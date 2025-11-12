// ================== CONFIGURACIÓN ==================
const API_USERS = "https://690f407f45e65ab24ac305d5.mockapi.io/users";
const API_ROOMS = "https://690f407f45e65ab24ac305d5.mockapi.io/rooms";
const API_RESERVATIONS = "https://691260db52a60f10c821792c.mockapi.io/reservations";

function cerrarSesion() {
  localStorage.removeItem("sesion");
  window.location.href = "login.html";
}
