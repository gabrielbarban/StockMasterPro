'use client';

import { useState } from 'react';
import { Tags, Plus, Edit2, Trash2, Package, BarChart3 } from 'lucide-react';
import { useCategorias } from '@/hooks/useCategorias';
import CategoriaModal from '@/components/forms/CategoriaModal';
import SimpleLayout from '@/components/layout/SimpleLayout';

export default function CategoriasPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  
  const { data: categorias, loading, error, refetch, createCategoria, updateCategoria, deleteCategoria } = useCategorias();

  const handleSave = async (categoriaData) => {
    if (editingCategoria) {
      return await updateCategoria(editingCategoria.id, categoriaData);
    } else {
      return await createCategoria(categoriaData);
    }
  };

  const handleEdit = (categoria) => {
    setEditingCategoria(categoria);
    setModalOpen(true);
  };

  const handleDelete = async (categoria) => {
    if (confirm(`Tem certeza que deseja deletar a categoria "${categoria.nome}"?`)) {
      const result = await deleteCategoria(categoria.id);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  if (loading) {
    return (
      <SimpleLayout currentPage="Categorias">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando categorias...</p>
          </div>
        </div>
      </SimpleLayout>
    );
  }

  return (
    <SimpleLayout currentPage="Categorias">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Tags className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
                  <p className="text-gray-600">Organize seus produtos por categorias</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingCategoria(null);
                  setModalOpen(true);
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Tags className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total de Categorias</p>
                  <p className="text-2xl font-bold">{categorias.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total de Produtos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {categorias.reduce((acc, cat) => acc + (cat.total_produtos || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Categoria Mais Usada</p>
                  <p className="text-lg font-bold text-purple-600">
                    {categorias.length > 0 
                      ? categorias.reduce((prev, current) => 
                          (current.total_produtos > prev.total_produtos) ? current : prev
                        ).nome
                      : 'Nenhuma'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Categorias */}
          {categorias.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categorias.map((categoria) => (
                <div key={categoria.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  
                  {/* Header do Card */}
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: categoria.cor }}
                        />
                        <h3 className="text-lg font-bold text-gray-900">{categoria.nome}</h3>
                      </div>
                      
                      {/* Ações */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(categoria)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(categoria)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {categoria.descricao && (
                      <p className="text-gray-600 text-sm">{categoria.descricao}</p>
                    )}
                  </div>

                  {/* Estatísticas do Card */}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{categoria.total_produtos || 0}</p>
                        <p className="text-xs text-gray-500">Produtos</p>
                      </div>
                      
                      <div className="text-center">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: categoria.cor + '20' }}
                        >
                          <Package 
                            className="h-6 w-6" 
                            style={{ color: categoria.cor }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer do Card */}
                  <div className="px-6 pb-6">
                    <div className="text-xs text-gray-500">
                      Criada em: {new Date(categoria.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Estado Vazio */
            <div className="bg-white rounded-lg shadow text-center py-12">
              <Tags className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma categoria encontrada</h3>
              <p className="text-gray-600 mb-6">
                Comece criando sua primeira categoria para organizar seus produtos.
              </p>
              <button
                onClick={() => {
                  setEditingCategoria(null);
                  setModalOpen(true);
                }}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Criar Primeira Categoria
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        <CategoriaModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingCategoria(null);
          }}
          categoria={editingCategoria}
          onSave={handleSave}
        />
      </div>
    </SimpleLayout>
  );
}