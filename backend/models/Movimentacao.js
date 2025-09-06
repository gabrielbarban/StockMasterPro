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
            JOIN produtos p ON m.produto_id = p.id
            LEFT JOIN categorias c ON p.categoria_id = c.id
        `;
        
        const conditions = [];
        const params = [];
        
        if (filters.produto_id) {
            conditions.push('m.produto_id = ?');
            params.push(filters.produto_id);
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
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY m.data_movimentacao DESC';
        
        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(parseInt(filters.limit));
        }
        
        return await executeQuery(query, params);
    }

    static async findById(id) {
        const query = `
            SELECT 
                m.*,
                p.nome as produto_nome,
                p.codigo as produto_codigo
            FROM movimentacoes m
            JOIN produtos p ON m.produto_id = p.id
            WHERE m.id = ?
        `;
        const result = await executeQuery(query, [id]);
        return result[0] || null;
    }

    static async create(movimentacaoData) {
        const { 
            produto_id, tipo, quantidade, motivo, preco_unitario,
            observacoes, responsavel, documento 
        } = movimentacaoData;
        
        console.log('📤 Model create movimentação:', movimentacaoData);
        
        const query = `
            INSERT INTO movimentacoes (
                produto_id, tipo, quantidade, motivo, preco_unitario,
                observacoes, responsavel, documento
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            produto_id, 
            tipo, 
            quantidade, 
            motivo, 
            preco_unitario || 0,
            observacoes || null,
            responsavel || null,
            documento || null
        ];
        
        console.log('📝 Query create:', query);
        console.log('📝 Values create:', values);
        
        const result = await executeQuery(query, values);
        
        // Atualizar estoque
        await executeQuery(
            'CALL AtualizarEstoque(?, ?, ?)', 
            [produto_id, tipo, quantidade]
        );
        
        return await this.findById(result.insertId);
    }

    static async getResumoMovimentacoes(produto_id, dias = 30) {
        const query = `
            SELECT 
                tipo,
                COUNT(*) as total_movimentacoes,
                SUM(quantidade) as total_quantidade,
                AVG(preco_unitario) as preco_medio
            FROM movimentacoes 
            WHERE produto_id = ? 
            AND data_movimentacao >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY tipo
        `;
        return await executeQuery(query, [produto_id, dias]);
    }

    static async getMovimentacoesPorPeriodo(data_inicio, data_fim) {
        const query = `
            SELECT 
                DATE(data_movimentacao) as data,
                tipo,
                COUNT(*) as total_movimentacoes,
                SUM(quantidade) as total_quantidade,
                SUM(quantidade * preco_unitario) as valor_total
            FROM movimentacoes 
            WHERE DATE(data_movimentacao) BETWEEN ? AND ?
            GROUP BY DATE(data_movimentacao), tipo
            ORDER BY data DESC
        `;
        return await executeQuery(query, [data_inicio, data_fim]);
    }

    static async getTopProdutosSaida(limite = 10, dias = 30) {
        const query = `
            SELECT 
                p.id,
                p.nome,
                p.codigo,
                SUM(m.quantidade) as total_saidas,
                COUNT(m.id) as numero_movimentacoes
            FROM movimentacoes m
            JOIN produtos p ON m.produto_id = p.id
            WHERE m.tipo = 'saida' 
            AND m.data_movimentacao >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY p.id, p.nome, p.codigo
            ORDER BY total_saidas DESC
            LIMIT ?
        `;
        return await executeQuery(query, [dias, limite]);
    }

    static async getEstoquesPorData(data) {
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
                SELECT produto_id, SUM(quantidade) as total
                FROM movimentacoes 
                WHERE tipo = 'entrada' AND DATE(data_movimentacao) <= ?
                GROUP BY produto_id
            ) entradas ON p.id = entradas.produto_id
            LEFT JOIN (
                SELECT produto_id, SUM(quantidade) as total
                FROM movimentacoes 
                WHERE tipo = 'saida' AND DATE(data_movimentacao) <= ?
                GROUP BY produto_id
            ) saidas ON p.id = saidas.produto_id
            WHERE p.ativo = 1
        `;
        return await executeQuery(query, [data, data]);
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