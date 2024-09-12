
document.querySelector("form").addEventListener("submit", function(event) {
    const usuario = document.getElementById("usuario").value;
    const password = document.getElementById("password").value;

    if (usuario === "" || password === "") {
        event.preventDefault();  // Evitar que el formulario se envíe
        alert("Por favor, complete todos los campos.");
    }
});

