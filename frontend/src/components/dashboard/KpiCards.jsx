import React from 'react';
import { Wallet, TrendingUp, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export default function KpiCards({ data = {}, loading = false }) {
  const kpis = data.kpis || data;
  const {
    current_balance = 0,
    forecasted_balance = 0,
    total_income_month = 0,
    total_expense_month = 0,
  } = kpis;

  const cards = [
    {
      title: 'Saldo Atual',
      value: current_balance,
      subtitle: 'Liquidez acumulada efetiva',
      icon: Wallet,
      iconColor: 'text-brand-primary',
      iconBg: 'bg-brand-primary-light',
      valueColor: current_balance >= 0 ? 'text-brand-text' : 'text-brand-destructive-dark',
    },
    {
      title: 'Saldo Previsto',
      value: forecasted_balance,
      subtitle: 'Projeção ao final do mês',
      icon: TrendingUp,
      iconColor: forecasted_balance >= 0 ? 'text-emerald-600' : 'text-brand-destructive-dark',
      iconBg: forecasted_balance >= 0 ? 'bg-emerald-50' : 'bg-rose-50',
      valueColor: forecasted_balance >= 0 ? 'text-brand-text' : 'text-brand-destructive-dark',
    },
    {
      title: 'Entradas do Mês',
      value: total_income_month,
      subtitle: 'Total de receitas do período',
      icon: ArrowUpCircle,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      valueColor: 'text-emerald-600',
    },
    {
      title: 'Saídas do Mês',
      value: total_expense_month,
      subtitle: 'Total de despesas do período',
      icon: ArrowDownCircle,
      iconColor: 'text-brand-destructive-dark',
      iconBg: 'bg-brand-destructive-light',
      valueColor: 'text-brand-destructive-dark',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-brand-border p-5 sm:p-6 shadow-card animate-pulse space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 bg-slate-200 rounded w-24"></div>
              <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="h-7 bg-slate-200 rounded w-36"></div>
            <div className="h-3 bg-slate-100 rounded w-28"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl border border-brand-border p-5 sm:p-6 shadow-card hover:shadow-hover transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
                {card.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center flex-shrink-0`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="my-3">
              <span
                className={`text-2xl sm:text-3xl font-bold font-display tracking-tight tabular-nums ${card.valueColor}`}
              >
                {formatBRL(card.value)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs text-brand-muted font-medium">
                {card.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
