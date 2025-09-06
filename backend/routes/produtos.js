const express = require('express');
const router = express.Router();
const produtosController = require('../controllers/produtosController');
const { authMiddleware, tenantMiddleware } = require('../middleware/auth');

// Aplicar middlewares em todas as rotas
router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', produtosController.getAll);
router.get('/baixo-estoque', produtosController.getBaixoEstoque);
router.get('/:id', produtosController.getById);
router.post('/', produtosController.create);
router.put('/:id', produtosController.update);
router.delete('/:id', produtosController.delete);
router.patch('/:id/estoque', produtosController.updateEstoque);
router.get('/:id/movimentacoes', produtosController.getMovimentacoes);

module.exports = router;