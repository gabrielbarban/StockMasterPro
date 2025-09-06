const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');
const { authMiddleware, tenantMiddleware } = require('../middleware/auth');

// DEBUG: Log de todas as requisições
router.use((req, res, next) => {
    console.log('🔍 Dashboard Route - Headers:', {
        authorization: req.headers.authorization,
        'content-type': req.headers['content-type']
    });
    next();
});

// Aplicar middlewares de autenticação
router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', async (req, res) => {
    try {
        console.log('📊 Dashboard - Usuario autenticado:', req.user);
        console.log('📊 Dashboard - Empresa ID:', req.empresaId);
        
        const empresaId = req.empresaId;
        
        const queries = {
            totalProdutos: `
                SELECT COUNT(*) as total FROM produtos WHERE ativo = 1 AND empresa_id = ?
            `,
            produtosBaixoEstoque: `
                SELECT COUNT(*) as total FROM produtos 
                WHERE estoque_atual <= estoque_minimo AND ativo = 1 AND empresa_id = ?
            `,
            valorTotalEstoque: `
                SELECT SUM(estoque_atual * preco_custo) as valor_total 
                FROM produtos WHERE ativo = 1 AND empresa_id = ?
            `,
            totalCategorias: `
                SELECT COUNT(*) as total FROM categorias WHERE empresa_id = ?
            `,
            totalFornecedores: `
                SELECT COUNT(*) as total FROM fornecedores WHERE ativo = 1 AND empresa_id = ?
            `,
            movimentacoesRecentes: `
                SELECT COUNT(*) as total FROM movimentacoes 
                WHERE DATE(data_movimentacao) = CURDATE() AND empresa_id = ?
            `,
            produtosCriticos: `
                SELECT 
                    p.id,
                    p.nome,
                    p.codigo,
                    p.estoque_atual,
                    p.estoque_minimo,
                    c.nome as categoria
                FROM produtos p
                LEFT JOIN categorias c ON p.categoria_id = c.id
                WHERE p.estoque_atual <= p.estoque_minimo AND p.ativo = 1 AND p.empresa_id = ?
                ORDER BY (p.estoque_atual - p.estoque_minimo) ASC
                LIMIT 10
            `
        };

        const results = {};
        
        for (const [key, query] of Object.entries(queries)) {
            console.log(`📊 Executando query: ${key}`);
            results[key] = await executeQuery(query, [empresaId]);
        }

        const dashboard = {
            resumo: {
                total_produtos: results.totalProdutos[0]?.total || 0,
                produtos_baixo_estoque: results.produtosBaixoEstoque[0]?.total || 0,
                valor_total_estoque: results.valorTotalEstoque[0]?.valor_total || 0,
                total_categorias: results.totalCategorias[0]?.total || 0,
                total_fornecedores: results.totalFornecedores[0]?.total || 0,
                movimentacoes_hoje: results.movimentacoesRecentes[0]?.total || 0
            },
            produtos_criticos: results.produtosCriticos
        };

        console.log('📊 Dashboard response:', dashboard);

        res.json({
            success: true,
            data: dashboard
        });

    } catch (error) {
        console.error('❌ Erro no dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar dados do dashboard',
            error: error.message
        });
    }
});

module.exports = router;