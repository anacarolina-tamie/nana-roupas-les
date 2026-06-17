module.exports = (cartao) => {
  const erros = [];

  if (!cartao.numero_cartao) {
    erros.push("Número do cartão é obrigatório");
  }

  if (!cartao.nome_impresso) {
    erros.push("Nome impresso é obrigatório");
  }

  if (!cartao.bandeira) {
    erros.push("Bandeira é obrigatória");
  }

  if (!cartao.cvv) {
    erros.push("CVV é obrigatório");
  }

  return erros.length ? erros : null;
};