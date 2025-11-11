// ================== CONFIGURACIÓN ==================
const API_USERS = "https://690f407f45e65ab24ac305d5.mockapi.io/users";
const API_ROOMS = "https://690f407f45e65ab24ac305d5.mockapi.io/rooms";
const API_RESERVATIONS = "https://691260db52a60f10c821792c.mockapi.io/reservations";


// ================== REGISTRO ==================
const registroForm = document.getElementById("registroForm");

if (registroForm) {
  registroForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("registroNombre").value.trim();
    const email = document.getElementById("registroEmail").value.trim();
    const password = document.getElementById("registroPassword").value.trim();

    // 1️⃣ Verifica si los campos están completos
    if (!nombre || !email || !password) {
      alert("Por favor completa todos los campos");
      return;
    }

    // 2️⃣ Obtiene los usuarios existentes
    const res = await fetch(API_USERS);
    const usuarios = await res.json();

    // 3️⃣ Verifica si ya existe el correo
    if (usuarios.find(u => u.email === email)) {
      alert("Ese correo ya está registrado ❌");
      return;
    }

    // 4️⃣ Crea nuevo usuario
    await fetch(API_USERS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password, role: "USUARIO" })
    });

    alert("Registro exitoso ✅");
    window.location.href = "login.html";
  });
}


// ================== LOGIN ==================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const res = await fetch(API_USERS);
    const usuarios = await res.json();

    const user = usuarios.find(u => u.email === email && u.password === password);

    if (!user) {
      alert("Correo o contraseña incorrectos ❌");
      return;
    }

    // Guarda sesión
    localStorage.setItem("sesion", JSON.stringify(user));

    alert(`Bienvenido ${user.nombre} (${user.role})`);

    if (user.role === "ADMIN") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "usuario.html";
    }
  });
}


// ================== PANEL ADMIN ==================
if (window.location.pathname.includes("admin.html")) {
  const sesion = JSON.parse(localStorage.getItem("sesion"));
  if (!sesion || sesion.role !== "ADMIN") {
    window.location.href = "login.html";
  }

  const lista = document.getElementById("listaUsuarios");
  const form = document.getElementById("crearUsuarioForm");

  async function mostrarUsuarios() {
    const res = await fetch(API_USERS);
    const usuarios = await res.json();

    lista.innerHTML = "";
    usuarios.forEach(u => {
      lista.innerHTML += `<li>${u.nombre} - ${u.email} (${u.role})</li>`;
    });
  }

  mostrarUsuarios();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nuevoNombre").value;
    const email = document.getElementById("nuevoEmail").value;
    const password = document.getElementById("nuevoPassword").value;
    const role = document.getElementById("nuevoRol").value;

    await fetch(API_USERS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password, role })
    });

    mostrarUsuarios();
    form.reset();
  });
}


// ================== CAMBIO DE CONTRASEÑA ==================
const cambiarcontraseña = document.getElementById("cambiarcontraseña");

if (cambiarcontraseña) {
  cambiarcontraseña.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("userId").value;
    const newPassword = document.getElementById("newPassword").value;

    const res = await fetch(`${API_USERS}/${id}`);
    const user = await res.json();

    user.password = newPassword;

    await fetch(`${API_USERS}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    });

    alert("Contraseña actualizada correctamente ✅");
    cambiarcontraseña.reset();
  });
}


// ================== PANEL USUARIO ==================
if (window.location.pathname.includes("usuario.html")) {
  const sesion = JSON.parse(localStorage.getItem("sesion"));
  if (!sesion) window.location.href = "login.html";

  document.getElementById("nombreUsuario").textContent = sesion.nombre;

  async function mostrarRooms() {
    const res = await fetch(API_ROOMS);
    const rooms = await res.json();

    const contenedor = document.getElementById("roomsList");
    contenedor.innerHTML = "";

    rooms.forEach(r => {
      contenedor.innerHTML += `<li>${r.tipo} - $${r.precio} - ${r.disponible ? "Disponible" : "Ocupada"}</li>`;
    });
  }

  mostrarRooms();
  // ================== VER Y CANCELAR RESERVAS ==================
async function mostrarReservas() {
  const res = await fetch(API_RESERVATIONS);
  const reservas = await res.json();
  const misReservas = reservas.filter(r => r.userId === sesion.id);

  const lista = document.getElementById("misReservas");
  lista.innerHTML = "";

  misReservas.forEach(r => {
    const item = document.createElement("li");
    item.innerHTML = `Reserva en habitación ${r.roomId} - ${r.fecha} 
      <button onclick="cancelarReserva('${r.id}')">Cancelar</button>`;
    lista.appendChild(item);
  });

  if (misReservas.length === 0) {
    lista.innerHTML = "<li>No tenés reservas</li>";
  }
}

async function cancelarReserva(id) {
  await fetch(`${API_RESERVATIONS}/${id}`, { method: "DELETE" });
  mostrarReservas();
}

mostrarReservas();
// ================== RESERVAR HABITACIÓN ==================
async function cargarHabitacionesDisponibles() {
  const res = await fetch(API_ROOMS);
  const rooms = await res.json();
  const disponibles = rooms.filter(r => r.disponible);

  const select = document.getElementById("roomSelect");
  select.innerHTML = "";

  disponibles.forEach(r => {
    const option = document.createElement("option");
    option.value = r.id;
    option.textContent = `${r.tipo} - $${r.precio}`;
    select.appendChild(option);
  });
}

document.getElementById("formReserva").addEventListener("submit", async (e) => {
  e.preventDefault();

  const roomId = document.getElementById("roomSelect").value;
  const checkIn = document.getElementById("checkIn").value;
  const checkOut = document.getElementById("checkOut").value;

  if (!roomId || !checkIn || !checkOut) {
    alert("Completá todos los campos");
    return;
  }

  // 1️⃣ Crear reserva
  await fetch(API_RESERVATIONS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: sesion.id,
      roomId,
      checkIn,
      checkOut,
      estado: "ACTIVA"
    })
  });

  // 2️⃣ Marcar habitación como ocupada
  await fetch(`${API_ROOMS}/${roomId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ disponible: false })
  });

  alert("Reserva confirmada ✅");
  cargarHabitacionesDisponibles();
  mostrarRooms();
  mostrarReservas();
  document.getElementById("formReserva").reset();
});

cargarHabitacionesDisponibles();

}


// ================== CERRAR SESIÓN ==================
function cerrarSesion() {
  localStorage.removeItem("sesion");
  window.location.href = "login.html";
}
