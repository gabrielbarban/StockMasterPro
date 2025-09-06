// STOCKMASTER PRO - Model de Fornecedores
const { executeQuery } = require('../config/database');

class Fornecedor {
    
    // Buscar todos os fornecedores
    static async findAll(ativo = null) {
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
                (SELECT COUNT(*) FROM produtos WHERE fornecedor_id = fornecedores.id AND ativo = 1) as total_produtos
            FROM fornecedores 
        `;
        
        const params = [];
        if (ativo !== null) {
            query += ' WHERE ativo = ?';
            params.push(ativo);
        }
        
        query += ' ORDER BY nome ASC';
        
        return await executeQuery(query, params);
    }

    // Buscar fornecedor por ID
    static async findById(id) {
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
                (SELECT COUNT(*) FROM produtos WHERE fornecedor_id = fornecedores.id AND ativo = 1) as total_produtos
            FROM fornecedores 
            WHERE id = ?
        `;
        const result = await executeQuery(query, [id]);
        return result[0] || null;
    }

    // Buscar fornecedor por CNPJ
    static async findByCnpj(cnpj) {
        const query = 'SELECT * FROM fornecedores WHERE cnpj = ?';
        const result = await executeQuery(query, [cnpj]);
        return result[0] || null;
    }

    // Buscar fornecedor por email
    static async findByEmail(email) {
        const query = 'SELECT * FROM fornecedores WHERE email = ?';
        const result = await executeQuery(query, [email]);
        return result[0] || null;
    }

    // Criar novo fornecedor
    static async create(fornecedorData) {
        const { 
            nome, 
            email, 
            telefone, 
            cnpj, 
            endereco, 
            contato_responsavel 
        } = fornecedorData;
        
        // Verificar se CNPJ já existe
        if (cnpj) {
            const existingCnpj = await this.findByCnpj(cnpj);
            if (existingCnpj) {
                throw new Error('Já existe um fornecedor com este CNPJ');
            }
        }

        // Verificar se email já existe
        if (email) {
            const existingEmail = await this.findByEmail(email);
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
                contato_responsavel
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const result = await executeQuery(query, [
            nome, 
            email, 
            telefone, 
            cnpj, 
            endereco, 
            contato_responsavel
        ]);
        
        // Retornar o fornecedor criado
        return await this.findById(result.insertId);
    }

    // Atualizar fornecedor
    static async update(id, fornecedorData) {
        const { 
            nome, 
            email, 
            telefone, 
            cnpj, 
            endereco, 
            contato_responsavel, 
            ativo 
        } = fornecedorData;
        
        // Verificar se existe
        const existingFornecedor = await this.findById(id);
        if (!existingFornecedor) {
            throw new Error('Fornecedor não encontrado');
        }

        // Verificar se CNPJ já está em uso por outro fornecedor
        if (cnpj && cnpj !== existingFornecedor.cnpj) {
            const fornecedorWithSameCnpj = await this.findByCnpj(cnpj);
            if (fornecedorWithSameCnpj) {
                throw new Error('Já existe um fornecedor com este CNPJ');
            }
        }

        // Verificar se email já está em uso por outro fornecedor
        if (email && email !== existingFornecedor.email) {
            const fornecedorWithSameEmail = await this.findByEmail(email);
            if (fornecedorWithSameEmail) {
                throw new Error('Já existe um fornecedor com este email');
            }
        }

        const query = `
            UPDATE fornecedores 
            SET nome = COALESCE(?, nome),
                email = COALESCE(?, email),
                telefone = COALESCE(?, telefone),
                cnpj = COALESCE(?, cnpj),
                endereco = COALESCE(?, endereco),
                contato_responsavel = COALESCE(?, contato_responsavel),
                ativo = COALESCE(?, ativo),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        await executeQuery(query, [
            nome, 
            email, 
            telefone, 
            cnpj, 
            endereco, 
            contato_responsavel, 
            ativo, 
            id
        ]);
        
        // Retornar o fornecedor atualizado
        return await this.findById(id);
    }

    // Deletar fornecedor (soft delete)
    static async delete(id) {
        // Verificar se existe
        const fornecedor = await this.findById(id);
        if (!fornecedor) {
            throw new Error('Fornecedor não encontrado');
        }

        // Verificar se tem produtos associados
        if (fornecedor.total_produtos > 0) {
            throw new Error('Não é possível deletar fornecedor que possui produtos associados');
        }

        const query = 'DELETE FROM fornecedores WHERE id = ?';
        await executeQuery(query, [id]);
        
        return { message: 'Fornecedor deletado com sucesso' };
    }

    // Desativar fornecedor
    static async deactivate(id) {
        const query = 'UPDATE fornecedores SET ativo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        await executeQuery(query, [id]);
        return await this.findById(id);
    }

    // Ativar fornecedor
    static async activate(id) {
        const query = 'UPDATE fornecedores SET ativo = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        await executeQuery(query, [id]);
        return await this.findById(id);
    }

    // Buscar produtos do fornecedor
    static async getProdutos(id) {
        const query = `
            SELECT 
                p.*,
                c.nome as categoria_nome
            FROM produtos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.fornecedor_id = ?
            ORDER BY p.nome ASC
        `;
        return await executeQuery(query, [id]);
    }

    // Estatísticas do fornecedor
    static async getStats(id) {
        const query = `
            SELECT 
                f.id,
                f.nome,
                COUNT(p.id) as total_produtos,
                SUM(CASE WHEN p.ativo = 1 THEN 1 ELSE 0 END) as produtos_ativos,
                SUM(p.estoque_atual * p.preco_custo) as valor_total_estoque,
                AVG(p.preco_custo) as preco_medio_produtos
            FROM fornecedores f
            LEFT JOIN produtos p ON f.id = p.fornecedor_id
            WHERE f.id = ?
            GROUP BY f.id, f.nome
        `;
        const result = await executeQuery(query, [id]);
        return result[0] || null;
    }

    // Validar dados do fornecedor
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

    // Formatar CNPJ
    static formatCnpj(cnpj) {
        if (!cnpj) return null;
        const numbers = cnpj.replace(/\D/g, '');
        if (numbers.length !== 14) return cnpj;
        return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    // Formatar telefone
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