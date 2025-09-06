const express = require('express');
const router = express.Router();
const movimentacoesController = require('../controllers/movimentacoesController');
const { authMiddleware, tenantMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', movimentacoesController.getAll);
router.get('/periodo', movimentacoesController.getMovimentacoesPorPeriodo);
router.get('/top-produtos', movimentacoesController.getTopProdutosSaida);
router.get('/estoques-data', movimentacoesController.getEstoquesPorData);
router.get('/:id', movimentacoesController.getById);
router.post('/', movimentacoesController.create);
router.get('/produto/:produto_id/resumo', movimentacoesController.getResumo);

module.exports = router;