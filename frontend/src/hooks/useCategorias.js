import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

export function useCategorias() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.categorias.getAll();
      setData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const createCategoria = async (categoriaData) => {
    try {
      await apiService.categorias.create(categoriaData);
      fetchCategorias();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Erro ao criar categoria' 
      };
    }
  };

  const updateCategoria = async (id, categoriaData) => {
    try {
      await apiService.categorias.update(id, categoriaData);
      fetchCategorias();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Erro ao atualizar categoria' 
      };
    }
  };

  const deleteCategoria = async (id) => {
    try {
      await apiService.categorias.delete(id);
      fetchCategorias();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Erro ao deletar categoria' 
      };
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria
  };
}