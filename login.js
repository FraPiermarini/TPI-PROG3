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

    localStorage.setItem("sesion", JSON.stringify(user));
    alert(`Bienvenido ${user.nombre} (${user.role})`);

    if (user.role === "ADMIN") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "usuario.html";
    }
  });
}
