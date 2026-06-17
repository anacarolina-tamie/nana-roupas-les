module.exports = (cliente) => {
  const erros = [];

  if (!cliente.telefone) return erros;

  // 1. Verifica se o que o usuário digitou contém APENAS números, parênteses, espaços ou traços
  // Se houver qualquer letra (a-z), este teste falha.
  const possuiLetras = /[a-zA-Z]/.test(cliente.telefone);
  
  if (possuiLetras) {
    erros.push("Telefone não pode conter letras");
    return erros; // Já retorna aqui para não precisar validar o tamanho de algo errado
  }

  // 2. Agora sim, removemos a máscara para validar a quantidade de dígitos
  const telefoneLimpo = cliente.telefone.replace(/\D/g, '');

  if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
    erros.push("Telefone deve ter 10 ou 11 dígitos");
  }

  return erros;
};