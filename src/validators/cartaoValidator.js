const valCamposObr = require('../strategies/cartao/valCamposObr');
const valNumeroCartao = require('../strategies/cartao/valNumeroCartao');
const valCVV = require('../strategies/cartao/valCVV');
const valBandeira = require('../strategies/cartao/valBandeira');
const valCartaoDuplicado = require('../strategies/cartao/valCartaoDuplicado');

const strategies = [
    valCamposObr,
    valNumeroCartao,
    valCVV,
    valBandeira
];

module.exports = async (cartao) => {
    const erros = [];

    for (let strategy of strategies) {
        const resultado = await strategy(cartao);

        if (Array.isArray(resultado)) {
            erros.push(...resultado);
        } else if (resultado) {
            erros.push(resultado);
        }
    }

    if (erros.length === 0) {
        try {
            const resultadoDuplicado = await valCartaoDuplicado(cartao);
            if (resultadoDuplicado) {
                erros.push(resultadoDuplicado);
            }
        } catch (err) {
            console.error("Erro na validação de duplicidade:", err);
            erros.push("Erro interno ao verificar duplicidade");
        }
    }

    return erros;
};