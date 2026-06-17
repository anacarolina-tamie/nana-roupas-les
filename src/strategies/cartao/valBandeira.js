const CardsFlags = require('../../utils/bandeirasCartao'); // importa o CardsFlags

module.exports = (cartao) => {
  if (!cartao.bandeira) return;

  if (!Object.values(CardsFlags).includes(cartao.bandeira)) {
    return "Bandeira inválida";
  }

  return null; // nenhuma validação falhou
};

