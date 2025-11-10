// ================== CONFIGURACIÓN ==================
const API_USERS = "https://690f407f45e65ab24ac305d5.mockapi.io/:endpoint"
const API_ROOMS = "https://690f407f45e65ab24ac305d5.mockapi.io/:endpoint"
const API_RESERVATIONS = "https://691260db52a60f10c821792c.mockapi.io/:endpoint"


//REGISTRO 
let registroForm = document.getElementById("registroForm");

if (registroForm) {
  registroForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    let nombre = document.getElementById("regNombre").value;
    let email = document.getElementById("regEmail").value;
    let password = document.getElementById("regPassword").value;

    // Obtiene los usuarios para verificar si el email ya existe
    let res = await fetch(API_USERS);
    let usuarios = await res.json();

    if (usuarios.find(u => u.email === email)) {
      alert("Ese correo ya está registrado");
      return;
    }

    // Crea nuevo usuario
    await fetch(API_USERS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password, role: "USUARIO" })
    });

    alert("Registro exitoso, ahora inicia sesión");
    window.location.href = "index.html";
  });
}


// ================== LOGIN ==================
let loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;

    // Busca todos los usuarios
    let res = await fetch(API_USERS);
    let usuarios = await res.json();

    // Verifica credenciales
    let user = usuarios.find(u => u.email === email && u.password === password);

    if (!user) {
      alert("Correo o contraseña incorrectos");
      return;
    }

    localStorage.setItem("sesion", JSON.stringify(user));

    // Redirige según el rol
    if (user.role === "ADMIN") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "usuario.html";
    }
  });
}


// ================== PANEL ADMIN ==================
if (window.location.pathname.includes("admin.html")) {
  let sesion = JSON.parse(localStorage.getItem("sesion"));
  if (!sesion || sesion.role !== "ADMIN") {
    window.location.href = "index.html";
  }

  let lista = document.getElementById("listaUsuarios");
  let form = document.getElementById("crearUsuarioForm");

  // Mostrar usuarios
  async function mostrarUsuarios() {
    let res = await fetch(API_USERS);
    let usuarios = await res.json();

    lista.innerHTML = "";
    usuarios.forEach(u => {
      lista.innerHTML += `<li>${u.nombre} - ${u.email} (${u.role})</li>`;
    });
  }

  mostrarUsuarios();

  // Crear usuario desde el panel admin
  form.addEventListener("submit", async function(e) {
    e.preventDefault();

    let nombre = document.getElementById("nuevoNombre").value;
    let email = document.getElementById("nuevoEmail").value;
    let password = document.getElementById("nuevoPassword").value;
    let role = document.getElementById("nuevoRol").value;

    await fetch(API_USERS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password, role })
    });

    mostrarUsuarios();
    form.reset();
  });
}


// ================== PANEL USUARIO ==================
if (window.location.pathname.includes("usuario.html")) {
  let sesion = JSON.parse(localStorage.getItem("sesion"));
  if (!sesion) {
    window.location.href = "index.html";
  }

  document.getElementById("nombreUsuario").textContent = sesion.nombre;

  // Mostrar habitaciones disponibles
  async function mostrarRooms() {
    let res = await fetch(API_ROOMS);
    let rooms = await res.json();

    let contenedor = document.getElementById("roomsList");
    if (!contenedor) return;

    contenedor.innerHTML = "";
    rooms.forEach(r => {
      contenedor.innerHTML += `
        <li>
          ${r.tipo} - $${r.precio} - ${r.disponible ? "Disponible" : "Ocupada"}
        </li>`;
    });
  }

  mostrarRooms();
}


// ================== CERRAR SESIÓN ==================
function cerrarSesion() {
  localStorage.removeItem("sesion");
  window.location.href = "index.html";
}
