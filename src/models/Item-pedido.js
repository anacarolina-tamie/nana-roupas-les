class ItemPedido {
  constructor(
    id_item_pedido,
    qtde_item,
    id_variacao,
    id_pedido
  ) {
    this.id_item_pedido = id_item_pedido;
    this.qtde_item      = qtde_item;
    this.id_variacao    = id_variacao;
    this.id_pedido      = id_pedido;
  }
}

module.exports = ItemPedido;