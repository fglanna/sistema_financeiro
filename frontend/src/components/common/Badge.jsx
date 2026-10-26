import React from 'react';

export default function Badge({
  children,
  variant = 'neutral',
  className = '',
}) {
  const variantClasses = {
    income: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    expense: 'bg-rose-50 text-rose-700 border-rose-200',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    overdue: 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-brand-primary-light text-brand-primary border-indigo-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border select-none transition-colors ${
        variantClasses[variant] || variantClasses.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
}
