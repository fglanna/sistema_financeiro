import React from 'react';
import { Activity } from 'lucide-react';

/**
 * Componente oficial de Logotipo do FinPulse
 * Design System: Executive Precision
 *
 * @param {('sm'|'md'|'lg')} size - Tamanho do logotipo (sm para sidebar/header, md/lg para auth)
 * @param {boolean} showText - Se deve renderizar o texto 'FinPulse' ao lado do ícone
 * @param {string} className - Classes adicionais para o contêiner
 */
export default function Logo({ size = 'md', showText = true, className = '' }) {
  const containerClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-xl',
  };

  const iconClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Emblema Vetorial Executivo com Pulso Financeiro */}
      <div
        className={`${containerClasses[size]} bg-gradient-to-tr from-brand-primary via-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-1 ring-white/20 flex-shrink-0 transition-transform hover:scale-105`}
        aria-hidden="true"
      >
        <Activity className={`${iconClasses[size]} text-indigo-50`} strokeWidth={2.75} />
      </div>

      {showText && (
        <span
          className={`font-display font-bold ${textClasses[size]} text-brand-text tracking-tight select-none`}
        >
          Fin<span className="text-brand-primary">Pulse</span>
        </span>
      )}
    </div>
  );
}
