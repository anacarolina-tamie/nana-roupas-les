const CupomDAO = require('../models/Cupom.dao');

exports.buscarCuponsCliente = async (req, res) => {
    try {
        const clienteId = req.params.id;

        const cupons = await CupomDAO.listarTodosPorCliente(clienteId);

        res.json(cupons);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao buscar cupons" });
    }
};

exports.buscarCuponsTrocaCliente = async (req, res) => {
  try {
    const clienteId = req.params.id;
    const cupons = await CupomDAO.listarCuponsTrocaPorCliente(clienteId);
    res.json(cupons);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao buscar cupons de troca" });
  }
};

