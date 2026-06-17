const pool = require('../database/connection');

const favoritosDao = {

    async adicionar(cliente_id, produto_id) {
        const query = `
            INSERT INTO favoritos (cliente_id, produto_id)
            VALUES ($1, $2)
            ON CONFLICT (cliente_id, produto_id) DO NOTHING
            RETURNING *`;
        const { rows } = await pool.query(query, [cliente_id, produto_id]);
        return rows[0];
    },

    async remover(cliente_id, produto_id) {
        const query = `
            DELETE FROM favoritos
            WHERE cliente_id = $1 AND produto_id = $2
            RETURNING *`;
        const { rows } = await pool.query(query, [cliente_id, produto_id]);
        return rows[0];
    },

    async listarPorCliente(cliente_id) {
        const query = `
            SELECT p.*
            FROM produtos p
            INNER JOIN favoritos f ON f.produto_id = p.id_produto
            WHERE f.cliente_id = $1
            ORDER BY p.nome_produto ASC`;
        const { rows } = await pool.query(query, [cliente_id]);
        return rows;
    },

    async buscarIdsFavoritos(cliente_id) {
        const query = `
            SELECT produto_id FROM favoritos
            WHERE cliente_id = $1`;
        const { rows } = await pool.query(query, [cliente_id]);
        return rows.map(r => r.produto_id);
    }
};

module.exports = favoritosDao;