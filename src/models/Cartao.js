class Cartao {

  constructor(
    id_cartao,
    numero_cartao,
    nome_impresso,
    bandeira,
    cvv,
    preferencial,
    id_cliente
  ) {
    this.id_cartao = id_cartao;
    this.numero_cartao = numero_cartao;
    this.nome_impresso = nome_impresso;
    this.bandeira = bandeira;
    this.cvv = cvv;
    this.preferencial = preferencial;
    this.id_cliente = id_cliente;
  }

}

module.exports = Cartao;