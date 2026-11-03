import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, User, LogOut, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../common/Logo';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Visão Geral',
      icon: LayoutDashboard,
    },
    {
      to: '/transactions',
      label: 'Lançamentos',
      icon: Receipt,
    },
    {
      to: '/profile',
      label: 'Meu Perfil',
      icon: User,
    },
  ];

  return (
    <>
      {/* Backdrop para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Barra Lateral */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-brand-border z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo e Cabeçalho da Barra */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-brand-border">
            <Logo size="sm" />
            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 rounded-full bg-brand-primary-light text-brand-primary font-body text-[10px] uppercase font-bold tracking-wider">
                Exec
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-brand-muted hover:text-brand-text lg:hidden rounded-md"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Seção de Navegação */}
          <div className="px-4 pt-6 pb-2">
            <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
              Gestão Financeira
            </span>
          </div>

          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-primary text-white shadow-sm font-semibold'
                        : 'text-brand-text-body hover:bg-brand-canvas hover:text-brand-text'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Rodapé da Barra Lateral com Perfil e Sair */}
        <div className="p-4 border-t border-brand-border bg-slate-50/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-brand-primary text-white font-display font-bold text-xs flex items-center justify-center flex-shrink-0">
                {user?.name
                  ? user.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'FP'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-brand-text truncate">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-[11px] text-brand-muted truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Sair do sistema"
              className="p-2 text-brand-muted hover:text-brand-destructive-dark hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
              aria-label="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
