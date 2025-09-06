const Fornecedor = require('../models/Fornecedor');

const fornecedoresController = {
    
    async getAll(req, res) {
        try {
            const { ativo } = req.query;
            const fornecedores = await Fornecedor.findAll(ativo);
            
            res.json({
                success: true,
                data: fornecedores,
                total: fornecedores.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar fornecedores',
                error: error.message
            });
        }
    },

    async getById(req, res) {
        try {
            const { id } = req.params;
            const fornecedor = await Fornecedor.findById(id);
            
            if (!fornecedor) {
                return res.status(404).json({
                    success: false,
                    message: 'Fornecedor não encontrado'
                });
            }

            res.json({
                success: true,
                data: fornecedor
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar fornecedor',
                error: error.message
            });
        }
    },

    async create(req, res) {
        try {
            const errors = Fornecedor.validateData(req.body);
            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors
                });
            }

            if (req.body.cnpj) {
                req.body.cnpj = Fornecedor.formatCnpj(req.body.cnpj);
            }
            if (req.body.telefone) {
                req.body.telefone = Fornecedor.formatTelefone(req.body.telefone);
            }

            const fornecedorData = { ...req.body, empresa_id: req.empresaId };
            const fornecedor = await Fornecedor.create(fornecedorData);
            res.status(201).json({
                success: true,
                message: 'Fornecedor criado com sucesso',
                data: fornecedor
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
            const errors = Fornecedor.validateData(req.body);
            
            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors
                });
            }

            // Limpar dados undefined antes de enviar para o model
            const dadosLimpos = {};
            Object.keys(req.body).forEach(key => {
                const value = req.body[key];
                if (value !== undefined) {
                    dadosLimpos[key] = value === '' ? null : value;
                }
            });

            console.log('📤 Controller - Dados limpos:', dadosLimpos);

            if (req.body.cnpj) {
                dadosLimpos.cnpj = Fornecedor.formatCnpj(req.body.cnpj);
            }
            if (req.body.telefone) {
                dadosLimpos.telefone = Fornecedor.formatTelefone(req.body.telefone);
            }

            const fornecedor = await Fornecedor.update(id, dadosLimpos);
            res.json({
                success: true,
                message: 'Fornecedor atualizado com sucesso',
                data: fornecedor
            });
        } catch (error) {
            console.error('❌ Erro no controller update:', error);
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await Fornecedor.delete(id);
            
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

    async deactivate(req, res) {
        try {
            const { id } = req.params;
            const fornecedor = await Fornecedor.deactivate(id);
            
            res.json({
                success: true,
                message: 'Fornecedor desativado com sucesso',
                data: fornecedor
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    async activate(req, res) {
        try {
            const { id } = req.params;
            const fornecedor = await Fornecedor.activate(id);
            
            res.json({
                success: true,
                message: 'Fornecedor ativado com sucesso',
                data: fornecedor
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    async getProdutos(req, res) {
        try {
            const { id } = req.params;
            const produtos = await Fornecedor.getProdutos(id);
            
            res.json({
                success: true,
                data: produtos,
                total: produtos.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar produtos do fornecedor',
                error: error.message
            });
        }
    },

    async getStats(req, res) {
        try {
            const { id } = req.params;
            const stats = await Fornecedor.getStats(id);
            
            if (!stats) {
                return res.status(404).json({
                    success: false,
                    message: 'Fornecedor não encontrado'
                });
            }

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar estatísticas',
                error: error.message
            });
        }
    }
};

module.exports = fornecedoresController;