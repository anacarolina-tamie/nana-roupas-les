class Cliente {

  constructor(
    id_cliente,
    nome_cliente,
    data_nasc,
    cpf,
    telefone,
    genero,
    email,
    senha
  ) {
    this.id_cliente = id_cliente;
    this.nome_cliente = nome_cliente;
    this.data_nasc = data_nasc;
    this.cpf = cpf;
    this.telefone = telefone;
    this.genero = genero;
    this.email = email;
    this.senha = senha;
  }

}

module.exports = Cliente;