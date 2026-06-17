const form = document.getElementById("formCadastro");

form.addEventListener("submit", function (event) {

  const senha = document.getElementById("senha").value;
  const confirmarSenha = document.getElementById("confirmarSenha").value;

  if (senha !== confirmarSenha) {
    event.preventDefault(); // impede o envio do formulário
    alert("As senhas não são iguais!");
  }

});

window.toggleSenha = function(id) {

  const campo = document.getElementById(id);

  if (campo.type === "password") {
    campo.type = "text";
  } else {
    campo.type = "password";
  }

}