let subtotalCarrinho = parseFloat(
  document.getElementById('valor-total').textContent
    .replace('R$', '').replace(/\./g, '').replace(',', '.').trim()
);

async function removerItem(idItem) {
  try {
    const resp = await fetch(`/carrinho/itens/${idItem}`, { method: 'DELETE' });
    if (resp.ok) {
      document.getElementById(`item-${idItem}`).remove();
      location.reload();
    }
  } catch (err) {
    console.error(err);
  }
}

async function atualizarQuantidade(idItem, novaQtd) {
  if (novaQtd < 1) {
    return removerItem(idItem);
  }
  try {
    const resp = await fetch(`/carrinho/itens/${idItem}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantidade: novaQtd })
    });
    if (resp.ok) {
      location.reload();
    } else {
      const data = await resp.json();
      Toastify({
        text: data.erro || 'Erro ao atualizar quantidade.',
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: { background: '#c0392b' }
      }).showToast();
    }
  } catch (err) {
    console.error(err);
  }
}

async function limparCarrinho() {
  try {
    const resp = await fetch('/carrinho', { method: 'DELETE' });
    if (resp.ok) location.reload();
  } catch (err) {
    console.error(err);
  }
}

async function consultarFrete() {
  const cep = document.getElementById('cepEntrega').value.trim().replace(/\D/g, '');

  if (cep.length !== 8) {
    Toastify({
      text: 'Insira um CEP válido com 8 dígitos.',
      duration: 3000, gravity: 'top', position: 'right',
      style: { background: '#c0392b' }
    }).showToast();
    return;
  }

  try {
    // 1. Valida o CEP e pega a UF via ViaCEP
    const viaCepRes = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const viaCepData = await viaCepRes.json();

    if (viaCepData.erro) {
      Toastify({
        text: 'CEP não encontrado.',
        duration: 3000, gravity: 'top', position: 'right',
        style: { background: '#c0392b' }
      }).showToast();
      return;
    }

    const uf = viaCepData.uf;

    // 2. Consulta o frete no backend
    const freteRes = await fetch('/api/frete/consultar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ cep, uf }),
    });

    const freteData = await freteRes.json();

    if (!freteRes.ok) {
      Toastify({
        text: freteData.mensagem || 'Erro ao consultar frete.',
        duration: 3000, gravity: 'top', position: 'right',
        style: { background: '#c0392b' }
      }).showToast();
      return;
    }

    // 3. Atualiza a tela
    const valorFrete = parseFloat(freteData.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    document.getElementById('valor-frete').textContent = `R$ ${valorFrete} · ${freteData.prazo_dias} dias úteis`;

    const totalComFrete = subtotalCarrinho + freteData.valor;
    document.getElementById('valor-total').textContent =
      'R$ ' + totalComFrete.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

    Toastify({
      text: `Frete calculado: R$ ${valorFrete} em ${freteData.prazo_dias} dias úteis`,
      duration: 3500, gravity: 'top', position: 'right',
      style: { background: '#66334D' }
    }).showToast();

  } catch (err) {
    console.error('Erro ao consultar frete:', err);
    Toastify({
      text: 'Falha ao consultar frete. Verifique sua conexão.',
      duration: 3000, gravity: 'top', position: 'right',
      style: { background: '#c0392b' }
    }).showToast();
  }
}

function irParaPagamento() {
  sessionStorage.setItem('checkout', JSON.stringify({
    subtotal: subtotalCarrinho,
    desconto: 0,
    origem: 'carrinho',
    produtosDireto: null
  }));

  window.location.href = '/finalizar-pedido';
}