import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { DollarSign, AlertCircle } from 'lucide-react';

export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  categories = [],
  paymentMethods = [],
  isDuplicate = false,
}) {
  const [formData, setFormData] = useState({
    type: 'DESPESA',
    description: '',
    amount: '',
    category_id: '',
    payment_method_id: '',
    due_date: new Date().toISOString().split('T')[0],
    status: 'PENDENTE',
    payment_date: '',
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || 'DESPESA',
        description: initialData.description || '',
        amount: initialData.amount ? String(initialData.amount) : '',
        category_id: initialData.category_id || '',
        payment_method_id: initialData.payment_method_id ? String(initialData.payment_method_id) : '',
        due_date: initialData.due_date ? initialData.due_date.split('T')[0] : new Date().toISOString().split('T')[0],
        status: isDuplicate ? 'PENDENTE' : initialData.status || 'PENDENTE',
        payment_date: isDuplicate ? '' : initialData.payment_date ? initialData.payment_date.split('T')[0] : '',
      });
    } else {
      // Padrão para novo lançamento
      const defaultPaymentMethod = paymentMethods.length > 0 ? String(paymentMethods[0].id) : '';
      setFormData({
        type: 'DESPESA',
        description: '',
        amount: '',
        category_id: '',
        payment_method_id: defaultPaymentMethod,
        due_date: new Date().toISOString().split('T')[0],
        status: 'PENDENTE',
        payment_date: '',
      });
    }
    setErrors({});
    setSubmitError('');
  }, [initialData, isDuplicate, isOpen, paymentMethods]);

  // Filtra categorias compatíveis com o tipo selecionado (RN08)
  const filteredCategories = categories.filter((cat) => cat.type === formData.type);

  // Se a categoria selecionada atualmente não for do mesmo tipo, reseta a categoria
  const handleTypeChange = (newType) => {
    setFormData((prev) => {
      const isCurrentCategoryValid = categories.some(
        (c) => c.id === prev.category_id && c.type === newType
      );
      return {
        ...prev,
        type: newType,
        category_id: isCurrentCategoryValid ? prev.category_id : '',
      };
    });
    if (errors.category_id) {
      setErrors((prev) => ({ ...prev, category_id: '' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Regra RN05: se status mudar para PENDENTE, limpa payment_date
      if (name === 'status' && value === 'PENDENTE') {
        next.payment_date = '';
      }
      // Se status mudar para PAGO e não houver data, preenche com a data atual ou due_date
      if (name === 'status' && value === 'PAGO' && !next.payment_date) {
        next.payment_date = next.due_date || new Date().toISOString().split('T')[0];
      }
      return next;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submitError) setSubmitError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.description.trim()) {
      errs.description = 'A descrição do lançamento é obrigatória.';
    }

    const parsedAmount = Number(formData.amount.replace(',', '.'));
    if (!formData.amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      errs.amount = 'Informe um valor numérico maior que zero.';
    }

    if (!formData.category_id) {
      errs.category_id = 'Selecione uma categoria compatível.';
    }

    if (!formData.payment_method_id) {
      errs.payment_method_id = 'Selecione uma forma de pagamento.';
    }

    if (!formData.due_date) {
      errs.due_date = 'A data de vencimento é obrigatória.';
    }

    // Validação RN05
    if (formData.status === 'PAGO' && !formData.payment_date) {
      errs.payment_date = 'A data de pagamento é obrigatória para lançamentos com status PAGO.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError('');

    const payload = {
      description: formData.description.trim(),
      amount: Number(formData.amount.replace(',', '.')),
      type: formData.type,
      category_id: formData.category_id,
      payment_method_id: Number(formData.payment_method_id),
      due_date: formData.due_date,
      status: formData.status,
      payment_date: formData.status === 'PAGO' ? formData.payment_date : null,
    };

    try {
      await onSave(payload, initialData && !isDuplicate ? initialData.id : null);
      onClose();
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || 'Ocorreu um erro ao salvar o lançamento financeiro.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle = isDuplicate
    ? 'Duplicar Lançamento'
    : initialData
    ? 'Editar Lançamento'
    : 'Novo Lançamento';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {submitError && (
          <div className="p-3 rounded-lg bg-brand-destructive-light border border-rose-200 text-brand-destructive-dark text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Tipo: Receita ou Despesa */}
        <div>
          <label className="block text-xs font-semibold text-brand-secondary mb-1.5 tracking-wide">
            Tipo de Lançamento <span className="text-brand-destructive-dark">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange('RECEITA')}
              className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                formData.type === 'RECEITA'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                  : 'bg-white text-slate-500 border-brand-border hover:bg-slate-50'
              }`}
            >
              + RECEITA (Entrada)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('DESPESA')}
              className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                formData.type === 'DESPESA'
                  ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm'
                  : 'bg-white text-slate-500 border-brand-border hover:bg-slate-50'
              }`}
            >
              - DESPESA (Saída)
            </button>
          </div>
        </div>

        {/* Descrição */}
        <Input
          label="Descrição"
          name="description"
          placeholder="Ex.: Supermercado, Salário, Energia elétrica"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          required
        />

        {/* Valor e Categoria */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Valor (R$)"
            name="amount"
            placeholder="0,00"
            icon={DollarSign}
            value={formData.amount}
            onChange={handleChange}
            error={errors.amount}
            tabular
            required
          />

          <Select
            label="Categoria"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            error={errors.category_id}
            required
          >
            <option value="">Selecione uma categoria...</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} {cat.is_default ? '(Padrão)' : ''}
              </option>
            ))}
          </Select>
        </div>

        {/* Forma de Pagamento e Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Forma de Pagamento"
            name="payment_method_id"
            value={formData.payment_method_id}
            onChange={handleChange}
            error={errors.payment_method_id}
            required
          >
            <option value="">Selecione...</option>
            {paymentMethods.map((pm) => (
              <option key={pm.id} value={pm.id}>
                {pm.name}
              </option>
            ))}
          </Select>

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="PENDENTE">Pendente</option>
            <option value="PAGO">Pago / Recebido</option>
          </Select>
        </div>

        {/* Datas: Vencimento e Pagamento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Data de Vencimento"
            name="due_date"
            type="date"
            value={formData.due_date}
            onChange={handleChange}
            error={errors.due_date}
            required
          />

          <Input
            label="Data de Pagamento"
            name="payment_date"
            type="date"
            value={formData.payment_date}
            onChange={handleChange}
            error={errors.payment_date}
            disabled={formData.status !== 'PAGO'}
            helperText={formData.status !== 'PAGO' ? 'Habilitado apenas quando status = PAGO' : ''}
          />
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-brand-border">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
          >
            {isDuplicate ? 'Criar Duplicata' : initialData ? 'Salvar Alterações' : 'Cadastrar Lançamento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
