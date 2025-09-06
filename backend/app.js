// STOCKMASTER PRO - Configuração da Aplicação Express
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Criar aplicação Express
const app = express();

// =============================================
// MIDDLEWARES DE SEGURANÇA
// =============================================

// Helmet para segurança básica
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // máximo 1000 requests por IP
    message: {
        error: 'Muitas tentativas. Tente novamente em 15 minutos.'
    }
});
app.use(limiter);

// CORS - permitir frontend
const corsOptions = {
    origin: [
        'http://localhost:3000', // Next.js dev
        'http://127.0.0.1:3000',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// =============================================
// MIDDLEWARES DE PARSING
// =============================================

// Parse JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// =============================================
// MIDDLEWARE PERSONALIZADO
// =============================================

// Middleware para adicionar timestamp nas requests
app.use((req, res, next) => {
    req.timestamp = new Date().toISOString();
    next();
});

// Middleware para headers personalizados
app.use((req, res, next) => {
    res.setHeader('X-API-Version', '1.0.0');
    res.setHeader('X-Powered-By', 'StockMaster Pro');
    next();
});

// =============================================
// ROTAS
// =============================================

// Rota de health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'StockMaster Pro API está funcionando!',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime()
    });
});

// Rota raiz
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'StockMaster Pro API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            produtos: '/api/produtos',
            categorias: '/api/categorias',
            fornecedores: '/api/fornecedores',
            movimentacoes: '/api/movimentacoes',
            dashboard: '/api/dashboard'
        }
    });
});

// Rotas da API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/fornecedores', require('./routes/fornecedores'));
app.use('/api/produtos', require('./routes/produtos'));
app.use('/api/movimentacoes', require('./routes/movimentacoes'));
app.use('/api/dashboard', require('./routes/dashboard'));

// =============================================
// MIDDLEWARE DE ERRO 404
// =============================================
app.use((req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        message: `A rota ${req.method} ${req.originalUrl} não existe`,
        timestamp: new Date().toISOString()
    });
});

// =============================================
// MIDDLEWARE DE TRATAMENTO DE ERRO GLOBAL
// =============================================
app.use((error, req, res, next) => {
    console.error('Erro capturado:', error);
    
    // Erro de validação do MySQL
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
            error: 'Dados duplicados',
            message: 'Já existe um registro com essas informações'
        });
    }
    
    // Erro de conexão com banco
    if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
            error: 'Erro de conexão',
            message: 'Não foi possível conectar ao banco de dados'
        });
    }
    
    // Erro genérico
    res.status(error.status || 500).json({
        error: error.message || 'Erro interno do servidor',
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

module.exports = app;