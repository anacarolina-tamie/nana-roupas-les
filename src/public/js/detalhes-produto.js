const variacoes = JSON.parse(decodeURIComponent(
    document.getElementById('dados-variacoes').dataset.variacoes
));
let tamanhoSelecionado = null;
let corSelecionada = null;

function selecionarOpcao(btn, tipo) {
  document.querySelectorAll(`[data-tipo="${tipo}"]`).forEach(b => b.classList.remove('selecionado'));
  btn.classList.add('selecionado');

  if (tipo === 'tamanho') tamanhoSelecionado = btn.dataset.valor;
  if (tipo === 'cor') {
    corSelecionada = btn.dataset.valor;
    atualizarImagem();
  }
}

function atualizarImagem() {
  // Pega qualquer variação da cor selecionada para obter a imagem
  const variacao = variacoes.find(v => String(v.id_cor) === String(corSelecionada));
  if (variacao && variacao.url_imagem) {
    document.getElementById('imagem-produto').src = variacao.url_imagem;
  }
}

function getVariacaoSelecionada() {
  if (!tamanhoSelecionado || !corSelecionada) return null;
  return variacoes.find(
    v => v.tamanho === tamanhoSelecionado && String(v.id_cor) === String(corSelecionada)
  );
}

async function adicionarAoCarrinho() {
  const variacao = getVariacaoSelecionada();
  if (!variacao) {
    document.getElementById('msg-aviso').classList.add('visivel');
    return;
  }
  document.getElementById('msg-aviso').classList.remove('visivel');

  const quantidade = parseInt(document.getElementById('quantidade').value); // ← saiu do fetch

  try {
    const resp = await fetch('/carrinho/itens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_variacao: variacao.id_variacao, quantidade })
    });

    const data = await resp.json();

    if (resp.ok) {
      Toastify({
        text: "Item adicionado ao carrinho!",
        duration: 3000,
        gravity: "top",
        position: "right",
        style: { background: "#66334D" }
      }).showToast();
    } else {
      Toastify({
        text: data.erro || "Erro ao adicionar item.",
        duration: 3000,
        gravity: "top",
        position: "right",
        style: { background: "#c0392b" }
      }).showToast();
    }
  } catch (err) {
    console.error(err);
  }
}

async function comprarAgora() {
  await adicionarAoCarrinho();
  const variacao = getVariacaoSelecionada();
  if (variacao) window.location.href = '/carrinho';
}

function ajustarQuantidade(delta) {
    const input = document.getElementById('quantidade');
    const novoValor = Math.min(99, Math.max(1, parseInt(input.value) + delta));
    input.value = novoValor;
}