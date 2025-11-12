// ================== REGISTRO ==================
const registroForm = document.getElementById("registroForm");

if (registroForm) {
  registroForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("registroNombre").value.trim();
    const email = document.getElementById("registroEmail").value.trim();
    const password = document.getElementById("registroPassword").value.trim();

    if (!nombre || !email || !password) {
      alert("Por favor completa todos los campos");
      return;
    }

    const res = await fetch(API_USERS);
    const usuarios = await res.json();

    if (usuarios.find(u => u.email === email)) {
      alert("Ese correo ya está registrado ❌");
      return;
    }

    await fetch(API_USERS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password, role: "USUARIO" })
    });

    alert("Registro exitoso ✅");
    window.location.href = "login.html";
  });
}
