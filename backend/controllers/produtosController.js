const Produto = require('../models/Produto');

const produtosController = {
    
    async getAll(req, res) {
        try {
            const filters = {
                empresa_id: req.empresaId,
                ativo: req.query.ativo,
                categoria_id: req.query.categoria_id,
                fornecedor_id: req.query.fornecedor_id,
                status_estoque: req.query.status_estoque,
                search: req.query.search
            };

            Object.keys(filters).forEach(key => {
                if (filters[key] === undefined || filters[key] === '') {
                    delete filters[key];
                }
            });

            // Manter empresa_id sempre
            filters.empresa_id = req.empresaId;

            const produtos = await Produto.findAll(filters);
            
            res.json({
                success: true,
                data: produtos,
                total: produtos.length,
                filters: filters
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar produtos',
                error: error.message
            });
        }
    },

    async getById(req, res) {
        try {
            const { id } = req.params;
            const produto = await Produto.findById(id);
            
            if (!produto) {
                return res.status(404).json({
                    success: false,
                    message: 'Produto não encontrado'
                });
            }

            res.json({
                success: true,
                data: produto
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar produto',
                error: error.message
            });
        }
    },

    async create(req, res) {
        try {
            const errors = Produto.validateData(req.body);
            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors
                });
            }

            const produto = await Produto.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Produto criado com sucesso',
                data: produto
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const errors = Produto.validateData(req.body);
            
            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors
                });
            }

            const produto = await Produto.update(id, req.body);
            res.json({
                success: true,
                message: 'Produto atualizado com sucesso',
                data: produto
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await Produto.delete(id);
            
            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    async updateEstoque(req, res) {
        try {
            const { id } = req.params;
            const { quantidade } = req.body;

            if (quantidade < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantidade não pode ser negativa'
                });
            }

            const produto = await Produto.updateEstoque(id, quantidade);
            res.json({
                success: true,
                message: 'Estoque atualizado com sucesso',
                data: produto
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    async getBaixoEstoque(req, res) {
        try {
            const produtos = await Produto.getProdutosBaixoEstoque();
            
            res.json({
                success: true,
                data: produtos,
                total: produtos.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar produtos com baixo estoque',
                error: error.message
            });
        }
    },

    async getMovimentacoes(req, res) {
        try {
            const { id } = req.params;
            const { limit } = req.query;
            
            const movimentacoes = await Produto.getMovimentacoes(id, limit);
            
            res.json({
                success: true,
                data: movimentacoes,
                total: movimentacoes.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar movimentações do produto',
                error: error.message
            });
        }
    }
};

module.exports = produtosController;