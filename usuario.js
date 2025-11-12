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

  async function mostrarReservas() {
    const res = await fetch(API_RESERVATIONS);
    const reservas = await res.json();
    const misReservas = reservas.filter(r => String(r.userId) === String(sesion.id));


    const resRooms = await fetch(API_ROOMS);
    const rooms = await resRooms.json();

    const lista = document.getElementById("misReservas");
    lista.innerHTML = "";

    misReservas.forEach(r => {
      const habitacion = rooms.find(h => h.id === r.roomId);
      const tipo = habitacion ? habitacion.tipo : "Desconocida";
      const precio = habitacion ? habitacion.precio : "N/D";

      const item = document.createElement("li");
      item.innerHTML = `
  Habitación: ${tipo} ($${precio})<br>
  Desde: ${r.checkIn} &nbsp;&nbsp; Hasta: ${r.checkOut}<br>
  Estado: ${r.estado}<br>
  ${r.estado === "ACTIVA" ? `<button onclick="cancelarReserva('${r.id}')">Cancelar</button>` : ""}
`;

      lista.appendChild(item);
    });

    if (misReservas.length === 0) {
      lista.innerHTML = "<li>No tenés reservas</li>";
    }
  }

  window.cancelarReserva = async function (id) {
    const res = await fetch(`${API_RESERVATIONS}/${id}`);
    const reserva = await res.json();

    await fetch(`${API_ROOMS}/${reserva.roomId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disponible: true })
    });

    await fetch(`${API_RESERVATIONS}/${id}`, { method: "DELETE" });

    mostrarReservas();
    cargarHabitacionesDisponibles();
    mostrarRooms?.();
  };

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

    const roomId = String(document.getElementById("roomSelect")?.value || "").trim();
    const checkIn = String(document.getElementById("checkIn")?.value || "").trim();
    const checkOut = String(document.getElementById("checkOut")?.value || "").trim();


    if (!roomId || !checkIn || !checkOut) {
      alert("Completá todos los campos");
      return;
    }

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
  mostrarRooms();
  mostrarReservas();
}

