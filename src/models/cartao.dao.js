const pool = require('../database/connection');
const Cartao = require('./Cartao');

class CartaoDAO {

  static async criar(cartao, client = pool) {
    const query = `
      INSERT INTO cartoes 
      (id_cliente, numero_cartao, nome_impresso, bandeira, cvv, preferencial)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [
      cartao.id_cliente,
      cartao.numero_cartao,
      cartao.nome_impresso,
      cartao.bandeira,
      cartao.cvv,
      cartao.preferencial
    ];

    const result = await client.query(query, values);
    return result.rows[0];
  }

  static async listarPorCliente(id_cliente) {
    const result = await pool.query(
        "SELECT * FROM cartoes WHERE id_cliente = $1 ORDER BY preferencial DESC, id_cartao ASC",
        [id_cliente]
    );
    return result.rows;
  }

  static async deletar(id_cartao) {
    const result = await pool.query(
      "DELETE FROM cartoes WHERE id_cartao = $1",
      [id_cartao]
    );
    return result.rowCount;
  }


static async definirPreferencial(id_cartao, id_cliente) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const r1 = await client.query(
            "UPDATE cartoes SET preferencial = false WHERE id_cliente = $1",
            [id_cliente]
        );
        console.log('removeu preferencial de:', id_cliente, '| rows:', r1.rowCount);

        const r2 = await client.query(
            "UPDATE cartoes SET preferencial = true WHERE id_cartao = $1",
            [id_cartao]
        );
        console.log('definiu preferencial no cartao:', id_cartao, '| rows:', r2.rowCount);

        await client.query('COMMIT');
        console.log('COMMIT feito');
    } catch (err) {
        await client.query('ROLLBACK');
        console.log('ROLLBACK - erro:', err.message);
        throw err;
    } finally {
        client.release();
    }
  }


  //PARA NAO PERMITIR O MESMO USUARIO CADASTRAR CARTAO REPETIDO  
  static async existeCartaoDuplicado(cartao, client = pool) {
    const query = `
    SELECT * FROM cartoes 
    WHERE id_cliente = $1
      AND numero_cartao = $2
      AND bandeira = $3
  `;

    const values = [
      cartao.id_cliente,
      cartao.numero_cartao,
      cartao.bandeira
    ];

    const result = await client.query(query, values);
    return result.rows.length > 0;
  }

  static async removerPreferencial(id_cliente, client = pool) {
    await client.query(
      "UPDATE cartoes SET preferencial = false WHERE id_cliente = $1",
      [id_cliente]
    );
  }
}



module.exports = CartaoDAO;