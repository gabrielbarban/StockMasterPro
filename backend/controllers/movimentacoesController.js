const Movimentacao = require('../models/Movimentacao');

const movimentacoesController = {
    
    async getAll(req, res) {
        try {
            const mysql = require('mysql2');
            
            const connection = mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME || 'stockmaster_pro'
            });
            
            const empresaId = req.empresaId;
            
            // Usar query callback ao invés de execute/promise
            connection.query(
                `SELECT 
                    m.id,
                    m.produto_id,
                    m.tipo,
                    m.quantidade,
                    m.motivo,
                    m.preco_unitario,
                    m.observacoes,
                    m.responsavel,
                    m.documento,
                    m.data_movimentacao,
                    m.created_at,
                    p.nome as produto_nome,
                    p.codigo as produto_codigo
                FROM movimentacoes m
                LEFT JOIN produtos p ON m.produto_id = p.id
                WHERE m.empresa_id = ?
                ORDER BY m.data_movimentacao DESC 
                LIMIT 50`,
                [empresaId],
                (error, results) => {
                    connection.end();
                    
                    if (error) {
                        console.error('Erro query callback movimentações:', error);
                        return res.status(500).json({
                            success: false,
                            message: error.message
                        });
                    }
                    
                    res.json({
                        success: true,
                        data: results,
                        total: results.length
                    });
                }
            );
            
        } catch (error) {
            console.error('Erro movimentações controller:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    async getById(req, res) {
        try {
            const { id } = req.params;
            const movimentacao = await Movimentacao.findById(id, req.empresaId);
            
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

            const movimentacaoData = { ...req.body, empresa_id: req.empresaId };
            const movimentacao = await Movimentacao.create(movimentacaoData);
            res.status(201).json({
                success: true,
                message: 'Movimentação criada com sucesso',
                data: movimentacao
            });
        } catch (error) {
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
            
            const resumo = await Movimentacao.getResumoMovimentacoes(produto_id, req.empresaId, dias);
            
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

            const movimentacoes = await Movimentacao.getMovimentacoesPorPeriodo(req.empresaId, data_inicio, data_fim);
            
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
            
            const produtos = await Movimentacao.getTopProdutosSaida(req.empresaId, limite, dias);
            
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

            const estoques = await Movimentacao.getEstoquesPorData(req.empresaId, data);
            
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