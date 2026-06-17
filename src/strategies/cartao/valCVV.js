module.exports = (cartao) => {
  const cvv = cartao.cvv;

  if (!cvv) return;

  if (!/^\d+$/.test(cvv)) {
    return "CVV deve conter apenas números";
  }

  if (cvv.length !== 3) {
    return "CVV deve ter 3 dígitos";
  }
};