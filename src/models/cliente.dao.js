const pool = require('../database/connection');
const Cliente = require('./Cliente');

class ClienteDAO {
  static async criar(cliente, client = pool) {
    const query = `
      INSERT INTO clientes (nome_cliente, data_nasc, cpf, telefone, genero, email, senha)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      cliente.nome_cliente,
      cliente.data_nasc,
      cliente.cpf,
      cliente.telefone,
      cliente.genero,
      cliente.email,
      cliente.senha
    ];
    const result = await client.query(query, values);
    return result.rows[0].id_cliente;
  }

  static async buscarPorId(id) {

    const sql = `
      SELECT *
      FROM clientes
      WHERE id_cliente = $1
    `;

    const result = await pool.query(sql, [id]);

    return result.rows[0];
  }

  static async atualizar(id, cliente) {

    const sql = `
    UPDATE clientes
    SET nome_cliente = $1,
        data_nasc = $2,
        cpf = $3,
        telefone = $4,
        genero = $5,
        email = $6
    WHERE id_cliente = $7
    RETURNING *;
  `;

    const values = [
      cliente.nome_cliente,
      cliente.data_nasc,
      cliente.cpf,
      cliente.telefone,
      cliente.genero,
      cliente.email,
      id
    ];

    const result = await pool.query(sql, values);

    return result.rows[0];
  }

  static async listarClientes() {
    const query = `
        SELECT id_cliente, nome_cliente, email, telefone
        FROM clientes
    `;

    const result = await pool.query(query);

    return result.rows;
  }

  static async deletarEnderecosPorCliente(id_cliente) {
    const query = `DELETE FROM enderecos WHERE id_cliente = $1`;
    await pool.query(query, [id_cliente]);
  }

  static async deletarCliente(id_cliente) {
    await this.deletarEnderecosPorCliente(id_cliente);

    const query = `DELETE FROM clientes WHERE id_cliente = $1`;
    const result = await pool.query(query, [id_cliente]);

    return result.rowCount;
  }

  static async consultar(termo) {
    const busca = `%${termo}%`;

    const sql = `
        SELECT DISTINCT 
            c.id_cliente, c.nome_cliente, c.data_nasc, c.cpf, c.telefone, c.genero, c.email
        FROM clientes c
        LEFT JOIN enderecos e ON c.id_cliente = e.id_cliente
        WHERE 
            c.nome_cliente ILIKE $1 OR 
            c.cpf ILIKE $1 OR 
            c.email ILIKE $1 OR 
            c.telefone ILIKE $1 OR
            e.logradouro ILIKE $1 OR
            e.cep ILIKE $1 OR
            e.bairro ILIKE $1 OR
            e.cidade ILIKE $1
    `;

    const result = await pool.query(sql, [busca]);
    return result.rows;
  }

  static async buscarPorCpfOuEmail(cpf, email) {
    const sql = `
    SELECT *
    FROM clientes
    WHERE cpf = $1 OR email = $2
  `;

    const result = await pool.query(sql, [cpf, email]);

    return result.rows[0];
  }

  static async buscarPorEmail(email) {
    const sql = `
      SELECT *
      FROM clientes
      WHERE email = $1
    `;
    const result = await pool.query(sql, [email]);
    return result.rows[0];
  }

}


module.exports = ClienteDAO;
