import { useState, useEffect } from 'react';
import { X, Save, TrendingUp } from 'lucide-react';
import { apiService } from '@/services/api';

export default function MovimentacaoModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    produto_id: '',
    tipo: 'entrada',
    quantidade: '',
    motivo: '',
    preco_unitario: '',
    observacoes: '',
    responsavel: '',
    documento: ''
  });
  
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchProdutos();
      setFormData({
        produto_id: '',
        tipo: 'entrada',
        quantidade: '',
        motivo: '',
        preco_unitario: '',
        observacoes: '',
        responsavel: '',
        documento: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const fetchProdutos = async () => {
    try {
      const response = await apiService.produtos.getAll();
      setProdutos(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const dadosLimpos = {
        produto_id: parseInt(formData.produto_id),
        tipo: formData.tipo,
        quantidade: parseInt(formData.quantidade),
        motivo: formData.motivo,
        preco_unitario: formData.preco_unitario ? parseFloat(formData.preco_unitario) : null,
        observacoes: formData.observacoes || null,
        responsavel: formData.responsavel || null,
        documento: formData.documento || null
      };
      
      const result = await onSave(dadosLimpos);
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-black">Nova Movimentação</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.general}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">Produto *</label>
                <select
                  name="produto_id"
                  value={formData.produto_id}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map(produto => (
                    <option key={produto.id} value={produto.id}>{produto.nome} ({produto.codigo})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-black mb-2">Tipo *</label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">Quantidade *</label>
                <input
                  type="number"
                  name="quantidade"
                  value={formData.quantidade}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-black mb-2">Preço Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  name="preco_unitario"
                  value={formData.preco_unitario}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Motivo *</label>
              <input
                type="text"
                name="motivo"
                value={formData.motivo}
                onChange={handleChange}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Compra, Venda, Ajuste, Perda..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">Responsável</label>
                <input
                  type="text"
                  name="responsavel"
                  value={formData.responsavel}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Quem fez a movimentação"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-black mb-2">Documento</label>
                <input
                  type="text"
                  name="documento"
                  value={formData.documento}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="NF, Pedido, etc."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Observações</label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows={3}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Observações adicionais"
              />
            </div>

          </div>

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