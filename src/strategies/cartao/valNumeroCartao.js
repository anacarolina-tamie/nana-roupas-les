module.exports = (cartao) => {
    const numero = cartao.numero_cartao;

    if (!numero) return;

    if (!/^\d+$/.test(numero)) {
        return "Número do cartão deve conter apenas números";
    }

    if (numero.length !== 16) {
        return "Número do cartão deve ter 16 dígitos";
    }

    if (!validarLuhn(numero)) {
        return "Número do cartão inválido";
    }
};

function validarLuhn(numero) {
    let soma = 0;
    let deveDobrar = false;

    // percorre da direita para esquerda
    for (let i = numero.length - 1; i >= 0; i--) {
        let digito = parseInt(numero[i]);

        if (deveDobrar) {
            digito *= 2;

            if (digito > 9) {
                digito -= 9;
            }
        }

        soma += digito;
        deveDobrar = !deveDobrar;
    }

    return soma % 10 === 0;
}
