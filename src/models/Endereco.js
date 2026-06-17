class Endereco {

  constructor(
    id_endereco,
    tp_endereco,
    tp_residencia,
    cep,
    tp_logradouro,
    logradouro,
    pais,
    estado,
    cidade,
    bairro,
    numero,
    complemento,
    nome_endereco,
    id_cliente
  ) {
    this.id_endereco = id_endereco;
    this.tp_endereco = tp_endereco;
    this.tp_residencia = tp_residencia;
    this.cep = cep;
    this.tp_logradouro = tp_logradouro;
    this.logradouro = logradouro;
    this.pais = pais;
    this.estado = estado;
    this.cidade = cidade;
    this.bairro = bairro;
    this.numero = numero;
    this.complemento = complemento;
    this.nome_endereco = nome_endereco;
    this.id_cliente = id_cliente;
  }

}

module.exports = Endereco;