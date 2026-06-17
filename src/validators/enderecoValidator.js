const valCamposObr = require('../strategies/endereco/valCamposObr');
const valCEP = require('../strategies/endereco/valCEP');
const strategies = [
    valCamposObr,
    valCEP
];

module.exports = async (endereco) => {
    const erros = [];

    for (let strategy of strategies) {
        const resultado = await strategy(endereco);

        if (Array.isArray(resultado)) {
            erros.push(...resultado);
        } else if (resultado) {
            erros.push(resultado);
        }
    }

    return erros;
};