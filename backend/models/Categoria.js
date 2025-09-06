const { executeQuery } = require('../config/database');

class Categoria {
    
    static async findAll(empresa_id) {
        const query = `
            SELECT 
                id,
                nome,
                descricao,
                cor,
                created_at,
                updated_at,
                (SELECT COUNT(*) FROM produtos WHERE categoria_id = categorias.id AND ativo = 1 AND empresa_id = ?) as total_produtos
            FROM categorias 
            WHERE empresa_id = ?
            ORDER BY nome ASC
        `;
        return await executeQuery(query, [empresa_id, empresa_id]);
    }

    static async findById(id, empresa_id) {
        const query = `
            SELECT 
                id,
                nome,
                descricao,
                cor,
                created_at,
                updated_at,
                (SELECT COUNT(*) FROM produtos WHERE categoria_id = categorias.id AND ativo = 1 AND empresa_id = ?) as total_produtos
            FROM categorias 
            WHERE id = ? AND empresa_id = ?
        `;
        const result = await executeQuery(query, [empresa_id, id, empresa_id]);
        return result[0] || null;
    }

    static async findByName(nome, empresa_id) {
        const query = 'SELECT * FROM categorias WHERE nome = ? AND empresa_id = ?';
        const result = await executeQuery(query, [nome, empresa_id]);
        return result[0] || null;
    }

    static async create(categoriaData) {
        const { nome, descricao, cor, empresa_id } = categoriaData;
        
        const existingCategory = await this.findByName(nome, empresa_id);
        if (existingCategory) {
            throw new Error('Já existe uma categoria com este nome');
        }

        const query = `
            INSERT INTO categorias (nome, descricao, cor, empresa_id) 
            VALUES (?, ?, ?, ?)
        `;
        const result = await executeQuery(query, [
            nome, 
            descricao || null, 
            cor || '#3B82F6',
            empresa_id
        ]);
        
        return await this.findById(result.insertId, empresa_id);
    }

    static async update(id, categoriaData, empresa_id) {
        const { nome, descricao, cor } = categoriaData;
        
        const existingCategory = await this.findById(id, empresa_id);
        if (!existingCategory) {
            throw new Error('Categoria não encontrada');
        }

        if (nome && nome !== existingCategory.nome) {
            const categoryWithSameName = await this.findByName(nome, empresa_id);
            if (categoryWithSameName) {
                throw new Error('Já existe uma categoria com este nome');
            }
        }

        const query = `
            UPDATE categorias 
            SET nome = COALESCE(?, nome),
                descricao = ?,
                cor = COALESCE(?, cor),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND empresa_id = ?
        `;
        
        await executeQuery(query, [
            nome || null,
            descricao || null,
            cor || null,
            id,
            empresa_id
        ]);
        
        return await this.findById(id, empresa_id);
    }

    static async delete(id, empresa_id) {
        const category = await this.findById(id, empresa_id);
        if (!category) {
            throw new Error('Categoria não encontrada');
        }

        if (category.total_produtos > 0) {
            throw new Error('Não é possível deletar categoria que possui produtos associados');
        }

        const query = 'DELETE FROM categorias WHERE id = ? AND empresa_id = ?';
        await executeQuery(query, [id, empresa_id]);
        
        return { message: 'Categoria deletada com sucesso' };
    }

    static async getStats(id, empresa_id) {
        const query = `
            SELECT 
                c.id,
                c.nome,
                COUNT(p.id) as total_produtos,
                SUM(CASE WHEN p.ativo = 1 THEN 1 ELSE 0 END) as produtos_ativos,
                SUM(CASE WHEN p.estoque_atual <= p.estoque_minimo THEN 1 ELSE 0 END) as produtos_estoque_baixo,
                SUM(p.estoque_atual * p.preco_custo) as valor_total_estoque,
                AVG(((p.preco_venda - p.preco_custo) / p.preco_custo) * 100) as margem_media
            FROM categorias c
            LEFT JOIN produtos p ON c.id = p.categoria_id AND p.empresa_id = c.empresa_id
            WHERE c.id = ? AND c.empresa_id = ?
            GROUP BY c.id, c.nome
        `;
        const result = await executeQuery(query, [id, empresa_id]);
        return result[0] || null;
    }

    static validateData(data) {
        const errors = [];

        if (!data.nome || data.nome.trim().length < 2) {
            errors.push('Nome é obrigatório e deve ter pelo menos 2 caracteres');
        }

        if (data.nome && data.nome.length > 100) {
            errors.push('Nome não pode ter mais de 100 caracteres');
        }

        if (data.descricao && data.descricao.length > 500) {
            errors.push('Descrição não pode ter mais de 500 caracteres');
        }

        if (data.cor && !/^#[0-9A-F]{6}$/i.test(data.cor)) {
            errors.push('Cor deve estar no formato hexadecimal (#RRGGBB)');
        }

        return errors;
    }
}

module.exports = Categoria;