module.exports = (cliente) => {
  const erros = [];

  if (!cliente.data_nasc) return;

  const data = new Date(cliente.data_nasc);
  const hoje = new Date();

  if (data > hoje) {
    erros.push("Data de nascimento inválida");
  }

  return erros;
};