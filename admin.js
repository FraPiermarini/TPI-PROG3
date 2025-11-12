// ================== PANEL ADMIN ==================
if (window.location.pathname.includes("admin.html")) {
  const sesion = JSON.parse(localStorage.getItem("sesion"));
  if (!sesion || sesion.role !== "ADMIN") {
    window.location.href = "login.html";
  }

  // === USUARIOS ===
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

  // === RESERVAS ===
  async function mostrarReservasAdmin() {
    const res = await fetch(API_RESERVATIONS);
    const reservas = await res.json();

    const contenedor = document.getElementById("panelReservasAdmin");
    contenedor.innerHTML = "";

    reservas.forEach(r => {
      const item = document.createElement("li");
      item.innerHTML = `
        Usuario: ${r.userId}<br>
        Habitación: ${r.roomId}<br>
        Desde: ${r.checkIn} &nbsp;&nbsp; Hasta: ${r.checkOut}<br>
      `;

      const select = document.createElement("select");
      ["ACTIVA", "CANCELADA", "FINALIZADA"].forEach(estado => {
        const option = document.createElement("option");
        option.value = estado;
        option.textContent = estado;
        if (r.estado === estado) option.selected = true;
        select.appendChild(option);
      });

      select.onchange = () => actualizarEstadoReserva(r.id, select.value);
      item.appendChild(select);
      contenedor.appendChild(item);
    });
  }

async function actualizarEstadoReserva(id, nuevoEstado) {
  const res = await fetch(`${API_RESERVATIONS}/${id}`);
  const reserva = await res.json();

  const actualizada = {
    ...reserva,
    estado: nuevoEstado
  };

  await fetch(`${API_RESERVATIONS}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(actualizada)
  });

  // Actualizar disponibilidad de la habitación
  const disponible = nuevoEstado === "CANCELADA" || nuevoEstado === "FINALIZADA";

  await fetch(`${API_ROOMS}/${reserva.roomId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ disponible })
  });

  mostrarReservasAdmin();
  mostrarHabitacionesAdmin();
}


  // === HABITACIONES ===
  async function mostrarHabitacionesAdmin() {
    const res = await fetch(API_ROOMS);
    const habitaciones = await res.json();

    const contenedor = document.getElementById("panelHabitacionesAdmin");
    contenedor.innerHTML = "";

    habitaciones.forEach(h => {
      const item = document.createElement("li");
      item.innerHTML = `Tipo: ${h.tipo} &nbsp;&nbsp; Precio: $`;

      const input = document.createElement("input");
      input.type = "number";
      input.value = h.precio;
      input.style.width = "80px";
      input.onchange = () => actualizarPrecioHabitacion(h.id, input.value);

      item.appendChild(input);
      contenedor.appendChild(item);
    });
  }

  async function actualizarPrecioHabitacion(id, nuevoPrecio) {
    await fetch(`${API_ROOMS}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ precio: Number(nuevoPrecio) })
    });
    mostrarHabitacionesAdmin();
  }

  // === INICIALIZACIÓN ===
  mostrarUsuarios();
  mostrarReservasAdmin();
  mostrarHabitacionesAdmin();
}
