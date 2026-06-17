const pool = require('../database/connection');
const Endereco = require('./Endereco');

class EnderecoDAO {
  static async criar(endereco, client = pool) {
    const query = `
      INSERT INTO enderecos (
        tp_endereco, tp_residencia, cep, tp_logradouro, logradouro, pais, estado, cidade, bairro,
        numero, complemento, nome_endereco, id_cliente
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *;
    `;
    const values = [
      endereco.tp_endereco,
      endereco.tp_residencia,
      endereco.cep,
      endereco.tp_logradouro,
      endereco.logradouro,
      endereco.pais,
      endereco.estado,
      endereco.cidade,
      endereco.bairro,
      endereco.numero,
      endereco.complemento,
      endereco.nome_endereco,
      endereco.id_cliente
    ];
    const result = await client.query(query, values);
    return result.rows[0];
  }


  static async buscarPorCliente(clienteId) {

    const query = `
      SELECT *
      FROM enderecos
      WHERE id_cliente = $1
    `;

    const resultado = await pool.query(query, [clienteId]);

    return resultado.rows;
  }

  static async buscarPorId(id) {

    const query = `
        SELECT *
        FROM enderecos
        WHERE id_endereco = $1
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
  }

  static async atualizar(id, endereco) {

    const query = `
UPDATE enderecos
SET
  tp_endereco = COALESCE($1, tp_endereco),
  tp_residencia = $2,
      cep = $3,
      tp_logradouro = $4,
      logradouro = $5,
      pais = $6,
      estado = $7,
      cidade = $8,
      bairro = $9,
      numero = $10,
      complemento = $11,
      nome_endereco = $12
    WHERE id_endereco = $13
RETURNING *
`;

    const values = [
      endereco.tp_endereco,
      endereco.tp_residencia,
      endereco.cep,
      endereco.tp_logradouro,
      endereco.logradouro,
      endereco.pais,
      endereco.estado,
      endereco.cidade,
      endereco.bairro,
      endereco.numero,
      endereco.complemento,
      endereco.nome_endereco,
      id
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
  }

  static async deletar(id) {
    const query = `
    DELETE FROM enderecos
    WHERE id_endereco = $1
  `;

    const result = await pool.query(query, [id]);

    return result.rowCount; // quantidade de linhas deletadas
  }

  static async atualizar(id, endereco) {
    const sql = `
    UPDATE enderecos
    SET tp_residencia = $1,
        cep = $2,
        tp_logradouro = $3,
        logradouro = $4,
        pais = $5,
        estado = $6,
        cidade = $7,
        bairro = $8,
        numero = $9,
        complemento = $10,
        nome_endereco = $11
    WHERE id_endereco = $12
    RETURNING *;
  `;

    const values = [
      endereco.tp_residencia,
      endereco.cep,
      endereco.tp_logradouro,
      endereco.logradouro,
      endereco.pais,
      endereco.estado,
      endereco.cidade,
      endereco.bairro,
      endereco.numero,
      endereco.complemento || null,
      endereco.nome_endereco,
      id
    ];

    const result = await pool.query(sql, values);
    return result.rows[0];
  }
}

module.exports = EnderecoDAO;
