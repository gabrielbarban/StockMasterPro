// STOCKMASTER PRO - Configuração do Banco de Dados
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuração da conexão
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'stockmaster_pro',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    charset: 'utf8mb4'
};

// Criar pool de conexões
const pool = mysql.createPool(dbConfig);

// Função para testar conexão
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conectado ao MySQL com sucesso!');
        console.log(`📊 Database: ${process.env.DB_NAME}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar com o MySQL:', error.message);
        return false;
    }
};

// Função para executar queries
const executeQuery = async (query, params = []) => {
    try {
        const [results] = await pool.execute(query, params);
        return results;
    } catch (error) {
        console.error('❌ Erro na query:', error.message);
        throw error;
    }
};

// Função para executar queries com múltiplos resultados
const executeQueryMultiple = async (query, params = []) => {
    try {
        const results = await pool.execute(query, params);
        return results;
    } catch (error) {
        console.error('❌ Erro na query múltipla:', error.message);
        throw error;
    }
};

module.exports = {
    pool,
    testConnection,
    executeQuery,
    executeQueryMultiple
};