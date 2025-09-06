// STOCKMASTER PRO - Servidor Principal
require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 3001;

// Função para inicializar o servidor
const startServer = async () => {
    try {
        // Testar conexão com o banco
        console.log('Testando conexão com o banco de dados...');
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.error('Não foi possível conectar ao banco de dados');
            process.exit(1);
        }

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('\nSTOCKMASTER PRO API');
            console.log('================================');
            console.log(`Servidor rodando na porta: ${PORT}`);
            console.log(`📱 URL: http://localhost:${PORT}`);
            console.log(`Health Check: http://localhost:${PORT}/api/health`);
            console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log('================================\n');
        });

    } catch (error) {
        console.error('Erro ao inicializar servidor:', error);
        process.exit(1);
    }
};

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
    console.error('Erro não capturado:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.error('Promise rejeitada:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Recebido SIGTERM. Desligando gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Recebido SIGINT. Desligando gracefully...');
    process.exit(0);
});

// Inicializar servidor
startServer();