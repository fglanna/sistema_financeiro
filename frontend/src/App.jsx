import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-brand-card p-8 rounded-lg shadow-card border border-brand-border max-w-md w-full">
        <h1 className="text-2xl font-bold font-display text-brand-text mb-2">
          Sistema de Controle Financeiro
        </h1>
        <p className="text-brand-muted text-sm mb-4">
          Ambiente e infraestrutura inicial preparados com sucesso.
        </p>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-tertiary-light text-brand-tertiary-dark border border-emerald-200">
          Fase 1 Concluída
        </span>
      </div>
    </div>
  );
}
