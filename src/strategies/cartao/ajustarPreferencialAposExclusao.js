const CartaoDAO = require('../../models/cartao.dao');

module.exports = async (cartaoExcluido) => {
  if (!cartaoExcluido.preferencial) return;

  const outro = await CartaoDAO.buscarQualquerPorCliente(cartaoExcluido.id_cliente);

  if (outro) {
    await CartaoDAO.definirPreferencial(outro.id_cartao, cartaoExcluido.id_cliente);
  }
};