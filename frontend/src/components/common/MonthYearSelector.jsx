import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export default function MonthYearSelector({
  month,
  year,
  onChange,
  className = '',
}) {
  const currentMonth = Number(month);
  const currentYear = Number(year);

  const handlePrev = () => {
    if (currentMonth === 1) {
      onChange({ month: 12, year: currentYear - 1 });
    } else {
      onChange({ month: currentMonth - 1, year: currentYear });
    }
  };

  const handleNext = () => {
    if (currentMonth === 12) {
      onChange({ month: 1, year: currentYear + 1 });
    } else {
      onChange({ month: currentMonth + 1, year: currentYear });
    }
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    onChange({ month: now.getMonth() + 1, year: now.getFullYear() });
  };

  const monthLabel = MONTH_NAMES[currentMonth - 1] || 'Mês';

  return (
    <div
      className={`inline-flex items-center gap-1.5 bg-white border border-brand-border rounded-xl p-1 shadow-sm select-none ${className}`}
    >
      <button
        type="button"
        onClick={handlePrev}
        className="p-1.5 text-brand-secondary hover:text-brand-text hover:bg-brand-canvas rounded-lg transition-colors"
        title="Mês anterior"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 px-2.5 py-1 text-sm font-semibold text-brand-text">
        <Calendar className="w-4 h-4 text-brand-primary" />
        <span>
          {monthLabel} <span className="text-brand-muted font-normal">/</span> {currentYear}
        </span>
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="p-1.5 text-brand-secondary hover:text-brand-text hover:bg-brand-canvas rounded-lg transition-colors"
        title="Próximo mês"
        aria-label="Próximo mês"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={handleCurrentMonth}
        className="ml-1 px-2.5 py-1 text-xs font-semibold text-brand-primary hover:bg-brand-primary-light rounded-lg transition-colors border-l border-brand-border pl-2.5"
      >
        Hoje
      </button>
    </div>
  );
}
