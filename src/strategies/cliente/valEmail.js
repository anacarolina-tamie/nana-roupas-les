module.exports = (cliente) => {
  const erros = [];

  if (!cliente.email) return;

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regex.test(cliente.email)) {
    erros.push("E-mail inválido");
  }

  return erros;
};