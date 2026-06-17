// ============================================================
// UTILITÁRIOS
// ============================================================

// Recupera o ID do cliente da sessão/meta ou ajuste conforme seu sistema de autenticação
// Exemplo: via meta tag injetada pelo servidor no layout principal
// <meta name="cliente-id" content="SESSION_CLIENTE_ID">


function toast(msg, tipo = 'success') {
    Toastify({
        text: msg,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: tipo === 'success' ? '#995277' : '#c0392b',
    }).showToast();
}

function formatarCPF(cpf) {
    return cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') || '—';
}

function formatarTelefone(tel) {
    return tel?.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') || '—';
}

function formatarData(data) {
    if (!data) return '—';
    return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function formatarCEP(cep) {
    return cep?.replace(/(\d{5})(\d{3})/, '$1-$2') || '';
}

// ============================================================
// SVG ICONS
// ============================================================
const iconEditar = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.34 7.042L17.608 9.30999M20.65 7.33L17.32 4L4.009 17.311L4 20.65L7.33901 20.641L20.65 7.33Z"
                    stroke="#995277" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>`;

const iconExcluir = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 3H15M3 5.99303H21M19 5.99303L18.3 16.4886C18.3403 17.5001 18.17 18.5091 17.8 19.4517C17.4987 19.9758 17.0455 20.3966 16.5 20.6589C15.5339 20.9643 14.5147 21.0662 13.507 20.9582H10.489C9.48134 21.0662 8.46211 20.9643 7.49597 20.6589C6.95045 20.3966 6.49726 19.9758 6.19598 19.4517C5.82593 18.5091 5.65568 17.5001 5.69598 16.4886L5 5.99303"
                    stroke="#66334D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>`;

// ============================================================
// MODAL DE CONFIRMAÇÃO
// ============================================================
let acaoConfirmada = null;

function abrirModal(mensagem, acao, labelConfirmar = 'Excluir') {
    document.getElementById('modal-mensagem').textContent = mensagem;
    document.getElementById('btn-confirmar-exclusao').textContent = labelConfirmar;
    acaoConfirmada = acao;
    document.getElementById('modal-confirmacao').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modal-confirmacao').style.display = 'none';
    acaoConfirmada = null;
}

document.getElementById('btn-confirmar-exclusao').addEventListener('click', () => {
    if (acaoConfirmada) acaoConfirmada();
    fecharModal();
});

// Fechar modal clicando fora
document.getElementById('modal-confirmacao').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-confirmacao')) fecharModal();
});

// ============================================================
// CARREGAR PERFIL
// ============================================================
async function carregarPerfil() {
    try {
        const res = await fetch(`/clientes/${ID_CLIENTE}`);
        if (!res.ok) throw new Error('Erro ao buscar cliente');
        const cliente = await res.json();

        document.getElementById('perfil-nome').textContent = cliente.nome_cliente || '—';
        document.getElementById('perfil-genero').textContent = cliente.genero || '—';
        document.getElementById('perfil-data-nasc').textContent = formatarData(cliente.data_nasc);
        document.getElementById('perfil-cpf').textContent = formatarCPF(cliente.cpf);
        document.getElementById('perfil-telefone').textContent = formatarTelefone(cliente.telefone);
        document.getElementById('perfil-email').textContent = cliente.email || '—';
    } catch (err) {
        console.error(err);
        toast('Erro ao carregar dados do perfil', 'error');
    }
}

// ============================================================
// CARREGAR ENDEREÇOS
// ============================================================
async function carregarEnderecos() {
    try {
        const res = await fetch(`/clientes/${ID_CLIENTE}/enderecos`);
        if (!res.ok) throw new Error('Erro ao buscar endereços');
        const enderecos = await res.json();

        const cobrancaContainer = document.getElementById('lista-endereco-cobranca');
        const entregaContainer = document.getElementById('lista-enderecos-entrega');

        cobrancaContainer.innerHTML = '';
        entregaContainer.innerHTML = '';

        const cobrancas = enderecos.filter(e => e.tp_endereco?.toUpperCase() === 'COBRANCA');
        const entregas = enderecos.filter(e => e.tp_endereco?.toUpperCase() !== 'COBRANCA');

        if (cobrancas.length === 0) {
            cobrancaContainer.innerHTML = '<p class="vazio">Nenhum endereço de cobrança cadastrado.</p>';
        } else {
            cobrancas.forEach(end => {
                cobrancaContainer.appendChild(criarCardEndereco(end, false));
            });
        }

        if (entregas.length === 0) {
            entregaContainer.innerHTML = '<p class="vazio">Nenhum endereço de entrega cadastrado.</p>';
        } else {
            entregas.forEach(end => {
                entregaContainer.appendChild(criarCardEndereco(end, true));
            });
        }

    } catch (err) {
        console.error(err);
        toast('Erro ao carregar endereços', 'error');
    }
}

function criarCardEndereco(end, podeExcluir) {
    const info = [
        end.tp_residencia,
        formatarCEP(end.cep),
        end.tp_logradouro,
        end.logradouro,
        end.numero,
        end.complemento,
        end.bairro,
        end.cidade,
        end.estado,
        end.pais
    ].filter(Boolean).join(', ');

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
                <p class="card-title"><strong>${end.nome_endereco || 'Endereço'}</strong></p>
                <div class="card-conteudo">
                    <p class="card-info">${info}</p>
                    <a href="/editar-endereco/${end.id_endereco}" title="Editar">${iconEditar}</a>
                    ${podeExcluir ? `<button class="btn-icon" title="Excluir" onclick="confirmarExclusaoEndereco(${end.id_endereco})">${iconExcluir}</button>` : ''}
                </div>
            `;
    return card;
}

async function confirmarExclusaoEndereco(idEndereco) {
    abrirModal('Tem certeza que deseja excluir este endereço?', async () => {
        try {
            const res = await fetch(`/enderecos/${idEndereco}`, { method: 'DELETE' });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.erro || 'Erro ao excluir endereço');
            }
            toast('Endereço excluído com sucesso');
            carregarEnderecos();
        } catch (err) {
            console.error(err);
            toast(err.message || 'Erro ao excluir endereço', 'error');
        }
    });
}

// ============================================================
// CARREGAR CARTÕES
// ============================================================
async function carregarCartoes() {
    try {
        const res = await fetch(`/clientes/${ID_CLIENTE}/cartoes`);
        if (!res.ok) throw new Error('Erro ao buscar cartões');
        const cartoes = await res.json();

        const container = document.getElementById('lista-cartoes');
        container.innerHTML = '';

        if (cartoes.length === 0) {
            container.innerHTML = '<p class="vazio">Nenhum cartão cadastrado.</p>';
            return;
        }

        cartoes.forEach(cartao => {
            container.appendChild(criarCardCartao(cartao));
        });

    } catch (err) {
        console.error(err);
        toast('Erro ao carregar cartões', 'error');
    }
}

function criarCardCartao(cartao) {
    const card = document.createElement('div');
    card.className = 'card';
    card.id = `card-cartao-${cartao.id_cartao}`;

    const tagPreferencial = cartao.preferencial
        ? `<span class="tag-cartao-principal">Cartão principal</span>`
        : `<button class="definir-preferencial" onclick="definirPreferencial(${cartao.id_cartao})">Definir como preferencial</button>`;

    card.innerHTML = `
                <div class="card-row-1">
                    <p class="card-title"><strong>${cartao.nome_impresso}</strong></p>
                    ${tagPreferencial}
                </div>
                <div class="card-conteudo">
                    <p class="card-info">
                        ${cartao.bandeira} &bull; **** ${cartao.ultimos4 || cartao.numero_cartao}
                    </p>
                    <button class="btn-icon" title="Excluir" onclick="confirmarExclusaoCartao(${cartao.id_cartao}, ${!!cartao.preferencial})">${iconExcluir}</button>
                </div>
            `;
    return card;
}

async function definirPreferencial(idCartao) {
    try {
        const res = await fetch(`/cartoes/${idCartao}/preferencial`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_cliente: ID_CLIENTE })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.erro || 'Erro ao definir preferencial');
        }

        toast('Cartão definido como preferencial!');
        carregarCartoes();
    } catch (err) {
        console.error(err);
        toast(err.message || 'Erro ao definir cartão preferencial', 'error');
    }
}

async function confirmarExclusaoCartao(idCartao, ehPreferencial) {
    if (ehPreferencial) {
        toast('Não é possível excluir o cartão preferencial. Defina outro como preferencial primeiro.', 'error');
        return;
    }

    abrirModal('Tem certeza que deseja excluir este cartão?', async () => {
        try {
            const res = await fetch(`/cartoes/${idCartao}`, { method: 'DELETE' });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.erro || 'Erro ao excluir cartão');
            }
            toast('Cartão excluído com sucesso');
            carregarCartoes();
        } catch (err) {
            console.error(err);
            toast(err.message || 'Erro ao excluir cartão', 'error');
        }
    });
}

// ============================================================
// CARREGAR CUPONS
// ============================================================
async function carregarCupons() {
    await carregarCuponsLoja();
    await carregarCuponsTroca();
}

async function carregarCuponsLoja() {
    try {
        const res = await fetch(`/clientes/${ID_CLIENTE}/cupons`);
        if (!res.ok) throw new Error();
        const cupons = await res.json();

        const container = document.getElementById('lista-cupons-troco');
        container.innerHTML = '';

        if (cupons.length === 0) {
            container.innerHTML = '<p class="vazio">Nenhum cupom de troco disponível.</p>';
            return;
        }

        cupons.forEach(cupom => {
            container.appendChild(criarCardCupomLoja(cupom));
        });
    } catch (err) {
        console.error(err);
        document.getElementById('lista-cupons-troco').innerHTML = '<p class="vazio">Nenhum cupom de troco disponível.</p>';
    }
}

function criarCardCupomLoja(cupom) {
    const card = document.createElement('div');
    card.className = 'card';

    const status = cupom.usado ? 'Usado' : 'Disponível';
    const valor = parseFloat(cupom.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const origem = cupom.pedido_id
        ? `Gerado pela devolução do pedido #${cupom.pedido_id}`
        : 'Gerado como troco de pagamento com cupom';

    card.innerHTML = `
    <div class="card-row-1">
      <p class="card-title"><strong>${cupom.codigo}</strong></p>
      <span class="tag-status ${cupom.usado ? 'tag-usado' : 'tag-disponivel'}">${status}</span>
    </div>
    <div class="card-conteudo">
      <p class="card-info">
        <strong>${valor}</strong><br>
        <span style="font-size:0.8rem; color:#888;">${origem}</span>
      </p>
    </div>
  `;
    return card;
}

async function carregarCuponsTroca() {
    try {
        const res = await fetch(`/cupons/${ID_CLIENTE}/troca`);
        if (!res.ok) throw new Error();
        const cupons = await res.json();

        const container = document.getElementById('lista-cupons-troca');
        container.innerHTML = '';

        if (cupons.length === 0) {
            container.innerHTML = '<p class="vazio">Nenhum cupom de troca disponível.</p>';
            return;
        }

        cupons.forEach(cupom => {
            container.appendChild(criarCardCupomTroca(cupom));
        });
    } catch (err) {
        console.error(err);
        document.getElementById('lista-cupons-troca').innerHTML = '<p class="vazio">Nenhum cupom de troca disponível.</p>';
    }
}

function criarCardCupomTroca(cupom) {
    const card = document.createElement('div');
    card.className = 'card';

    const valor = parseFloat(cupom.valor_cupom_troca).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const nome = cupom.nome_cupom_troca || 'Cupom de troca';
    const status = cupom.usado ? 'Usado' : 'Disponível';  // ← novo

    card.innerHTML = `
    <div class="card-row-1">
      <p class="card-title"><strong>${cupom.cod_cupom_troca}</strong></p>
      <span class="tag-status ${cupom.usado ? 'tag-usado' : 'tag-disponivel'}">${status}</span>  <!-- ← novo -->
    </div>
    <div class="card-conteudo">
      <p class="card-info">
        <strong>${valor}</strong><br>
        <span style="font-size:0.8rem; color:#888;">${nome} &bull; Vinculado à solicitação #${cupom.id_sol_troca}</span>
      </p>
    </div>
  `;
    return card;
}
// ============================================================
// SAIR DA CONTA
// ============================================================
function sairDaConta() {
    abrirModal('Tem certeza que deseja sair da conta?', () => {
        window.location.href = '/logout';
    }, 'Sair');
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    if (!ID_CLIENTE) {
        toast('Sessão inválida. Faça login novamente.', 'error');
        setTimeout(() => window.location.href = '/login', 2000);
        return;
    }

    carregarPerfil();
    carregarEnderecos();
    carregarCartoes();
    carregarCupons();
});