'use client';

import { useState } from 'react';
import { 
  Users, Plus, Edit2, Trash2, Package, 
  Phone, Mail, MapPin, Building, 
  ToggleLeft, ToggleRight, Eye, EyeOff 
} from 'lucide-react';
import { useFornecedores } from '@/hooks/useFornecedores';
import FornecedorModal from '@/components/forms/FornecedorModal';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SimpleLayout from '@/components/layout/SimpleLayout';

export default function FornecedoresPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  
  const { 
    data: fornecedores, 
    loading, 
    error, 
    refetch, 
    createFornecedor, 
    updateFornecedor, 
    deleteFornecedor,
    toggleFornecedor 
  } = useFornecedores(showInactive ? null : 1);

  const handleSave = async (fornecedorData) => {
    if (editingFornecedor) {
      return await updateFornecedor(editingFornecedor.id, fornecedorData);
    } else {
      return await createFornecedor(fornecedorData);
    }
  };

  const handleEdit = (fornecedor) => {
    setEditingFornecedor(fornecedor);
    setModalOpen(true);
  };

  const handleDelete = async (fornecedor) => {
    if (confirm(`Tem certeza que deseja deletar o fornecedor "${fornecedor.nome}"?`)) {
      const result = await deleteFornecedor(fornecedor.id);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const handleToggleStatus = async (fornecedor) => {
    const action = fornecedor.ativo ? 'desativar' : 'ativar';
    if (confirm(`Tem certeza que deseja ${action} o fornecedor "${fornecedor.nome}"?`)) {
      console.log('Toggling fornecedor:', fornecedor.id, 'ativo atual:', fornecedor.ativo);
      const result = await toggleFornecedor(fornecedor.id, fornecedor.ativo);
      console.log('Result:', result);
      if (!result.success) {
        alert(`Erro ao ${action} fornecedor: ${result.error}`);
      }
    }
  };

  const fornecedoresAtivos = fornecedores.filter(f => f.ativo);
  const fornecedoresInativos = fornecedores.filter(f => !f.ativo);

  if (loading) {
    return (
      <ProtectedRoute>
        <SimpleLayout currentPage="Fornecedores">
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando fornecedores...</p>
            </div>
          </div>
        </SimpleLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SimpleLayout currentPage="Fornecedores">
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Fornecedores</h1>
                    <p className="text-gray-600">Gerencie seus fornecedores e parceiros</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Toggle para mostrar inativos */}
                  <button
                    onClick={() => setShowInactive(!showInactive)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {showInactive ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        <span>Ocultar Inativos</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        <span>Mostrar Inativos</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      setEditingFornecedor(null);
                      setModalOpen(true);
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Fornecedor
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="max-w-7xl mx-auto px-4 py-6">
            
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold">{fornecedores.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <ToggleRight className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Ativos</p>
                    <p className="text-2xl font-bold text-green-600">{fornecedoresAtivos.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <ToggleLeft className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Inativos</p>
                    <p className="text-2xl font-bold text-red-600">{fornecedoresInativos.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Produtos</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {fornecedores.reduce((acc, f) => acc + (f.total_produtos || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid de Fornecedores */}
            {fornecedores.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {fornecedores.map((fornecedor) => (
                  <div 
                    key={fornecedor.id} 
                    className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow ${
                      !fornecedor.ativo ? 'opacity-60' : ''
                    }`}
                  >
                    
                    {/* Header do Card */}
                    <div className="p-6 border-b">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-bold text-gray-900 mr-2">{fornecedor.nome}</h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              fornecedor.ativo 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          
                          {fornecedor.contato_responsavel && (
                            <p className="text-sm text-gray-600 mb-1">
                              👤 {fornecedor.contato_responsavel}
                            </p>
                          )}
                          
                          <div className="text-xs text-gray-500">
                            {fornecedor.total_produtos || 0} produto(s) cadastrado(s)
                          </div>
                        </div>
                        
                        {/* Ações */}
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleToggleStatus(fornecedor)}
                            className={`p-2 rounded-lg ${
                              fornecedor.ativo 
                                ? 'text-red-600 hover:bg-red-50' 
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={fornecedor.ativo ? 'Desativar' : 'Ativar'}
                          >
                            {fornecedor.ativo ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleEdit(fornecedor)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(fornecedor)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Deletar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Informações de Contato */}
                    <div className="p-6 space-y-3">
                      {fornecedor.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{fornecedor.email}</span>
                        </div>
                      )}
                      
                      {fornecedor.telefone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{fornecedor.telefone}</span>
                        </div>
                      )}
                      
                      {fornecedor.cnpj && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Building className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{fornecedor.cnpj}</span>
                        </div>
                      )}
                      
                      {fornecedor.endereco && (
                        <div className="flex items-start text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                          <span className="line-clamp-2">{fornecedor.endereco}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer do Card */}
                    <div className="px-6 pb-6">
                      <div className="text-xs text-gray-500">
                        Criado em: {new Date(fornecedor.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Estado Vazio */
              <div className="bg-white rounded-lg shadow text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum fornecedor encontrado</h3>
                <p className="text-gray-600 mb-6">
                  {showInactive 
                    ? 'Nenhum fornecedor inativo encontrado.' 
                    : 'Comece cadastrando seu primeiro fornecedor.'
                  }
                </p>
                <button
                  onClick={() => {
                    setEditingFornecedor(null);
                    setModalOpen(true);
                  }}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Cadastrar Primeiro Fornecedor
                </button>
              </div>
            )}
          </div>

          {/* Modal */}
          <FornecedorModal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setEditingFornecedor(null);
            }}
            fornecedor={editingFornecedor}
            onSave={handleSave}
          />
        </div>
      </SimpleLayout>
    </ProtectedRoute>
  );
}