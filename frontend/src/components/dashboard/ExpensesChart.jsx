import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const COLORS = [
  '#4F46E5', // Deep Indigo
  '#F43F5E', // Rose Coral
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#64748B', // Slate
];

function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export default function ExpensesChart({ data = [], loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-brand-border p-6 shadow-card h-80 flex items-center justify-center animate-pulse">
        <div className="w-40 h-40 rounded-full border-8 border-slate-100 border-t-slate-200 animate-spin"></div>
      </div>
    );
  }

  const chartData = (data || []).map((item) => ({
    name: item.category_name || 'Sem Categoria',
    value: Number(item.amount !== undefined ? item.amount : item.total) || 0,
    percentage: Number(item.percentage) || 0,
  }));

  const totalExpenses = chartData.reduce((acc, curr) => acc + curr.value, 0);

  if (chartData.length === 0 || totalExpenses === 0) {
    return (
      <div className="bg-white rounded-xl border border-brand-border p-6 sm:p-8 shadow-card flex flex-col items-center justify-center text-center h-80">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
          <PieChartIcon className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold font-display text-brand-text">
          Nenhuma despesa no período
        </h4>
        <p className="text-xs text-brand-muted mt-1 max-w-xs">
          Não há despesas cadastradas para o mês selecionado.
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="bg-white p-3 rounded-lg shadow-popover border border-brand-border text-xs z-50">
          <p className="font-bold text-brand-text mb-1">{item.name}</p>
          <p className="text-brand-muted">
            Valor:{' '}
            <strong className="text-brand-text tabular-nums">
              {formatBRL(item.value)}
            </strong>
          </p>
          <p className="text-brand-muted">
            Participação:{' '}
            <strong className="text-brand-primary tabular-nums">
              {item.payload.percentage.toFixed(1)}%
            </strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-brand-border p-5 sm:p-6 shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold font-display text-brand-text">
            Despesas por Categoria
          </h3>
          <p className="text-xs text-brand-muted">
            Distribuição percentual dos gastos no mês
          </p>
        </div>
        <span className="text-xs font-semibold text-brand-text tabular-nums bg-slate-100 px-2.5 py-1 rounded-md">
          Total: {formatBRL(totalExpenses)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 min-h-[220px]">
        {/* Gráfico Rosca */}
        <div className="h-56 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda Customizada */}
        <div className="space-y-2 overflow-y-auto max-h-56 pr-1">
          {chartData.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="font-medium text-brand-secondary truncate">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className="text-brand-muted tabular-nums">
                  {formatBRL(item.value)}
                </span>
                <span className="font-bold text-brand-text tabular-nums w-12 text-right">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
