class Pedido {
  constructor(
    id_pedido,
    status_pedido,
    frete,
    desconto,
    valor_total,
    id_cliente,
    id_endereco
  ) {
    this.id_pedido     = id_pedido;
    this.status_pedido = status_pedido;
    this.frete         = frete;
    this.desconto      = desconto;
    this.valor_total   = valor_total;
    this.id_cliente    = id_cliente;
    this.id_endereco   = id_endereco;
  }
}

module.exports = Pedido;