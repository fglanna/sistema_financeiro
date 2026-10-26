import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionModal from '../components/transactions/TransactionModal';
import CategoryManagerModal from '../components/transactions/CategoryManagerModal';
import MonthYearSelector from '../components/common/MonthYearSelector';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import {
  Plus,
  Search,
  Download,
  Tag,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function Transactions() {
  const today = new Date();
  const [period, setPeriod] = useState({
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  });

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Filtros
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Estados de controle
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modais
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState(null);
  const [isDuplicateMode, setIsDuplicateMode] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Carrega transações filtradas
  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/transactions', {
        params: {
          month: period.month,
          year: period.year,
          search: search || undefined,
          category_id: selectedCategory || undefined,
        },
      });
      setTransactions(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Erro ao carregar o extrato de lançamentos.'
      );
    } finally {
      setLoading(false);
    }
  }, [period, search, selectedCategory]);

  // Carrega categorias e formas de pagamento
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
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    loadMetadata();
  }, []);

  // Salva transação (novo ou edição)
  const handleSaveTransaction = async (payload, id) => {
    if (id) {
      await api.put(`/transactions/${id}`, payload);
      setSuccess('Lançamento atualizado com sucesso.');
    } else {
      await api.post('/transactions', payload);
      setSuccess('Novo lançamento cadastrado com sucesso.');
    }
    await loadTransactions();
  };

  // Abre modal para edição
  const handleEdit = (tx) => {
    setModalInitialData(tx);
    setIsDuplicateMode(false);
    setIsTransactionModalOpen(true);
  };

  // Duplicação de lançamento via rascunho em memória (Fluxo 3 FSD)
  const handleDuplicate = async (tx) => {
    try {
      const response = await api.get(`/transactions/${tx.id}/duplicate-draft`);
      setModalInitialData(response.data);
      setIsDuplicateMode(true);
      setIsTransactionModalOpen(true);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Não foi possível gerar o rascunho de duplicação.'
      );
    }
  };

  // Exclusão de transação
  const handleDelete = async (tx) => {
    if (
      !window.confirm(
        `Deseja realmente excluir o lançamento "${tx.description}" no valor de R$ ${Number(
          tx.amount
        ).toFixed(2)}?`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/transactions/${tx.id}`);
      setSuccess('Lançamento excluído com sucesso.');
      await loadTransactions();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Erro ao tentar excluir o lançamento.'
      );
    }
  };

  // Exportação CSV em memória (Fluxo 6 & RN09)
  const handleExportCsv = async () => {
    setExporting(true);
    setError('');
    try {
      const response = await api.get('/transactions/export/csv', {
        params: {
          month: period.month,
          year: period.year,
          search: search || undefined,
          category_id: selectedCategory || undefined,
        },
        responseType: 'blob', // Recebe o binário diretamente
      });

      // Cria URL do blob para disparo de download no navegador
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `extrato_${period.year}_${String(period.month).padStart(2, '0')}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Não foi possível exportar a planilha CSV.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. CABEÇALHO E BARRA DE FERRAMENTAS SUPERIOR */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-brand-border shadow-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-brand-text">
              Extrato de Movimentações
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Consulte, filtre e gerencie todas as receitas e despesas
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <MonthYearSelector
              month={period.month}
              year={period.year}
              onChange={setPeriod}
            />

            <Button
              type="button"
              variant="secondary"
              size="md"
              icon={Tag}
              onClick={() => setIsCategoryModalOpen(true)}
            >
              Categorias
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="md"
              icon={Download}
              loading={exporting}
              onClick={handleExportCsv}
            >
              Exportar CSV
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => {
                setModalInitialData(null);
                setIsDuplicateMode(false);
                setIsTransactionModalOpen(true);
              }}
            >
              Novo Lançamento
            </Button>
          </div>
        </div>

        {/* 2. FILTROS RÁPIDOS: BUSCA TEXTUAL E CATEGORIA */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Buscar pela descrição do lançamento..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Todas as categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </Select>

            <button
              type="button"
              onClick={loadTransactions}
              title="Recarregar"
              className="p-2.5 text-brand-secondary hover:text-brand-text hover:bg-slate-100 border border-brand-border rounded-lg transition-colors flex-shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Alertas e Mensagens de Feedback */}
      {error && (
        <div className="p-3.5 rounded-lg bg-brand-destructive-light border border-rose-200 text-xs sm:text-sm text-brand-destructive-dark flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* 3. TABELA DE LANÇAMENTOS */}
      <TransactionTable
        transactions={transactions}
        loading={loading}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
      />

      {/* Modais */}
      {isTransactionModalOpen && (
        <TransactionModal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          onSave={handleSaveTransaction}
          initialData={modalInitialData}
          isDuplicate={isDuplicateMode}
          categories={categories}
          paymentMethods={paymentMethods}
        />
      )}

      {isCategoryModalOpen && (
        <CategoryManagerModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          categories={categories}
          onCategoriesUpdated={loadMetadata}
        />
      )}
    </div>
  );
}
