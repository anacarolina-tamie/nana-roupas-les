const valCamposObr = require('../strategies/cliente/valCamposObr');

const valSenha = require('../strategies/cliente/valSenha');
const valEmail = require('../strategies/cliente/valEmail');
const valCPF = require('../strategies/cliente/valCPF');
const valTelefone = require('../strategies/cliente/valTelefone');
const valDataNascimento = require('../strategies/cliente/valDataNascimento');
const valClienteDuplicado = require('../strategies/cliente/valClienteDuplicado');

const strategies = [
  valCamposObr,
  valSenha,
  valEmail,
  valCPF,
  valTelefone,
  valDataNascimento,
  valClienteDuplicado
];

module.exports = async (cliente) => {
  const erros = [];

  for (let strategy of strategies) {
    const resultado = await strategy(cliente);

    if (Array.isArray(resultado)) {
      erros.push(...resultado);
    } else if (resultado) {
      erros.push(resultado);
    }
  }

  return erros;
};