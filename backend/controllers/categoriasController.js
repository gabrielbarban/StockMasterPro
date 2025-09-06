const Categoria = require('../models/Categoria');

const categoriasController = {
    
    async getAll(req, res) {
        try {
            const categorias = await Categoria.findAll(req.empresaId);
            res.json({
                success: true,
                data: categorias,
                total: categorias.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar categorias',
                error: error.message
            });
        }
    },

    async getById(req, res) {
        try {
            const { id } = req.params;
            const categoria = await Categoria.findById(id, req.empresaId);
            
            if (!categoria) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoria não encontrada'
                });
            }

            res.json({
                success: true,
                data: categoria
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar categoria',
                error: error.message
            });
        }
    },

    async create(req, res) {
        try {
            const errors = Categoria.validateData(req.body);
            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors
                });
            }

            const categoriaData = { ...req.body, empresa_id: req.empresaId };
            const categoria = await Categoria.create(categoriaData);
            res.status(201).json({
                success: true,
                message: 'Categoria criada com sucesso',
                data: categoria
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
            const errors = Categoria.validateData(req.body);
            
            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors
                });
            }

            const categoria = await Categoria.update(id, req.body, req.empresaId);
            res.json({
                success: true,
                message: 'Categoria atualizada com sucesso',
                data: categoria
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
            const result = await Categoria.delete(id, req.empresaId);
            
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

    async getStats(req, res) {
        try {
            const { id } = req.params;
            const stats = await Categoria.getStats(id, req.empresaId);
            
            if (!stats) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoria não encontrada'
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

module.exports = categoriasController;