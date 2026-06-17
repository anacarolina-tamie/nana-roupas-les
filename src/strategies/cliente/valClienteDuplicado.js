const ClienteDAO = require('../../models/cliente.dao');

module.exports = async (cliente) => {
  const erros = [];

  if (!cliente.cpf && !cliente.email) return erros;

  // 🔹 busca por cpf ou email
  const existente = await ClienteDAO.buscarPorCpfOuEmail(cliente.cpf, cliente.email);

  if (existente) {
    if (existente.cpf === cliente.cpf) {
      erros.push("CPF já cadastrado");
    }

    if (existente.email === cliente.email) {
      erros.push("E-mail já cadastrado");
    }
  }

  return erros;
};