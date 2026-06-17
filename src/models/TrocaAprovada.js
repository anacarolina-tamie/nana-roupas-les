class TrocaAprovada {
  constructor(
    id_troca_apr,
    status_rec,
    ret_est,
    id_sol_troca
  ) {
    this.id_troca_apr = id_troca_apr;
    this.status_rec   = status_rec;   // boolean — item foi recebido?
    this.ret_est      = ret_est;      // boolean — retornar ao estoque?
    this.id_sol_troca = id_sol_troca;
  }
}

module.exports = TrocaAprovada;