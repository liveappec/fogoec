const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwNgxo9xzZRWnYzDbGCg5TKDC0G5TwMnXW5tr71ZK2lX-NgEEOdneoj0jHTv48MG-ehkQ/exec";
const WHATSAPP_NUMBER = "593984890621";

document.getElementById("fecha").addEventListener("change", verificarDisponibilidad);
document.getElementById("hora").addEventListener("change", verificarDisponibilidad);

async function verificarDisponibilidad() {
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;
  const disponibilidad = document.getElementById("disponibilidad");
  const formDatos = document.getElementById("formDatos");

  if (!fecha || !hora) {
    disponibilidad.innerHTML = "Selecciona fecha y hora para ver disponibilidad.";
    formDatos.classList.add("hidden");
    return;
  }

  disponibilidad.innerHTML = "Consultando disponibilidad...";
  formDatos.classList.add("hidden");

  try {
    const response = await fetch(`${WEB_APP_URL}?action=disponibilidad&fecha=${fecha}&hora=${hora}`);
    const data = await response.json();

    if (!data.ok) {
      disponibilidad.innerHTML = data.message || "No se pudo consultar disponibilidad.";
      return;
    }

    if (data.mesasDisponibles > 0) {
      const textoMesa = data.mesasDisponibles === 1 ? "1 mesa disponible" : `${data.mesasDisponibles} mesas disponibles`;
      disponibilidad.innerHTML = textoMesa;
      formDatos.classList.remove("hidden");
    } else {
      disponibilidad.innerHTML = `
        No hay mesas disponibles en este horario.<br>
        Próxima liberación estimada ${data.proximaLiberacionTexto || "por confirmar"}.
        <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank">Contáctanos por WhatsApp</a>
      `;
      formDatos.classList.add("hidden");
    }

  } catch (error) {
    disponibilidad.innerHTML = "Error de conexión. Intenta nuevamente.";
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

  if (!data.nombreCompleto || !data.cedula || !data.celular || !data.personas || !data.fechaReserva || !data.horaReserva) {
    alert("Completa todos los campos obligatorios.");
    return;
  }

  try {
    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!result.ok) {
      alert(result.message || "No se pudo crear la reserva.");
      return;
    }

    alert(`Reserva confirmada. Código: ${result.codigoReserva}`);

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(result.waFull)}`,
      "_blank"
    );

  } catch (error) {
    alert("Error de conexión. Intenta nuevamente.");
  }
}
