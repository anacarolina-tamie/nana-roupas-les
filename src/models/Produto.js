class Produto {

  constructor(
    id_produto,
    nome_produto,
    categoria,
    valor_produto,
    materiais,
  ) {
    this.id_produto = id_produto;
    this.nome_produto = nome_produto;
    this.categoria = categoria;
    this.valor_produto = valor_produto;
    this.materiais = materiais;
  }

}

module.exports = Produto;