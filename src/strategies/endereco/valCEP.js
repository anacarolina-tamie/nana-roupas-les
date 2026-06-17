module.exports = (endereco) => {

    if (!endereco.cep) return;

    const erros = [];

    const cep = endereco.cep.replace(/\D/g, '');

    if (!/^\d{8}$/.test(cep)) {
        erros.push("CEP inválido");
    }

    if (/^(\d)\1{7}$/.test(cep)) {
        erros.push("CEP inválido");
    }

    return erros;
};