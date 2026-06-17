let qtdEnderecos = 0;
let qtdCartoes = 0;

const max = 3;

// =======================
// ENDEREÇO
// =======================

/*function adicionarEndereco() {
  if (qtdEnderecos >= max) {
    alert("Máximo de 3 endereços atingido");
    return;
  }

  qtdEnderecos++;

  const container = document.getElementById("container-enderecos");

  const div = document.createElement("div");
  div.classList.add("inputs-grid");
  div.innerHTML = `
    <hr>
    <h3>Endereço ${qtdEnderecos}</h3>

    <div class="w-50">
      <div class="label">Tipo de residência</div>
      <input class="input" name="enderecos[${qtdEnderecos}][tpResidencia]" required>
    </div>

    <div class="w-50">
      <div class="label">CEP</div>
      <input class="input" name="enderecos[${qtdEnderecos}][cep]" required>
    </div>

    <div class="w-50">
      <div class="label">Tipo de logradouro</div>
      <input class="input" name="enderecos[${qtdEnderecos}][tpLogradouro]" required>
    </div>

    <div class="w-50">
      <div class="label">Logradouro</div>
      <input class="input" name="enderecos[${qtdEnderecos}][logradouro]" required>
    </div>

    <div class="w-25">
      <div class="label">País</div>
      <input class="input" name="enderecos[${qtdEnderecos}][pais]" required>
    </div>

    <div class="w-25">
      <div class="label">Estado</div>
      <input class="input" name="enderecos[${qtdEnderecos}][estado]" required>
    </div>

    <div class="w-50">
      <div class="label">Cidade</div>
      <input class="input" name="enderecos[${qtdEnderecos}][cidade]" required>
    </div>

    <div class="w-50">
      <div class="label">Bairro</div>
      <input class="input" name="enderecos[${qtdEnderecos}][bairro]" required>
    </div>

    <div class="w-25">
      <div class="label">Número</div>
      <input class="input" name="enderecos[${qtdEnderecos}][numero]" required>
    </div>

    <div class="w-25">
      <div class="label">Complemento</div>
      <input class="input" name="enderecos[${qtdEnderecos}][complemento]">
    </div>

    <div class="w-50">
      <div class="label">Nome do endereço</div>
      <input class="input" name="enderecos[${qtdEnderecos}][nomeEndereco]" required>
    </div>
  `;

  container.appendChild(div);
}*/

window.adicionarEndereco = function () {
  if (qtdEnderecos >= max) {
    alert("Máximo de 3 endereços atingido");
    return;
  }

  qtdEnderecos++;

  const container = document.getElementById("container-enderecos");

  const div = document.createElement("div");
  div.classList.add("inputs-grid");

  div.innerHTML = `
      <link rel=stylesheet href = "../css/adicionar-form.css"
      <div> <h2>Endereço ${qtdEnderecos}</h2> </div>
    
      <div class="w-50">
        <div class="label">Tipo de residência</div>
        <input class="input" name="enderecos[${qtdEnderecos}][tp_residencia]" 
          placeholder="Ex: Apartamento" required maxlength="100">
      </div>

      <div class="w-50">
        <div class="label">CEP</div>
        <input class="input" id="cep-${qtdEnderecos}" 
          name="enderecos[${qtdEnderecos}][cep]" 
          placeholder="00000-000" required maxlength="9">
      </div>

      <div class="w-50">
        <div class="label">Tipo de logradouro</div>
        <input class="input" name="enderecos[${qtdEnderecos}][tp_logradouro]" 
          placeholder="Insira o tipo de logradouro" required maxlength="100">
      </div>

      <div class="w-50">
        <div class="label">Logradouro</div>
        <input class="input" name="enderecos[${qtdEnderecos}][logradouro]" 
          placeholder="Insira o logradouro" required maxlength="100">
      </div>

      <div class="w-25">
        <div class="label">País</div>
        <input class="input" name="enderecos[${qtdEnderecos}][pais]" 
          placeholder="Insira o país" required maxlength="100">
      </div>

      <div class="w-25">
        <div class="label">Estado</div>
        <input class="input" name="enderecos[${qtdEnderecos}][estado]" 
          placeholder="Insira o estado" required maxlength="100">
      </div>

      <div class="w-50">
        <div class="label">Cidade</div>
        <input class="input" name="enderecos[${qtdEnderecos}][cidade]" 
          placeholder="Insira a cidade" required maxlength="100">
      </div>

      <div class="w-50">
        <div class="label">Bairro</div>
        <input class="input" name="enderecos[${qtdEnderecos}][bairro]" 
          placeholder="Insira o bairro" required maxlength="100">
      </div>

      <div class="w-25">
        <div class="label">Número</div>
        <input class="input" name="enderecos[${qtdEnderecos}][numero]" 
          placeholder="Insira o número" required maxlength="20">
      </div>

      <div class="w-25">
        <div class="label">Complemento (opcional)</div>
        <input class="input" name="enderecos[${qtdEnderecos}][complemento]" 
          placeholder="Insira o complemento" maxlength="100">
      </div>

      <div class="w-50">
        <div class="label">Nome do endereço</div>
        <input class="input" name="enderecos[${qtdEnderecos}][nome_endereco]" 
          placeholder="Insira uma frase curta para identificação do endereço" 
          required maxlength="100">
      </div>

      <button type="button" class="botao-excluir">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M9 3H15M3 5.99303H21M19 5.99303L18.3 16.4886C18.3403 17.5001 18.17 18.5091 17.8 19.4517C17.4987 19.9758 17.0455 20.3966 16.5 20.6589C15.5339 20.9643 14.5147 21.0662 13.507 20.9582H10.489C9.48134 21.0662 8.46211 20.9643 7.49597 20.6589C6.95045 20.3966 6.49726 19.9758 6.19598 19.4517C5.82593 18.5091 5.65568 17.5001 5.69598 16.4886L5 5.99303"
                  stroke="#66334D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
  `;

  container.appendChild(div);

  aplicarMascaraCEP(`cep-${qtdEnderecos}`);

  const botaoExcluir = div.querySelector(".botao-excluir");

  botaoExcluir.addEventListener("click", function () {
  div.remove();
    qtdEnderecos--;

  });
}

// =======================
// CARTÃO
// =======================

/*function adicionarCartao() {
  if (qtdCartoes >= max) {
    alert("Máximo de 3 cartões atingido");
    return;
  }

  qtdCartoes++;

  const container = document.getElementById("container-cartoes");

  const div = document.createElement("div");
  div.classList.add("inputs-grid");
  div.innerHTML = `
    <hr>
    <h3>Cartão ${qtdCartoes}</h3>

    <div class="w-50">
      <div class="label">Número do Cartão</div>
      <input class="input" name="cartoes[${qtdCartoes}][numero_cartao]" required>
    </div>

    <div class="w-50">
      <div class="label">Nome Impresso</div>
      <input class="input" name="cartoes[${qtdCartoes}][nome_impresso]" required>
    </div>

    <div class="w-50">
      <div class="label">Bandeira</div>
      <input class="input" name="cartoes[${qtdCartoes}][bandeira]" required>
    </div>

    <div class="w-50">
      <div class="label">Código de Segurança</div>
      <input class="input" name="cartoes[${qtdCartoes}][codigo_seguranca]" required>
    </div>
  `;

  container.appendChild(div);
}*/
window.adicionarCartao = function () {
  if (qtdCartoes >= max) {
    alert("Máximo de 3 cartões atingido");
    return;
  }

  qtdCartoes++;

  const container = document.getElementById("container-cartoes");

  const div = document.createElement("div");
  div.classList.add("inputs-grid");

  div.innerHTML = `
    <link rel=stylesheet href = "../css/adicionar-form.css"

    <h3>Cartão ${qtdCartoes}</h3>

    <div class="w-50">
      <div class="label">Número do Cartão</div>
      <input class="input" name="cartoes[${qtdCartoes}][numero_cartao]" 
        placeholder="0000 0000 0000 0000" required maxlength="19">
    </div>

    <div class="w-50">
      <div class="label">Nome Impresso</div>
      <input class="input" name="cartoes[${qtdCartoes}][nome_impresso]" 
        placeholder="Nome como no cartão" required maxlength="100">
    </div>

    <div class="w-50">
        <div class="label">
            Bandeira
        </div>
        <div class="container-select">
            <select class="dropdown" name="cartoes[${qtdCartoes}][bandeira]" required>
                <option value="" disabled selected>Selecione</option>
                <option value="visa">Visa</option>
                <option value="elo">Elo</option>
                <option value="mastercard">Mastercard</option>
            </select>
        </div>
    </div>

    <div class="w-50">
      <div class="label">CVV</div>
      <input class="input" name="cartoes[${qtdCartoes}][cvv]" 
        placeholder="123" required maxlength="3">
    </div>

    <button type="button" class="botao-excluir">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M9 3H15M3 5.99303H21M19 5.99303L18.3 16.4886C18.3403 17.5001 18.17 18.5091 17.8 19.4517C17.4987 19.9758 17.0455 20.3966 16.5 20.6589C15.5339 20.9643 14.5147 21.0662 13.507 20.9582H10.489C9.48134 21.0662 8.46211 20.9643 7.49597 20.6589C6.95045 20.3966 6.49726 19.9758 6.19598 19.4517C5.82593 18.5091 5.65568 17.5001 5.69598 16.4886L5 5.99303"
                stroke="#66334D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
<label class="radio-opcao">
    <input class="preferencial" type="radio" name="cartao_preferencial" value="${qtdCartoes}" required>
    Preferencial
</label>

    <style>
        .botao-excluir {
            cursor: pointer;
        }
    </style>  
  `;

  container.appendChild(div);

  const botaoExcluir = div.querySelector(".botao-excluir");

  botaoExcluir.addEventListener("click", function () {
  div.remove();
    qtdCartoes--;

  });

}



// =======================
// VALIDAÇÃO MÍNIMA
// =======================

document.getElementById("formCadastro").addEventListener("submit", function (e) {
  if (qtdEnderecos < 1) {
    e.preventDefault();
    alert("Adicione pelo menos 1 endereço");
    return;
  }

  if (qtdCartoes < 1) {
    e.preventDefault();
    alert("Adicione pelo menos 1 cartão");
    return;
  }
});

function aplicarMascaraCEP(id) {
  const input = document.getElementById(id);

  input.addEventListener("input", function () {
    let valor = input.value.replace(/\D/g, "");

    if (valor.length > 5) {
      valor = valor.slice(0, 5) + "-" + valor.slice(5, 8);
    }

    input.value = valor;
  });
}