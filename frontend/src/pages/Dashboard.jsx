import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import KpiCards from '../components/dashboard/KpiCards';
import ExpensesChart from '../components/dashboard/ExpensesChart';
import AlertsPanel from '../components/dashboard/AlertsPanel';
import MonthYearSelector from '../components/common/MonthYearSelector';
import TransactionModal from '../components/transactions/TransactionModal';
import Button from '../components/common/Button';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const today = new Date();
  const [period, setPeriod] = useState({
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  });

  const [dashboardData, setDashboardData] = useState({
    current_balance: 0,
    forecasted_balance: 0,
    total_income_month: 0,
    total_expense_month: 0,
    expenses_by_category: [],
    alerts: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modais e dados auxiliares para criação rápida
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Carrega dados do Dashboard
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/dashboard', {
        params: {
          month: period.month,
          year: period.year,
        },
      });
      setDashboardData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Não foi possível carregar as informações financeiras.'
      );
    } finally {
      setLoading(false);
    }
  }, [period]);

  // Carrega categorias e formas de pagamento para o modal rápido
  const loadMetadata = async () => {
    try {
      const [catRes, pmRes] = await Promise.all([
        api.get('/categories'),
        api.get('/payment-methods'),
      ]);
      setCategories(catRes.data);
      setPaymentMethods(pmRes.data);
    } catch (err) {
      console.error('Erro ao carregar metadados:', err);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    loadMetadata();
  }, []);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const handleCreateTransaction = async (payload) => {
    await api.post('/transactions', payload);
    await loadDashboard();
  };

  return (
    <div className="space-y-6">
      {/* 1. BARRA SUPERIOR DE CONTEXTO E AÇÕES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-brand-border shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold font-display text-brand-text">
              Painel Financeiro
            </h2>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Em tempo real</span>
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-0.5">
            Acompanhe sua liquidez acumulada e compromissos do mês
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Seletor de Período */}
          <MonthYearSelector
            month={period.month}
            year={period.year}
            onChange={handlePeriodChange}
          />

          {/* Botão de Atualizar */}
          <button
            type="button"
            onClick={loadDashboard}
            title="Atualizar dados"
            className="p-2 text-brand-secondary hover:text-brand-text hover:bg-slate-100 border border-brand-border rounded-xl transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Botão Novo Lançamento */}
          <Button
            type="button"
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Novo Lançamento
          </Button>
        </div>
      </div>

      {/* Alerta de Erro */}
      {error && (
        <div className="p-4 rounded-lg bg-brand-destructive-light border border-rose-200 flex items-center gap-2.5 text-xs sm:text-sm text-brand-destructive-dark">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. CARDS DE KPIS FINANCEIROS (RN02 e RN03) */}
      <KpiCards data={dashboardData} loading={loading} />

      {/* 3. GRÁFICO E PAINEL DE ALERTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Rosca de Despesas */}
        <ExpensesChart
          data={dashboardData.expenses_by_category}
          loading={loading}
        />

        {/* Lista de Pendências e Alertas */}
        <AlertsPanel alerts={dashboardData.alerts} loading={loading} />
      </div>

      {/* Modal de Lançamento Rápido */}
      {isModalOpen && (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleCreateTransaction}
          categories={categories}
          paymentMethods={paymentMethods}
        />
      )}
    </div>
  );
}
