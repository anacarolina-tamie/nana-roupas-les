const Cliente = require('../models/Cliente');
const Endereco = require('../models/Endereco');
const Cartao = require('../models/Cartao');
const ClienteDAO = require('../models/cliente.dao');
const EnderecoDAO = require('../models/endereco.dao');
const CartaoDAO = require('../models/cartao.dao');
const validarCliente = require('../validators/clienteValidator');
const validarEndereco = require("../validators/enderecoValidator");
const validarCartao = require("../validators/cartaoValidator");
const pool = require('../database/connection');

/*exports.criarCliente = async (req, res) => {
  try {
    const { cliente, enderecos, cartoes } = req.body;

    // Cria cliente
    const novoCliente = new Cliente(
      null,
      cliente.nome_cliente,
      cliente.data_nasc,
      cliente.cpf.replace(/\D/g, ''),
      cliente.telefone.replace(/\D/g, ''),
      cliente.genero,
      cliente.email,
      cliente.senha
    );

    const clienteId = await ClienteDAO.criar(novoCliente);

    // VALIDA E CRIA ENDEREÇOS
    for (const end of enderecos) {
      const enderecoTratado = {
        ...end,
        cep: end.cep?.replace(/\D/g, ''),
        estado: end.estado?.toUpperCase().trim(),
      };

      const errosEndereco = await validarEndereco(enderecoTratado);

      if (errosEndereco.length > 0) {
        return res.status(400).json({
          erro: "Erro em endereço",
          detalhes: errosEndereco
        });
      }

      const novoEndereco = new Endereco(
        null,
        end.tp_endereco || "Entrega",
        end.tp_residencia,
        enderecoTratado.cep,
        end.tp_logradouro,
        end.logradouro,
        end.pais,
        enderecoTratado.estado,
        end.cidade,
        end.bairro,
        end.numero,
        end.complemento || null,
        end.nome_endereco,
        clienteId
      );

      await EnderecoDAO.criar(novoEndereco);
    }

    // VALIDA E CRIA CARTÕES
    for (const c of cartoes) {
      const numeroCompleto = c.numero_cartao.replace(/\s/g, '');

      const cartaoTemp = {
        numero_cartao: numeroCompleto,
        nome_impresso: c.nome_impresso,
        bandeira: c.bandeira,
        cvv: c.cvv,
        preferencial: c.preferencial,
      };

      const errosCartao = await validarCartao(cartaoTemp);

      if (errosCartao.length > 0) {
        return res.status(400).json({
          erro: "Erro em cartão",
          detalhes: errosCartao
        });
      }

      const ultimos4 = numeroCompleto.slice(-4);

      const novoCartao = new Cartao(
        null,
        ultimos4,
        c.nome_impresso,
        c.bandeira,
        c.cvv,
        c.preferencial || false,
        clienteId
      );

      await CartaoDAO.criar(novoCartao);
    }

    res.status(201).json({ mensagem: "Cadastro completo realizado!" });

  } catch (err) {
    console.error("Erro ao criar cliente:", err);
    res.status(500).json({ erro: "Erro no servidor" });
  }
};*/

/*xports.criarCliente = async (req, res) => {
  try {
    const { cliente, enderecoCobranca, enderecosEntrega, cartoes } = req.body;

    // 🔴 VALIDAÇÕES INICIAIS
    if (!enderecoCobranca) {
      return res.status(400).json({ erro: "Endereço de cobrança é obrigatório" });
    }

    if (!enderecosEntrega || enderecosEntrega.length < 1 || enderecosEntrega.length > 3) {
      return res.status(400).json({
        erro: "Deve ter entre 1 e 3 endereços de entrega"
      });
    }

    if (!cartoes || cartoes.length < 1 || cartoes.length > 3) {
      return res.status(400).json({
        erro: "Deve ter entre 1 e 3 cartões"
      });
    }

    // ✅ CRIA CLIENTE
    const novoCliente = new Cliente(
      null,
      cliente.nome_cliente,
      cliente.data_nasc,
      cliente.cpf.replace(/\D/g, ''),
      cliente.telefone.replace(/\D/g, ''),
      cliente.genero,
      cliente.email,
      cliente.senha
    );

    const clienteId = await ClienteDAO.criar(novoCliente);

    // =========================
    // 🟡 ENDEREÇO DE COBRANÇA
    // =========================
    let cobrancaTratado = {
      ...enderecoCobranca,
      cep: enderecoCobranca.cep?.replace(/\D/g, ''),
      estado: enderecoCobranca.estado?.toUpperCase().trim(),
      tp_endereco: "COBRANCA",
      id_cliente: clienteId
    };

    const errosCobranca = await validarEndereco(cobrancaTratado);

    if (errosCobranca.length > 0) {
      return res.status(400).json({
        erro: "Erro no endereço de cobrança",
        detalhes: errosCobranca
      });
    }

    const enderecoCobrancaObj = new Endereco(
      null,
      "COBRANCA",
      cobrancaTratado.tp_residencia,
      cobrancaTratado.cep,
      cobrancaTratado.tp_logradouro,
      cobrancaTratado.logradouro,
      cobrancaTratado.pais,
      cobrancaTratado.estado,
      cobrancaTratado.cidade,
      cobrancaTratado.bairro,
      cobrancaTratado.numero,
      cobrancaTratado.complemento || null,
      cobrancaTratado.nome_endereco,
      clienteId
    );

    await EnderecoDAO.criar(enderecoCobrancaObj);

    // =========================
    // 🟢 ENDEREÇOS DE ENTREGA
    // =========================
    for (const end of enderecosEntrega) {
      const enderecoTratado = {
        ...end,
        cep: end.cep?.replace(/\D/g, ''),
        estado: end.estado?.toUpperCase().trim(),
        tp_endereco: "ENTREGA",
        id_cliente: clienteId
      };

      const errosEndereco = await validarEndereco(enderecoTratado);

      if (errosEndereco.length > 0) {
        return res.status(400).json({
          erro: "Erro em endereço de entrega",
          detalhes: errosEndereco
        });
      }

      const novoEndereco = new Endereco(
        null,
        "ENTREGA",
        enderecoTratado.tp_residencia,
        enderecoTratado.cep,
        enderecoTratado.tp_logradouro,
        enderecoTratado.logradouro,
        enderecoTratado.pais,
        enderecoTratado.estado,
        enderecoTratado.cidade,
        enderecoTratado.bairro,
        enderecoTratado.numero,
        enderecoTratado.complemento || null,
        enderecoTratado.nome_endereco,
        clienteId
      );

      await EnderecoDAO.criar(novoEndereco);
    }

    // =========================
    // 🔵 CARTÕES
    // =========================
    for (const c of cartoes) {
      const numeroCompleto = c.numero_cartao.replace(/\s/g, '');

      const cartaoTemp = {
        numero_cartao: numeroCompleto,
        nome_impresso: c.nome_impresso,
        bandeira: c.bandeira,
        cvv: c.cvv,
        preferencial: c.preferencial,
      };

      const errosCartao = await validarCartao(cartaoTemp);

      if (errosCartao.length > 0) {
        return res.status(400).json({
          erro: "Erro em cartão",
          detalhes: errosCartao
        });
      }

      const ultimos4 = numeroCompleto.slice(-4);

      const novoCartao = new Cartao(
        null,
        ultimos4,
        c.nome_impresso,
        c.bandeira,
        c.cvv,
        c.preferencial || false,
        clienteId
      );

      await CartaoDAO.criar(novoCartao);
    }

    // ✅ SUCESSO
    res.status(201).json({ mensagem: "Cadastro completo realizado!" });

  } catch (err) {
    console.error("Erro ao criar cliente:", err);
    res.status(500).json({ erro: "Erro no servidor" });
  }
};*/

exports.criarCliente = async (req, res) => {

  const pool = require('../database/connection'); // 🔥 IMPORTANTE
  const client = await pool.connect(); // 🔥 conexão da transação

  try {
    const { cliente, enderecoCobranca, enderecosEntrega, cartoes } = req.body;

    const errosCliente = await validarCliente({
      ...cliente,
      confirmarSenha: cliente.confirmarSenha  // garante que chega no valSenha
    });

    if (errosCliente.length > 0) {
      client.release();
      return res.status(400).json({
        erro: "Erro nos dados do cliente",
        detalhes: errosCliente
      });
    }

    // 🔴 VALIDAÇÕES INICIAIS
    if (!enderecoCobranca) {
      return res.status(400).json({ erro: "Endereço de cobrança é obrigatório" });
    }

    if (!enderecosEntrega || enderecosEntrega.length < 1 || enderecosEntrega.length > 3) {
      return res.status(400).json({
        erro: "Deve ter entre 1 e 3 endereços de entrega"
      });
    }

    if (!cartoes || cartoes.length < 1 || cartoes.length > 3) {
      return res.status(400).json({
        erro: "Deve ter entre 1 e 3 cartões"
      });
    }

    // 🔥 INICIA TRANSAÇÃO
    await client.query('BEGIN');

    // ✅ CRIA CLIENTE
    const novoCliente = new Cliente(
      null,
      cliente.nome_cliente,
      cliente.data_nasc,
      cliente.cpf.replace(/\D/g, ''),
      cliente.telefone.replace(/\D/g, ''),
      cliente.genero,
      cliente.email,
      cliente.senha
    );

    const clienteId = await ClienteDAO.criar(novoCliente, client); // 🔥 passando client

    // =========================
    // 🟡 ENDEREÇO DE COBRANÇA
    // =========================
    let cobrancaTratado = {
      ...enderecoCobranca,
      cep: enderecoCobranca.cep?.replace(/\D/g, ''),
      estado: enderecoCobranca.estado?.toUpperCase().trim(),
      tp_endereco: "COBRANCA",
      id_cliente: clienteId
    };

    const errosCobranca = await validarEndereco(cobrancaTratado);

    if (errosCobranca.length > 0) {
      await client.query('ROLLBACK'); // 🔥 rollback manual
      return res.status(400).json({
        erro: "Erro no endereço de cobrança",
        detalhes: errosCobranca
      });
    }

    const enderecoCobrancaObj = new Endereco(
      null,
      "COBRANCA",
      cobrancaTratado.tp_residencia,
      cobrancaTratado.cep,
      cobrancaTratado.tp_logradouro,
      cobrancaTratado.logradouro,
      cobrancaTratado.pais,
      cobrancaTratado.estado,
      cobrancaTratado.cidade,
      cobrancaTratado.bairro,
      cobrancaTratado.numero,
      cobrancaTratado.complemento || null,
      cobrancaTratado.nome_endereco,
      clienteId
    );

    await EnderecoDAO.criar(enderecoCobrancaObj, client); // 🔥 passando client

    // =========================
    // 🟢 ENDEREÇOS DE ENTREGA
    // =========================
    for (const end of enderecosEntrega) {
      const enderecoTratado = {
        ...end,
        cep: end.cep?.replace(/\D/g, ''),
        estado: end.estado?.toUpperCase().trim(),
        tp_endereco: "ENTREGA",
        id_cliente: clienteId
      };

      const errosEndereco = await validarEndereco(enderecoTratado);

      if (errosEndereco.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          erro: "Erro em endereço de entrega",
          detalhes: errosEndereco
        });
      }

      const novoEndereco = new Endereco(
        null,
        "ENTREGA",
        enderecoTratado.tp_residencia,
        enderecoTratado.cep,
        enderecoTratado.tp_logradouro,
        enderecoTratado.logradouro,
        enderecoTratado.pais,
        enderecoTratado.estado,
        enderecoTratado.cidade,
        enderecoTratado.bairro,
        enderecoTratado.numero,
        enderecoTratado.complemento || null,
        enderecoTratado.nome_endereco,
        clienteId
      );

      await EnderecoDAO.criar(novoEndereco, client); // 🔥 passando client
    }

    // =========================
    // 🔵 CARTÕES
    // =========================
    for (const c of cartoes) {
      const numeroCompleto = c.numero_cartao.replace(/\s/g, '');

      const cartaoTemp = {
        numero_cartao: numeroCompleto,
        nome_impresso: c.nome_impresso,
        bandeira: c.bandeira,
        cvv: c.cvv,
        preferencial: c.preferencial,
      };

      const errosCartao = await validarCartao(cartaoTemp);

      if (errosCartao.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          erro: "Erro em cartão",
          detalhes: errosCartao
        });
      }

      const ultimos4 = numeroCompleto.slice(-4);

      const novoCartao = new Cartao(
        null,
        ultimos4,
        c.nome_impresso,
        c.bandeira,
        c.cvv,
        c.preferencial || false,
        clienteId
      );

      await CartaoDAO.criar(novoCartao, client); // 🔥 passando client
    }

    // 🔥 FINALIZA TRANSAÇÃO
    await client.query('COMMIT');

    res.status(201).json({ mensagem: "Cadastro completo realizado!" });

  } catch (err) {

    await client.query('ROLLBACK'); // 🔥 rollback em erro inesperado

    console.error("Erro ao criar cliente:", err);
    res.status(500).json({ erro: "Erro no servidor" });

  } finally {
    client.release(); // 🔥 SEMPRE liberar conexão
  }
};

exports.buscarCliente = async (req, res) => {

  try {

    const id = req.params.id;

    const cliente = await ClienteDAO.buscarPorId(id);

    res.json(cliente);

  } catch (erro) {

    console.error(erro);
    res.status(500).send("Erro ao buscar cliente");

  }

};


exports.atualizar = async (req, res) => {
  try {

    const id = req.params.id;
    const dadosCliente = req.body;

    await ClienteDAO.atualizar(id, dadosCliente);

    if (req.body.cobranca) {

      const cobranca = {
        tp_residencia: req.body.cobranca.tpResidencia,
        cep: req.body.cobranca.cep.replace(/\D/g, ''),
        tp_logradouro: req.body.cobranca.tpLogradouro,
        logradouro: req.body.cobranca.logradouro,
        pais: req.body.cobranca.pais,
        estado: req.body.cobranca.estado,
        cidade: req.body.cobranca.cidade,
        bairro: req.body.cobranca.bairro,
        numero: req.body.cobranca.numero,
        complemento: req.body.cobranca.complemento,
        nome_endereco: req.body.cobranca.nomeEndereco
      };

      await EnderecoDAO.atualizar(req.body.cobranca.id_endereco, cobranca);
    }

    if (req.body.entrega) {

      const entrega = {
        tp_residencia: req.body.entrega.tpResidencia,
        cep: req.body.entrega.cep.replace(/\D/g, ''),
        tp_logradouro: req.body.entrega.tpLogradouro,
        logradouro: req.body.entrega.logradouro,
        pais: req.body.entrega.pais,
        estado: req.body.entrega.estado,
        cidade: req.body.entrega.cidade,
        bairro: req.body.entrega.bairro,
        numero: req.body.entrega.numero,
        complemento: req.body.entrega.complemento,
        nome_endereco: req.body.entrega.nomeEndereco
      };

      await EnderecoDAO.atualizar(req.body.entrega.id_endereco, entrega);
    }

    res.redirect("/lista-clientes?sucesso=cliente-atualizado");

  } catch (erro) {

    console.error(erro);
    res.status(500).send("Erro ao atualizar cliente");

  }
};


exports.listarClientes = async (req, res) => {
  try {
    const clientes = await ClienteDAO.listarClientes();
    res.json(clientes);
  } catch (erro) {
    console.error("Erro ao listar clientes:", erro);
    res.status(500).json({ erro: "Erro ao listar clientes" });
  }
};


exports.excluirCliente = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ erro: "ID do cliente é obrigatório" });
  }

  try {
    const deletados = await ClienteDAO.deletarCliente(id);

    if (deletados === 0) {
      return res.status(404).json({ erro: "Cliente não encontrado" });
    }

    res.json({ mensagem: "Cliente excluído com sucesso" });
  } catch (erro) {
    console.error("Erro ao excluir cliente:", erro.message);
    res.status(500).json({ erro: "Erro ao excluir cliente" });
  }
};


exports.consultarClientes = async (req, res) => {
  try {
    const { filtro } = req.query;

    let resultados;

    if (filtro && filtro.trim() !== '') {
      resultados = await ClienteDAO.consultar(filtro);
    } else {
      resultados = await ClienteDAO.listarClientes();
    }

    res.json(resultados);

  } catch (erro) {
    console.error("Erro na consulta:", erro);
    res.status(500).json({ erro: "Erro ao processar consulta." });
  }
};

  exports.editarCliente = async (req, res) => {
    try {
      const id = req.params.id;
      const { nomeCliente, dataNasc, cpf, telefone, genero, email } = req.body;

      await ClienteDAO.atualizar(id, {
        nome_cliente: nomeCliente,
        data_nasc: dataNasc,
        cpf: cpf.replace(/\D/g, ''),
        telefone: telefone.replace(/\D/g, ''),
        genero,
        email
      });

      res.redirect('/configuracoes');

    } catch (err) {
      console.error(err);
      res.status(500).send('Erro ao atualizar cliente');
    }
  };