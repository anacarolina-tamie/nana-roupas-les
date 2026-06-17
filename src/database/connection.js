/*const path = require('path');
require('dotenv').config({
  override: true,
  path: path.join(__dirname, 'development.env')
});
const { Pool, Client } = require('pg');

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

(async () => {
  const client = await pool.connect();
  try {
    console.log('Conectado ao PostgreSQL');

    const resultado1 = await client.query('SELECT * FROM clientes');

    /*Descomentar se quiser testar se ta retornando os registros da tabela
    console.log('Dados retornados do banco:');
    console.table(resultado1.rows);


    const resultado2 = await client.query('SELECT * FROM enderecos');
    console.log('Dados retornados do banco:');
    console.table(resultado2.rows);
    *//*



  } catch (err) {
    console.error('Erro ao conectar ao PostgreSQL', err);
  } finally {
    client.release();
  }

})();

module.exports = pool;*/

/* CHAT MANDOU ESSE const path = require('path');
require('dotenv').config({
  override: true,
  path: path.join(__dirname, 'development.env')
});

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
  ssl: {
    rejectUnauthorized: false
  },
  family: 4, // 🔥 força IPv4 (ESSENCIAL)
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000
});

// evita crash do servidor
pool.on('error', (err) => {
  console.error('Erro inesperado no pool:', err);
});

module.exports = pool;*/

const path = require('path');
require('dotenv').config({
  override: true,
  path: path.join(__dirname, 'development.env')
});

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  family: 4,
  connectionTimeoutMillis: 20000
});

// =========================
// TESTE DE CONEXÃO INICIAL
// =========================
async function testarConexao() {
  try {
    const client = await pool.connect();

    console.log('Conectado ao PostgreSQL');

    await client.query('SELECT 1'); // teste simples

    client.release();
  } catch (err) {
    console.error('Erro ao conectar ao PostgreSQL:', err.message);

    // tenta novamente depois de 5 segundos
    setTimeout(testarConexao, 5000);
  }
}

testarConexao();

// =========================
// 🔥 TRATAMENTO GLOBAL DO POOL
// =========================
pool.on('error', (err) => {
  console.error('Erro inesperado no pool:', err.message);
});

// =========================
// 🔥 EXPORTAÇÃO
// =========================
module.exports = pool;