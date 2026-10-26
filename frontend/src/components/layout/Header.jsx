import React from 'react';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return 'Visão Geral Financeira';
      case '/transactions':
        return 'Lançamentos & Extrato';
      case '/profile':
        return 'Perfil do Usuário';
      default:
        return 'Painel de Controle';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-brand-border flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Lado Esquerdo: Botão Mobile e Título */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 text-brand-secondary hover:bg-brand-canvas rounded-lg lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-brand-muted hidden sm:inline">FinPulse</span>
          <span className="text-xs text-brand-muted hidden sm:inline">/</span>
          <h1 className="text-sm sm:text-base font-bold font-display text-brand-text">
            {getPageTitle(location.pathname)}
          </h1>
        </div>
      </div>

      {/* Lado Direito: Ações e Perfil do Usuário */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          to="/profile"
          className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg hover:bg-brand-canvas transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-brand-primary text-white font-display font-bold text-xs flex items-center justify-center">
            {user?.name
              ? user.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
              : 'FP'}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-brand-text leading-tight">
              {user?.name || 'Usuário'}
            </span>
            <span className="text-[11px] text-brand-muted leading-tight">
              Conta Ativa
            </span>
          </div>
        </Link>

        <div className="h-6 w-px bg-brand-border" />

        <button
          type="button"
          onClick={logout}
          title="Encerrar sessão"
          className="flex items-center gap-1.5 text-xs font-medium text-brand-muted hover:text-brand-destructive-dark hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
