const pool = require('../database/connection');

// ─── FUNÇÕES INTERNAS ────────────────────────────────────────

async function buscarUFporCEP(cep) {
  const cepLimpo = String(cep).replace(/\D/g, '');

  if (cepLimpo.length !== 8) {
    throw new Error('CEP inválido');
  }

  const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

  if (!res.ok) {
    throw new Error('Falha ao consultar ViaCEP');
  }

  const data = await res.json();

  if (data.erro) {
    throw new Error('CEP não encontrado');
  }

  return data.uf;
}

async function calcularPesoTotal(idCliente) {
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(v.peso_gramas * ic.quantidade), 0) AS peso_total
     FROM carrinho c
     JOIN itens_carrinho ic ON ic.id_carrinho = c.id_carrinho
     JOIN variacoes v ON v.id_variacao = ic.id_variacao
     WHERE c.id_cliente = $1`,
    [idCliente]
  );

  return parseInt(rows[0].peso_total, 10);
}

async function buscarFreteNaTabela(uf, pesoGramas) {
  const { rows } = await pool.query(
    `SELECT valor, prazo_dias
     FROM frete_regioes
     WHERE uf = $1
       AND $2 BETWEEN peso_min_g AND peso_max_g
     LIMIT 1`,
    [uf.toUpperCase(), pesoGramas]
  );

  if (!rows.length) {
    return { valor: 20.00, prazo_dias: 10 };
  }

  return rows[0];
}

// ─── CONTROLLER ──────────────────────────────────────────────

const controllerFrete = {

  // POST /api/frete/calcular
  // Usado na tela de finalizar pedido (usa id_endereco salvo no banco)
  async calcularFrete(req, res) {
    const idCliente = req.session.usuario.id;

    if (!idCliente) {
      return res.status(401).json({ mensagem: 'Não autenticado.' });
    }

    const { id_endereco } = req.body;

    if (!id_endereco) {
      return res.status(400).json({ mensagem: 'id_endereco é obrigatório.' });
    }

    try {
      const { rows: endRows } = await pool.query(
        `SELECT cep FROM enderecos WHERE id_endereco = $1 AND id_cliente = $2`,
        [id_endereco, idCliente]
      );

      if (!endRows.length) {
        return res.status(404).json({ mensagem: 'Endereço não encontrado.' });
      }

      const cep = endRows[0].cep;
      const uf = await buscarUFporCEP(cep);
      const pesoTotal = await calcularPesoTotal(idCliente);
      const pesoConsulta = Math.max(pesoTotal, 1);
      const frete = await buscarFreteNaTabela(uf, pesoConsulta);

      return res.json({
        valor: parseFloat(frete.valor),
        prazo_dias: frete.prazo_dias,
        uf,
        peso_gramas: pesoTotal,
      });

    } catch (err) {
      console.error('Erro ao calcular frete:', err.message);

      if (err.message === 'CEP não encontrado' || err.message === 'CEP inválido') {
        return res.status(422).json({ mensagem: err.message });
      }

      return res.status(500).json({ mensagem: 'Erro interno ao calcular frete.' });
    }
  },

  // POST /api/frete/consultar
  // Usado na tela do carrinho (recebe UF direto do frontend via ViaCEP)
  async consultarFrete(req, res) {
    const idCliente = req.session.usuario.id;

    if (!idCliente) {
      return res.status(401).json({ mensagem: 'Não autenticado.' });
    }

    const { uf } = req.body;

    if (!uf) {
      return res.status(400).json({ mensagem: 'UF é obrigatória.' });
    }

    try {
      const pesoTotal = await calcularPesoTotal(idCliente);
      const pesoConsulta = Math.max(pesoTotal, 1);
      const frete = await buscarFreteNaTabela(uf, pesoConsulta);

      return res.json({
        valor: parseFloat(frete.valor),
        prazo_dias: frete.prazo_dias,
        uf,
        peso_gramas: pesoTotal,
      });

    } catch (err) {
      console.error('Erro ao consultar frete:', err.message);
      return res.status(500).json({ mensagem: 'Erro interno ao consultar frete.' });
    }
  },

};

module.exports = controllerFrete;