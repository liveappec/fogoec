const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwNgxo9xzZRWnYzDbGCg5TKDC0G5TwMnXW5tr71ZK2lX-NgEEOdneoj0jHTv48MG-ehkQ/exec";

document.getElementById("fecha").addEventListener("change", cargarHorasDisponibles);

function cargarHorasDisponibles() {
  const fecha = document.getElementById("fecha").value;
  const horasBox = document.getElementById("horasBox");
  const horaInput = document.getElementById("hora");
  const disponibilidad = document.getElementById("disponibilidad");
  const formDatos = document.getElementById("formDatos");

  horaInput.value = "";
  formDatos.classList.add("hidden");

  if (!fecha) {
    horasBox.innerHTML = `<p class="mini-text">Primero selecciona una fecha.</p>`;
    disponibilidad.innerHTML = "Selecciona fecha y hora para ver disponibilidad.";
    return;
  }

  const horarios = obtenerHorariosPorFecha(fecha);

  if (horarios.length === 0) {
    horasBox.innerHTML = `<p class="mini-text">FOGO no atiende este día.</p>`;
    disponibilidad.innerHTML = "FOGO no atiende este día. Selecciona otra fecha.";
    return;
  }

  horasBox.innerHTML = "";

  horarios.forEach(hora => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hora-btn";
    btn.textContent = hora;

    btn.onclick = () => {
      document.querySelectorAll(".hora-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      horaInput.value = hora;
      verificarDisponibilidad();
    };

    horasBox.appendChild(btn);
  });

  disponibilidad.innerHTML = "Selecciona una hora para ver disponibilidad.";
}

function obtenerHorariosPorFecha(fecha) {
  const partes = fecha.split("-");
  const date = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
  const dia = date.getDay();

  if (dia === 1) return [];

  if (dia >= 2 && dia <= 4) {
    return generarBloqueHoras("18:30", "22:00");
  }

  if (dia === 5 || dia === 6) {
    return [
      ...generarBloqueHoras("12:30", "15:30"),
      ...generarBloqueHoras("18:30", "23:00")
    ];
  }

  if (dia === 0) {
    return generarBloqueHoras("12:30", "16:00");
  }

  return [];
}

function generarBloqueHoras(inicio, fin) {
  const horas = [];
  let [h, m] = inicio.split(":").map(Number);
  const [hFin, mFin] = fin.split(":").map(Number);

  while (h < hFin || (h === hFin && m <= mFin)) {
    horas.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);

    m += 30;
    if (m >= 60) {
      h += 1;
      m = 0;
    }
  }

  return horas;
}

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
    const response = await fetch(`${WEB_APP_URL}?action=disponibilidad&fecha=${fecha}&hora=${hora}&t=${Date.now()}`);
    const data = await response.json();

    if (!data.ok) {
      disponibilidad.innerHTML = data.message || "No se pudo consultar disponibilidad.";
      return;
    }

    if (data.mesasDisponibles > 0) {
      disponibilidad.innerHTML =
        data.mesasDisponibles === 1
          ? "1 mesa disponible"
          : `${data.mesasDisponibles} mesas disponibles`;

      formDatos.classList.remove("hidden");
    } else {
      disponibilidad.innerHTML = `
        No hay mesas disponibles en este horario.<br>
        Próxima liberación estimada ${data.proximaLiberacionTexto || "por confirmar"}.<br>
        Contáctanos directamente con FOGO para ayudarte.
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

  } catch (error) {
    alert("Error de conexión. Intenta nuevamente.");
  }
}
