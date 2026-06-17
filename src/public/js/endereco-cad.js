async function salvarEndereco() {
  const ID_CLIENTE = document.querySelector('meta[name="cliente-id"]')?.content;

  const endereco = {
    tp_residencia: document.querySelector('[name="cobranca[tpResidencia]"]').value,
    cep: document.querySelector('[name="cobranca[cep]"]').value,
    tp_logradouro: document.querySelector('[name="cobranca[tpLogradouro]"]').value,
    logradouro: document.querySelector('[name="cobranca[logradouro]"]').value,
    pais: document.querySelector('[name="cobranca[pais]"]').value,
    estado: document.querySelector('[name="cobranca[estado]"]').value,
    cidade: document.querySelector('[name="cobranca[cidade]"]').value,
    bairro: document.querySelector('[name="cobranca[bairro]"]').value,
    numero: document.querySelector('[name="cobranca[numero]"]').value,
    complemento: document.querySelector('[name="cobranca[complemento]"]').value,
    nome_endereco: document.querySelector('[name="cobranca[nomeEndereco]"]').value
  };

  const response = await fetch(`/clientes/${ID_CLIENTE}/enderecos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(endereco)
  });

  const data = await response.json();

  if (!response.ok) {
    document.getElementById('erros').innerText = data.erros ? data.erros.map(e => e.mensagem || e).join('\n') : data.erro;
    return;
  }

  // Redireciona de volta para a origem, se informada
  const params = new URLSearchParams(window.location.search);
  const origem = params.get('origem');

  if (origem === 'finalizar-pedido') {
    window.location.href = '/finalizar-pedido';
  } else {
    window.location.href = '/configuracoes';
  }
}