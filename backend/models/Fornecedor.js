const { executeQuery } = require('../config/database');

class Fornecedor {
    
    static async findAll(empresa_id, ativo = null) {
        let query = `
            SELECT 
                id,
                nome,
                email,
                telefone,
                cnpj,
                endereco,
                contato_responsavel,
                ativo,
                created_at,
                updated_at,
                (SELECT COUNT(*) FROM produtos WHERE fornecedor_id = fornecedores.id AND ativo = 1 AND empresa_id = ?) as total_produtos
            FROM fornecedores 
            WHERE empresa_id = ?
        `;
        
        const params = [empresa_id, empresa_id];
        if (ativo !== null) {
            query += ' AND ativo = ?';
            params.push(ativo);
        }
        
        query += ' ORDER BY nome ASC';
        
        return await executeQuery(query, params);
    }

    static async findById(id, empresa_id) {
        const query = `
            SELECT 
                id,
                nome,
                email,
                telefone,
                cnpj,
                endereco,
                contato_responsavel,
                ativo,
                created_at,
                updated_at,
                (SELECT COUNT(*) FROM produtos WHERE fornecedor_id = fornecedores.id AND ativo = 1 AND empresa_id = ?) as total_produtos
            FROM fornecedores 
            WHERE id = ? AND empresa_id = ?
        `;
        const result = await executeQuery(query, [empresa_id, id, empresa_id]);
        return result[0] || null;
    }

    static async findByCnpj(cnpj, empresa_id) {
        const query = 'SELECT * FROM fornecedores WHERE cnpj = ? AND empresa_id = ?';
        const result = await executeQuery(query, [cnpj, empresa_id]);
        return result[0] || null;
    }

    static async findByEmail(email, empresa_id) {
        const query = 'SELECT * FROM fornecedores WHERE email = ? AND empresa_id = ?';
        const result = await executeQuery(query, [email, empresa_id]);
        return result[0] || null;
    }

    static async create(fornecedorData) {
        const { 
            nome, 
            email, 
            telefone, 
            cnpj, 
            endereco, 
            contato_responsavel,
            empresa_id
        } = fornecedorData;
        
        if (cnpj) {
            const existingCnpj = await this.findByCnpj(cnpj, empresa_id);
            if (existingCnpj) {
                throw new Error('Já existe um fornecedor com este CNPJ');
            }
        }

        if (email) {
            const existingEmail = await this.findByEmail(email, empresa_id);
            if (existingEmail) {
                throw new Error('Já existe um fornecedor com este email');
            }
        }

        const query = `
            INSERT INTO fornecedores (
                nome, 
                email, 
                telefone, 
                cnpj, 
                endereco, 
                contato_responsavel,
                empresa_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const result = await executeQuery(query, [
            nome, 
            email || null, 
            telefone || null, 
            cnpj || null, 
            endereco || null, 
            contato_responsavel || null,
            empresa_id
        ]);
        
        return await this.findById(result.insertId, empresa_id);
    }

    static async update(id, fornecedorData, empresa_id) {
        const { 
            nome, 
            email, 
            telefone, 
            cnpj, 
            endereco, 
            contato_responsavel, 
            ativo 
        } = fornecedorData;
        
        const existingFornecedor = await this.findById(id, empresa_id);
        if (!existingFornecedor) {
            throw new Error('Fornecedor não encontrado');
        }

        if (cnpj && cnpj !== existingFornecedor.cnpj) {
            const fornecedorWithSameCnpj = await this.findByCnpj(cnpj, empresa_id);
            if (fornecedorWithSameCnpj) {
                throw new Error('Já existe um fornecedor com este CNPJ');
            }
        }

        if (email && email !== existingFornecedor.email) {
            const fornecedorWithSameEmail = await this.findByEmail(email, empresa_id);
            if (fornecedorWithSameEmail) {
                throw new Error('Já existe um fornecedor com este email');
            }
        }

        const query = `
            UPDATE fornecedores 
            SET nome = COALESCE(?, nome),
                email = ?,
                telefone = ?,
                cnpj = ?,
                endereco = ?,
                contato_responsavel = ?,
                ativo = COALESCE(?, ativo),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND empresa_id = ?
        `;
        
        await executeQuery(query, [
            nome || null, 
            email || null, 
            telefone || null, 
            cnpj || null, 
            endereco || null, 
            contato_responsavel || null, 
            ativo !== undefined ? ativo : null, 
            id,
            empresa_id
        ]);
        
        return await this.findById(id, empresa_id);
    }

    static async delete(id, empresa_id) {
        const fornecedor = await this.findById(id, empresa_id);
        if (!fornecedor) {
            throw new Error('Fornecedor não encontrado');
        }

        if (fornecedor.total_produtos > 0) {
            throw new Error('Não é possível deletar fornecedor que possui produtos associados');
        }

        const query = 'DELETE FROM fornecedores WHERE id = ? AND empresa_id = ?';
        await executeQuery(query, [id, empresa_id]);
        
        return { message: 'Fornecedor deletado com sucesso' };
    }

    static async deactivate(id, empresa_id) {
        const query = 'UPDATE fornecedores SET ativo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND empresa_id = ?';
        await executeQuery(query, [id, empresa_id]);
        return await this.findById(id, empresa_id);
    }

    static async activate(id, empresa_id) {
        const query = 'UPDATE fornecedores SET ativo = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND empresa_id = ?';
        await executeQuery(query, [id, empresa_id]);
        return await this.findById(id, empresa_id);
    }

    static async getProdutos(id, empresa_id) {
        const query = `
            SELECT 
                p.*,
                c.nome as categoria_nome
            FROM produtos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.fornecedor_id = ? AND p.empresa_id = ?
            ORDER BY p.nome ASC
        `;
        return await executeQuery(query, [id, empresa_id]);
    }

    static async getStats(id, empresa_id) {
        const query = `
            SELECT 
                f.id,
                f.nome,
                COUNT(p.id) as total_produtos,
                SUM(CASE WHEN p.ativo = 1 THEN 1 ELSE 0 END) as produtos_ativos,
                SUM(p.estoque_atual * p.preco_custo) as valor_total_estoque,
                AVG(p.preco_custo) as preco_medio_produtos
            FROM fornecedores f
            LEFT JOIN produtos p ON f.id = p.fornecedor_id AND p.empresa_id = f.empresa_id
            WHERE f.id = ? AND f.empresa_id = ?
            GROUP BY f.id, f.nome
        `;
        const result = await executeQuery(query, [id, empresa_id]);
        return result[0] || null;
    }

    static validateData(data) {
        const errors = [];

        if (!data.nome || data.nome.trim().length < 2) {
            errors.push('Nome é obrigatório e deve ter pelo menos 2 caracteres');
        }

        if (data.nome && data.nome.length > 150) {
            errors.push('Nome não pode ter mais de 150 caracteres');
        }

        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Email deve ter um formato válido');
        }

        if (data.cnpj && !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(data.cnpj)) {
            errors.push('CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX');
        }

        if (data.telefone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(data.telefone)) {
            errors.push('Telefone deve estar no formato (XX) XXXXX-XXXX');
        }

        return errors;
    }

    static formatCnpj(cnpj) {
        if (!cnpj) return null;
        const numbers = cnpj.replace(/\D/g, '');
        if (numbers.length !== 14) return cnpj;
        return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    static formatTelefone(telefone) {
        if (!telefone) return null;
        const numbers = telefone.replace(/\D/g, '');
        if (numbers.length === 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else if (numbers.length === 11) {
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        return telefone;
    }
}

module.exports = Fornecedor;