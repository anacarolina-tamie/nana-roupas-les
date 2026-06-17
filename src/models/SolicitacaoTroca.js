class SolicitacaoTroca {
  constructor(
    id_sol_troca,
    status_troca,
    id_item_pedido
  ) {
    this.id_sol_troca   = id_sol_troca;
    this.status_troca   = status_troca;   // 'Pendente' | 'Aprovada' | 'Reprovada'
    this.id_item_pedido = id_item_pedido;
  }
}

module.exports = SolicitacaoTroca;