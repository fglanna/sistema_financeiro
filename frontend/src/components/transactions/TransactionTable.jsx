import React from 'react';
import { Edit2, Copy, Trash2, ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react';
import Badge from '../common/Badge';

function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

function formatDateBR(dateStr) {
  if (!dateStr) return '-';
  const cleanDate = dateStr.split('T')[0];
  const [year, month, day] = cleanDate.split('-');
  return `${day}/${month}/${year}`;
}

// Verifica se a transação pendente está atrasada (RN06)
function isOverdue(dueDateStr, status) {
  if (status !== 'PENDENTE' || !dueDateStr) return false;
  const cleanDate = dueDateStr.split('T')[0];
  const today = new Date().toISOString().split('T')[0];
  return cleanDate < today;
}

export default function TransactionTable({
  transactions = [],
  loading = false,
  onEdit,
  onDuplicate,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-brand-border p-6 shadow-card animate-pulse space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-slate-100 rounded w-full"></div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-brand-border p-10 shadow-card text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold font-display text-brand-text">
          Nenhum lançamento encontrado
        </h4>
        <p className="text-xs text-brand-muted mt-1 max-w-sm">
          Não há registros financeiros para os filtros ou período selecionados.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-brand-border shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-brand-border text-[11px] font-semibold text-brand-muted uppercase tracking-wider h-10 select-none">
              <th className="px-4 py-2 text-center w-24">Status</th>
              <th className="px-4 py-2 w-28">Vencimento</th>
              <th className="px-4 py-2">Descrição</th>
              <th className="px-4 py-2 w-36">Categoria</th>
              <th className="px-4 py-2 w-32">Pagamento</th>
              <th className="px-4 py-2 text-right w-32">Valor</th>
              <th className="px-4 py-2 text-center w-28">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const overdue = isOverdue(tx.due_date, tx.status);
              const isIncome = tx.type === 'RECEITA';

              return (
                <tr
                  key={tx.id}
                  className={`h-12 transition-colors ${
                    overdue
                      ? 'bg-rose-50/60 hover:bg-rose-50 text-rose-950 font-medium'
                      : 'hover:bg-slate-50/80 text-brand-text'
                  }`}
                >
                  {/* Status Badge */}
                  <td className="px-4 py-2 text-center whitespace-nowrap">
                    {overdue ? (
                      <Badge variant="overdue">Atrasado</Badge>
                    ) : tx.status === 'PAGO' ? (
                      <Badge variant="paid">Pago</Badge>
                    ) : (
                      <Badge variant="pending">Pendente</Badge>
                    )}
                  </td>

                  {/* Vencimento */}
                  <td className="px-4 py-2 whitespace-nowrap tabular-nums text-slate-600 font-medium">
                    {formatDateBR(tx.due_date)}
                  </td>

                  {/* Descrição e Tipo */}
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                          isIncome
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <span className="font-semibold truncate max-w-xs sm:max-w-md">
                        {tx.description}
                      </span>
                    </div>
                  </td>

                  {/* Categoria */}
                  <td className="px-4 py-2 whitespace-nowrap text-brand-secondary">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 font-medium text-[11px] text-slate-700">
                      {tx.category_name || '-'}
                    </span>
                  </td>

                  {/* Forma de Pagamento */}
                  <td className="px-4 py-2 whitespace-nowrap text-brand-muted">
                    {tx.payment_method_name || '-'}
                  </td>

                  {/* Valor */}
                  <td
                    className={`px-4 py-2 text-right whitespace-nowrap tabular-nums font-bold ${
                      isIncome ? 'text-emerald-600' : 'text-brand-text'
                    }`}
                  >
                    {isIncome ? '+' : '-'} {formatBRL(tx.amount)}
                  </td>

                  {/* Ações */}
                  <td className="px-4 py-2 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(tx)}
                        title="Editar lançamento"
                        className="p-1.5 text-brand-muted hover:text-brand-primary hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDuplicate(tx)}
                        title="Duplicar lançamento"
                        className="p-1.5 text-brand-muted hover:text-brand-tertiary-dark hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(tx)}
                        title="Excluir lançamento"
                        className="p-1.5 text-brand-muted hover:text-brand-destructive-dark hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
