const { executeQuery } = require('../config/database');

class Produto {
    
    static async findAll(filters = {}) {
        let query = `
            SELECT 
                p.*,
                c.nome as categoria_nome,
                c.cor as categoria_cor,
                f.nome as fornecedor_nome,
                (p.preco_venda - p.preco_custo) as margem_absoluta,
                ROUND(((p.preco_venda - p.preco_custo) / p.preco_custo * 100), 2) as margem_percentual,
                (p.estoque_atual * p.preco_custo) as valor_estoque_custo,
                CASE 
                    WHEN p.estoque_atual <= p.estoque_minimo THEN 'CRITICO'
                    WHEN p.estoque_atual <= (p.estoque_minimo * 1.5) THEN 'BAIXO'
                    ELSE 'OK'
                END as status_estoque
            FROM produtos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
        `;
        
        const conditions = [];
        const params = [];
        
        if (filters.ativo !== undefined) {
            conditions.push('p.ativo = ?');
            params.push(filters.ativo);
        }
        
        if (filters.categoria_id) {
            conditions.push('p.categoria_id = ?');
            params.push(filters.categoria_id);
        }
        
        if (filters.fornecedor_id) {
            conditions.push('p.fornecedor_id = ?');
            params.push(filters.fornecedor_id);
        }
        
        if (filters.status_estoque) {
            if (filters.status_estoque === 'CRITICO') {
                conditions.push('p.estoque_atual <= p.estoque_minimo');
            } else if (filters.status_estoque === 'BAIXO') {
                conditions.push('p.estoque_atual <= (p.estoque_minimo * 1.5) AND p.estoque_atual > p.estoque_minimo');
            }
        }
        
        if (filters.search) {
            conditions.push('(p.nome LIKE ? OR p.codigo LIKE ?)');
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY p.nome ASC';
        
        return await executeQuery(query, params);
    }

    static async findById(id) {
        const query = `
            SELECT 
                p.*,
                c.nome as categoria_nome,
                f.nome as fornecedor_nome,
                (p.preco_venda - p.preco_custo) as margem_absoluta,
                ROUND(((p.preco_venda - p.preco_custo) / p.preco_custo * 100), 2) as margem_percentual
            FROM produtos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
            WHERE p.id = ?
        `;
        const result = await executeQuery(query, [id]);
        return result[0] || null;
    }

    static async findByCodigo(codigo) {
        const query = 'SELECT * FROM produtos WHERE codigo = ?';
        const result = await executeQuery(query, [codigo]);
        return result[0] || null;
    }

    static async create(produtoData) {
        const { 
            codigo, nome, descricao, categoria_id, fornecedor_id,
            preco_custo, preco_venda, estoque_atual, estoque_minimo, 
            estoque_maximo, unidade_medida, empresa_id
        } = produtoData;
        
        const existingProduto = await executeQuery(
            'SELECT id FROM produtos WHERE codigo = ? AND empresa_id = ?', 
            [codigo, empresa_id]
        );
        if (existingProduto.length > 0) {
            throw new Error('Já existe um produto com este código');
        }

        const query = `
            INSERT INTO produtos (
                codigo, nome, descricao, categoria_id, fornecedor_id,
                preco_custo, preco_venda, estoque_atual, estoque_minimo,
                estoque_maximo, unidade_medida, empresa_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const result = await executeQuery(query, [
            codigo, nome, descricao, categoria_id, fornecedor_id,
            preco_custo, preco_venda, estoque_atual || 0, 
            estoque_minimo || 1, estoque_maximo || 100, 
            unidade_medida || 'un', empresa_id
        ]);
        
        return await this.findById(result.insertId, empresa_id);
    }

    static async update(id, produtoData) {
        const existingProduto = await this.findById(id);
        if (!existingProduto) {
            throw new Error('Produto não encontrado');
        }

        if (produtoData.codigo && produtoData.codigo !== existingProduto.codigo) {
            const produtoWithSameCodigo = await this.findByCodigo(produtoData.codigo);
            if (produtoWithSameCodigo) {
                throw new Error('Já existe um produto com este código');
            }
        }

        const fields = Object.keys(produtoData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(produtoData);
        
        const query = `
            UPDATE produtos 
            SET ${fields}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        await executeQuery(query, [...values, id]);
        return await this.findById(id);
    }

    static async delete(id) {
        const produto = await this.findById(id);
        if (!produto) {
            throw new Error('Produto não encontrado');
        }

        await executeQuery('DELETE FROM produtos WHERE id = ?', [id]);
        return { message: 'Produto deletado com sucesso' };
    }

    static async updateEstoque(id, novaQuantidade) {
        const query = `
            UPDATE produtos 
            SET estoque_atual = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        await executeQuery(query, [novaQuantidade, id]);
        return await this.findById(id);
    }

    static async getProdutosBaixoEstoque() {
        const query = `
            SELECT 
                p.*,
                c.nome as categoria_nome,
                f.nome as fornecedor_nome
            FROM produtos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
            WHERE p.estoque_atual <= p.estoque_minimo AND p.ativo = 1
            ORDER BY (p.estoque_atual - p.estoque_minimo) ASC
        `;
        return await executeQuery(query);
    }

    static async getMovimentacoes(id, limit = 20) {
        const query = `
            SELECT 
                m.*,
                p.nome as produto_nome
            FROM movimentacoes m
            JOIN produtos p ON m.produto_id = p.id
            WHERE m.produto_id = ?
            ORDER BY m.data_movimentacao DESC
            LIMIT ?
        `;
        return await executeQuery(query, [id, limit]);
    }

    static validateData(data) {
        const errors = [];

        if (!data.codigo || data.codigo.trim().length < 1) {
            errors.push('Código é obrigatório');
        }

        if (!data.nome || data.nome.trim().length < 2) {
            errors.push('Nome é obrigatório e deve ter pelo menos 2 caracteres');
        }

        if (data.preco_custo && data.preco_custo < 0) {
            errors.push('Preço de custo não pode ser negativo');
        }

        if (data.preco_venda && data.preco_venda < 0) {
            errors.push('Preço de venda não pode ser negativo');
        }

        if (data.estoque_atual && data.estoque_atual < 0) {
            errors.push('Estoque atual não pode ser negativo');
        }

        return errors;
    }
}

module.exports = Produto;