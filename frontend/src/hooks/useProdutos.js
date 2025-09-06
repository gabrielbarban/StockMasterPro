import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

export function useProdutos(filters = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.produtos.getAll(filters);
      setData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, [JSON.stringify(filters)]);

  const createProduto = async (produtoData) => {
    try {
      await apiService.produtos.create(produtoData);
      fetchProdutos();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Erro ao criar produto' 
      };
    }
  };

  const updateProduto = async (id, produtoData) => {
    try {
      await apiService.produtos.update(id, produtoData);
      fetchProdutos();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Erro ao atualizar produto' 
      };
    }
  };

  const deleteProduto = async (id) => {
    try {
      await apiService.produtos.delete(id);
      fetchProdutos();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Erro ao deletar produto' 
      };
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchProdutos,
    createProduto,
    updateProduto,
    deleteProduto
  };
}