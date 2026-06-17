

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("formCadastro");
  const cpfInput = document.getElementById("cpf");
  const telInput = document.getElementById("telefone");
  const cepInputCobr = document.getElementById("cepCobranca");
  const cepInputEntr = document.getElementById("cepEntrega");
  const toggleEntrega = document.getElementById("toggle-entrega");
  const errosDiv = document.getElementById("erros");

  form.addEventListener("submit", function (event) {
    let erros = [];
    errosDiv.innerHTML = ""; // Limpa erros anteriores

    // Validação de CPF
    if (!validarCPF(cpfInput.value)) {
      erros.push("CPF inválido.");
    }

    // Validação de Telefone
    if (!validarTelefone(telInput.value)) {
      erros.push("Telefone inválido.");
    }

    // Validação de CEP Cobrança
    if (!validarCEP(cepInputCobr.value)) {
      erros.push("CEP do endereço de cobrança inválido.");
    }

    // Validação de CEP Entrega (Apenas se o checkbox estiver marcado)
    if (toggleEntrega && toggleEntrega.checked) {
      if (!validarCEP(cepInputEntr.value)) {
        erros.push("CEP do endereço de entrega inválido.");
      }
    }

    // Se houver erros, impede o envio (POST)
    if (erros.length > 0) {
      event.preventDefault(); // ESTA LINHA BLOQUEIA O POST

      const ul = document.createElement("ul");
      ul.style.color = "red";
      erros.forEach(msg => {
        const li = document.createElement("li");
        li.textContent = msg;
        ul.appendChild(li);
      });
      errosDiv.appendChild(ul);
      errosDiv.scrollIntoView({ behavior: "smooth" });
    }
  });
});


// --- Função para validar CPF ---
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf[10])) return false;

  return true;
}

function validarTelefone(tel) {
  tel = tel.replace(/\D/g, "");
  if (tel.length < 10 || tel.length > 11) return false;
  if (/^(\d)\1+$/.test(tel)) return false; // impede sequência repetida
  return true;
}

// --- Função para validar CEP ---
function validarCEP(cep) {
  cep = cep.replace(/\D/g, "");
  if (!/^\d{8}$/.test(cep)) return false;      // deve ter 8 números
  if (/^(\d)\1{7}$/.test(cep)) return false;   // impede sequência repetida
  return true;
}






