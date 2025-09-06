import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

export function useFornecedores(ativo = null) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFornecedores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.fornecedores.getAll(ativo);
      setData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar fornecedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFornecedores();
  }, [ativo]);

  const createFornecedor = async (fornecedorData) => {
    try {
      await apiService.fornecedores.create(fornecedorData);
      fetchFornecedores();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Erro ao criar fornecedor' 
      };
    }
  };

  const updateFornecedor = async (id, fornecedorData) => {
    try {
      console.log('INICIANDO UPDATE FORNECEDOR');
      console.log('ID:', id);
      console.log('Dados:', JSON.stringify(fornecedorData, null, 2));
      
      const response = await apiService.fornecedores.update(id, fornecedorData);
      
      console.log('UPDATE SUCESSO:', response.data);
      fetchFornecedores();
      return { success: true };
    } catch (err) {
      console.error('ERRO NO UPDATE:', err);
      console.error('RESPONSE DATA:', err.response?.data);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Erro ao atualizar fornecedor' 
      };
    }
  };

  const deleteFornecedor = async (id) => {
    try {
      await apiService.fornecedores.delete(id);
      fetchFornecedores();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Erro ao deletar fornecedor' 
      };
    }
  };

  const toggleFornecedor = async (id, ativo) => {
    try {
      console.log('Alterando status do fornecedor:', id, 'de', ativo, 'para', !ativo);
      
      // Buscar os dados atuais do fornecedor primeiro
      const fornecedorAtual = data.find(f => f.id === id);
      if (!fornecedorAtual) {
        throw new Error('Fornecedor não encontrado');
      }
      
      // Enviar todos os dados do fornecedor com o novo status
      const dadosCompletos = {
        nome: fornecedorAtual.nome,
        email: fornecedorAtual.email,
        telefone: fornecedorAtual.telefone,
        cnpj: fornecedorAtual.cnpj,
        endereco: fornecedorAtual.endereco,
        contato_responsavel: fornecedorAtual.contato_responsavel,
        ativo: !ativo // Inverter o status atual
      };
      
      console.log('Enviando dados:', dadosCompletos);
      
      const response = await apiService.fornecedores.update(id, dadosCompletos);
      console.log('Status alterado com sucesso:', response.data);
      
      fetchFornecedores();
      return { success: true };
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || 'Erro ao alterar status do fornecedor' 
      };
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchFornecedores,
    createFornecedor,
    updateFornecedor,
    deleteFornecedor,
    toggleFornecedor
  };
}