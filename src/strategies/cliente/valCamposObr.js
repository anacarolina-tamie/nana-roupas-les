module.exports = (cliente) => {
  const erros = [];

  if (!cliente.nome_cliente || cliente.nome_cliente.trim() === '') {
    erros.push("Nome é obrigatório");
  }

  if (!cliente.genero) {
    erros.push("Gênero é obrigatório");
  }

  if (!cliente.data_nasc) {
    erros.push("Data de nascimento é obrigatória");
  }

  if (!cliente.cpf) {
    erros.push("CPF é obrigatório");
  }

  if (!cliente.telefone) {
    erros.push("Telefone é obrigatório");
  }

  if (!cliente.email) {
    erros.push("E-mail é obrigatório");
  }

  if (!cliente.senha) {
    erros.push("Senha é obrigatória");
  }

  if (!cliente.confirmarSenha) {
    erros.push("Confirmação de senha é obrigatória");
  }

  return erros;
};