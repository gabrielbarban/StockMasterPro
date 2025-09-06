const { executeQuery } = require('../config/database');

class Movimentacao {
    
    static async findAll(filters = {}) {
        let query = `
            SELECT 
                m.*,
                p.nome as produto_nome,
                p.codigo as produto_codigo,
                c.nome as categoria_nome
            FROM movimentacoes m
            JOIN produtos p ON m.produto_id = p.id AND p.empresa_id = m.empresa_id
            LEFT JOIN categorias c ON p.categoria_id = c.id AND c.empresa_id = m.empresa_id
            WHERE m.empresa_id = ?
        `;
        
        const conditions = [];
        const params = [filters.empresa_id];
        
        if (filters.produto_id) {
            conditions.push('m.produto_id = ?');
            params.push(parseInt(filters.produto_id));
        }
        
        if (filters.tipo) {
            conditions.push('m.tipo = ?');
            params.push(filters.tipo);
        }
        
        if (filters.motivo) {
            conditions.push('m.motivo LIKE ?');
            params.push(`%${filters.motivo}%`);
        }
        
        if (filters.data_inicio) {
            conditions.push('DATE(m.data_movimentacao) >= ?');
            params.push(filters.data_inicio);
        }
        
        if (filters.data_fim) {
            conditions.push('DATE(m.data_movimentacao) <= ?');
            params.push(filters.data_fim);
        }
        
        if (conditions.length > 0) {
            query += ' AND ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY m.data_movimentacao DESC';
        
        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(parseInt(filters.limit));
        }
        
        console.log('🔍 Query movimentações:', query);
        console.log('🔍 Params movimentações:', params);
        
        return await executeQuery(query, params);
    }

    static async findById(id, empresa_id) {
        const query = `
            SELECT 
                m.*,
                p.nome as produto_nome,
                p.codigo as produto_codigo
            FROM movimentacoes m
            JOIN produtos p ON m.produto_id = p.id
            WHERE m.id = ? AND m.empresa_id = ? AND p.empresa_id = ?
        `;
        const result = await executeQuery(query, [id, empresa_id, empresa_id]);
        return result[0] || null;
    }

    static async create(movimentacaoData) {
        const { 
            produto_id, tipo, quantidade, motivo, preco_unitario,
            observacoes, responsavel, documento, empresa_id 
        } = movimentacaoData;
        
        // Verificar se o produto pertence à empresa
        const produtoQuery = 'SELECT id FROM produtos WHERE id = ? AND empresa_id = ?';
        const produtoResult = await executeQuery(produtoQuery, [produto_id, empresa_id]);
        
        if (produtoResult.length === 0) {
            throw new Error('Produto não encontrado');
        }
        
        const query = `
            INSERT INTO movimentacoes (
                produto_id, tipo, quantidade, motivo, preco_unitario,
                observacoes, responsavel, documento, empresa_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            produto_id, 
            tipo, 
            quantidade, 
            motivo, 
            preco_unitario || 0,
            observacoes || null,
            responsavel || null,
            documento || null,
            empresa_id
        ];
        
        const result = await executeQuery(query, values);
        
        // Atualizar estoque do produto
        const updateEstoqueQuery = `
            UPDATE produtos 
            SET estoque_atual = estoque_atual ${tipo === 'entrada' ? '+' : '-'} ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND empresa_id = ?
        `;
        
        await executeQuery(updateEstoqueQuery, [quantidade, produto_id, empresa_id]);
        
        return await this.findById(result.insertId, empresa_id);
    }

    static async getResumoMovimentacoes(produto_id, empresa_id, dias = 30) {
        const query = `
            SELECT 
                tipo,
                COUNT(*) as total_movimentacoes,
                SUM(quantidade) as total_quantidade,
                AVG(preco_unitario) as preco_medio
            FROM movimentacoes m
            JOIN produtos p ON m.produto_id = p.id
            WHERE m.produto_id = ? AND p.empresa_id = ?
            AND m.data_movimentacao >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY tipo
        `;
        return await executeQuery(query, [produto_id, empresa_id, dias]);
    }

    static async getMovimentacoesPorPeriodo(empresa_id, data_inicio, data_fim) {
        const query = `
            SELECT 
                DATE(data_movimentacao) as data,
                tipo,
                COUNT(*) as total_movimentacoes,
                SUM(quantidade) as total_quantidade,
                SUM(quantidade * preco_unitario) as valor_total
            FROM movimentacoes m
            JOIN produtos p ON m.produto_id = p.id
            WHERE p.empresa_id = ? AND DATE(m.data_movimentacao) BETWEEN ? AND ?
            GROUP BY DATE(data_movimentacao), tipo
            ORDER BY data DESC
        `;
        return await executeQuery(query, [empresa_id, data_inicio, data_fim]);
    }

    static async getTopProdutosSaida(empresa_id, limite = 10, dias = 30) {
        const query = `
            SELECT 
                p.id,
                p.nome,
                p.codigo,
                SUM(m.quantidade) as total_saidas,
                COUNT(m.id) as numero_movimentacoes
            FROM movimentacoes m
            JOIN produtos p ON m.produto_id = p.id
            WHERE m.tipo = 'saida' AND p.empresa_id = ?
            AND m.data_movimentacao >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY p.id, p.nome, p.codigo
            ORDER BY total_saidas DESC
            LIMIT ?
        `;
        return await executeQuery(query, [empresa_id, dias, limite]);
    }

    static async getEstoquesPorData(empresa_id, data) {
        const query = `
            SELECT 
                p.id,
                p.nome,
                p.codigo,
                p.estoque_atual,
                COALESCE(entradas.total, 0) as entradas_ate_data,
                COALESCE(saidas.total, 0) as saidas_ate_data
            FROM produtos p
            LEFT JOIN (
                SELECT m.produto_id, SUM(m.quantidade) as total
                FROM movimentacoes m
                JOIN produtos p2 ON m.produto_id = p2.id
                WHERE m.tipo = 'entrada' AND DATE(m.data_movimentacao) <= ? AND p2.empresa_id = ?
                GROUP BY m.produto_id
            ) entradas ON p.id = entradas.produto_id
            LEFT JOIN (
                SELECT m.produto_id, SUM(m.quantidade) as total
                FROM movimentacoes m
                JOIN produtos p2 ON m.produto_id = p2.id
                WHERE m.tipo = 'saida' AND DATE(m.data_movimentacao) <= ? AND p2.empresa_id = ?
                GROUP BY m.produto_id
            ) saidas ON p.id = saidas.produto_id
            WHERE p.ativo = 1 AND p.empresa_id = ?
        `;
        return await executeQuery(query, [data, empresa_id, data, empresa_id, empresa_id]);
    }

    static validateData(data) {
        const errors = [];

        if (!data.produto_id) {
            errors.push('Produto é obrigatório');
        }

        if (!data.tipo || !['entrada', 'saida'].includes(data.tipo)) {
            errors.push('Tipo deve ser "entrada" ou "saida"');
        }

        if (!data.quantidade || data.quantidade <= 0) {
            errors.push('Quantidade deve ser maior que zero');
        }

        if (!data.motivo || data.motivo.trim().length < 2) {
            errors.push('Motivo é obrigatório');
        }

        if (data.preco_unitario && data.preco_unitario < 0) {
            errors.push('Preço unitário não pode ser negativo');
        }

        return errors;
    }
}

module.exports = Movimentacao;