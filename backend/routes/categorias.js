const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasController');
const { authMiddleware, tenantMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', categoriasController.getAll);
router.get('/:id', categoriasController.getById);
router.post('/', categoriasController.create);
router.put('/:id', categoriasController.update);
router.delete('/:id', categoriasController.delete);
router.get('/:id/stats', categoriasController.getStats);

module.exports = router;