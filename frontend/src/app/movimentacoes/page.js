'use client';

import { useState } from 'react';
import { 
  TrendingUp, Plus, ArrowUp, ArrowDown, Calendar, 
  Package, Filter, Search 
} from 'lucide-react';
import { useMovimentacoes } from '@/hooks/useMovimentacoes';
import MovimentacaoModal from '@/components/forms/MovimentacaoModal';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SimpleLayout from '@/components/layout/SimpleLayout';

export default function MovimentacoesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [tipoFilter, setTipoFilter] = useState('');
  
  const { 
    data: movimentacoes, 
    loading, 
    error, 
    refetch, 
    createMovimentacao 
  } = useMovimentacoes(filters);

  const handleSave = async (movimentacaoData) => {
    return await createMovimentacao(movimentacaoData);
  };

  const handleFilterChange = (tipo) => {
    setTipoFilter(tipo);
    if (tipo === '') {
      setFilters({});
    } else {
      setFilters({ tipo });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const entradas = movimentacoes.filter(m => m.tipo === 'entrada');
  const saidas = movimentacoes.filter(m => m.tipo === 'saida');

  if (loading) {
    return (
      <ProtectedRoute>
        <SimpleLayout currentPage="Movimentações">
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando movimentações...</p>
            </div>
          </div>
        </SimpleLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SimpleLayout currentPage="Movimentações">
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Movimentações</h1>
                    <p className="text-gray-600">Histórico de entradas e saídas do estoque</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Movimentação
                </button>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="max-w-7xl mx-auto px-4 py-6">
            
            {/* Filtros */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center space-x-4">
                <Filter className="h-5 w-5 text-gray-400" />
                <button
                  onClick={() => handleFilterChange('')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    tipoFilter === '' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => handleFilterChange('entrada')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    tipoFilter === 'entrada' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Entradas
                </button>
                <button
                  onClick={() => handleFilterChange('saida')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    tipoFilter === 'saida' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Saídas
                </button>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold">{movimentacoes.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <ArrowUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Entradas</p>
                    <p className="text-2xl font-bold text-green-600">{entradas.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <ArrowDown className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Saídas</p>
                    <p className="text-2xl font-bold text-red-600">{saidas.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Hoje</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {movimentacoes.filter(m => 
                        new Date(m.data_movimentacao).toDateString() === new Date().toDateString()
                      ).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Movimentações */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {movimentacoes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data/Hora
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantidade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Motivo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Responsável
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {movimentacoes.map((movimentacao) => (
                        <tr key={movimentacao.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(movimentacao.data_movimentacao)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Package className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {movimentacao.produto_nome}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {movimentacao.produto_codigo}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              movimentacao.tipo === 'entrada'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {movimentacao.tipo === 'entrada' ? (
                                <ArrowUp className="h-3 w-3 mr-1" />
                              ) : (
                                <ArrowDown className="h-3 w-3 mr-1" />
                              )}
                              {movimentacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {movimentacao.quantidade}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {movimentacao.motivo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {movimentacao.preco_unitario ? 
                              formatCurrency(movimentacao.preco_unitario * movimentacao.quantidade) : 
                              '-'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {movimentacao.responsavel || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma movimentação encontrada</h3>
                  <p className="text-gray-500 mb-4">
                    Comece registrando sua primeira movimentação de estoque.
                  </p>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Primeira Movimentação
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Modal */}
          <MovimentacaoModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
          />
        </div>
      </SimpleLayout>
    </ProtectedRoute>
  );
}