class CupomPromocional {
  constructor(
    id_cupom_prom,
    nome_cupom_prom,
    cod_cupom_prom,
    valor_cupom_prom
  ) {
    this.id_cupom_prom    = id_cupom_prom;
    this.nome_cupom_prom  = nome_cupom_prom;
    this.cod_cupom_prom   = cod_cupom_prom;
    this.valor_cupom_prom = valor_cupom_prom;
  }
}

module.exports = CupomPromocional;