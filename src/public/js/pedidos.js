const inputPesquisar = document.getElementById('input-pesquisar');
const btnLimpar      = document.getElementById('btn-limpar');
const linhas         = document.querySelectorAll('.linha-pedido');

inputPesquisar.addEventListener('input', function () {
  const termo = this.value.trim().toLowerCase();
  btnLimpar.style.display = termo ? 'inline-block' : 'none';

  linhas.forEach(linha => {
    const id    = linha.dataset.id.toLowerCase();
    const nome  = linha.dataset.nome.toLowerCase();
    const match = id.includes(termo) || nome.includes(termo);
    linha.style.display = match ? '' : 'none';
  });
});

btnLimpar.addEventListener('click', function () {
  inputPesquisar.value    = '';
  this.style.display      = 'none';
  linhas.forEach(l => l.style.display = '');
});