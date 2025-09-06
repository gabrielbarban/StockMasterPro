import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

export function useMovimentacoes(filters = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovimentacoes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.movimentacoes.getAll(filters);
      setData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar movimentações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovimentacoes();
  }, [JSON.stringify(filters)]);

  const createMovimentacao = async (movimentacaoData) => {
    try {
      await apiService.movimentacoes.create(movimentacaoData);
      fetchMovimentacoes();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Erro ao criar movimentação' 
      };
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchMovimentacoes,
    createMovimentacao
  };
}