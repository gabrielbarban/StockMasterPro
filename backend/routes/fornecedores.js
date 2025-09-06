const express = require('express');
const router = express.Router();
const fornecedoresController = require('../controllers/fornecedoresController');
const { authMiddleware, tenantMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', fornecedoresController.getAll);
router.get('/:id', fornecedoresController.getById);
router.post('/', fornecedoresController.create);
router.put('/:id', fornecedoresController.update);
router.delete('/:id', fornecedoresController.delete);
router.patch('/:id/deactivate', fornecedoresController.deactivate);
router.patch('/:id/activate', fornecedoresController.activate);
router.get('/:id/produtos', fornecedoresController.getProdutos);
router.get('/:id/stats', fornecedoresController.getStats);

module.exports = router;