import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, ArrowRight, User, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Banner de Boas-Vindas */}
      <div className="bg-white rounded-xl border border-brand-border shadow-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-primary-light text-brand-primary text-xs font-semibold mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>Fase 6 — Autenticação e Layout Prontos</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-brand-text">
            Olá, {user?.name || 'Usuário'}!
          </h2>
          <p className="text-xs sm:text-sm text-brand-muted mt-1 max-w-xl">
            Sua conta está conectada e a infraestrutura de autenticação e layout foi carregada com sucesso. Os cards de KPIs, gráficos interativos e extrato analítico serão renderizados na Fase 7.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/profile">
            <Button variant="secondary" size="md" icon={User}>
              Gerenciar Perfil
            </Button>
          </Link>
          <Link to="/transactions">
            <Button variant="primary" size="md">
              <span>Acessar Extrato</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards Informativos de Pré-visualização de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-brand-border shadow-card p-5">
          <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider block mb-1">
            Saldo Inicial Cadastrado
          </span>
          <span className="text-xl sm:text-2xl font-bold font-display text-brand-text tabular-nums">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(user?.initial_balance || 0)}
          </span>
          <p className="text-[11px] text-brand-muted mt-2">
            Ponto de partida configurado no perfil
          </p>
        </div>

        <div className="bg-white rounded-xl border border-brand-border shadow-card p-5">
          <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider block mb-1">
            Status da Sessão
          </span>
          <span className="text-xl sm:text-2xl font-bold font-display text-brand-tertiary-dark">
            Autenticado
          </span>
          <p className="text-[11px] text-brand-muted mt-2">
            Token JWT ativo e validado (24h)
          </p>
        </div>

        <div className="bg-white rounded-xl border border-brand-border shadow-card p-5">
          <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider block mb-1">
            Próxima Entrega
          </span>
          <span className="text-xl sm:text-2xl font-bold font-display text-brand-primary">
            Fase 7
          </span>
          <p className="text-[11px] text-brand-muted mt-2">
            Dashboard completo com Recharts e Extrato
          </p>
        </div>

        <div className="bg-white rounded-xl border border-brand-border shadow-card p-5">
          <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider block mb-1">
            Ambiente Local
          </span>
          <span className="text-xl sm:text-2xl font-bold font-display text-brand-secondary">
            Dev / Vite
          </span>
          <p className="text-[11px] text-brand-muted mt-2">
            API REST integrada via porta 3001
          </p>
        </div>
      </div>
    </div>
  );
}
