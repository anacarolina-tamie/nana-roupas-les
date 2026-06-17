function gerarNumeroValido() {
  let numero = ''

  // gera 15 dígitos
  for (let i = 0; i < 15; i++) {
    numero += Math.floor(Math.random() * 10)
  }

  // calcula o dígito verificador (Luhn)
  let soma = 0
  let deveDobrar = true

  for (let i = numero.length - 1; i >= 0; i--) {
    let digito = parseInt(numero[i])

    if (deveDobrar) {
      digito *= 2
      if (digito > 9) digito -= 9
    }

    soma += digito
    deveDobrar = !deveDobrar
  }

  const digitoVerificador = (10 - (soma % 10)) % 10

  return numero + digitoVerificador
}

export function gerarCartao() {
  return {
    numero: gerarNumeroValido(),
    nome: 'TESTE CYPRESS',
    bandeira: 'visa',
    cvv: String(Math.floor(100 + Math.random() * 900)),
  }
}