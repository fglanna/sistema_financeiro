import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { Tag, Edit2, Trash2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export default function CategoryManagerModal({
  isOpen,
  onClose,
  categories = [],
  onCategoriesUpdated,
}) {
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'RECEITA', 'DESPESA'
  const [formData, setFormData] = useState({
    name: '',
    type: 'DESPESA',
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({ name: '', type: 'DESPESA' });
    setEditingCategory(null);
    setError('');
    setSuccess('');
  };

  const handleStartEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
    });
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('O nome da categoria é obrigatório.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingCategory) {
        // Atualiza categoria existente
        await api.put(`/categories/${editingCategory.id}`, {
          name: formData.name.trim(),
          type: formData.type,
        });
        setSuccess('Categoria atualizada com sucesso.');
      } else {
        // Cria nova categoria
        await api.post('/categories', {
          name: formData.name.trim(),
          type: formData.type,
        });
        setSuccess('Nova categoria criada com sucesso.');
      }

      resetForm();
      if (onCategoriesUpdated) {
        await onCategoriesUpdated();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Não foi possível salvar a categoria. Verifique as informações.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Deseja realmente excluir a categoria "${category.name}"?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.delete(`/categories/${category.id}`);
      setSuccess('Categoria excluída com sucesso.');
      if (onCategoriesUpdated) {
        await onCategoriesUpdated();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Não é possível excluir esta categoria pois ela possui movimentações vinculadas (RN08).'
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((cat) => {
    if (activeTab === 'ALL') return true;
    return cat.type === activeTab;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Gerenciar Categorias"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Mensagens de Feedback */}
        {error && (
          <div className="p-3 rounded-lg bg-brand-destructive-light border border-rose-200 text-brand-destructive-dark text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Formulário de Criação / Edição */}
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-slate-50 border border-brand-border rounded-xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-brand-primary" />
              <span>
                {editingCategory ? 'Editar Categoria Personalizada' : 'Nova Categoria'}
              </span>
            </h4>
            {editingCategory && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-brand-muted hover:text-brand-text underline"
              >
                Cancelar edição
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2">
              <Input
                placeholder="Nome da categoria (ex.: Freelas, Pet Shop)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                disabled={!!editingCategory} // Trava defensiva se estiver editando para não violar RN08
              >
                <option value="DESPESA">Despesa</option>
                <option value="RECEITA">Receita</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={loading}
              icon={editingCategory ? Edit2 : Plus}
            >
              {editingCategory ? 'Atualizar Categoria' : 'Adicionar Categoria'}
            </Button>
          </div>
        </form>

        {/* Abas de Filtro */}
        <div className="flex items-center justify-between border-b border-brand-border pb-2">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'ALL'
                  ? 'bg-brand-primary text-white'
                  : 'text-brand-muted hover:bg-slate-100'
              }`}
            >
              Todas ({categories.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('RECEITA')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'RECEITA'
                  ? 'bg-emerald-600 text-white'
                  : 'text-brand-muted hover:bg-slate-100'
              }`}
            >
              Receitas ({categories.filter((c) => c.type === 'RECEITA').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('DESPESA')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'DESPESA'
                  ? 'bg-rose-600 text-white'
                  : 'text-brand-muted hover:bg-slate-100'
              }`}
            >
              Despesas ({categories.filter((c) => c.type === 'DESPESA').length})
            </button>
          </div>
        </div>

        {/* Lista de Categorias */}
        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
          {filteredCategories.length === 0 ? (
            <p className="text-center text-xs text-brand-muted py-6">
              Nenhuma categoria encontrada nesta aba.
            </p>
          ) : (
            filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="py-2.5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      cat.type === 'RECEITA' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  <span className="font-semibold text-brand-text truncate">
                    {cat.name}
                  </span>
                  {cat.is_default ? (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 font-medium border border-slate-200">
                      Padrão
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-50 text-brand-primary font-medium border border-indigo-200">
                      Personalizada
                    </span>
                  )}
                </div>

                {/* Ações (Apenas para categorias personalizadas do usuário) */}
                {!cat.is_default ? (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat)}
                      title="Editar nome"
                      className="p-1 text-brand-muted hover:text-brand-primary rounded hover:bg-slate-100 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat)}
                      title="Excluir categoria"
                      className="p-1 text-brand-muted hover:text-brand-destructive-dark rounded hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">
                    Somente leitura
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
