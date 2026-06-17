let idItemTrocaAtual = null;
let modoTrocaTotal = false;

function toast(msg, tipo) {
  if (typeof Toastify === 'undefined') return;
  Toastify({
    text: msg,
    duration: 3000,
    gravity: 'top',
    position: 'right',
    style: { background: tipo === 'erro' ? '#c0392b' : '#66334D' }
  }).showToast();
}

function abrirModal(idItem, total = false, nomeItem = '') {
  idItemTrocaAtual = total ? null : idItem;
  modoTrocaTotal = total;

  const campoQtd = document.getElementById('campo-quantidade');
  const listaItens = document.getElementById('lista-itens-modal');
  const desc = document.getElementById('modalTrocaDesc');
  const nomeEl = document.getElementById('modal-item-nome-unico');
  document.getElementById('input-motivo-unico').value = '';
  document.getElementById('input-quantidade').value = '';
  document.querySelectorAll('.btn-trocar-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const max = parseInt(btn.dataset.max) || 1;
      document.getElementById('input-quantidade').max = max;
      abrirModal(btn.dataset.id, false, btn.dataset.nome);
    });
  });
  listaItens.innerHTML = '';

  if (total) {
    document.getElementById('modalTrocaTitulo').textContent = 'Solicitar troca do pedido completo';
    desc.textContent = 'Informe o motivo da troca para cada item:';
    nomeEl.textContent = '';
    campoQtd.style.display = 'none';
    listaItens.style.display = 'block';

    ITENS_PEDIDO.forEach(item => {
      const bloco = document.createElement('div');
      bloco.className = 'modal-item-troca';
      bloco.innerHTML = `
      <p class="modal-item-nome">${item.nome}</p>
      <p class="modal-item-qtd">Qtd: ${item.qtd}</p>
      <input
        type="text"
        class="input-motivo-item"
        data-id="${item.id}"
        data-qtd="${item.qtd}"
        placeholder="Motivo da troca..."
      >
    `;
      listaItens.appendChild(bloco);
    });

  } else {
    document.getElementById('modalTrocaTitulo').textContent = 'Solicitar troca do item';
    desc.textContent = 'Informe a quantidade e o motivo da troca.';
    nomeEl.textContent = nomeItem;
    campoQtd.style.display = 'block';
    listaItens.style.display = 'none';
  }

  document.getElementById('modalTroca').style.display = 'flex';
}

function fecharModal() {
  document.getElementById('modalTroca').style.display = 'none';
  idItemTrocaAtual = null;
  modoTrocaTotal = false;
}

// Botões por item
document.querySelectorAll('.btn-trocar-item').forEach(btn => {
  btn.addEventListener('click', () => abrirModal(btn.dataset.id, false, btn.dataset.nome));
});

// Botão troca total
const btnTrocaCompleta = document.getElementById('btnTrocaCompleta');
if (btnTrocaCompleta) {
  btnTrocaCompleta.addEventListener('click', () => abrirModal(null, true));
}

document.getElementById('btnCancelarModal').addEventListener('click', fecharModal);
document.getElementById('modalTroca').addEventListener('click', e => {
  if (e.target === e.currentTarget) fecharModal();
});

document.getElementById('btnConfirmarTroca').addEventListener('click', async () => {
  const btn = document.getElementById('btnConfirmarTroca');
  let url, body;

  if (modoTrocaTotal) {
    const inputs = document.querySelectorAll('.input-motivo-item');
    const itens = [];
    let valido = true;

    inputs.forEach(input => {
      const motivo = input.value.trim();
      if (!motivo) valido = false;
      itens.push({
        id_item_pedido: input.dataset.id,
        motivo,
        qtd: input.dataset.qtd
      });
    });

    if (!valido) {
      toast('Informe o motivo para todos os itens.', 'erro');
      return;
    }

    url = '/historico/solicitar-troca-total';
    body = { id_pedido: ID_PEDIDO, itens };

  } else {
    if (!idItemTrocaAtual) return;

    const qtd = parseInt(document.getElementById('input-quantidade').value);
    const motivo = document.getElementById('input-motivo-unico').value.trim();

    if (!qtd || qtd < 1) {
      toast('Informe uma quantidade válida.', 'erro');
      return;
    }

    if (qtd > parseInt(document.getElementById('input-quantidade').max)) {
      toast(`Quantidade máxima permitida: ${document.getElementById('input-quantidade').max}`, 'erro');
      return;
    }

    if (!motivo) {
      toast('Informe o motivo da troca.', 'erro');
      return;
    }

    url = '/historico/solicitar-troca/' + idItemTrocaAtual;
    body = { quantidade: qtd, motivo };
  }

  btn.disabled = true;
  btn.textContent = 'Enviando...';

  try {
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    fecharModal();

    if (res.ok) {
      toast('Solicitação enviada com sucesso!', 'sucesso');
      setTimeout(() => location.reload(), 1200);
    } else {
      toast(data.mensagem || 'Erro ao solicitar troca.', 'erro');
    }
  } catch {
    fecharModal();
    toast('Falha na conexão. Tente novamente.', 'erro');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Enviar solicitação';
  }
});