import React, { forwardRef } from 'react';

const Select = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      className = '',
      id,
      name,
      required,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || name || Math.random().toString(36).substring(2, 9);

    return (
      <div className="w-full text-left">
        {label && (
          <label
            htmlFor={selectId}
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
          <select
            ref={ref}
            id={selectId}
            name={name}
            disabled={disabled}
            required={required}
            className={`w-full h-10 px-3 bg-white border rounded-lg text-sm text-brand-text transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
              Icon ? 'pl-9' : ''
            } ${
              error
                ? 'border-brand-destructive-dark focus:border-brand-destructive-dark focus:ring-rose-200'
                : 'border-brand-border-dark hover:border-slate-400'
            } ${className}`}
            {...props}
          >
            {children}
          </select>
        </div>
        {error ? (
          <p className="mt-1 text-xs text-brand-destructive-dark font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-brand-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
