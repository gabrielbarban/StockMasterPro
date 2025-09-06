import api from '@/lib/api';

export const apiService = {
  // Dashboard
  dashboard: {
    get: () => api.get('/dashboard'),
  },

  // Categorias
  categorias: {
    getAll: () => api.get('/categorias'),
    getById: (id) => api.get(`/categorias/${id}`),
    create: (data) => api.post('/categorias', data),
    update: (id, data) => api.put(`/categorias/${id}`, data),
    delete: (id) => api.delete(`/categorias/${id}`),
    getStats: (id) => api.get(`/categorias/${id}/stats`),
  },

  // Fornecedores
  fornecedores: {
    getAll: (ativo) => api.get('/fornecedores', { params: { ativo } }),
    getById: (id) => api.get(`/fornecedores/${id}`),
    create: (data) => api.post('/fornecedores', data),
    update: (id, data) => api.put(`/fornecedores/${id}`, data),
    delete: (id) => api.delete(`/fornecedores/${id}`),
    getProdutos: (id) => api.get(`/fornecedores/${id}/produtos`),
    getStats: (id) => api.get(`/fornecedores/${id}/stats`),
  },

  // Produtos
  produtos: {
    getAll: (filters) => api.get('/produtos', { params: filters }),
    getById: (id) => api.get(`/produtos/${id}`),
    create: (data) => api.post('/produtos', data),
    update: (id, data) => api.put(`/produtos/${id}`, data),
    delete: (id) => api.delete(`/produtos/${id}`),
    updateEstoque: (id, quantidade) => api.patch(`/produtos/${id}/estoque`, { quantidade }),
    getBaixoEstoque: () => api.get('/produtos/baixo-estoque'),
    getMovimentacoes: (id, limit) => api.get(`/produtos/${id}/movimentacoes`, { params: { limit } }),
  },

  // Movimentações
  movimentacoes: {
    getAll: (filters) => api.get('/movimentacoes', { params: filters }),
    getById: (id) => api.get(`/movimentacoes/${id}`),
    create: (data) => api.post('/movimentacoes', data),
    getResumo: (produtoId, dias) => api.get(`/movimentacoes/produto/${produtoId}/resumo`, { params: { dias } }),
    getPorPeriodo: (dataInicio, dataFim) => api.get('/movimentacoes/periodo', { params: { data_inicio: dataInicio, data_fim: dataFim } }),
    getTopProdutos: (limite, dias) => api.get('/movimentacoes/top-produtos', { params: { limite, dias } }),
    getEstoquesPorData: (data) => api.get('/movimentacoes/estoques-data', { params: { data } }),
  },
};