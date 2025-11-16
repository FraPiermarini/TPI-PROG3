const loginForm = document.getElementById("loginForm"); //busca en formulario 
//SI existe el formulario:
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();  //Evita recargar la pagina cuando se quiere inciar sesion

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim(); //Toma l email y contraseña ingresado

    const res = await fetch(API_USERS);
    const usuarios = await res.json();  //Pide la lista de usuarios a la API

    const user = usuarios.find(u => u.email === email && u.password === password);  //Busca el usuario

    if (!user) {
      alert("Correo o contraseña incorrectos ");
      return;
    }  //si no exite muestra error

    localStorage.setItem("sesion", JSON.stringify(user)); //Guarda la sesion
    alert(`Bienvenido ${user.nombre} (${user.role})`); 

    if (user.role === "ADMIN") { //segun el rol va a una oagina
      window.location.href = "admin.html";
    } else {
      window.location.href = "usuario.html";
    }
  });
}
