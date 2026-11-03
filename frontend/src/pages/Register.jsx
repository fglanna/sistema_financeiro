import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { User, Mail, Lock, DollarSign, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Logo from '../components/common/Logo';

export default function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    initial_balance: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submitError) setSubmitError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'O nome completo é obrigatório.';
    }

    if (!formData.email) {
      errs.email = 'O e-mail é obrigatório.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Informe um e-mail válido.';
    }

    if (!formData.password) {
      errs.password = 'A senha é obrigatória.';
    } else if (formData.password.length < 6) {
      errs.password = 'A senha deve possuir no mínimo 6 caracteres.';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'As senhas informadas não coincidem.';
    }

    if (
      formData.initial_balance !== '' &&
      isNaN(Number(formData.initial_balance.replace(',', '.')))
    ) {
      errs.initial_balance = 'Informe um valor numérico válido para o saldo.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError('');

    const parsedBalance =
      formData.initial_balance !== ''
        ? Number(formData.initial_balance.replace(',', '.'))
        : 0;

    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      initial_balance: parsedBalance,
    });

    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setSubmitError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-brand-canvas flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-xl border border-brand-border shadow-card p-6 sm:p-8 my-6">
        {/* Cabeçalho do Card */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h2 className="text-xl font-bold font-display text-brand-text">
            Crie sua conta
          </h2>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Inicie seu controle financeiro com padrão executivo
          </p>
        </div>

        {/* Mensagem de Erro Geral */}
        {submitError && (
          <div className="mb-5 p-3.5 rounded-lg bg-brand-destructive-light border border-rose-200 flex items-start gap-2.5 text-xs sm:text-sm text-brand-destructive-dark">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome Completo"
            name="name"
            placeholder="Ex.: Maria Silva Santos"
            icon={User}
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            autoComplete="name"
          />

          <Input
            label="E-mail"
            name="email"
            type="email"
            placeholder="seu.email@exemplo.com"
            icon={Mail}
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            autoComplete="email"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Senha"
              name="password"
              type="password"
              placeholder="Mín. 6 dígitos"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              autoComplete="new-password"
            />

            <Input
              label="Confirmar Senha"
              name="confirmPassword"
              type="password"
              placeholder="Repita a senha"
              icon={Lock}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />
          </div>

          <Input
            label="Saldo Inicial (R$)"
            name="initial_balance"
            type="text"
            placeholder="0,00"
            helperText="Ponto de partida do seu fluxo de caixa (opcional, padrão R$ 0,00)"
            icon={DollarSign}
            value={formData.initial_balance}
            onChange={handleChange}
            error={errors.initial_balance}
            tabular
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-2"
            loading={isSubmitting}
          >
            Criar Conta e Entrar
          </Button>
        </form>

        {/* Rodapé do Card */}
        <div className="mt-6 pt-5 border-t border-brand-border text-center">
          <p className="text-xs text-brand-muted">
            Já tem uma conta cadastrada?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline"
            >
              Fazer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
