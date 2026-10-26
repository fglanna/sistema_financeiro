import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitError('');

    if (!email) {
      setError('O e-mail é obrigatório.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Informe um endereço de e-mail válido.');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
    } catch (err) {
      if (err.response?.status === 429) {
        setSubmitError(
          'Muitas tentativas em pouco tempo. Por segurança, aguarde alguns minutos e tente novamente.'
        );
      } else {
        // Exibição da confirmação genérica ou mensagem segura de erro
        setSubmitError(
          err.response?.data?.message ||
            'Não foi possível processar a solicitação no momento. Tente novamente mais tarde.'
        );
      }
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
            Recuperar Senha
          </h2>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Informe seu e-mail cadastrado para receber as instruções de redefinição
          </p>
        </div>

        {submitError && (
          <div className="mb-5 p-3.5 rounded-lg bg-brand-destructive-light border border-rose-200 flex items-start gap-2.5 text-xs sm:text-sm text-brand-destructive-dark">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        {isSubmitted ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-brand-tertiary-light text-brand-tertiary-dark mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brand-text">
              Verifique sua caixa de entrada
            </h3>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              Se houver uma conta associada a{' '}
              <strong className="text-brand-text">{email}</strong>, enviamos um link de uso único válido por 1 hora para redefinir sua senha.
            </p>
            <div className="pt-4">
              <Link to="/login">
                <Button variant="secondary" size="md" className="w-full">
                  Voltar para o Login
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail de cadastro"
              name="email"
              type="email"
              placeholder="seu.email@exemplo.com"
              icon={Mail}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
                if (submitError) setSubmitError('');
              }}
              error={error}
              required
              autoComplete="email"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              loading={isSubmitting}
            >
              Enviar Link de Recuperação
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
