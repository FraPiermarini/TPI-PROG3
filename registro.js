const registroForm = document.getElementById("registroForm");  //busca el formulario

if (registroForm) {
  registroForm.addEventListener("submit", async (e) => {
    e.preventDefault(); //Evita recargar la pagina

    const nombre = document.getElementById("registroNombre").value.trim();
    const email = document.getElementById("registroEmail").value.trim();
    const password = document.getElementById("registroPassword").value.trim(); //toma los datos

    if (!nombre || !email || !password) {
      alert("Por favor completa todos los campos");
      return;
    }  //si falta algun campo marca error

    const res = await fetch(API_USERS);
    const usuarios = await res.json(); //toma la lista de usuarios

    if (usuarios.find(u => u.email === email)) {
      alert("Ese correo ya está registrado ");
      return;
    }  //si ya esta el gmail muestra error

    await fetch(API_USERS, {
      method: "POST", //indica q se quiere agregar un usuario
      headers: { "Content-Type": "application/json" },  
      body: JSON.stringify({ nombre, email, password, role: "USUARIO" })
    });  //paso los datos a JSON para mandarlos a la API

    alert("Registro exitoso ");
    window.location.href = "login.html";
  });
}
