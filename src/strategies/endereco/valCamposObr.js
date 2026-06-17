module.exports = (endereco) => {
  const erros = [];

  const camposObrigatorios = [
    "tp_residencia",
    "cep",
    "tp_logradouro",
    "logradouro",
    "pais",
    "estado",
    "cidade",
    "bairro",
    "numero",
    "nome_endereco"
  ];

  camposObrigatorios.forEach(campo => {
    if (!endereco[campo] || endereco[campo].toString().trim() === "") {
      erros.push(`O campo ${campo} é obrigatório`);
    }
  });

  return erros;
};