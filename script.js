const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwNgxo9xzZRWnYzDbGCg5TKDC0G5TwMnXW5tr71ZK2lX-NgEEOdneoj0jHTv48MG-ehkQ/exec";

document.getElementById("hora").addEventListener("change", verificarDisponibilidad);
document.getElementById("fecha").addEventListener("change", verificarDisponibilidad);

async function verificarDisponibilidad() {
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;

  if (!fecha || !hora) return;

  const res = await fetch(`${WEB_APP_URL}?action=disponibilidad&fecha=${fecha}&hora=${hora}`);
  const data = await res.json();

  const div = document.getElementById("disponibilidad");
  const form = document.getElementById("formDatos");

  if (data.mesasDisponibles > 0) {
    div.innerHTML = `<p>${data.mesasDisponibles} mesas disponibles</p>`;
    form.style.display = "block";
  } else {
    div.innerHTML = `
      <p>No hay mesas disponibles en este horario</p>
      <p>Próxima liberación estimada ${data.proximaLiberacionTexto || ""}</p>
      <a href="https://wa.me/593984890621" target="_blank">Contáctanos por WhatsApp</a>
    `;
    form.style.display = "none";
  }
}

async function crearReserva() {
  const data = {
    action: "crearReserva",
    nombreCompleto: document.getElementById("nombre").value.trim(),
    cedula: document.getElementById("cedula").value.trim(),
    celular: document.getElementById("celular").value.trim(),
    instagram: document.getElementById("instagram").value.trim(),
    personas: document.getElementById("personas").value,
    fechaReserva: document.getElementById("fecha").value,
    horaReserva: document.getElementById("hora").value,
    observaciones: document.getElementById("observaciones").value.trim()
  };

  const res = await fetch(WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (result.ok) {
    alert("Reserva confirmada");

    window.open(
      `https://wa.me/593984890621?text=${encodeURIComponent(result.waFull)}`,
      "_blank"
    );
  } else {
    alert(result.message);
  }
}
