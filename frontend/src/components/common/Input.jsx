import React, { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      type = 'text',
      className = '',
      id,
      name,
      required,
      disabled,
      tabular = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || name || Math.random().toString(36).substring(2, 9);

    return (
      <div className="w-full text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-brand-secondary mb-1.5 tracking-wide"
          >
            {label} {required && <span className="text-brand-destructive-dark">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-sm">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-muted">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            disabled={disabled}
            required={required}
            className={`w-full h-10 px-3 bg-white border rounded-lg text-sm text-brand-text placeholder-brand-muted/70 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
              Icon ? 'pl-9' : ''
            } ${
              error
                ? 'border-brand-destructive-dark focus:border-brand-destructive-dark focus:ring-rose-200'
                : 'border-brand-border-dark hover:border-slate-400'
            } ${tabular ? 'tabular-nums text-right' : ''} ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1 text-xs text-brand-destructive-dark flex items-center gap-1 font-medium">
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-brand-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
