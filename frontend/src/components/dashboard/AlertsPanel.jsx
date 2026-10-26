import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';

function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

function formatDateBR(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
}

export default function AlertsPanel({ alerts = [], loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-brand-border p-6 shadow-card h-80 flex flex-col justify-center animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 rounded w-32"></div>
        <div className="h-12 bg-slate-100 rounded-lg"></div>
        <div className="h-12 bg-slate-100 rounded-lg"></div>
        <div className="h-12 bg-slate-100 rounded-lg"></div>
      </div>
    );
  }

  const hasAlerts = alerts && alerts.length > 0;

  return (
    <div className="bg-white rounded-xl border border-brand-border p-5 sm:p-6 shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-display text-brand-text">
              Pendências e Alertas
            </h3>
            <p className="text-xs text-brand-muted">
              Contas vencidas ou com vencimento para hoje
            </p>
          </div>
        </div>

        {hasAlerts && (
          <Badge variant="overdue">
            {alerts.length} {alerts.length === 1 ? 'Alerta' : 'Alertas'}
          </Badge>
        )}
      </div>

      <div className="flex-1 overflow-y-auto max-h-60 space-y-2.5 pr-1">
        {!hasAlerts ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-brand-text">
              Nenhuma conta pendente atrasada
            </p>
            <p className="text-xs text-brand-muted mt-0.5">
              Todas as suas obrigações do período estão em dia.
            </p>
          </div>
        ) : (
          alerts.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs transition-colors ${
                item.is_overdue
                  ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                  : 'bg-amber-50/70 border-amber-200 text-amber-900'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold truncate text-brand-text">
                    {item.description}
                  </span>
                  {item.is_overdue ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-800 uppercase">
                      Vencida
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-800 uppercase">
                      Vence Hoje
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-brand-muted">
                  <Clock className="w-3 h-3" />
                  <span>Vencimento: {formatDateBR(item.due_date)}</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="font-bold text-sm tabular-nums block text-brand-text">
                  {formatBRL(item.amount)}
                </span>
                <span className="text-[10px] uppercase font-semibold text-brand-muted">
                  {item.type}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-slate-100 flex justify-end">
        <Link
          to="/transactions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline"
        >
          <span>Ir para o Extrato Completo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
