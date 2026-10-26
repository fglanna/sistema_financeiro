import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!password) {
      errs.password = 'A nova senha é obrigatória.';
    } else if (password.length < 6) {
      errs.password = 'A senha deve possuir no mínimo 6 caracteres.';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'As senhas informadas não coincidem.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!token) {
      setSubmitError('Token de recuperação não encontrado ou link inválido.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await api.post('/auth/reset-password', {
        token,
        new_password: password,
      });
      setIsSuccess(true);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message ||
          'Não foi possível redefinir sua senha. O link pode ter expirado ou já ter sido utilizado.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-canvas flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-xl border border-brand-border shadow-card p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <img
              src="/assets/logo.png"
              alt="FinPulse Logo"
              className="h-10 w-auto object-contain"
            />
            <span className="font-display font-bold text-2xl text-brand-text tracking-tight">
              FinPulse
            </span>
          </div>
          <h2 className="text-xl font-bold font-display text-brand-text">
            Redefinir Senha
          </h2>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Defina uma nova senha segura para acessar sua conta
          </p>
        </div>

        {submitError && (
          <div className="mb-5 p-3.5 rounded-lg bg-brand-destructive-light border border-rose-200 flex items-start gap-2.5 text-xs sm:text-sm text-brand-destructive-dark">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        {!token ? (
          <div className="text-center space-y-4">
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm text-left">
              <p className="font-semibold mb-1">Link de recuperação inválido</p>
              <p>
                O token de segurança não foi identificado na URL. Solicite um novo link de redefinição de senha.
              </p>
            </div>
            <Link to="/forgot-password">
              <Button variant="primary" size="md" className="w-full">
                Solicitar Novo Link
              </Button>
            </Link>
          </div>
        ) : isSuccess ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-brand-tertiary-light text-brand-tertiary-dark mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-text">
              Senha redefinida com sucesso!
            </h3>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              Sua nova credencial foi atualizada e o token anterior foi invalidado por segurança. Você já pode fazer login na plataforma.
            </p>
            <div className="pt-4">
              <Link to="/login">
                <Button variant="primary" size="md" className="w-full">
                  Fazer Login Agora
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nova Senha"
              name="password"
              type="password"
              placeholder="Mínimo de 6 caracteres"
              icon={Lock}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                if (submitError) setSubmitError('');
              }}
              error={errors.password}
              required
              autoComplete="new-password"
            />

            <Input
              label="Confirmação da Nova Senha"
              name="confirmPassword"
              type="password"
              placeholder="Repita a nova senha"
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                if (submitError) setSubmitError('');
              }}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              loading={isSubmitting}
            >
              Salvar Nova Senha
            </Button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-secondary hover:text-brand-primary"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar para o Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
