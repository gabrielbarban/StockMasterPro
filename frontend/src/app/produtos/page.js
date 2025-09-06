'use client';

import { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, Filter, Edit2, Trash2, 
  AlertTriangle, TrendingUp, Eye 
} from 'lucide-react';
import { useProdutos } from '@/hooks/useProdutos';
import ProdutoModal from '@/components/forms/ProdutoModal';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SimpleLayout from '@/components/layout/SimpleLayout';
import { apiService } from '@/services/api';

export default function ProdutosPage() {
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [statusEstoque, setStatusEstoque] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [categorias, setCategorias] = useState([]);
  
  const { data: produtos, loading, error, refetch, createProduto, updateProduto, deleteProduto } = useProdutos(filters);

  useEffect(() => {
    fetchCategorias();
  }, []);

  useEffect(() => {
    const newFilters = {};
    if (searchTerm) newFilters.search = searchTerm;
    if (selectedCategoria) newFilters.categoria_id = selectedCategoria;
    if (statusEstoque) newFilters.status_estoque = statusEstoque;
    setFilters(newFilters);
  }, [searchTerm, selectedCategoria, statusEstoque]);

  const fetchCategorias = async () => {
    try {
      const response = await apiService.categorias.getAll();
      setCategorias(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const handleSave = async (produtoData) => {
    if (editingProduto) {
      return await updateProduto(editingProduto.id, produtoData);
    } else {
      return await createProduto(produtoData);
    }
  };

  const handleEdit = (produto) => {
    setEditingProduto(produto);
    setModalOpen(true);
  };

  const handleDelete = async (produto) => {
    if (confirm(`Tem certeza que deseja deletar o produto "${produto.nome}"?`)) {
      const result = await deleteProduto(produto.id);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const getStatusEstoque = (produto) => {
    if (produto.estoque_atual <= produto.estoque_minimo) {
      return { status: 'CRITICO', color: 'text-red-600 bg-red-50', label: 'Crítico' };
    } else if (produto.estoque_atual <= produto.estoque_minimo * 1.5) {
      return { status: 'BAIXO', color: 'text-yellow-600 bg-yellow-50', label: 'Baixo' };
    }
    return { status: 'OK', color: 'text-green-600 bg-green-50', label: 'OK' };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <SimpleLayout currentPage="Produtos">
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando produtos...</p>
            </div>
          </div>
        </SimpleLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SimpleLayout currentPage="Produtos">
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
                    <p className="text-gray-600">Gerencie seu catálogo de produtos</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingProduto(null);
                    setModalOpen(true);
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Produto
                </button>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Categoria */}
                <select
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas as categorias</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>

                {/* Status do Estoque */}
                <select
                  value={statusEstoque}
                  onChange={(e) => setStatusEstoque(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os status</option>
                  <option value="CRITICO">Estoque Crítico</option>
                  <option value="BAIXO">Estoque Baixo</option>
                </select>

                {/* Botão Limpar */}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategoria('');
                    setStatusEstoque('');
                  }}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold">{produtos.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Estoque Crítico</p>
                    <p className="text-2xl font-bold text-red-600">
                      {produtos.filter(p => p.estoque_atual <= p.estoque_minimo).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Valor Total</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(produtos.reduce((acc, p) => acc + (p.estoque_atual * p.preco_custo), 0))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Margem Média</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {produtos.length > 0 
                        ? (() => {
                            const produtosComMargem = produtos.filter(p => p.margem_percentual && !isNaN(p.margem_percentual));
                            return produtosComMargem.length > 0 
                              ? (produtosComMargem.reduce((acc, p) => acc + p.margem_percentual, 0) / produtosComMargem.length).toFixed(1)
                              : '0.0';
                          })()
                        : '0.0'
                      }%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela de Produtos */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preços
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estoque
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {produtos.map((produto) => {
                      const statusEstoque = getStatusEstoque(produto);
                      return (
                        <tr key={produto.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                              <div className="text-sm text-gray-500">{produto.codigo}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{produto.categoria_nome || 'Sem categoria'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div>Custo: {formatCurrency(produto.preco_custo)}</div>
                              <div>Venda: {formatCurrency(produto.preco_venda)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div>{produto.estoque_atual} {produto.unidade_medida}</div>
                              <div className="text-xs text-gray-500">Min: {produto.estoque_minimo}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusEstoque.color}`}>
                              {statusEstoque.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(produto)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(produto)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {produtos.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
                  <p className="text-gray-500 mb-4">
                    {Object.keys(filters).length > 0 
                      ? 'Tente ajustar os filtros ou criar um novo produto.' 
                      : 'Comece criando seu primeiro produto.'
                    }
                  </p>
                  <button
                    onClick={() => {
                      setEditingProduto(null);
                      setModalOpen(true);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Produto
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Modal */}
          <ProdutoModal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setEditingProduto(null);
            }}
            produto={editingProduto}
            onSave={handleSave}
          />
        </div>
      </SimpleLayout>
    </ProtectedRoute>
  );
}