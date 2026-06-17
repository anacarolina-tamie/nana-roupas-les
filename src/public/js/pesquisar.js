const inputPesquisar = document.getElementById('input-pesquisar');
const btnBuscar = document.getElementById('btn-buscar');
const tabelaCorpo = document.getElementById('tabela-corpo');
const btnLimpar = document.getElementById('btn-limpar');

// Função que faz a chamada ao banco
async function realizarBusca() {

    const filtro = inputPesquisar.value.trim();

    let url = '/consultar';

    if (filtro !== '') {
        url = `/consultar?filtro=${encodeURIComponent(filtro)}`;
    }

    try {
        const response = await fetch(url);
        const clientes = await response.json();

        renderizarTabela(clientes);

    } catch (erro) {
        console.error('Erro ao buscar:', erro);
    }
}

// Evento de clique na lupa
btnBuscar.addEventListener('click', realizarBusca);

// Evento de apertar "Enter" dentro do input
inputPesquisar.addEventListener('input', () => {

    if (inputPesquisar.value.trim() !== '') {
        btnLimpar.style.display = 'block';
    } else {
        btnLimpar.style.display = 'none';
    }

});

inputPesquisar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        realizarBusca();
    }
});

btnLimpar.addEventListener('click', () => {
    inputPesquisar.value = '';
    btnLimpar.style.display = 'none';
    realizarBusca();
});

// A função renderizarTabela continua a mesma do exemplo anterior
function renderizarTabela(clientes) {
    tabelaCorpo.innerHTML = '';

    if (clientes.length === 0) {
        tabelaCorpo.innerHTML =
            `<tr>
                <td colspan="4" style="text-align:center;">
                    Nenhum resultado encontrado
                </td>
            </tr>`;
        return;
    }

    clientes.forEach(cliente => {

        const tr = document.createElement('tr');
        tr.id = `linha-cliente-${cliente.id_cliente}`;
        tr.style.cursor = "pointer";

        tr.innerHTML = `
            <td>
                ${cliente.nome_cliente}
            </td>

            <td>
                ${cliente.telefone || ''}
            </td>

            <td>
                ${cliente.email || ''}
            </td>

            <td class="acoes">
                <button class="btn-detalhes acoes-icone">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M12 17.8C16.034 17.8 19.686 15.55 21.648 12C19.686 8.45 16.034 6.2 12 6.2C7.966 6.2 4.314 8.45 2.352 12C4.314 15.55 7.966 17.8 12 17.8ZM12 5C16.808 5 20.972 7.848 23 12C20.972 16.152 16.808 19 12 19C7.192 19 3.028 16.152 1 12C3.028 7.848 7.192 5 12 5ZM12 14.8C12.7426 14.8 13.4548 14.505 13.9799 13.9799C14.505 13.4548 14.8 12.7426 14.8 12C14.8 11.2574 14.505 10.5452 13.9799 10.0201C13.4548 9.495 12.7426 9.2 12 9.2C11.2574 9.2 10.5452 9.495 10.0201 10.0201C9.495 10.5452 9.2 11.2574 9.2 12C9.2 12.7426 9.495 13.4548 10.0201 13.9799C10.5452 14.505 11.2574 14.8 12 14.8ZM12 16C10.9391 16 9.92172 15.5786 9.17157 14.8284C8.42143 14.0783 8 13.0609 8 12C8 10.9391 8.42143 9.92172 9.17157 9.17157C9.92172 8.42143 10.9391 8 12 8C13.0609 8 14.0783 8.42143 14.8284 9.17157C15.5786 9.92172 16 10.9391 16 12C16 13.0609 15.5786 14.0783 14.8284 14.8284C14.0783 15.5786 13.0609 16 12 16Z"
                            fill="#AEAEAE" />
                    </svg>
                </button> 
                <button class="btn-excluir acoes-icone">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                            d="M9 3H15M3 5.99303H21M19 5.99303L18.3 16.4886C18.3403 17.5001 18.17 18.5091 17.8 19.4517C17.4987 19.9758 17.0455 20.3966 16.5 20.6589C15.5339 20.9643 14.5147 21.0662 13.507 20.9582H10.489C9.48134 21.0662 8.46211 20.9643 7.49597 20.6589C6.95045 20.3966 6.49726 19.9758 6.19598 19.4517C5.82593 18.5091 5.65568 17.5001 5.69598 16.4886L5 5.99303"
                            stroke="#66334D" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                        </svg>
                </button>
            </td>
        `;

        //instanciar os botões para adicionar eventos
        const btnDetalhes = tr.querySelector('.btn-detalhes');
        const btnExcluir = tr.querySelector('.btn-excluir');

        btnDetalhes.addEventListener('click', () => {
            window.location.href = `/detalhes-cliente/${cliente.id_cliente}`;
        });

        btnExcluir.addEventListener('click', (e) => {
            e.stopPropagation(); // essa parte evita conflito com clique na linha
            confirmarExclusao(cliente.id_cliente, 'clientes');
        });

        tabelaCorpo.appendChild(tr);
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}