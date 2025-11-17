if (window.location.pathname.includes("usuario.html")) {
  const sesion = JSON.parse(localStorage.getItem("sesion"));
  if (!sesion) window.location.href = "login.html";  //verifica que el usuario este logueado si no lo devuelve al login

  document.getElementById("nombreUsuario").textContent = sesion.nombre; //muestra el nombre del usuario

  async function mostrarRooms() {
    const res = await fetch(API_ROOMS);
    const rooms = await res.json();  //pide la lista de habitaciones y las pasa a JSON

    const contenedor = document.getElementById("roomsList");
    contenedor.innerHTML = "";  //limpia la lista

    rooms.forEach(r => {
      contenedor.innerHTML += `<li>${r.tipo} - $${r.precio} - ${r.disponible ? "Disponible" : "Ocupada"}</li>`;
    });
  }  //recorre y muestra todas las habitaciones con los datos

  async function mostrarReservas() {
    const res = await fetch(API_RESERVATIONS);
    const reservas = await res.json(); //pide las reservas y las pada a JSOn
    const misReservas = reservas.filter(r => String(r.userId) === String(sesion.id)); //solo muestra las reservas del usuario


    const resRooms = await fetch(API_ROOMS);
    const rooms = await resRooms.json(); //llama de nuevo a las habitaciones

    const lista = document.getElementById("misReservas");
    lista.innerHTML = ""; //limpia las habitaciones

    misReservas.forEach(r => {
      const habitacion = rooms.find(h => h.id === r.roomId);
      const tipo = habitacion ? habitacion.tipo : "Desconocida";
      const precio = habitacion ? habitacion.precio : "N/D";  //busca la reserva en las reservas del usuario

      const item = document.createElement("li");
      item.innerHTML = `  
  Habitación: ${tipo} ($${precio})<br>
  Desde: ${r.checkIn} &nbsp;&nbsp; Hasta: ${r.checkOut}<br>
  Estado: ${r.estado}<br>
  ${r.estado === "ACTIVA" ? `<button onclick="cancelarReserva('${r.id}')">Cancelar</button>` : ""}
`;  //crear una lista con los datos de la reserva 

      lista.appendChild(item);
    }); //agrega la reserva a la lista

    if (misReservas.length === 0) {
      lista.innerHTML = "<li>No tenés reservas</li>";
    } //si no tenes reservas muestra esto
  }

  window.cancelarReserva = async function (id) {
    const res = await fetch(`${API_RESERVATIONS}/${id}`);
    const reserva = await res.json();  //obtiene la reserva por id 

    await fetch(`${API_ROOMS}/${reserva.roomId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disponible: true })
    });  //cambia el estado de la reserva

    await fetch(`${API_RESERVATIONS}/${id}`, { method: "DELETE" }); //elimina la reserva anterior

    mostrarReservas();  //actualiza todo
    cargarHabitacionesDisponibles();
    mostrarRooms?.();
  };

  async function cargarHabitacionesDisponibles() {
    const res = await fetch(API_ROOMS);
    const rooms = await res.json();
    const disponibles = rooms.filter(r => r.disponible);  //llama las habitaciones y carga solo las disponibles

    const select = document.getElementById("roomSelect");
    select.innerHTML = "";  //limpia

    disponibles.forEach(r => {
      const option = document.createElement("option");
      option.value = r.id;
      option.textContent = `${r.tipo} - $${r.precio}`;
      select.appendChild(option);
    });  //carga las habitaciones disponibles en el select
  }

  document.getElementById("formReserva").addEventListener("submit", async (e) => {
    e.preventDefault(); //evita recargar la pagina

    const roomId = String(document.getElementById("roomSelect")?.value || "").trim();
    const checkIn = String(document.getElementById("checkIn")?.value || "").trim();
    const checkOut = String(document.getElementById("checkOut")?.value || "").trim();  //obtiene los datos del form

    if (!roomId || !checkIn || !checkOut) {
      alert("Completá todos los campos");
      return;  //si hay algun campo vacio muestra esto
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
      }) //crea la reserrva en la api
    });

    await fetch(`${API_ROOMS}/${roomId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disponible: false })
    });  //marca la habitacion como ocupadoa

    alert("Reserva confirmada ");
    cargarHabitacionesDisponibles();
    mostrarRooms();
    mostrarReservas();  //acutaliza todo
    document.getElementById("formReserva").reset();  //limpia el formulario
  });

  cargarHabitacionesDisponibles();
  mostrarRooms();
  mostrarReservas();
}

