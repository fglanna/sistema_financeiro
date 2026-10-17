/**
 * Testes Automatizados de Integração — Fase 5: Backend Avançado
 * Dashboard (RN02, RN03), Exportação CSV em Memória (RN09) e Worker Cron (RN07)
 */
const http = require('http');
const app = require('./src/app');
const db = require('./src/database/connection');
const config = require('./src/config/config');

const PORT = 3098;
const BASE_URL = `http://localhost:${PORT}/api`;

let server;

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const status = response.status;
  const contentType = response.headers.get('content-type') || '';
  const contentDisposition = response.headers.get('content-disposition') || '';

  let textData = null;
  let jsonData = null;
  let rawBuffer = null;

  const arrayBuf = await response.arrayBuffer();
  rawBuffer = Buffer.from(arrayBuf);

  if (contentType.includes('application/json')) {
    try {
      jsonData = JSON.parse(rawBuffer.toString('utf-8'));
    } catch (e) {
      jsonData = null;
    }
  } else {
    textData = rawBuffer.toString('utf-8');
  }

  return { status, data: jsonData, text: textData, rawBuffer, contentType, contentDisposition };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FALHA: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ OK: ${message}`);
}

async function runTests() {
  console.log('--- INICIANDO TESTES DA FASE 5: BACKEND AVANÇADO ---');

  await new Promise((resolve) => {
    server = http.createServer(app).listen(PORT, () => {
      console.log(`Servidor de teste ativo na porta ${PORT}`);
      resolve();
    });
  });

  try {
    // 1. Criar usuários de teste com saldo inicial
    const userAEmail = `fase5_userA_${Date.now()}@example.com`;
    const userBEmail = `fase5_userB_${Date.now()}@example.com`;

    // Usuário A começa com Saldo Inicial = 1000.00
    const resRegA = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Usuário Teste Fase 5 A',
        email: userAEmail,
        password: 'Password123!',
        initial_balance: 1000.00
      }
    });
    assert(resRegA.status === 201, 'Cadastro do Usuário A com initial_balance = 1000.00 realizado com sucesso');
    const tokenA = resRegA.data.token;
    const userAId = resRegA.data.user.id;

    // Usuário B começa com Saldo Inicial = 500.00
    const resRegB = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Usuário Teste Fase 5 B',
        email: userBEmail,
        password: 'Password123!',
        initial_balance: 500.00
      }
    });
    assert(resRegB.status === 201, 'Cadastro do Usuário B realizado com sucesso');
    const tokenB = resRegB.data.token;
    const userBId = resRegB.data.user.id;

    // 2. Obter categorias padrão e formas de pagamento
    const resCats = await request('/categories', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const catSalario = resCats.data.find((c) => c.name === 'Salário' && c.type === 'RECEITA');
    const catAlimentacao = resCats.data.find((c) => c.name === 'Alimentação' && c.type === 'DESPESA');
    const catMoradia = resCats.data.find((c) => c.name === 'Moradia' && c.type === 'DESPESA');

    const resPm = await request('/payment-methods', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const pixMethod = resPm.data[0].id;

    // Data de corte / referência
    // Hoje:
    const today = new Date();
    const todayStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(today);

    // Mês e ano corrente
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentMonthStr = String(currentMonth).padStart(2, '0');

    // 3. Cadastrar cenários de transações para Usuário A:
    // T1: Receita PAGA hoje (R$ 3000.00) -> Entra no Saldo Atual (RN02)
    const resT1 = await request('/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: {
        description: 'Salário Mensal',
        amount: 3000.00,
        type: 'RECEITA',
        category_id: catSalario.id,
        payment_method_id: pixMethod,
        status: 'PAGO',
        due_date: `${currentYear}-${currentMonthStr}-05`,
        payment_date: todayStr
      }
    });
    assert(resT1.status === 201, 'T1: Receita PAGA cadastrada');

    // T2: Despesa PAGA hoje (R$ 800.00) -> Abate do Saldo Atual (RN02)
    const resT2 = await request('/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: {
        description: 'Aluguel do Mês',
        amount: 800.00,
        type: 'DESPESA',
        category_id: catMoradia.id,
        payment_method_id: pixMethod,
        status: 'PAGO',
        due_date: `${currentYear}-${currentMonthStr}-10`,
        payment_date: todayStr
      }
    });
    assert(resT2.status === 201, 'T2: Despesa PAGA cadastrada');

    // T3: Receita PENDENTE no mês corrente (R$ 500.00) -> Entra no Saldo Previsto (RN03)
    const resT3 = await request('/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: {
        description: 'Freelance Design',
        amount: 500.00,
        type: 'RECEITA',
        category_id: catSalario.id,
        payment_method_id: pixMethod,
        status: 'PENDENTE',
        due_date: `${currentYear}-${currentMonthStr}-25`,
        payment_date: null
      }
    });
    assert(resT3.status === 201, 'T3: Receita PENDENTE cadastrada');

    // T4: Despesa PENDENTE no mês corrente (R$ 300.00) -> Abate do Saldo Previsto (RN03)
    const resT4 = await request('/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: {
        description: 'Supermercado Mensal',
        amount: 300.00,
        type: 'DESPESA',
        category_id: catAlimentacao.id,
        payment_method_id: pixMethod,
        status: 'PENDENTE',
        due_date: `${currentYear}-${currentMonthStr}-20`,
        payment_date: null
      }
    });
    assert(resT4.status === 201, 'T4: Despesa PENDENTE cadastrada');

    // T5: Receita PAGA no futuro (data de pagamento futura: ano 2099)
    // Conforme RN02: payment_date <= CURRENT_DATE. Não deve compor o Saldo Atual!
    // Para testar a trava estrita de RN02 com payment_date no futuro:
    const resT5 = await request('/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: {
        description: 'Receita Futura Não Efetivada',
        amount: 9999.00,
        type: 'RECEITA',
        category_id: catSalario.id,
        payment_method_id: pixMethod,
        status: 'PAGO',
        due_date: '2099-12-31',
        payment_date: '2099-12-31'
      }
    });
    assert(resT5.status === 201, 'T5: Receita futura cadastrada para teste de corte RN02');

    // T6: Criar uma conta atrasada PENDENTE (vencimento no passado) para testar alerts e Cron
    const pastYear = 2025;
    const resT6 = await request('/transactions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: {
        description: 'Conta de Energia Atrasada',
        amount: 150.00,
        type: 'DESPESA',
        category_id: catMoradia.id,
        payment_method_id: pixMethod,
        status: 'PENDENTE',
        due_date: `${pastYear}-01-10`,
        payment_date: null
      }
    });
    assert(resT6.status === 201, 'T6: Conta vencida cadastrada');

    // ==========================================
    // 4. TESTE DO DASHBOARD (RN02, RN03)
    // ==========================================
    console.log('\n[TESTE 1] Validando Dashboard e Cálculos Financeiros (RN02 e RN03)...');
    const resDash = await request(`/dashboard?month=${currentMonth}&year=${currentYear}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(resDash.status === 200, 'GET /api/dashboard retorna status 200');

    const kpis = resDash.data.kpis;
    console.log('KPIs retornados:', kpis);

    // Saldo Inicial = 1000.00
    // Receitas Pagas <= hoje = 3000.00 (T1)
    // Despesas Pagas <= hoje = 800.00 (T2)
    // Saldo Atual esperado = 1000.00 + 3000.00 - 800.00 = 3200.00
    assert(kpis.current_balance === 3200.00, `RN02: Saldo Atual deve ser exatamente R$ 3200.00 (obtido: ${kpis.current_balance})`);

    // Receitas Pendentes do Mês = 500.00 (T3)
    // Despesas Pendentes do Mês = 300.00 (T4)
    // Saldo Previsto esperado = 3200.00 + 500.00 - 300.00 = 3400.00
    assert(kpis.forecasted_balance === 3400.00, `RN03: Saldo Previsto deve ser exatamente R$ 3400.00 (obtido: ${kpis.forecasted_balance})`);

    // Totais do mês selecionado:
    // Receitas do mês = 3000 (T1) + 500 (T3) = 3500.00
    // Despesas do mês = 800 (T2) + 300 (T4) = 1100.00
    assert(kpis.total_income_month === 3500.00, `Total de receitas do mês deve ser R$ 3500.00 (obtido: ${kpis.total_income_month})`);
    assert(kpis.total_expense_month === 1100.00, `Total de despesas do mês deve ser R$ 1100.00 (obtido: ${kpis.total_expense_month})`);

    // Despesas por categoria do mês:
    // Moradia: 800.00 (72.73%)
    // Alimentação: 300.00 (27.27%)
    const expCat = resDash.data.expenses_by_category;
    assert(Array.isArray(expCat) && expCat.length === 2, 'Despesas por categoria retornou 2 categorias agrupadas');
    const moradiaAggr = expCat.find((c) => c.category_name === 'Moradia');
    assert(moradiaAggr && moradiaAggr.amount === 800.00, 'Moradia totalizou 800.00 nas despesas do mês');
    assert(moradiaAggr.percentage > 72 && moradiaAggr.percentage < 73, 'Percentual de Moradia calculado corretamente');

    // Alertas do mês corrente:
    const alerts = resDash.data.alerts;
    assert(Array.isArray(alerts), 'Lista de alertas retornada como array');
    const alertSupermercado = alerts.find((a) => a.description === 'Supermercado Mensal');
    assert(alertSupermercado && alertSupermercado.status === 'PENDENTE', 'Alerta para Supermercado Mensal presente');

    // Validação de isolamento do Dashboard (Usuário B)
    const resDashB = await request(`/dashboard?month=${currentMonth}&year=${currentYear}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert(resDashB.status === 200, 'Dashboard do Usuário B acessado com sucesso');
    assert(resDashB.data.kpis.current_balance === 500.00, 'RN01: Usuário B visualiza apenas seu próprio Saldo Inicial e nenhuma transação de A');
    assert(resDashB.data.alerts.length === 0, 'Usuário B não possui alertas de A');

    // ==========================================
    // 5. TESTE DE EXPORTAÇÃO CSV (RN09)
    // ==========================================
    console.log('\n[TESTE 2] Validando Exportação CSV em Memória (RN09)...');
    const resCsv = await request(`/transactions/export/csv?month=${currentMonth}&year=${currentYear}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(resCsv.status === 200, 'GET /api/transactions/export/csv retorna 200');
    assert(resCsv.contentType.includes('text/csv'), 'Header Content-Type é text/csv');
    assert(resCsv.contentDisposition.includes(`extrato_${currentYear}_${currentMonthStr}.csv`), `Header Content-Disposition define extrato_${currentYear}_${currentMonthStr}.csv`);
    
    // Validação estrita do BOM UTF-8: bytes 0xEF, 0xBB, 0xBF no início do arquivo
    const hasUtf8BomBytes = resCsv.rawBuffer[0] === 0xEF && resCsv.rawBuffer[1] === 0xBB && resCsv.rawBuffer[2] === 0xBF;
    assert(hasUtf8BomBytes, 'CSV possui bytes exatos do BOM UTF-8 (EF BB BF) para compatibilidade com Excel');
    assert(resCsv.text.includes('Salário Mensal'), 'CSV contém a transação Salário Mensal');
    assert(resCsv.text.includes('Aluguel do Mês'), 'CSV contém a transação Aluguel do Mês');
    assert(
      resCsv.text.includes('"Data de Vencimento";"Descrição";"Tipo";"Categoria";"Forma de Pagamento";"Valor (R$)";"Status";"Data de Pagamento"') ||
      resCsv.text.includes('Data de Vencimento;Descrição;Tipo;Categoria;Forma de Pagamento;Valor (R$);Status;Data de Pagamento'),
      'Cabeçalhos do CSV formatados corretamente com separador ponto e vírgula'
    );

    // Testar filtro com busca na exportação CSV (RN09)
    const resCsvFiltered = await request(`/transactions/export/csv?month=${currentMonth}&year=${currentYear}&search=Aluguel`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert(resCsvFiltered.text.includes('Aluguel do Mês'), 'CSV filtrado contém Aluguel do Mês');
    assert(!resCsvFiltered.text.includes('Salário Mensal'), 'CSV filtrado NÃO contém outras despesas/receitas que não atendem à busca');

    // ==========================================
    // 6. TESTE DO WORKER CRON E ENVIO REAL (RN07)
    // ==========================================
    console.log('\n[TESTE 3] Validando Rotina Cron Diária (RN07), Idempotência e Seleção de Pendências...');

    // O Usuário A possui T6 com data de vencimento no passado e T4 no mês corrente.
    // Vamos disparar a rotina cron com autenticação CRON_SECRET via POST /api/cron/daily-alerts
    const cronSecret = config.cron.secret || 'cron_secret_padrao_teste';

    // Primeiro disparo (com force = true para garantir execução limpa nos testes)
    const resCron = await request('/cron/daily-alerts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cronSecret}`
      },
      body: { force: true }
    });
    assert(resCron.status === 200, 'POST /api/cron/daily-alerts com segredo válido retorna 200');
    assert(resCron.data.status === 'completed', 'Rotina diária concluída com sucesso');
    assert(resCron.data.pendingAlertsCount >= 1, 'Cron detectou lançamentos pendentes com vencimento <= CURRENT_DATE');
    assert(resCron.data.processedUsers >= 1, 'Cron processou os usuários com pendências');
    // emailsSentCount >= 1 em modo mock (dev sem SMTP real) ou com SMTP real configurado
    // emailsFailedCount = 0 em modo mock; pode ser > 0 apenas com credenciais SMTP reais inválidas
    const totalAttempts = (resCron.data.emailsSentCount || 0) + (resCron.data.emailsFailedCount || 0);
    assert(totalAttempts >= 1, 'Cron realizou ao menos 1 tentativa de envio de e-mail (mock ou real)');
    assert(resCron.data.emailsFailedCount === 0, 'Cron não registrou falhas SMTP (modo mock ativo ou SMTP real funcionando)');

    // Segundo disparo (sem force) deve retornar skipped devido à idempotência
    const resCronIdempotent = await request('/cron/daily-alerts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cronSecret}`
      },
      body: { force: false }
    });
    assert(resCronIdempotent.status === 200, 'Idempotência: disparo duplicado retorna 200');
    assert(resCronIdempotent.data.status === 'skipped', 'Idempotência: status retornado é "skipped"');
    assert(resCronIdempotent.data.reason === 'already_executed', 'Idempotência: motivo "already_executed"');

    // 7. Limpeza dos usuários de teste via exclusão de conta (RN10)
    console.log('\n[LIMPANDO DADOS DE TESTE]');
    await request('/users/me', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    await request('/users/me', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    console.log('✅ Usuários de teste e lançamentos removidos com sucesso via CASCADE');

    console.log('\n🎉 TODOS OS TESTES DA FASE 5 PASSARAM COM 100% DE SUCESSO! 🎉\n');
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await db.destroy();
    process.exit(0);
  }
}

runTests().catch(async (err) => {
  console.error('Falha geral no teste da Fase 5:', err);
  await db.destroy().catch(() => {});
  process.exit(1);
});
