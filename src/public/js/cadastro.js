const form = document.getElementById("formCadastro");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const errosDiv = document.getElementById("erros");
  errosDiv.innerHTML = "";

  // =========================
  // CLIENTE
  // =========================
  const cliente = {
    nome_cliente: form.nomeCliente.value,
    data_nasc: form.dataNasc.value,
    cpf: form.cpf.value,
    telefone: form.telefone.value,
    genero: form.genero.value,
    email: form.email.value,
    senha: form.senha.value,
    confirmarSenha: form.confirmarSenha.value
  };

  // =========================
  // ENDEREÇO DE COBRANÇA (fixo no HTML)
  // =========================
  const enderecoCobranca = {
    tp_residencia: form["cobranca[tpResidencia]"].value,
    cep: form["cobranca[cep]"].value,
    tp_logradouro: form["cobranca[tpLogradouro]"].value,
    logradouro: form["cobranca[logradouro]"].value,
    pais: form["cobranca[pais]"].value,
    estado: form["cobranca[estado]"].value,
    cidade: form["cobranca[cidade]"].value,
    bairro: form["cobranca[bairro]"].value,
    numero: form["cobranca[numero]"].value,
    complemento: form["cobranca[complemento]"]?.value || null,
    nome_endereco: form["cobranca[nomeEndereco]"].value
  };

  // =========================
  // ENDEREÇOS DE ENTREGA (dinâmicos)
  // =========================
  const enderecosEntrega = [];
  const endInputs = document.querySelectorAll("[name^='enderecos']");
  const mapEnd = {};

  endInputs.forEach(input => {
    const match = input.name.match(/enderecos\[(\d+)\]\[(.+)\]/);
    if (match) {
      const index = match[1];
      const campo = match[2];
      if (!mapEnd[index]) mapEnd[index] = {};
      mapEnd[index][campo] = input.value;
    }
  });

  Object.values(mapEnd).forEach(end => enderecosEntrega.push(end));

  // =========================
  // CARTÕES DINÂMICOS
  // =========================
  const cartoes = [];
  const cartInputs = document.querySelectorAll("[name^='cartoes']");
  const mapCart = {};

  cartInputs.forEach(input => {
    const match = input.name.match(/cartoes\[(\d+)\]\[(.+)\]/);
    if (match) {
      const index = match[1];
      const campo = match[2];
      if (!mapCart[index]) mapCart[index] = {};
      mapCart[index][campo] = input.value;
    }
  });


  const indexMarcado = form.querySelector('input[name="cartao_preferencial"]:checked')?.value;

// No seu loop de cartões
Object.entries(mapCart).forEach(([index, cart]) => {
  // O 'index' vem do seu mapCart (que você montou usando a Regex)
  // O 'indexMarcado' vem do Radio
  
  if (index === indexMarcado) {
     cart.preferencial = true;
  } else {
     cart.preferencial = false;
  }
  
  cartoes.push(cart);
});

  // =========================
  // VALIDAÇÃO FRONT
  // =========================
  if (enderecosEntrega.length < 1) {
    errosDiv.innerHTML = "Adicione pelo menos 1 endereço de entrega";
    return;
  }

  if (cartoes.length < 1) {
    errosDiv.innerHTML = "Adicione pelo menos 1 cartão";
    return;
  }

  // =========================
  // ENVIO
  // =========================
  const data = {
    cliente,
    enderecoCobranca,    // ← agora separado
    enderecosEntrega,    // ← nome correto
    cartoes
  };

  try {
    const response = await fetch("/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (!response.ok) {
      if (result.detalhes && result.detalhes.length > 0) {
        errosDiv.innerHTML = result.detalhes.join("<br>");
      } else {
        errosDiv.innerHTML = result.erro || "Erro ao cadastrar";
      }
      return;
    }

    if (!response.ok) {
      errosDiv.innerHTML = result.erro || "Erro ao cadastrar";
      return;
    }

    alert("Cadastro realizado com sucesso!");
    window.location.href = "/login";

  } catch (err) {
    console.error(err);
    errosDiv.innerHTML = "Erro no servidor";
  }
});