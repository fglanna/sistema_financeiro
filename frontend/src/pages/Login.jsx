import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Logo from '../components/common/Logo';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redireciona se já estiver autenticado
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
    if (!formData.email) {
      errs.email = 'O e-mail é obrigatório.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Informe um endereço de e-mail válido.';
    }

    if (!formData.password) {
      errs.password = 'A senha é obrigatória.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError('');

    const result = await login(formData.email, formData.password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setSubmitError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-brand-canvas flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-xl border border-brand-border shadow-card p-6 sm:p-8">
        {/* Cabeçalho do Card com Logo Oficial */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h2 className="text-xl font-bold font-display text-brand-text">
            Acesse sua conta
          </h2>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Gestão financeira executiva com alto rigor e clareza
          </p>
        </div>

        {/* Alerta de Erro Geral */}
        {submitError && (
          <div className="mb-5 p-3.5 rounded-lg bg-brand-destructive-light border border-rose-200 flex items-start gap-2.5 text-xs sm:text-sm text-brand-destructive-dark">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="E-mail profissional ou pessoal"
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-brand-secondary tracking-wide"
              >
                Senha <span className="text-brand-destructive-dark">*</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-brand-primary hover:text-brand-primary-hover hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-2"
            loading={isSubmitting}
          >
            Entrar no Painel
          </Button>
        </form>

        {/* Rodapé do Card */}
        <div className="mt-6 pt-5 border-t border-brand-border text-center">
          <p className="text-xs text-brand-muted">
            Ainda não possui uma conta?{' '}
            <Link
              to="/register"
              className="font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline"
            >
              Cadastre-se gratuitamente
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
