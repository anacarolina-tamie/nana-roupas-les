/* =============================================================
   public/js/finalizar-pedido.js
   Lógica da tela de Pagamento (checkout) — suporte a 2 cartões
   ============================================================= */

const API = {
  enderecos: () => `/clientes/${ID_CLIENTE}/enderecos`,
  cartoes: () => `/clientes/${ID_CLIENTE}/cartoes`,
  frete: '/api/frete/calcular',
  finalizar: '/finalizar-pedido',
  validarCupom: '/cupons/validar',
};

/* ─── ESTADO ─── */
const state = {
  enderecos: [],
  cartoes: [],
  enderecoSelecionado: null,
  cartaoSelecionado: null,   // cartão 1
  cartao2Selecionado: null,   // cartão 2
  valorCartao1: null,   // valor digitado para cartão 1 (null = tudo)
  doisCartoes: false,
  cupom: null,
  subtotal: 0,
  frete: 0,
  prazo: null,
  desconto: 0,
  origem: null,
  produtosDireto: null,
};

/* ─── UTILITÁRIOS ─── */
function fmt(v) {
  return 'R$ ' + Number(v).toFixed(2).replace('.', ',');
}

function toast(msg, tipo = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'show ' + tipo;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = ''; }, 3200);
}

function openModal(titulo, corpo) {
  document.getElementById('modalTitle').textContent = titulo;
  document.getElementById('modalBody').textContent = corpo;
  document.getElementById('modalBackdrop').classList.add('open');
}

/* ─── MODAL ─── */
function initModal() {
  document.getElementById('btnModalClose').addEventListener('click', () =>
    document.getElementById('modalBackdrop').classList.remove('open')
  );
  document.getElementById('modalBackdrop').addEventListener('click', (e) => {
    if (e.target === e.currentTarget)
      document.getElementById('modalBackdrop').classList.remove('open');
  });
}

/* ─── RESUMO ─── */
function carregarValoresCarrinho() {
  const raw = sessionStorage.getItem('checkout');
  if (raw) {
    try {
      const data = JSON.parse(raw);
      state.subtotal = parseFloat(data.subtotal) || 0;
      state.desconto = parseFloat(data.desconto) || 0;
      state.origem = data.origem || 'carrinho';
      state.produtosDireto = data.produtosDireto || null;
    } catch (_) { }
  } else {
    const p = new URLSearchParams(location.search);
    state.subtotal = parseFloat(p.get('subtotal')) || 0;
    state.origem = p.get('origem') || 'carrinho';
  }
  atualizarResumo();
}

function totalFinal() {
  const descontoCupom = state.cupom ? state.cupom.valor : 0;
  return Math.max(0, state.subtotal + state.frete - descontoCupom);
}

function atualizarResumo() {
  const descontoCupom = state.cupom ? state.cupom.valor : 0;

  document.getElementById('sumSubtotal').textContent = fmt(state.subtotal);

  // Exibe frete + prazo (ex: "R$ 24,90 · 4 dias úteis")
  const freteEl = document.getElementById('sumFrete');
  if (state.frete > 0) {
    freteEl.textContent = state.prazo
      ? `${fmt(state.frete)} · ${state.prazo} dias úteis`
      : fmt(state.frete);
  } else {
    freteEl.textContent = '—';
  }

  document.getElementById('sumDesconto').textContent =
    descontoCupom > 0 ? '- ' + fmt(descontoCupom) : '—';
  document.getElementById('sumTotal').textContent = fmt(totalFinal());

  atualizarResumoCartoes();
  validarBotaoFinalizar();
}

/* atualiza as linhas de divisão no resumo quando 2 cartões */
function atualizarResumoCartoes() {
  const container = document.getElementById('sumCartoesDiv');
  if (!container) return;

  if (!state.doisCartoes || !state.cartaoSelecionado || !state.cartao2Selecionado) {
    container.style.display = 'none';
    return;
  }

  const total = totalFinal();
  const v1 = parseFloat(document.getElementById('inputValorCartao1')?.value) || 0;
  const v2 = Math.max(0, total - v1);

  const c1 = state.cartoes.find(c => String(c.id_cartao) === String(state.cartaoSelecionado));
  const c2 = state.cartoes.find(c => String(c.id_cartao) === String(state.cartao2Selecionado));

  container.style.display = 'block';
  container.innerHTML = `
    <div class="summary-row">
      <span>Cartão 1 (${c1 ? c1.bandeira || '****' : ''}): </span>
      <span class="val">${fmt(v1)}</span>
    </div>
    <div class="summary-row">
      <span>Cartão 2 (${c2 ? c2.bandeira || '****' : ''}): </span>
      <span class="val">${fmt(v2)}</span>
    </div>
  `;
}

/* ─── ENDEREÇOS ─── */
async function carregarEnderecos() {
  try {
    const res = await fetch(API.enderecos(), { credentials: 'include' });
    if (!res.ok) throw new Error(res.status);
    state.enderecos = await res.json();
    renderEnderecos();
  } catch (err) {
    console.error('Erro ao carregar endereços:', err);
    document.getElementById('addressList').innerHTML =
      '<p class="empty-state">Não foi possível carregar os endereços.</p>';
  }
}

function renderEnderecos() {
  const list = document.getElementById('addressList');
  if (!state.enderecos.length) {
    list.innerHTML = '<p class="empty-state">Nenhum endereço cadastrado.<br>Adicione um endereço para continuar.</p>';
    return;
  }
  list.innerHTML = state.enderecos.map((end, i) => `
    <div class="address-item ${i === 0 ? 'selected' : ''}"
         data-id="${end.id_endereco}" role="radio" aria-checked="${i === 0}" tabindex="0">
      <div class="radio-circle"><div class="radio-dot"></div></div>
      <div class="address-info">
        <span class="address-meta">CEP <span class="address-dot"></span> ${end.nome_endereco || 'Endereço'}</span>
        <span class="address-line">
          ${end.logradouro}, ${end.numero}${end.complemento ? ', ' + end.complemento : ''}<br>
          ${end.bairro}, ${end.cidade} — ${end.estado}, ${end.cep}, ${end.pais || 'Brasil'}
        </span>
      </div>
      <div class="address-actions">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');

  selecionarEndereco(state.enderecos[0].id_endereco);

  list.querySelectorAll('.address-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.btn-edit') || e.target.closest('.btn-delete')) return;
      selecionarEndereco(item.dataset.id);
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') selecionarEndereco(item.dataset.id);
    });
  });
}

function selecionarEndereco(id) {
  state.enderecoSelecionado = id;
  document.querySelectorAll('.address-item').forEach(item => {
    const sel = item.dataset.id == id;
    item.classList.toggle('selected', sel);
    item.setAttribute('aria-checked', sel);
  });
  calcularFrete(id);
  validarBotaoFinalizar();
}

async function calcularFrete(enderecoId) {
  // Mostra estado de carregamento
  const freteEl = document.getElementById('sumFrete');
  if (freteEl) freteEl.textContent = 'Calculando...';

  try {
    const res = await fetch('/api/frete/calcular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id_endereco: enderecoId }),
    });

    const data = await res.json();

    if (!res.ok) {
      // CEP não encontrado ou outro erro conhecido
      toast(data.mensagem || 'Não foi possível calcular o frete.', 'error');
      state.frete = 0;
      state.prazo = null;
      atualizarResumo();
      return;
    }

    state.frete = data.valor;        // ex: 24.90
    state.prazo = data.prazo_dias;   // ex: 4

    atualizarResumo();

  } catch (err) {
    console.error('Erro ao calcular frete:', err);
    toast('Falha ao calcular o frete. Verifique sua conexão.', 'error');

    // Fallback: mantém frete zerado para não deixar o usuário travado
    state.frete = 0;
    state.prazo = null;
    atualizarResumo();
  }
}

/* ─── CARTÕES ─── */
async function carregarCartoes() {
  try {
    const res = await fetch(API.cartoes(), { credentials: 'include' });
    if (!res.ok) throw new Error(res.status);
    state.cartoes = await res.json();
    renderCartoes();
  } catch (err) {
    console.error('Erro ao carregar cartões:', err);
    document.getElementById('cardList').innerHTML =
      '<p class="empty-state">Não foi possível carregar os cartões.</p>';
  }
}

function renderCartoes() {
  const list = document.getElementById('cardList');
  document.getElementById('cardCount').textContent = state.cartoes.length;

  if (!state.cartoes.length) {
    list.innerHTML = '<p class="empty-state">Nenhum cartão cadastrado.<br>Adicione um cartão para continuar.</p>';
    // esconde checkbox dois cartões se não há cartões suficientes
    document.getElementById('doisCartoesRow').style.display = 'none';
    return;
  }

  // Só mostra checkbox de 2 cartões se há >= 2 cartões
  document.getElementById('doisCartoesRow').style.display =
    state.cartoes.length >= 2 ? 'flex' : 'none';

  renderListaCartoes();
}

function renderListaCartoes() {
  renderCartaoLista('cardList', 'cartao1', state.cartaoSelecionado, state.cartao2Selecionado);
  if (state.doisCartoes) {
    document.getElementById('card2Section').style.display = 'block';
    renderCartaoLista('cardList2', 'cartao2', state.cartao2Selecionado, state.cartaoSelecionado);
    document.getElementById('valorCartao1Section').style.display = 'block';
  } else {
    document.getElementById('card2Section').style.display = 'none';
    document.getElementById('valorCartao1Section').style.display = 'none';
  }
}

function renderCartaoLista(listId, grupo, selecionadoId, excluirId) {
  const list = document.getElementById(listId);
  if (!list) return;

  const cartoesFiltrados = state.cartoes.filter(c => String(c.id_cartao) !== String(excluirId));

  if (!cartoesFiltrados.length) {
    list.innerHTML = '<p class="empty-state">Nenhum outro cartão disponível.</p>';
    return;
  }

  const selecionado = cartoesFiltrados.find(c => String(c.id_cartao) === String(selecionadoId))
    ? selecionadoId
    : null;

  list.innerHTML = cartoesFiltrados.map((card) => {
    const primeiros4 = card.numero_cartao ? String(card.numero_cartao).slice(0, 4) : '****';
    const isSel = String(card.id_cartao) === String(selecionado);
    return `
      <div class="card-item ${isSel ? 'selected' : ''}"
           data-id="${card.id_cartao}" data-grupo="${grupo}"
           role="radio" aria-checked="${isSel}" tabindex="0">
        <div class="radio-circle"><div class="radio-dot"></div></div>
        <div class="card-info">
          <div class="card-meta">
            <span class="card-brand">${card.bandeira || 'Cartão'}</span>
            <span class="address-dot"></span>
            <span class="card-holder">${card.nome_impresso || ''}</span>
            ${card.preferencial ? '<span class="badge-principal">Cartão principal</span>' : ''}
          </div>
          <span class="card-number">**** **** **** ${primeiros4} </span>
        </div>
      </div>
    `;
  }).join('');

  // Determina qual cartão selecionar por padrão
  const selecionadoValido = cartoesFiltrados.find(c => String(c.id_cartao) === String(selecionadoId));

  let idParaSelecionar = null;
  if (selecionadoValido) {
    idParaSelecionar = selecionadoId;
  } else if (cartoesFiltrados.length === 1) {
    idParaSelecionar = cartoesFiltrados[0].id_cartao;
  } else {
    const preferencial = cartoesFiltrados.find(c => c.preferencial);
    if (preferencial) idParaSelecionar = preferencial.id_cartao;
  }

  // ✅ CORREÇÃO: usa _aplicarSelecaoCartao em vez de selecionarCartao
  // para evitar loop infinito (renderCartaoLista ↔️ selecionarCartao)
  if (idParaSelecionar) {
    _aplicarSelecaoCartao(idParaSelecionar, grupo, listId);
  }

  list.querySelectorAll('.card-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.btn-remove')) return;
      selecionarCartao(item.dataset.id, grupo);
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') selecionarCartao(item.dataset.id, grupo);
    });
  });
}

/*
 * Atualiza apenas o state e as classes CSS de seleção numa lista.
 * NÃO re-renderiza a outra lista — sem risco de recursão.
 * Chamada internamente por renderCartaoLista.
 */
function _aplicarSelecaoCartao(id, grupo, listId) {
  if (grupo === 'cartao1') {
    state.cartaoSelecionado = id;
  } else {
    state.cartao2Selecionado = id;
  }

  document.querySelectorAll(`#${listId} .card-item`).forEach(item => {
    const sel = item.dataset.id == id;
    item.classList.toggle('selected', sel);
    item.setAttribute('aria-checked', sel);
  });
}

/*
 * Chamada apenas por interação do usuário (clique / teclado).
 * Atualiza o state + DOM da lista atual e re-renderiza a outra lista
 * (usando renderCartaoLista, que por sua vez usa _aplicarSelecaoCartao — sem loop).
 */
function selecionarCartao(id, grupo = 'cartao1') {
  const listId = grupo === 'cartao1' ? 'cardList' : 'cardList2';
  _aplicarSelecaoCartao(id, grupo, listId);

  // Re-renderiza a outra lista para excluir o recém-selecionado
  if (grupo === 'cartao1' && state.doisCartoes) {
    renderCartaoLista('cardList2', 'cartao2', state.cartao2Selecionado, id);
  } else if (grupo === 'cartao2') {
    renderCartaoLista('cardList', 'cartao1', state.cartaoSelecionado, id);
  }

  atualizarResumo();
  validarBotaoFinalizar();
}

/* ─── CHECKBOX 2 CARTÕES ─── */
function initDoisCartoes() {
  const checkbox = document.getElementById('checkDoisCartoes');
  const label = document.getElementById('labelDoisCartoes');

  function toggle() {
    state.doisCartoes = !state.doisCartoes;
    checkbox.classList.toggle('checked', state.doisCartoes);

    if (!state.doisCartoes) {
      state.cartao2Selecionado = null;
    }

    renderListaCartoes();
    atualizarResumo();
    validarBotaoFinalizar();
  }

  checkbox.addEventListener('click', toggle);
  label.addEventListener('click', toggle);

  // Input valor cartão 1
  document.getElementById('inputValorCartao1')?.addEventListener('input', () => {
    atualizarResumo();
    validarBotaoFinalizar();
  });
}

/* ─── CUPOM ─── */
function initCupom() {
  const inputCupom = document.getElementById('inputCupom');
  const btnAplicar = document.getElementById('btnAplicarCupom');
  const btnRemover = document.getElementById('btnRemoverCupom');
  const cupomStatus = document.getElementById('cupomStatus');

  inputCupom.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); btnAplicar.click(); }
  });

  btnAplicar.addEventListener('click', async () => {
    const codigo = inputCupom.value.trim();
    if (!codigo) { toast('Insira o código do cupom.', 'error'); return; }

    btnAplicar.disabled = true;
    btnAplicar.textContent = 'Verificando...';

    try {
      const res = await fetch(API.validarCupom, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ codigo }),
      });
      const data = await res.json();

      if (!res.ok || !data.valido) {
        toast(data.mensagem || 'Cupom inválido.', 'error');
        return;
      }

      state.cupom = { id: data.id, tipo: data.tipo, valor: parseFloat(data.valor), codigo: data.codigo, nome: data.nome };

      cupomStatus.innerHTML = `
        <span class="cupom-tag">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          ${data.nome} — ${fmt(data.valor)} de desconto
        </span>
      `;
      cupomStatus.style.display = 'block';
      btnRemover.style.display = 'inline-flex';
      btnAplicar.style.display = 'none';
      inputCupom.disabled = true;

      const totalBruto = state.subtotal + state.frete;
      if (state.cupom.valor > totalBruto) {
        const troco = (state.cupom.valor - totalBruto).toFixed(2).replace('.', ',');
        toast(`Cupom aplicado! Você receberá um cupom de troco de R$ ${troco} após finalizar.`, 'success');
      } else {
        toast('Cupom aplicado com sucesso!', 'success');
      }
      atualizarResumo();
    } catch (err) {
      console.error('Erro ao aplicar cupom:', err);
      toast('Falha ao verificar o cupom. Tente novamente.', 'error');
    } finally {
      btnAplicar.disabled = false;
      btnAplicar.textContent = 'Aplicar';
    }
  });

  btnRemover.addEventListener('click', () => {
    state.cupom = null;
    inputCupom.value = '';
    inputCupom.disabled = false;
    cupomStatus.style.display = 'none';
    btnRemover.style.display = 'none';
    btnAplicar.style.display = 'inline-flex';
    toast('Cupom removido.', '');
    atualizarResumo();
  });
}

/* ─── BOTÕES ADICIONAR ─── */
function initBotoesAdicionar() {
  document.getElementById('btnAddAddress').addEventListener('click', () => {
    window.location.href = '/adicionar-endereco?origem=finalizar-pedido';
  });
  document.getElementById('btnAddCard').addEventListener('click', () => {
    window.location.href = '/adicionar-cartao?origem=finalizar-pedido';
  });
}

/* ─── VALIDAÇÃO BOTÃO FINALIZAR ─── */
function validarBotaoFinalizar() {
  let ok = state.enderecoSelecionado && state.cartaoSelecionado && state.subtotal > 0;

  if (ok && state.doisCartoes) {
    if (!state.cartao2Selecionado) {
      ok = false;
    } else {
      const total = totalFinal();
      const v1 = parseFloat(document.getElementById('inputValorCartao1')?.value) || 0;
      const v2 = parseFloat((total - v1).toFixed(2));
      const temCupom = state.cupom && state.cupom.valor > 0;

      const aviso = document.getElementById('avisoValorCartao1');
      if (!temCupom && (v1 < 10 || v2 < 10)) {
        ok = false;
        if (aviso) aviso.textContent = 'O valor mínimo por cartão é R$ 10,00. Aplique um cupom para permitir valores menores.';
      } else {
        if (aviso) aviso.textContent = '';
      }
    }
  }

  document.getElementById('btnPay').disabled = !ok;
}

/* ─── FINALIZAR COMPRA ─── */
function initFinalizarCompra() {
  document.getElementById('btnPay').addEventListener('click', async () => {
    if (!state.enderecoSelecionado) { toast('Selecione um endereço de entrega.', 'error'); return; }
    if (!state.cartaoSelecionado) { toast('Selecione um cartão de pagamento.', 'error'); return; }
    if (state.subtotal <= 0) { toast('Não há itens no seu pedido.', 'error'); return; }

    const total = totalFinal();

    let valorCartao1 = null;
    let valorCartao2 = null;
    if (state.doisCartoes) {
      if (!state.cartao2Selecionado) { toast('Selecione o segundo cartão.', 'error'); return; }
      valorCartao1 = parseFloat(document.getElementById('inputValorCartao1')?.value) || 0;
      valorCartao2 = parseFloat((total - valorCartao1).toFixed(2));

      if (valorCartao1 <= 0 || valorCartao1 >= total) {
        toast(`O valor do cartão 1 deve ser entre R$ 0,01 e ${fmt(total - 0.01)}.`, 'error');
        return;
      }

      const temCupom = state.cupom && state.cupom.valor > 0;
      if (!temCupom) {
        if (valorCartao1 < 10 || valorCartao2 < 10) {
          toast('O valor mínimo por cartão é R$ 10,00 (exceto quando há cupom aplicado).', 'error');
          return;
        }
      }
    }

    const btn = document.getElementById('btnPay');
    btn.classList.add('loading');
    btn.disabled = true;

    const body = {
      id_endereco: state.enderecoSelecionado,
      frete: state.frete,
      id_cartao: state.cartaoSelecionado,
      id_cartao_2: state.doisCartoes ? state.cartao2Selecionado : null,
      valor_cartao_1: valorCartao1,
      valor_cartao_2: valorCartao2,
      cupom: state.cupom,
      origem: state.origem,
      produtosDireto: state.produtosDireto,
    };

    try {
      const res = await fetch(API.finalizar, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        toast(data.mensagem || 'Erro ao finalizar a compra. Tente novamente.', 'error');
        btn.classList.remove('loading');
        btn.disabled = false;
        return;
      }

      sessionStorage.removeItem('checkout');

      if (data.cupomTroco) {
        const { codigo, valor } = data.cupomTroco;
        openModal(
          'Pedido realizado!',
          `Seu pedido foi confirmado!\n\nComo o valor do cupom era maior que o total, geramos um cupom de troco para você:\n\nCódigo: ${codigo}\nValor: R$ ${valor.toFixed(2).replace('.', ',')}\n\nGuarde este código — ele estará disponível na sua conta.`
        );
        document.getElementById('btnModalClose').addEventListener('click', () => {
          window.location.href = '/historico';
        }, { once: true });
      } else {
        toast('Pedido realizado com sucesso!', 'success');
        setTimeout(() => { window.location.href = '/historico'; }, 1600);
      }
    } catch (err) {
      console.error('Erro ao finalizar compra:', err);
      toast('Falha na conexão. Verifique sua internet e tente novamente.', 'error');
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  });
}

/* ─── BOTÃO VOLTAR ─── */
function initBotaoVoltar() {
  document.getElementById('btnVoltar').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = state.origem === 'direto' ? '/produtos' : '/carrinho';
  });
}

/* ─── INIT ─── */
(async function init() {
  initModal();
  initCupom();
  initDoisCartoes();
  initBotoesAdicionar();
  initBotaoVoltar();
  initFinalizarCompra();

  carregarValoresCarrinho();
  await Promise.all([carregarEnderecos(), carregarCartoes()]);
})();