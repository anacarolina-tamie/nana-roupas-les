const CartaoDAO = require('../../models/cartao.dao');

module.exports = async (cartao) => {
  if (!cartao.bandeira) return;

  const ultimos4 = cartao.numero_cartao.slice(-4);

  const existe = await CartaoDAO.existeCartaoDuplicado({
    id_cliente: cartao.id_cliente,
    numero_cartao: ultimos4,
    bandeira: cartao.bandeira
  });
  
  
  if (existe) {
    return "Cartão já cadastrado para este cliente";
  }
};

