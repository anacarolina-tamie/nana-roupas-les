class Transacao {
  constructor(
    id_transacao,
    status_transacao,
    id_pedido,
    id_cartao_1,
    id_cartao_2,
    id_cupom_troca
  ) {
    this.id_transacao     = id_transacao;
    this.status_transacao = status_transacao;
    this.id_pedido        = id_pedido;
    this.id_cartao_1      = id_cartao_1;
    this.id_cartao_2      = id_cartao_2;     // opcional
    this.id_cupom_troca   = id_cupom_troca;  // opcional
  }
}

module.exports = Transacao;