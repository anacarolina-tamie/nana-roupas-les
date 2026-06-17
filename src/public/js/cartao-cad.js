async function salvarCartao() {
  const ID_CLIENTE = document.querySelector('meta[name="cliente-id"]')?.content;

  const cartao = {
    numero_cartao: document.querySelector('[name="cartao[numero_cartao]"]').value,
    nome_impresso: document.querySelector('[name="cartao[nome_impresso]"]').value,
    bandeira:      document.querySelector('[name="cartao[bandeira]"]').value,
    cvv:           document.querySelector('[name="cartao[codigo_seguranca]"]').value,
    preferencial:  document.querySelector('[name="cartao[preferencial]"]')?.checked || false,
  };

  const response = await fetch(`/clientes/${ID_CLIENTE}/cartoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',   // ← adicionar
    body: JSON.stringify(cartao)
  });

  const data = await response.json();

  if (!response.ok) {
    document.getElementById('erros').innerText = data.erros
      ? data.erros.map(e => e.mensagem || e).join('\n')
      : data.erro;
    return;
  }

  // ← redireciona para a origem
  const origem = new URLSearchParams(location.search).get('origem');
  window.location.href = origem === 'finalizar-pedido' ? '/finalizar-pedido' : '/configuracoes';
}