
const params = new URLSearchParams(window.location.search);

if (params.get("sucesso") === "cliente-criado") {

  Toastify({
    text: "Cliente cadastrado com sucesso!",
    duration: 3000,
    gravity: "top",
    position: "right",
    style: {
      background: "green"
    }
  }).showToast();

  window.history.replaceState({}, document.title, window.location.pathname);

}