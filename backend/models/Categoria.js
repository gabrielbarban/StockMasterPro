// STOCKMASTER PRO - Model de Categorias
const { executeQuery } = require('../config/database');

class Categoria {
    
    // Buscar todas as categorias
    static async findAll() {
        const query = `
            SELECT 
                id,
                nome,
                descricao,
                cor,
                created_at,
                updated_at,
                (SELECT COUNT(*) FROM produtos WHERE categoria_id = categorias.id AND ativo = 1) as total_produtos
            FROM categorias 
            ORDER BY nome ASC
        `;
        return await executeQuery(query);
    }

    // Buscar categoria por ID
    static async findById(id) {
        const query = `
            SELECT 
                id,
                nome,
                descricao,
                cor,
                created_at,
                updated_at,
                (SELECT COUNT(*) FROM produtos WHERE categoria_id = categorias.id AND ativo = 1) as total_produtos
            FROM categorias 
            WHERE id = ?
        `;
        const result = await executeQuery(query, [id]);
        return result[0] || null;
    }

    // Buscar categoria por nome
    static async findByName(nome) {
        const query = 'SELECT * FROM categorias WHERE nome = ?';
        const result = await executeQuery(query, [nome]);
        return result[0] || null;
    }

    // Criar nova categoria
    static async create(categoriaData) {
        const { nome, descricao, cor } = categoriaData;
        
        // Verificar se já existe
        const existingCategory = await this.findByName(nome);
        if (existingCategory) {
            throw new Error('Já existe uma categoria com este nome');
        }

        const query = `
            INSERT INTO categorias (nome, descricao, cor) 
            VALUES (?, ?, ?)
        `;
        const result = await executeQuery(query, [nome, descricao, cor || '#3B82F6']);
        
        // Retornar a categoria criada
        return await this.findById(result.insertId);
    }

    // Atualizar categoria
    static async update(id, categoriaData) {
        const { nome, descricao, cor } = categoriaData;
        
        // Verificar se existe
        const existingCategory = await this.findById(id);
        if (!existingCategory) {
            throw new Error('Categoria não encontrada');
        }

        // Verificar se o nome já está em uso por outra categoria
        if (nome && nome !== existingCategory.nome) {
            const categoryWithSameName = await this.findByName(nome);
            if (categoryWithSameName) {
                throw new Error('Já existe uma categoria com este nome');
            }
        }

        const query = `
            UPDATE categorias 
            SET nome = COALESCE(?, nome),
                descricao = COALESCE(?, descricao),
                cor = COALESCE(?, cor),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        await executeQuery(query, [nome, descricao, cor, id]);
        
        // Retornar a categoria atualizada
        return await this.findById(id);
    }

    // Deletar categoria
    static async delete(id) {
        // Verificar se existe
        const category = await this.findById(id);
        if (!category) {
            throw new Error('Categoria não encontrada');
        }

        // Verificar se tem produtos associados
        if (category.total_produtos > 0) {
            throw new Error('Não é possível deletar categoria que possui produtos associados');
        }

        const query = 'DELETE FROM categorias WHERE id = ?';
        await executeQuery(query, [id]);
        
        return { message: 'Categoria deletada com sucesso' };
    }

    // Estatísticas da categoria
    static async getStats(id) {
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
            LEFT JOIN produtos p ON c.id = p.categoria_id
            WHERE c.id = ?
            GROUP BY c.id, c.nome
        `;
        const result = await executeQuery(query, [id]);
        return result[0] || null;
    }

    // Validar dados da categoria
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