import { useState, useEffect } from 'react';
import { X, Save, Tags } from 'lucide-react';

export default function CategoriaModal({ isOpen, onClose, categoria, onSave }) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cor: '#3B82F6'
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (categoria) {
        setFormData({
          nome: categoria.nome || '',
          descricao: categoria.descricao || '',
          cor: categoria.cor || '#3B82F6'
        });
      } else {
        setFormData({
          nome: '',
          descricao: '',
          cor: '#3B82F6'
        });
      }
    }
  }, [isOpen, categoria]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const result = await onSave(formData);
      if (result.success) {
        onClose();
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'Erro inesperado' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const cores = [
    { nome: 'Azul', valor: '#3B82F6' },
    { nome: 'Verde', valor: '#10B981' },
    { nome: 'Amarelo', valor: '#F59E0B' },
    { nome: 'Vermelho', valor: '#EF4444' },
    { nome: 'Roxo', valor: '#8B5CF6' },
    { nome: 'Rosa', valor: '#EC4899' },
    { nome: 'Índigo', valor: '#6366F1' },
    { nome: 'Cinza', valor: '#6B7280' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Tags className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-black">
              {categoria ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.general}
              </div>
            )}

            {/* Nome */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Nome *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Eletrônicos, Roupas, Casa..."
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Descrição
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                rows={3}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descrição da categoria (opcional)"
              />
            </div>

            {/* Cor */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Cor da Categoria
              </label>
              <div className="grid grid-cols-4 gap-3">
                {cores.map((cor) => (
                  <button
                    key={cor.valor}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, cor: cor.valor }))}
                    className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all ${
                      formData.cor === cor.valor 
                        ? 'border-gray-900 scale-105' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div 
                      className="w-6 h-6 rounded-full mr-2"
                      style={{ backgroundColor: cor.valor }}
                    />
                    <span className="text-sm font-medium text-black">{cor.nome}</span>
                  </button>
                ))}
              </div>
              
              {/* Preview da cor selecionada */}
              <div className="mt-3 flex items-center">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-gray-300 mr-3"
                  style={{ backgroundColor: formData.cor }}
                />
                <span className="text-sm text-black font-medium">Cor selecionada: {formData.cor}</span>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-4 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-black font-semibold bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Save className="h-5 w-5 mr-2" />
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}