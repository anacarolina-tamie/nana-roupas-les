class Variacao {

  constructor(
    id_variacao,
    produto_id,
    cor_id,
    tamanho,
    comprimento,
    largura,
    peso_gramas,
    estoque
  ) {
    this.id_variacao = id_variacao;   // ID da variação
    this.produto_id = produto_id;     // referência ao produto
    this.cor_id = cor_id;             // referência à cor
    this.tamanho = tamanho;           // P, M, G
    this.comprimento = comprimento;   // cm
    this.largura = largura;           // cm
    this.peso_gramas = peso_gramas;   // g
    this.estoque = estoque;           // quantidade disponível
  }

}

module.exports = Variacao;