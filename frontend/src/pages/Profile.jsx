import React, { useState, useEffect } from 'react';
import { User, Mail, DollarSign, AlertTriangle, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

export default function Profile() {
  const { user, updateProfile, deleteAccount } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    initial_balance: '',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal de exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        initial_balance:
          user.initial_balance !== undefined && user.initial_balance !== null
            ? String(user.initial_balance)
            : '0.00',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (successMessage) setSuccessMessage('');
    if (errorMessage) setErrorMessage('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'O nome completo é obrigatório.';
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsUpdating(true);
    setSuccessMessage('');
    setErrorMessage('');

    const parsedBalance = Number(formData.initial_balance.replace(',', '.'));

    const result = await updateProfile({
      name: formData.name.trim(),
      initial_balance: parsedBalance,
    });

    setIsUpdating(false);

    if (result.success) {
      setSuccessMessage('Dados do perfil atualizados com sucesso.');
    } else {
      setErrorMessage(result.error);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const result = await deleteAccount();
    setIsDeleting(false);

    if (!result.success) {
      setErrorMessage(result.error);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-brand-text">
          Configurações do Perfil
        </h2>
        <p className="text-xs sm:text-sm text-brand-muted mt-1">
          Gerencie suas informações cadastrais, saldo de partida e configurações de conta
        </p>
      </div>

      {/* Alertas de Notificação */}
      {successMessage && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs sm:text-sm text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-lg bg-brand-destructive-light border border-rose-200 flex items-center gap-2.5 text-xs sm:text-sm text-brand-destructive-dark animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Card 1: Dados Pessoais & Financeiros */}
      <div className="bg-white rounded-xl border border-brand-border shadow-card p-6 sm:p-8">
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-brand-border">
          <div className="w-10 h-10 rounded-full bg-brand-primary-light text-brand-primary flex items-center justify-center font-display font-bold text-sm">
            {user?.name
              ? user.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
              : 'FP'}
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-brand-text">
              Dados Cadastrais
            </h3>
            <p className="text-xs text-brand-muted">
              Identificação do titular da conta e parâmetro base do fluxo de caixa
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-5 max-w-xl">
          <Input
            label="Nome Completo"
            name="name"
            value={formData.name}
            onChange={handleChange}
            icon={User}
            error={errors.name}
            required
          />

          <Input
            label="Endereço de E-mail"
            name="email"
            value={formData.email}
            icon={Mail}
            disabled
            helperText="O endereço de e-mail é utilizado para autenticação e não pode ser alterado diretamente."
          />

          <Input
            label="Saldo Inicial (R$)"
            name="initial_balance"
            type="text"
            value={formData.initial_balance}
            onChange={handleChange}
            icon={DollarSign}
            error={errors.initial_balance}
            helperText="Valor de abertura da conta. Utilizado na fórmula RN02 do Saldo Atual."
            tabular
            required
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isUpdating}
            >
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>

      {/* Card 2: Zona Destrutiva (RN10) */}
      <div className="bg-white rounded-xl border border-rose-200 shadow-card p-6 sm:p-8">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-rose-100">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-brand-destructive-dark flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-brand-destructive-dark">
              Área Destrutiva — Exclusão de Conta
            </h3>
            <p className="text-xs text-brand-muted">
              Ações com remoção irreversível de informações e lançamentos financeiros
            </p>
          </div>
        </div>

        <div className="space-y-4 max-w-xl">
          <p className="text-xs sm:text-sm text-brand-text-body leading-relaxed">
            Ao excluir sua conta, todos os seus dados cadastrais, categorias personalizadas e lançamentos financeiros de receitas e despesas serão permanentemente excluídos do banco de dados (exclusão em cascata conforme regra RN10). Esta ação é definitiva e não pode ser desfeita.
          </p>

          <Button
            type="button"
            variant="destructive"
            size="md"
            icon={Trash2}
            onClick={() => {
              setDeleteConfirmationText('');
              setIsDeleteModalOpen(true);
            }}
          >
            Excluir Minha Conta Definitivamente
          </Button>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Exclusão de Conta"
      >
        <div className="space-y-4 text-left">
          <div className="p-3.5 rounded-lg bg-brand-destructive-light border border-rose-200 text-brand-destructive-dark text-xs sm:text-sm">
            <p className="font-bold mb-1">Atenção! Esta ação é irreversível.</p>
            <p>
              Todos os lançamentos financeiros, histórico de saldos e categorias criadas por você serão removidos imediatamente.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-secondary mb-1.5">
              Para confirmar, digite <span className="font-bold text-brand-destructive-dark select-none">EXCLUIR</span> no campo abaixo:
            </label>
            <input
              type="text"
              placeholder="EXCLUIR"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-brand-border-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-brand-destructive-dark"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="md"
              onClick={handleDeleteAccount}
              loading={isDeleting}
              disabled={deleteConfirmationText.trim().toUpperCase() !== 'EXCLUIR'}
            >
              Excluir Definitivamente
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
