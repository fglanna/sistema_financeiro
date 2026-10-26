import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 select-none disabled:opacity-60 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 rounded-md gap-1.5',
    md: 'text-sm px-4 py-2 rounded-lg gap-2',
    lg: 'text-base px-5 py-2.5 rounded-lg gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-brand-primary text-white hover:bg-brand-primary-hover focus:ring-brand-primary shadow-sm hover:shadow active:scale-[0.99]',
    secondary:
      'bg-white text-brand-secondary border border-brand-border hover:bg-brand-canvas hover:border-brand-border-dark focus:ring-slate-300 shadow-sm',
    destructive:
      'bg-brand-destructive-light text-brand-destructive-dark border border-rose-200 hover:bg-rose-100 hover:border-rose-300 focus:ring-rose-400',
    ghost:
      'bg-transparent text-brand-muted hover:text-brand-text hover:bg-brand-canvas focus:ring-slate-200',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${
        variantClasses[variant] || variantClasses.primary
      } ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 text-current" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
