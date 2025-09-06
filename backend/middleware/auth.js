const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token não fornecido'
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
        
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }
};

const tenantMiddleware = (req, res, next) => {
    if (!req.user || !req.user.empresaId) {
        return res.status(403).json({
            success: false,
            message: 'Acesso negado - empresa não identificada'
        });
    }
    
    req.empresaId = req.user.empresaId;
    next();
};

module.exports = { authMiddleware, tenantMiddleware };