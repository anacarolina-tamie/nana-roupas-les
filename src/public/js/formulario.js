/*function gerenciarEnderecoEntrega() {
    const checkbox = document.getElementById('toggle-entrega');
    const secaoEntrega = document.getElementById('secao-entrega');

    if (checkbox && secaoEntrega) {
        
        const ajustarVisibilidade = () => {
            if (checkbox.checked) {
                secaoEntrega.style.display = 'block';
            } else {
                secaoEntrega.style.display = 'none';
            }
        };

        ajustarVisibilidade();

        checkbox.addEventListener('change', ajustarVisibilidade);
    }
}
document.addEventListener('DOMContentLoaded', gerenciarEnderecoEntrega);*/


const checkbox = document.getElementById('toggle-entrega');
const camposEntrega = document.querySelectorAll('[name^="entrega"]'); // Pega todos os campos que começam com "entrega"

function ajustarObrigatoriedade() {
    const estaMarcado = checkbox.checked;

    camposEntrega.forEach(campo => {
        if (estaMarcado) {
            campo.setAttribute('required', ''); // Torna obrigatório se for preencher
        } else {
            campo.removeAttribute('required'); // Remove a obrigatoriedade se for usar o de cobrança
        }
    });
}

// Executa quando clicar na checkbox
//checkbox.addEventListener('change', ajustarObrigatoriedade);

// Executa ao carregar a página para garantir o estado inicial correto
//ajustarObrigatoriedade();

/*function descartar(){
        let resposta = confirm('Tem certeza que deseja descartar as alterações?')
        if (resposta) {
          window.location.href = "/lista-clientes";
        }
}
        */


window.descartar = function(pagina){
    let resposta = confirm('Tem certeza que deseja descartar as alterações?')
    if (resposta) {
        window.location.href = pagina;
    }
}


function modalExcluir() {
    let resposta = confirm('Tem certeza que deseja excluir?')
    if (resposta) {
        alert('Excluído com sucesso!');
    }
}


async function confirmarExclusao(id, tipo) {
   
    const resposta = confirm(`Tem certeza que deseja excluir este ${tipo.slice(0, -1)}?`);

    if (resposta) {
        try {


            const response = await fetch(`http://localhost:3000/${tipo}/${id}`, {
                method: 'DELETE'
            });


            const dados = await response.json();

            if (response.ok) {
                const linha = document.getElementById(`linha-cliente-${id}`);
                if (linha) linha.remove();

                Toastify({
                    text: dados.mensagem || "Excluído com sucesso!",
                    duration: 3000,
                    gravity: "top",
                    position: "right",
                    style: { background: "#66334D" }
                }).showToast();

            } else {
                alert("Erro: " + dados.erro);
            }
        } catch (erro) {
            console.error("Erro na requisição:", erro);
            alert("Não foi possível conectar ao servidor.");
        }
    }
}