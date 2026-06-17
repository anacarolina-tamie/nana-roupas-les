const CartaoDAO = require('../models/cartao.dao');
const Cartao = require('../models/Cartao');
const validarCartao = require('../validators/cartaoValidator');

exports.adicionarCartao = async (req, res) => {
  try {
    const id_cliente = req.params.id;

    let { numero_cartao, nome_impresso, bandeira, cvv, preferencial } = req.body;

    preferencial = preferencial === true || preferencial === 'true';

    // 🔹 sanitiza (remove tudo que não é número)
    const numeroCompleto = numero_cartao.replaceAll(" ", "");

    // 🔹 objeto TEMP para validação (com 16 dígitos)
    const cartaoTemp = {
      numero_cartao: numeroCompleto,
      nome_impresso,
      bandeira,
      cvv,
      preferencial,
      id_cliente
    };

    // valida com número completo
    const erros = await validarCartao(cartaoTemp);

    if (erros.length > 0) {
      return res.status(400).json({ erros });
    }

    // 🔹 agora sim pega só os 4 últimos
    const ultimos4 = numeroCompleto.slice(-4);

    const novoCartao = new Cartao(
      null,
      ultimos4,
      nome_impresso,
      bandeira,
      cvv,
      preferencial || false,
      id_cliente
    );


    if (preferencial) {
      await CartaoDAO.removerPreferencial(id_cliente);
    }

    const cartaoCriado = await CartaoDAO.criar(novoCartao);

    res.status(201).json(cartaoCriado);

  } catch (erro) {
    console.error("ERRO COMPLETO:", erro);

    if (erro.code === '23505') {
      return res.status(400).json({
        erro: "Cliente já possui um cartão preferencial"
      });
    }

    res.status(500).json({ erro: "Erro ao cadastrar cartão" });
  }
};


exports.listarCartoes = async (req, res) => {
  try {
    const id_cliente = req.params.id;

    const cartoes = await CartaoDAO.listarPorCliente(id_cliente);

    res.json(cartoes);

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao listar cartões" });
  }
};


exports.excluirCartao = async (req, res) => {
  try {
    const id = req.params.id;
    const idCliente = req.session.usuario.id;

    console.log('idCliente:', idCliente);
    const cartoes = await CartaoDAO.listarPorCliente(idCliente);
    console.log('total cartoes:', cartoes.length);

    if (cartoes.length <= 1) {
      return res.status(400).json({ erro: 'É necessário ter pelo menos um cartao cadastrado.' });
    }

    const deletados = await CartaoDAO.deletar(id);
    if (deletados === 0) {
      return res.status(404).json({ erro: "Cartão não encontrado" });
    }

    res.json({ mensagem: "Cartão excluído com sucesso" });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao excluir cartão" });
  }
}

  exports.definirCartaoPreferencial = async (req, res) => {
    try {
      const id_cartao = req.params.id;
      const { id_cliente } = req.body;

      console.log('id_cartao:', id_cartao, 'id_cliente:', id_cliente);

      debugger;

      await CartaoDAO.definirPreferencial(id_cartao, id_cliente);

      res.json({ mensagem: "Cartão definido como preferencial" });

    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: "Erro ao definir preferencial" });
    }
  };