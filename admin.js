if (window.location.pathname.includes("admin.html")) {
  const sesion = JSON.parse(localStorage.getItem("sesion")); //obtiene la sesion
  if (!sesion || sesion.role !== "ADMIN") {
    window.location.href = "login.html";  //si no hay sesion vuelve al login
  }

  const lista = document.getElementById("listaUsuarios");
  const form = document.getElementById("crearUsuarioForm");

  async function mostrarUsuarios() {
    const res = await fetch(API_USERS);
    const usuarios = await res.json();  //pide los usuarios a la api

    lista.innerHTML = "";  //limpia
    usuarios.forEach(u => {
      lista.innerHTML += `<li>${u.nombre} - ${u.email} (${u.role})</li>`;
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nuevoNombre").value;
    const email = document.getElementById("nuevoEmail").value;
    const password = document.getElementById("nuevoPassword").value;
    const role = document.getElementById("nuevoRol").value;  //crea un nuevo usuario con el formulario

    await fetch(API_USERS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password, role })
    });  //carga el usuario en la api

    mostrarUsuarios();
    form.reset();  //actualiza la lsta y limpia el formlario
  });

  async function mostrarReservasAdmin() {
    const res = await fetch(API_RESERVATIONS);
    const reservas = await res.json();  //pide las reservas a la api

    const contenedor = document.getElementById("panelReservasAdmin");
    contenedor.innerHTML = ""; //limpia

    reservas.forEach(r => {
      const item = document.createElement("li");
      item.innerHTML = `
        Usuario: ${r.userId}<br>
        Habitación: ${r.roomId}<br>
        Desde: ${r.checkIn} &nbsp;&nbsp; Hasta: ${r.checkOut}<br> 
      `;  //crea una lista con los datos de la resrva

      const select = document.createElement("select");
      ["ACTIVA", "CANCELADA", "FINALIZADA"].forEach(estado => {
        const option = document.createElement("option");
        option.value = estado;
        option.textContent = estado;
        if (r.estado === estado) option.selected = true;
        select.appendChild(option);
      });  //carga el selector del estado de la reserva

      select.onchange = () => actualizarEstadoReserva(r.id, select.value); //actualiza la pagina cuando carga el estado
      item.appendChild(select);
      contenedor.appendChild(item);
    });
  }

const formPass = document.getElementById("cambiarconstraseña");

if (formPass) {
  formPass.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("userNombre").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();

    // obtiene todos los usuarios
    const res = await fetch(API_USERS);
    const usuarios = await res.json();

    //Buscar por nombre EXACTO
    const user = usuarios.find(u => u.nombre.toLowerCase() === nombre.toLowerCase());

    if (!user) {
      alert("No existe un usuario con ese nombre ");
      return; //si no encuentra el usuario muestra esto
    }

    //actualiza la contraseña en la api
    await fetch(`${API_USERS}/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...user,
        password: newPassword
      })
    });

    alert(`Contraseña actualizada para ${user.nombre} `);
    formPass.reset();
  });
}

async function actualizarEstadoReserva(id, nuevoEstado) {
  const res = await fetch(`${API_RESERVATIONS}/${id}`);
  const reserva = await res.json();

  const actualizada = {
    ...reserva,
    estado: nuevoEstado
  };  //actualiza el estado de la reserva

  await fetch(`${API_RESERVATIONS}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(actualizada)
  });

  //si el estado es cancelada o finalizada la muestra como disponible
  const disponible = nuevoEstado === "CANCELADA" || nuevoEstado === "FINALIZADA";

  await fetch(`${API_ROOMS}/${reserva.roomId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ disponible })
  }); //cambia el estado la appi

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
      input.onchange = () => actualizarPrecioHabitacion(h.id, input.value); //actualiza el precio de la habitacion

      item.appendChild(input);
      contenedor.appendChild(item);
    });
  }

  async function actualizarPrecioHabitacion(id, nuevoPrecio) {
    await fetch(`${API_ROOMS}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ precio: Number(nuevoPrecio) })
    }); //carga el nuevo precio en la api
    mostrarHabitacionesAdmin();
  }
async function cargarDashboard() {
  const res = await fetch(API_RESERVATIONS);
  const reservas = await res.json(); //pide las reservas

  // Contar estados (si no existen, se crean en 0)
  let estados = {
    activa: 0,
    cancelada: 0,
    finalizada: 0
  };

  reservas.forEach(r => {
    const estado = (r.estado || "activo").toLowerCase();
    if (estado.includes("cancel")) estados.cancelada++;
    else if (estado.includes("final")) estados.finalizada++;
    else estados.activa++;
  });

  // Crear gráfico
  const ctx = document.getElementById("chartReservas");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Activas", "Canceladas", "Finalizadas"],
      datasets: [{
        label: "Cantidad de reservas",
        data: [
          estados.activa,
          estados.cancelada,
          estados.finalizada
        ]
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Llamar al dashboard cuando cargue la página
cargarDashboard();

  
  // === INICIALIZACIÓN ===
  mostrarUsuarios();
  mostrarReservasAdmin();
  mostrarHabitacionesAdmin();
}

