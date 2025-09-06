import { useState, useEffect } from 'react';
import { X, Save, Package } from 'lucide-react';
import { apiService } from '@/services/api';

export default function ProdutoModal({ isOpen, onClose, produto, onSave }) {
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    categoria_id: '',
    fornecedor_id: '',
    preco_custo: '',
    preco_venda: '',
    estoque_atual: '',
    estoque_minimo: '',
    estoque_maximo: '',
    unidade_medida: 'un'
  });
  
  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchCategorias();
      fetchFornecedores();
      
      if (produto) {
        setFormData({
          codigo: produto.codigo || '',
          nome: produto.nome || '',
          descricao: produto.descricao || '',
          categoria_id: produto.categoria_id || '',
          fornecedor_id: produto.fornecedor_id || '',
          preco_custo: produto.preco_custo || '',
          preco_venda: produto.preco_venda || '',
          estoque_atual: produto.estoque_atual || '',
          estoque_minimo: produto.estoque_minimo || '',
          estoque_maximo: produto.estoque_maximo || '',
          unidade_medida: produto.unidade_medida || 'un'
        });
      } else {
        setFormData({
          codigo: '',
          nome: '',
          descricao: '',
          categoria_id: '',
          fornecedor_id: '',
          preco_custo: '',
          preco_venda: '',
          estoque_atual: '',
          estoque_minimo: '',
          estoque_maximo: '',
          unidade_medida: 'un'
        });
      }
    }
  }, [isOpen, produto]);

  const fetchCategorias = async () => {
    try {
      const response = await apiService.categorias.getAll();
      setCategorias(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const fetchFornecedores = async () => {
    try {
      const response = await apiService.fornecedores.getAll();
      setFornecedores(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
    }
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-black">
              {produto ? 'Editar Produto' : 'Novo Produto'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.general}
              </div>
            )}

            {/* Código e Nome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Código *
                </label>
                <input
                  type="text"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: TECH001"
                  required
                />
              </div>
              
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
                  placeholder="Nome do produto"
                  required
                />
              </div>
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
                placeholder="Descrição detalhada do produto"
              />
            </div>

            {/* Categoria e Fornecedor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Categoria
                </label>
                <select
                  name="categoria_id"
                  value={formData.categoria_id}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" className="text-gray-400">Selecione uma categoria</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id} className="text-black">
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Fornecedor
                </label>
                <select
                  name="fornecedor_id"
                  value={formData.fornecedor_id}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" className="text-gray-400">Selecione um fornecedor</option>
                  {fornecedores.map(fornecedor => (
                    <option key={fornecedor.id} value={fornecedor.id} className="text-black">
                      {fornecedor.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preços */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Preço de Custo (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="preco_custo"
                  value={formData.preco_custo}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Preço de Venda (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="preco_venda"
                  value={formData.preco_venda}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Estoque */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Estoque Atual
                </label>
                <input
                  type="number"
                  name="estoque_atual"
                  value={formData.estoque_atual}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Estoque Mínimo
                </label>
                <input
                  type="number"
                  name="estoque_minimo"
                  value={formData.estoque_minimo}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Estoque Máximo
                </label>
                <input
                  type="number"
                  name="estoque_maximo"
                  value={formData.estoque_maximo}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100"
                />
              </div>
            </div>

            {/* Unidade de Medida */}
            <div className="w-full md:w-48">
              <label className="block text-sm font-bold text-black mb-2">
                Unidade de Medida
              </label>
              <select
                name="unidade_medida"
                value={formData.unidade_medida}
                onChange={handleChange}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-black font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="un" className="text-black">Unidade</option>
                <option value="kg" className="text-black">Quilograma</option>
                <option value="g" className="text-black">Grama</option>
                <option value="l" className="text-black">Litro</option>
                <option value="ml" className="text-black">Mililitro</option>
                <option value="m" className="text-black">Metro</option>
                <option value="cm" className="text-black">Centímetro</option>
              </select>
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