import React from 'react';
import { Receipt, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export default function Transactions() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-brand-border shadow-card p-6 sm:p-8">
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-brand-border">
          <div className="w-10 h-10 rounded-lg bg-brand-primary-light text-brand-primary flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-brand-text">
              Extrato e Lançamentos Financeiros
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted">
              Módulo programado para ser implementado na Fase 7
            </p>
          </div>
        </div>

        <div className="text-center py-10 max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold font-display text-brand-text">
            Tabela Analítica em Construção
          </h3>
          <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
            Nesta tela serão disponibilizados a tabela densa de lançamentos, filtros por categoria, pesquisa textual, modais de novo lançamento e duplicação em rascunho, e download de extrato em CSV gerado em memória (Fase 7).
          </p>
          <div className="pt-2">
            <Link to="/dashboard">
              <Button variant="secondary" size="md" icon={ArrowLeft}>
                Voltar para Visão Geral
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
