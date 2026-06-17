class CupomTroca {
  constructor(
    id_cupom_troca,
    nome_cupom_troca,
    cod_cupom_troca,
    valor_cupom_troca,
    id_sol_troca
  ) {
    this.id_cupom_troca    = id_cupom_troca;
    this.nome_cupom_troca  = nome_cupom_troca;
    this.cod_cupom_troca   = cod_cupom_troca;
    this.valor_cupom_troca = valor_cupom_troca;
    this.id_sol_troca      = id_sol_troca;
  }
}

module.exports = CupomTroca;