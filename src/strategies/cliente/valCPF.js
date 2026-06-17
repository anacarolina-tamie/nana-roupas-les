module.exports = (cliente) => {
    const erros = [];

    if (!cliente.cpf) return;

    const cpf = cliente.cpf.replace(/\D/g, '');

    if (cpf.length !== 11) {
        erros.push("CPF inválido");
    }

    if (/^(\d)\1{10}$/.test(cpf)) {
        erros.push("CPF inválido");
    }

    if (!validarCPF(cpf)) {
        erros.push("CPF inválido.");
    }

    return erros;
};


function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, "");
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== parseInt(cpf[10])) return false;

    return true;
}