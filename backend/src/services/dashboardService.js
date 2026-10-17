const db = require('../database/connection');
const userRepository = require('../repositories/userRepository');

class DashboardService {
  /**
   * Obtém os dados consolidados do dashboard para o usuário e mês/ano especificados.
   * Respeita rigorosamente:
   * - RN01: Multi-tenancy isolado por userId
   * - RN02: Saldo Atual = Saldo Inicial + Receitas Pagas (payment_date <= CURRENT_DATE) - Despesas Pagas
   * - RN03: Saldo Previsto = Saldo Atual + Receitas Pendentes do Mês - Despesas Pendentes do Mês
   *
   * @param {string} userId
   * @param {number} month (1 a 12)
   * @param {number} year (ex.: 2026)
   * @returns {Promise<Object>}
   */
  async getDashboardData(userId, month, year) {
    // 1. Busca perfil do usuário para capturar initial_balance
    const user = await userRepository.findById(userId);
    if (!user) {
      const err = new Error('Usuário não encontrado.');
      err.statusCode = 404;
      throw err;
    }

    const initialBalance = parseFloat(user.initial_balance || 0);

    // 2. RN02: Cálculo do Saldo Atual acumulado até a data corrente
    // Considera lançamentos com status 'PAGO' e payment_date <= CURRENT_DATE desde o início
    const paidSums = await db('financial_transactions')
      .where('user_id', userId)
      .where('status', 'PAGO')
      .whereRaw('payment_date <= CURRENT_DATE')
      .select('type')
      .sum('amount as total')
      .groupBy('type');

    let totalPaidIncomeHistorical = 0;
    let totalPaidExpenseHistorical = 0;

    paidSums.forEach((row) => {
      const val = parseFloat(row.total || 0);
      if (row.type === 'RECEITA') {
        totalPaidIncomeHistorical = val;
      } else if (row.type === 'DESPESA') {
        totalPaidExpenseHistorical = val;
      }
    });

    const currentBalance = initialBalance + totalPaidIncomeHistorical - totalPaidExpenseHistorical;

    // 3. Totais do mês de referência consultado (todas as movimentações com vencimento no mês selecionado)
    const monthTransactions = await db('financial_transactions as ft')
      .select(
        'ft.id',
        'ft.description',
        'ft.amount',
        'ft.type',
        'ft.status',
        'ft.due_date',
        'ft.payment_date',
        'ft.category_id',
        'c.name as category_name'
      )
      .join('categories as c', 'ft.category_id', 'c.id')
      .where('ft.user_id', userId)
      .whereRaw('EXTRACT(MONTH FROM ft.due_date) = ?', [month])
      .whereRaw('EXTRACT(YEAR FROM ft.due_date) = ?', [year])
      .orderBy('ft.due_date', 'asc');

    let totalIncomeMonth = 0;
    let totalExpenseMonth = 0;
    let pendingIncomeMonth = 0;
    let pendingExpenseMonth = 0;
    const expenseByCategoryMap = {};

    monthTransactions.forEach((tx) => {
      const amount = parseFloat(tx.amount || 0);

      if (tx.type === 'RECEITA') {
        totalIncomeMonth += amount;
        if (tx.status === 'PENDENTE') {
          pendingIncomeMonth += amount;
        }
      } else if (tx.type === 'DESPESA') {
        totalExpenseMonth += amount;
        if (tx.status === 'PENDENTE') {
          pendingExpenseMonth += amount;
        }

        // Agrupamento de despesas por categoria
        const catName = tx.category_name || 'Outras';
        if (!expenseByCategoryMap[catName]) {
          expenseByCategoryMap[catName] = 0;
        }
        expenseByCategoryMap[catName] += amount;
      }
    });

    // 4. RN03: Cálculo do Saldo Previsto
    // Saldo Previsto = Saldo Atual + Receitas Pendentes do Mês - Despesas Pendentes do Mês
    const forecastedBalance = currentBalance + pendingIncomeMonth - pendingExpenseMonth;

    // 5. Formatação do gráfico de despesas por categoria (com percentual)
    const expensesByCategory = Object.entries(expenseByCategoryMap).map(([category_name, amount]) => {
      const percentage = totalExpenseMonth > 0 ? (amount / totalExpenseMonth) * 100 : 0;
      return {
        category_name,
        amount: parseFloat(amount.toFixed(2)),
        percentage: parseFloat(percentage.toFixed(2))
      };
    }).sort((a, b) => b.amount - a.amount);

    // 6. Alertas: Pendências do mês (ou vencidas) para o usuário
    // Data corrente em formato YYYY-MM-DD
    const todayStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());

    const alerts = monthTransactions
      .filter((tx) => tx.status === 'PENDENTE')
      .map((tx) => {
        // due_date vem formatado como Date ou string YYYY-MM-DD
        const dueDateStr = tx.due_date instanceof Date
          ? tx.due_date.toISOString().split('T')[0]
          : String(tx.due_date).split('T')[0];

        const isOverdue = dueDateStr < todayStr;

        return {
          id: tx.id,
          description: tx.description,
          amount: parseFloat(parseFloat(tx.amount).toFixed(2)),
          type: tx.type,
          due_date: dueDateStr,
          status: tx.status,
          category_name: tx.category_name,
          is_overdue: isOverdue
        };
      });

    return {
      kpis: {
        current_balance: parseFloat(currentBalance.toFixed(2)),
        forecasted_balance: parseFloat(forecastedBalance.toFixed(2)),
        total_income_month: parseFloat(totalIncomeMonth.toFixed(2)),
        total_expense_month: parseFloat(totalExpenseMonth.toFixed(2))
      },
      expenses_by_category: expensesByCategory,
      alerts
    };
  }
}

module.exports = new DashboardService();
