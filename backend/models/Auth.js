const { executeQuery } = require('../config/database');
const bcrypt = require('bcryptjs');

class Auth {
    
    static async createEmpresa(empresaData) {
        const { nome, cnpj, email, telefone, endereco } = empresaData;
        
        const query = `
            INSERT INTO empresas (nome, cnpj, email, telefone, endereco) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const result = await executeQuery(query, [
            nome, 
            cnpj || null, 
            email || null, 
            telefone || null, 
            endereco || null
        ]);
        return result.insertId;
    }
    
    static async createUsuario(userData) {
        const { empresa_id, nome, email, password, tipo } = userData;
        
        const passwordHash = await bcrypt.hash(password, 10);
        
        const query = `
            INSERT INTO usuarios (empresa_id, nome, email, password_hash, tipo) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const result = await executeQuery(query, [
            empresa_id, 
            nome, 
            email, 
            passwordHash, 
            tipo || 'admin'
        ]);
        return await this.findUsuarioById(result.insertId);
    }
    
    static async findUsuarioByEmail(email, empresaNome) {
        const query = `
            SELECT 
                u.*,
                e.nome as empresa_nome,
                e.cnpj as empresa_cnpj,
                e.ativo as empresa_ativo
            FROM usuarios u
            JOIN empresas e ON u.empresa_id = e.id
            WHERE u.email = ? AND e.nome = ? AND u.ativo = 1 AND e.ativo = 1
        `;
        
        const result = await executeQuery(query, [email, empresaNome]);
        return result[0] || null;
    }
    
    static async findUsuarioById(id) {
        const query = `
            SELECT 
                u.*,
                e.nome as empresa_nome,
                e.cnpj as empresa_cnpj
            FROM usuarios u
            JOIN empresas e ON u.empresa_id = e.id
            WHERE u.id = ?
        `;
        
        const result = await executeQuery(query, [id]);
        return result[0] || null;
    }
    
    static async findEmpresaByNome(nome) {
        const query = 'SELECT * FROM empresas WHERE nome = ? AND ativo = 1';
        const result = await executeQuery(query, [nome]);
        return result[0] || null;
    }
    
    static async findEmpresaByCnpj(cnpj) {
        const query = 'SELECT * FROM empresas WHERE cnpj = ?';
        const result = await executeQuery(query, [cnpj]);
        return result[0] || null;
    }
    
    static async verificarPassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }
    
    static async updateUltimoLogin(usuarioId) {
        const query = 'UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?';
        await executeQuery(query, [usuarioId]);
    }
    
    static async registerEmpresaCompleta(data) {
        const { empresa_nome, empresa_cnpj, admin_nome, admin_email, admin_password } = data;
        
        if (empresa_cnpj) {
            const empresaExistente = await this.findEmpresaByCnpj(empresa_cnpj);
            if (empresaExistente) {
                throw new Error('CNPJ já cadastrado');
            }
        }
        
        const empresaExistente = await this.findEmpresaByNome(empresa_nome);
        if (empresaExistente) {
            throw new Error('Nome da empresa já existe');
        }
        
        const emailExistente = await this.findUsuarioByEmail(admin_email, empresa_nome);
        if (emailExistente) {
            throw new Error('Email já cadastrado');
        }
        
        const empresaId = await this.createEmpresa({
            nome: empresa_nome,
            cnpj: empresa_cnpj || null,
            email: admin_email || null
        });
        
        const usuario = await this.createUsuario({
            empresa_id: empresaId,
            nome: admin_nome,
            email: admin_email,
            password: admin_password,
            tipo: 'admin'
        });
        
        return {
            empresa: await this.findEmpresaByNome(empresa_nome),
            usuario: usuario
        };
    }
}

module.exports = Auth;