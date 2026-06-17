/*const valBandeira = require("./valBandeira");
const valCamposObrigatorios = require("./valCamposObrigatorios");
const valCartaoDuplicado = require("./valCartaoDuplicado");
const valCVV = require("./valCVV");
const valNumeroCartao = require("./valNumeroCartao");

function validarCartao(cartao, listaCartoes) {
  const validadores = [
    valCamposObrigatorios,
    valNumeroCartao,
    valCVV,
    valBandeira,
    (c) => valCartaoDuplicado(c, listaCartoes)
  ];

  for (const validar of validadores) {
    const erro = validar(cartao);
    if (erro) return erro;
  }

  return null;
}

module.exports = validarCartao;*/