Inputmask("999.999.999-99").mask("#cpf");
Inputmask({
  mask: ["(99) 9999-9999", "(99) 99999-9999"], // 10 dígitos ou 11 dígitos
  keepStatic: true // permite alternar entre as máscaras enquanto o usuário digita
}).mask("#telefone");
Inputmask("99999-999").mask("#cepCobranca");
Inputmask("99999-999").mask("#cepEntrega");