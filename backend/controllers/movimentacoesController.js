const Movimentacao = require('../models/Movimentacao');

const movimentacoesController = {
    
    async getAll(req, res) {
        try {
            const filters = {
                produto_id: req.query.produto_id,
                tipo: req.query.tipo,
                motivo: req.query.motivo,
                data_inicio: req.query.data_inicio,
                data_fim: req.query.data_fim,
                limit: req.query.limit || 50
            };

            Object.keys(filters).forEach(key => {
                if (filters[key] === undefined || filters[key] === '') {
                    delete filters[key];
                }
            });

            const movimentacoes = await Movimentacao.findAll(filters);
            
            res.json({
                success: true,
                data: movimentacoes,
                total: movimentacoes.length,
                filters: filters
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar movimentações',
                error: error.message
            });
        }
    },

    async getById(req, res) {
        try {
            const { id } = req.params;
            const movimentacao = await Movimentacao.findById(id);
            
            if (!movimentacao) {
                return res.status(404).json({
                    success: false,
                    message: 'Movimentação não encontrada'
                });
            }

            res.json({
                success: true,
                data: movimentacao
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar movimentação',
                error: error.message
            });
        }
    },

    async create(req, res) {
        try {
            const errors = Movimentacao.validateData(req.body);
            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors
                });
            }

            console.log('📤 Criando movimentação:', req.body);

            const movimentacao = await Movimentacao.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Movimentação criada com sucesso',
                data: movimentacao
            });
        } catch (error) {
            console.error('❌ Erro no create movimentação:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    async getResumo(req, res) {
        try {
            const { produto_id } = req.params;
            const { dias } = req.query;
            
            const resumo = await Movimentacao.getResumoMovimentacoes(produto_id, dias);
            
            res.json({
                success: true,
                data: resumo
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar resumo de movimentações',
                error: error.message
            });
        }
    },

    async getMovimentacoesPorPeriodo(req, res) {
        try {
            const { data_inicio, data_fim } = req.query;
            
            if (!data_inicio || !data_fim) {
                return res.status(400).json({
                    success: false,
                    message: 'Data de início e fim são obrigatórias'
                });
            }

            const movimentacoes = await Movimentacao.getMovimentacoesPorPeriodo(data_inicio, data_fim);
            
            res.json({
                success: true,
                data: movimentacoes,
                periodo: { data_inicio, data_fim }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar movimentações por período',
                error: error.message
            });
        }
    },

    async getTopProdutosSaida(req, res) {
        try {
            const { limite, dias } = req.query;
            
            const produtos = await Movimentacao.getTopProdutosSaida(limite, dias);
            
            res.json({
                success: true,
                data: produtos,
                parametros: { limite: limite || 10, dias: dias || 30 }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar produtos mais vendidos',
                error: error.message
            });
        }
    },

    async getEstoquesPorData(req, res) {
        try {
            const { data } = req.query;
            
            if (!data) {
                return res.status(400).json({
                    success: false,
                    message: 'Data é obrigatória'
                });
            }

            const estoques = await Movimentacao.getEstoquesPorData(data);
            
            res.json({
                success: true,
                data: estoques,
                data_consulta: data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar estoques por data',
                error: error.message
            });
        }
    }
};

module.exports = movimentacoesController;