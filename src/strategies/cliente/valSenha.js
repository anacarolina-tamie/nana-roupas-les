module.exports = (cliente) => {
  const erros = [];

  const senha = cliente.senha;
  const confirmar = cliente.confirmarSenha;

  if (!senha) return;

  if (senha.length < 8) {
    erros.push("Senha deve ter pelo menos 8 caracteres");
  }

  if (!/[A-Z]/.test(senha)) {
    erros.push("Senha deve conter letra maiúscula");
  }

  if (!/[a-z]/.test(senha)) {
    erros.push("Senha deve conter letra minúscula");
  }

  if (!/[0-9]/.test(senha)) {
    erros.push("Senha deve conter pelo menos um número");
  }

  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(senha)) {
    erros.push("Senha deve conter caractere especial");
  }

  if (senha !== confirmar) {
    erros.push("Senhas não conferem");
  }

  return erros;
};