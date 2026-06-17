function gerenciarEnderecoEntrega() {
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

document.addEventListener('DOMContentLoaded', gerenciarEnderecoEntrega);