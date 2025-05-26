const colors = ['#FF5252', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#607D8B'];
let animationId = null;
let m = 2, n = 2; // Valores iniciales
let tipoProblema = 'buses';
let origenLabels = [], destinoLabels = [];

// Actualiza las etiquetas según el tipo de problema y regenera los inputs.
function actualizarEtiquetas() {
  tipoProblema = document.getElementById("tipo").value;
  document.getElementById("label1-text").innerText =
    tipoProblema === "buses" ? "Cantidad de buses:" : "Cantidad de orígenes:";
  document.getElementById("label2-text").innerText =
    tipoProblema === "buses" ? "Cantidad de ciudades:" : "Cantidad de destinos:";
  generarInputs();
}

// Genera dinámicamente los campos de entrada para orígenes y destinos.
function generarInputs() {
  let origenesInput = document.getElementById("origenes");
  let destinosInput = document.getElementById("destinos");
  let errorOrigenes = document.getElementById("error-origenes");
  let errorDestinos = document.getElementById("error-destinos");

  // Validar máximo 4 y mínimo 1
  let origenesVal = parseInt(origenesInput.value);
  let destinosVal = parseInt(destinosInput.value);

  let valido = true;
  if (isNaN(origenesVal) || origenesVal < 1) {
    errorOrigenes.textContent = "Debe ser al menos 1";
    origenesInput.classList.add('error');
    valido = false;
  } else if (origenesVal > 4) {
    errorOrigenes.textContent = "El máximo permitido es 4";
    origenesInput.value = 4;
    origenesVal = 4;
    origenesInput.classList.add('error');
    valido = false;
  } else {
    errorOrigenes.textContent = "";
    origenesInput.classList.remove('error');
  }

  if (isNaN(destinosVal) || destinosVal < 1) {
    errorDestinos.textContent = "Debe ser al menos 1";
    destinosInput.classList.add('error');
    valido = false;
  } else if (destinosVal > 4) {
    errorDestinos.textContent = "El máximo permitido es 4";
    destinosInput.value = 4;
    destinosVal = 4;
    destinosInput.classList.add('error');
    valido = false;
  } else {
    errorDestinos.textContent = "";
    destinosInput.classList.remove('error');
  }

  m = Math.min(4, origenesVal);
  n = Math.min(4, destinosVal);

  const contOrigenes = document.getElementById("inputs-origenes");
  const contDestinos = document.getElementById("inputs-destinos");

  contOrigenes.innerHTML = `<strong>${tipoProblema === "buses" ? "Buses" : "Orígenes"}:</strong><br>`;
  for (let i = 0; i < m; i++) {
    contOrigenes.innerHTML += `
      <div class="input-with-icon">
        <i class="fas ${tipoProblema === 'buses' ? 'fa-bus' : 'fa-warehouse'}"></i>
        <input type="text" id="origen${i}" placeholder="${tipoProblema === 'buses' ? 'Bus' : 'O'} ${i + 1}">
      </div>`;
  }

  contDestinos.innerHTML = `<strong>${tipoProblema === "buses" ? "Ciudades" : "Destinos"}:</strong><br>`;
  for (let j = 0; j < n; j++) {
    contDestinos.innerHTML += `
      <div class="input-with-icon">
        <i class="fas ${tipoProblema === 'buses' ? 'fa-city' : 'fa-map-marker-alt'}"></i>
        <input type="text" id="destino${j}" placeholder="${tipoProblema === 'buses' ? 'Ciudad' : 'D'} ${j + 1}">
      </div>`;
  }

  // Ocultar secciones secundarias
  document.getElementById('datos-section').classList.add('hidden');
  document.getElementById('modelo-matematico').classList.add('hidden');
  chequearMostrarRed();
}

function chequearMostrarRed() {
  const origenesInput = document.getElementById("origenes");
  const destinosInput = document.getElementById("destinos");
  const btn = document.getElementById("btn-mostrar-red");

  // Ambos campos deben ser válidos y no estar vacíos ni en error
  let valido = true;
  if (
    isNaN(parseInt(origenesInput.value)) || 
    parseInt(origenesInput.value) < 1 || 
    parseInt(origenesInput.value) > 4 ||
    origenesInput.classList.contains('error')
  ) {
    valido = false;
  }
  if (
    isNaN(parseInt(destinosInput.value)) || 
    parseInt(destinosInput.value) < 1 || 
    parseInt(destinosInput.value) > 4 ||
    destinosInput.classList.contains('error')
  ) {
    valido = false;
  }
  btn.disabled = !valido;
}

// Llama a esta función en los eventos de los inputs
document.getElementById("origenes").addEventListener("input", function() {
  generarInputs(); 
  validarNumeroMenu(this); 
  chequearMostrarRed();
});
document.getElementById("destinos").addEventListener("input", function() {
  generarInputs(); 
  validarNumeroMenu(this); 
  chequearMostrarRed();
});

// Dibuja la red en el canvas, los nodos y anima las flechas.
function dibujarRed() {
  const canvas = document.getElementById("canvas-red");
  // Aumentar el tamaño del canvas para mayor espacio
  canvas.width = 900;
  canvas.height = 600;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Obtener etiquetas de orígenes y destinos.
  origenLabels = [];
  destinoLabels = [];
  for (let i = 0; i < m; i++) {
    let nombre = document.getElementById(`origen${i}`).value.trim();
    origenLabels.push(nombre || (tipoProblema === 'buses' ? `Bus ${i + 1}` : `O${i + 1}`));
  }
  for (let j = 0; j < n; j++) {
    let nombre = document.getElementById(`destino${j}`).value.trim();
    destinoLabels.push(nombre || (tipoProblema === 'buses' ? `Ciudad ${j + 1}` : `D${j + 1}`));
  }

  // Configurar coordenadas; mayor separación horizontal y vertical.
  const origenX = 200, destinoX = 700;
  const spacingY = (canvas.height - 100) / Math.max(m, n);
  let origenY = [], destinoY = [];

  // Dibujar etiqueta de grupo para orígenes.
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#00796b";
  ctx.fillText(tipoProblema === 'buses' ? "Buses" : "Orígenes", origenX, 40);

  // Dibujar nodos de orígenes (buses).
  for (let i = 0; i < m; i++) {
    let y = 70 + i * spacingY;
    origenY.push(y);
    ctx.beginPath();
    ctx.arc(origenX, y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "#b2dfdb";
    ctx.fill();
    ctx.strokeStyle = "#00796b";
    ctx.lineWidth = 2;
    ctx.stroke();
    const icon = tipoProblema === 'buses' ? '🚌' : '📦';
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#333";
    ctx.fillText(icon, origenX, y);
    ctx.font = "12px Arial";
    ctx.textAlign = "right";
    ctx.fillText(origenLabels[i], origenX - 30, y + 35);
  }

  // Dibujar etiqueta de grupo para destinos.
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#2e7d32";
  ctx.fillText(tipoProblema === 'buses' ? "Ciudades" : "Destinos", destinoX, 40);

  // Dibujar nodos de destinos (ciudades).
  for (let j = 0; j < n; j++) {
    let y = 70 + j * spacingY;
    destinoY.push(y);
    ctx.beginPath();
    ctx.arc(destinoX, y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "#c8e6c9";
    ctx.fill();
    ctx.strokeStyle = "#2e7d32";
    ctx.lineWidth = 2;
    ctx.stroke();
    const icon = tipoProblema === 'buses' ? '🏙️' : '📍';
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#333";
    ctx.fillText(icon, destinoX, y);
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText(destinoLabels[j], destinoX + 30, y + 35);
  }

  // Animación de las flechas y sus textos.
  let startTime = null;
  const duration = 800;
  function animate(currentTime) {
    if (!startTime) startTime = currentTime;
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);

    // Limpiar solo la zona central donde se dibujan las flechas.
    ctx.clearRect(origenX + 20, 50, destinoX - origenX - 40, canvas.height - 50);

    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        const color = colors[(i * n + j) % colors.length];
        dibujarFlecha(ctx,
          origenX + 20, origenY[i],
          destinoX - 20, destinoY[j],
          color, progress, i, j);
      }
    }

    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    } else {
      animationId = null;
      // Una vez terminada la animación, mostrar la sección de datos.
      document.getElementById('datos-section').classList.remove('hidden');
      generarTablasBuses();
    }
  }
  animationId = requestAnimationFrame(animate);
  mostrarFormulacionSimbolica();
}

function mostrarFormulacionSimbolica() {
  // Obtén la cantidad de orígenes y destinos
  const m = parseInt(document.getElementById("origenes").value);
  const n = parseInt(document.getElementById("destinos").value);

  // Función Objetivo
  let funcionObjetivo = 'Min Z = ';
  const terminos = [];
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      terminos.push(`C<sub>${i}${j}</sub>·X<sub>${i}${j}</sub>`);
    }
  }
  funcionObjetivo += terminos.join(' + ');

  // Restricciones de oferta
  let restriccionesOferta = '';
  for (let i = 1; i <= m; i++) {
    const sumandos = [];
    for (let j = 1; j <= n; j++) {
      sumandos.push(`X<sub>${i}${j}</sub>`);
    }
    restriccionesOferta += `${sumandos.join(' + ')} ≤ Oferta<sub>${i}</sub><br>`;
  }

  // Restricciones de demanda
  let restriccionesDemanda = '';
  for (let j = 1; j <= n; j++) {
    const sumandos = [];
    for (let i = 1; i <= m; i++) {
      sumandos.push(`X<sub>${i}${j}</sub>`);
    }
    restriccionesDemanda += `${sumandos.join(' + ')} = Demanda<sub>${j}</sub><br>`;
  }

  // Mostrar en el div
  document.getElementById('formulacion-simbolica').innerHTML = `
    <h4>Función Objetivo:</h4>
    <div class="formula">${funcionObjetivo}</div>
    <h4>Restricciones de oferta:</h4>
    <div class="formula">${restriccionesOferta}</div>
    <h4>Restricciones de demanda:</h4>
    <div class="formula">${restriccionesDemanda}</div>
  `;
}



// Función que dibuja cada flecha y coloca los textos sobre la línea.
// Se coloca el texto "Xij" cerca del nodo origen y el texto "Cij" cerca del nodo destino.
// Los textos se dibujan con fuente semi-transparente para que no se vean tan opacos.
function dibujarFlecha(ctx, fromX, fromY, toX, toY, color, progress, i, j) {
  const headLength = 12;
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const actualToX = fromX + (toX - fromX) * progress;
  const actualToY = fromY + (toY - fromY) * progress;

  // Dibuja la línea de la flecha.
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(actualToX, actualToY);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Dibuja el texto "Xij" (semi-transparente) cerca del nodo origen.
  const fracX = 0.15; // 15% de la distancia desde el origen
  const posX_x = fromX + (actualToX - fromX) * fracX;
  const posY_x = fromY + (actualToY - fromY) * fracX;
  const labelX = "X" + toSubscript(i + 1) + toSubscript(j + 1);
  ctx.font = "22px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  // Se añade un pequeño offset para espaciar los textos.
  ctx.fillText(labelX, posX_x, posY_x - 10);

  // Dibuja el texto "Cij" (semi-transparente) cerca del nodo destino.
  const fracC = 0.85; // 85% de la distancia desde el origen
  const posX_c = fromX + (actualToX - fromX) * fracC;
  const posY_c = fromY + (actualToY - fromY) * fracC;
  const labelC = "C" + toSubscript(i + 1) + toSubscript(j + 1);
  ctx.fillText(labelC, posX_c, posY_c - 10);

  // Si la flecha está completa, dibuja la cabeza de la flecha.
  if (progress === 1) {
    ctx.beginPath();
    ctx.moveTo(actualToX, actualToY);
    ctx.lineTo(
      actualToX - headLength * Math.cos(angle - Math.PI / 6),
      actualToY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      actualToX - headLength * Math.cos(angle + Math.PI / 6),
      actualToY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
}

// Función de ayuda para convertir números a subíndices usando Unicode.
function toSubscript(num) {
  const subMap = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
  return num.toString().split('').map(d => subMap[d] || d).join('');
}

// Genera las tablas para que el usuario ingrese los datos de cada bus (origen).
function generarTablasBuses() {
  const tablasBuses = document.getElementById("tablas-buses");
  let html = '';

  // Tablas para orígenes (buses)
  for (let i = 0; i < m; i++) {
    const nombreBus = document.getElementById(`origen${i}`).value.trim() ||
      (tipoProblema === 'buses' ? `Bus ${i + 1}` : `Origen ${i + 1}`);
    html += `
      <div class="bus-table-container">
        <div class="bus-header">
          <h4>${nombreBus}</h4>
          <div class="bus-capacity">
            <span>${tipoProblema === 'buses' ? 'Capacidad:' : 'Oferta:'}</span>
            <input type="number" id="oferta-${i}" placeholder="${tipoProblema === 'buses' ? 'Asientos' : 'Unidades'}" min="0" required oninput="validarNumero(this)" onchange="validarCapacidad(${i})">
            <div class="error-message" id="error-oferta-${i}"></div>
          </div>
        </div>
        <table class="bus-table">
          <thead>
            <tr>
              <th>${tipoProblema === 'buses' ? 'Ciudad' : 'Destino'}</th>
              <th>${tipoProblema === 'buses' ? 'Pasajeros' : 'Cantidad'}</th>
              <th>${tipoProblema === 'buses' ? 'Costo x pasajero' : 'Costo'}</th>
            </tr>
          </thead>
          <tbody>`;
    for (let j = 0; j < n; j++) {
      const nombreDestino = document.getElementById(`destino${j}`).value.trim() ||
        (tipoProblema === 'buses' ? `Ciudad ${j + 1}` : `Destino ${j + 1}`);
      html += `
            <tr>
              <td>${nombreDestino}</td>
              <td>
                <input type="number" id="asignacion-${i}-${j}" placeholder="Cantidad" min="0" required oninput="validarNumero(this)" onchange="validarAsignacion(${i}, ${j})">
                <div class="error-message" id="error-asignacion-${i}-${j}"></div>
              </td>
              <td>
                <input type="number" id="costo-${i}-${j}" placeholder="Costo" min="0" required step="0.01" oninput="validarNumero(this)">
                <div class="error-message" id="error-costo-${i}-${j}"></div>
              </td>
            </tr>`;
    }
    html += `
          </tbody>
        </table>
      </div>`;
  }

  // Sección de demandas (como una tabla horizontal)
  html += `
    <div class="demanda-section">
      <h3>Demandas de las Ciudades</h3>
      <div class="demanda-grid">
  `;

  for (let j = 0; j < n; j++) {
    const nombreDestino = document.getElementById(`destino${j}`).value.trim() ||
      (tipoProblema === 'buses' ? `Ciudad ${j + 1}` : `Destino ${j + 1}`);
    html += `
        <div class="demanda-item">
          <label>${nombreDestino}</label>
          <input type="number" id="demanda-${j}" placeholder="Demanda" min="0" required oninput="validarNumero(this)">
          <div class="error-message" id="error-demanda-${j}"></div>
        </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  tablasBuses.innerHTML = html;
}

// Modifica la validación para solo aceptar valores >= 1 y no vacíos
function validarNumero(input) {
  const errorId = input.id.replace(/^[a-z-]+/, 'error-$&');
  const errorElement = document.getElementById(errorId);

  // Permitir cero en oferta, asignaciones, costo, demanda
  const permiteCero =
    input.id.startsWith('oferta-') ||
    input.id.startsWith('asignacion-') ||
    input.id.startsWith('costo-') ||
    input.id.startsWith('demanda-');

  if (
    isNaN(input.value) ||
    input.value === "" ||
    (!permiteCero && Number(input.value) < 1) ||
    (permiteCero && Number(input.value) < 0) ||
    !/^\d+$/.test(input.value)
  ) {
    input.classList.add('error');
    errorElement.textContent = permiteCero
      ? "Ingrese un número entero mayor o igual a 0"
      : "Ingrese un número entero positivo (> 0)";
    errorElement.style.display = 'block';
    return false;
  } else {
    input.classList.remove('error');
    errorElement.style.display = 'none';
    return true;
  }
}

function validarNumeroMenu(input) {
  const errorElement = document.getElementById('error-' + input.id);
  if (
    isNaN(input.value) ||
    input.value === "" ||
    Number(input.value) < 1 ||
    !/^\d+$/.test(input.value)
  ) {
    input.classList.add('error');
    errorElement.textContent = "Ingrese un número entero positivo (> 0)";
    errorElement.style.display = 'block';
    return false;
  } else {
    input.classList.remove('error');
    errorElement.textContent = "";
    errorElement.style.display = 'none';
    return true;
  }
}

// Valida que la capacidad (oferta) no sea superada por la suma de asignaciones.
function validarCapacidad(i) {
  const capacidadInput = document.getElementById(`oferta-${i}`);
  if (!validarNumero(capacidadInput)) return false;

  const capacidad = parseFloat(capacidadInput.value);
  if (isNaN(capacidad)) return true;

  let totalAsignado = 0;
  let error = false;

  for (let j = 0; j < n; j++) {
    const asignacionInput = document.getElementById(`asignacion-${i}-${j}`);
    if (!validarNumero(asignacionInput)) {
      error = true;
      continue;
    }

    const asignacion = parseFloat(asignacionInput.value);
    if (!isNaN(asignacion)) {
      totalAsignado += asignacion;
    }
  }

  const errorElement = document.getElementById(`error-oferta-${i}`);
  if (totalAsignado > capacidad) {
    errorElement.textContent = `La suma (${totalAsignado}) excede la capacidad (${capacidad})`;
    errorElement.style.display = 'block';
    capacidadInput.classList.add('error');
    error = true;
  } else {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
    capacidadInput.classList.remove('error');
  }

  return !error;
}


// Valida cada asignación en relación con la capacidad.
function validarAsignacion(i, j) {
  const asignacionInput = document.getElementById(`asignacion-${i}-${j}`);
  if (!validarNumero(asignacionInput)) return false;
  const capacidadInput = document.getElementById(`oferta-${i}`);
  const capacidad = parseFloat(capacidadInput.value);
  if (isNaN(capacidad)) return true;
  const asignacion = parseFloat(asignacionInput.value) || 0;
  if (asignacion > capacidad) {
    asignacionInput.classList.add('error');
    document.getElementById(`error-asignacion-${i}-${j}`).textContent =
      `No puede exceder la capacidad (${capacidad})`;
    document.getElementById(`error-asignacion-${i}-${j}`).style.display = 'block';
    return false;
  }
  let totalAsignado = 0;
  for (let k = 0; k < n; k++) {
    totalAsignado += parseFloat(document.getElementById(`asignacion-${i}-${k}`).value) || 0;
  }
  if (totalAsignado > capacidad) {
    capacidadInput.classList.add('error');
    document.getElementById(`error-oferta-${i}`).textContent =
      `La suma de asignaciones (${totalAsignado}) excede la capacidad (${capacidad})`;
    document.getElementById(`error-oferta-${i}`).style.display = 'block';
    return false;
  } else {
    capacidadInput.classList.remove('error');
    document.getElementById(`error-oferta-${i}`).style.display = 'none';
    return true;
  }
}
// Modelo matematico 

function generarModeloMatematico() {
  let valido = true;

  // Validar capacidades y asignaciones
  for (let i = 0; i < m; i++) {
    if (!validarCapacidad(i)) valido = false;
  }

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (!validarNumero(document.getElementById(`asignacion-${i}-${j}`))) {
        valido = false;
      }
    }
  }

  if (!valido) {
    alert("Por favor corrija los errores antes de generar el modelo matemático");
    return;
  }

  document.getElementById('modelo-matematico').classList.remove('hidden');

   // -------- FUNCIÓN OBJETIVO --------
  let fo = "Min Z = ";
  const terms = [];

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const costo = document.getElementById(`costo-${i}-${j}`).value || `C${i + 1}${j + 1}`;
      const asignacionValor = document.getElementById(`asignacion-${i}-${j}`).value;
      const simboloX = `x${toSubscript(i + 1)}${toSubscript(j + 1)}`;
      
      // Si hay valor de asignación, mostrar asignación × símbolo, sino solo costo × símbolo
      if (asignacionValor && asignacionValor !== "") {
        terms.push(`${asignacionValor}${simboloX}`);
      } else {
        terms.push(`${costo}${simboloX}`);
      }
    }
  }

  document.getElementById("funcion-objetivo").innerHTML = fo + terms.join(" + ");

  // -------- RESTRICCIONES DE OFERTA --------
  let restOferta = "";
  for (let i = 0; i < m; i++) {
    const oferta = document.getElementById(`oferta-${i}`).value || `B${i + 1}`;
    const terminos = [];

    for (let j = 0; j < n; j++) {
      const xVal = document.getElementById(`asignacion-${i}-${j}`).value || `x${toSubscript(i + 1)}${toSubscript(j + 1)}`;
      terminos.push(xVal);
    }

    restOferta += `${terminos.join(" + ")} ≤ ${oferta}<br>`;
  }

  document.getElementById("restricciones-oferta").innerHTML = restOferta;

  // -------- RESTRICCIONES DE DEMANDA --------
  let restDemanda = "";
  for (let j = 0; j < n; j++) {
    const demanda = document.getElementById(`demanda-${j}`).value || `D${j + 1}`;
    const terminos = [];

    for (let i = 0; i < m; i++) {
      const xVal = document.getElementById(`asignacion-${i}-${j}`).value || `x${toSubscript(i + 1)}${toSubscript(j + 1)}`;
      terminos.push(xVal);
    }

    restDemanda += `${terminos.join(" + ")} = ${demanda}<br>`;
  }

  document.getElementById("restricciones-demanda").innerHTML = restDemanda;
}


// Modificar la función resolverEsquinaNoroeste() existente
function resolverEsquinaNoroeste() {
  // Capturar valores de oferta (capacidad)
  const ofertas = [];
  for (let i = 0; i < m; i++) {
    const valor = parseFloat(document.getElementById(`oferta-${i}`).value);
    if (isNaN(valor) || valor < 0) {
      alert(`Ingrese una oferta válida para el origen ${i + 1}`);
      return;
    }
    ofertas.push(valor);
  }

  // Capturar valores de demanda
  const demandas = [];
  for (let j = 0; j < n; j++) {
    const valor = parseFloat(document.getElementById(`demanda-${j}`).value);
    if (isNaN(valor) || valor < 0) {
      alert(`Ingrese una demanda válida para el destino ${j + 1}`);
      return;
    }
    demandas.push(valor);
  }

  // Capturar matriz de costos
  const costos = [];
  for (let i = 0; i < m; i++) {
    costos[i] = [];
    for (let j = 0; j < n; j++) {
      const valor = parseFloat(document.getElementById(`costo-${i}-${j}`).value);
      if (isNaN(valor) || valor < 0) {
        alert(`Ingrese un costo válido para la ruta Origen ${i + 1} → Destino ${j + 1}`);
        return;
      }
      costos[i][j] = valor;
    }
  }

  // Verificar balance (suma ofertas = suma demandas)
  const totalOferta = ofertas.reduce((a, b) => a + b, 0);
  const totalDemanda = demandas.reduce((a, b) => a + b, 0);

  if (totalOferta !== totalDemanda) {
    alert(`El problema no está balanceado.\nSuma ofertas: ${totalOferta}\nSuma demandas: ${totalDemanda}`);
    return;
  }

  // Inicializar matriz de solución
  const solucion = Array(m).fill().map(() => Array(n).fill(0));
  let i = 0, j = 0;
  const ofertasRestantes = [...ofertas];
  const demandasRestantes = [...demandas];

  // Algoritmo de la esquina noroeste
  while (i < m && j < n) {
    const asignacion = Math.min(ofertasRestantes[i], demandasRestantes[j]);
    solucion[i][j] = asignacion;
    ofertasRestantes[i] -= asignacion;
    demandasRestantes[j] -= asignacion;

    if (ofertasRestantes[i] === 0 && i < m - 1) {
      i++;
    } else if (demandasRestantes[j] === 0 && j < n - 1) {
      j++;
    } else {
      i++;
      j++;
    }
  }

  // Calcular costo total
  let costoTotal = 0;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      costoTotal += solucion[i][j] * costos[i][j];
    }
  }

  // Mostrar resultados
  mostrarResultadoEsquinaNoroeste(solucion, costos, ofertas, demandas, costoTotal);
}

function mostrarResultadoEsquinaNoroeste(solucion, costos, ofertas, demandas, costoTotal) {
  const resultado = document.getElementById('resultado');

  // 1. Tabla de resultados (como estaba antes, pero mejorada)
  let contenidoHTML = '<h3>Solución por Método de la Esquina Noroeste</h3>';

  let tabla = '<table class="noroeste-table">';

  // Encabezados
  tabla += '<thead><tr><th></th>';
  for (let j = 0; j < n; j++) {
    const nombreDestino = document.getElementById(`destino${j}`).value.trim() ||
      (tipoProblema === 'buses' ? `Ciudad ${j + 1}` : `Destino ${j + 1}`);
    tabla += `<th>${nombreDestino}</th>`;
  }
  tabla += '<th>Oferta</th></tr></thead>';

  // Filas de datos
  tabla += '<tbody>';
  for (let i = 0; i < m; i++) {
    const nombreOrigen = document.getElementById(`origen${i}`).value.trim() ||
      (tipoProblema === 'buses' ? `Bus ${i + 1}` : `Origen ${i + 1}`);
    tabla += `<tr><th>${nombreOrigen}</th>`;

    for (let j = 0; j < n; j++) {
      const asignado = solucion[i][j]; // Asignación del método
      const valorUsuario = document.getElementById(`asignacion-${i}-${j}`)?.value || "";
      const variableNombre = `x${i + 1}${j + 1}`;

      tabla += `<td class="diagonal-cell">
            <div class="diagonal-top" style="color: red; font-size: 13px; font-weight: bold;">
              ${asignado > 0 ? asignado : ''}
            </div>
            <div class="diagonal-bottom" style="color: gray; font-size: 13px; font-weight: bold;">
              ${valorUsuario !== "" ? valorUsuario : ''}
            </div>
          </td>`;
    }

    const oferta = document.getElementById(`oferta-${i}`).value || '0';
    tabla += `<td class="oferta-cell">${oferta}</td></tr>`;
  }

  // Fila demandas
  tabla += '<tr class="demanda-row"><th>Demandas</th>';
  for (let j = 0; j < n; j++) {
    const demanda = document.getElementById(`demanda-${j}`).value || '0';
    tabla += `<td class="demanda-cell">${demanda}</td>`;
  }

  const totalOferta = Array.from({ length: m }, (_, i) =>
    parseFloat(document.getElementById(`oferta-${i}`).value) || 0
  ).reduce((a, b) => a + b, 0);

  tabla += `<td class="total-cell">${totalOferta}</td></tr>`;
  tabla += '</tbody></table>';

  resultado.innerHTML = tabla;

  // 2. Modelo matemático final (solo con rutas válidas)
  contenidoHTML += tabla;
  contenidoHTML += '<div class="modelo-matematico">';

  // 2.1 Función objetivo final (asignación × solución)
  contenidoHTML += '<h4>Función Objetivo Final:</h4>';
  let funcionObjetivoFinal = "Min Z = ";
  const terminosValidos = [];
  let valorFuncionObjetivo = 0;

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (solucion[i][j] > 0) {
        // Obtener la asignación que ingresó el usuario
        const asignacionUsuario = parseFloat(document.getElementById(`asignacion-${i}-${j}`).value) || 0;
        
        // Multiplicar asignación del usuario × solución del método
        const producto = asignacionUsuario * solucion[i][j];
        valorFuncionObjetivo += producto;
        
        terminosValidos.push(`${asignacionUsuario} × ${solucion[i][j]}`);
      }
    }
  }

  contenidoHTML += `<div class="funcion-objetivo-simple">${funcionObjetivoFinal}${terminosValidos.join(" + ")}</div>`;

  // Agregar el valor final de la función objetivo
  contenidoHTML += `<div class="variable-adicional">Función Objetivo Final = ${valorFuncionObjetivo}</div>`;

  // 2.2 Restricciones de oferta finales
  contenidoHTML += '<h4>Restricciones de Oferta Finales:</h4>';
  let restriccionesOferta = '';

  for (let i = 0; i < m; i++) {
    const terminos = [];
    let sumaAsignada = 0;

    for (let j = 0; j < n; j++) {
      if (solucion[i][j] > 0) {
        terminos.push(`${solucion[i][j]}`);
        sumaAsignada += solucion[i][j];
      }
    }

    restriccionesOferta += `<div class="formula">${terminos.join(" + ")} = ${sumaAsignada} ≤ ${ofertas[i]}</div>`;
  }

  contenidoHTML += restriccionesOferta;

  // 2.3 Restricciones de demanda finales
  contenidoHTML += '<h4>Restricciones de Demanda Finales:</h4>';
  let restriccionesDemanda = '';

  for (let j = 0; j < n; j++) {
    const terminos = [];
    let sumaAsignada = 0;

    for (let i = 0; i < m; i++) {
      if (solucion[i][j] > 0) {
        terminos.push(`${solucion[i][j]}`);
        sumaAsignada += solucion[i][j];
      }
    }

    restriccionesDemanda += `<div class="formula">${terminos.join(" + ")} = ${sumaAsignada} = ${demandas[j]}</div>`;
  }

  contenidoHTML += restriccionesDemanda;
  contenidoHTML += '</div>';

  // 3. Dibujar grafo de rutas válidas
  contenidoHTML += '<h3>Representación Gráfica de Rutas Utilizadas</h3>';
  contenidoHTML += '<div class="canvas-container">';
  contenidoHTML += '<canvas id="canvas-solucion" width="900" height="600"></canvas>';
  contenidoHTML += '</div>';

  // Asignar el contenido HTML completo
  resultado.innerHTML = contenidoHTML;

  // Dibujar el grafo de rutas
  dibujarGrafoSolucion(solucion, costos);
}

function dibujarGrafoSolucion(solucion, costos) {
  const canvas = document.getElementById("canvas-solucion");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Configurar coordenadas (igual que en dibujarRed)
  const origenX = 200, destinoX = 700;
  const spacingY = (canvas.height - 100) / Math.max(m, n);
  let origenY = [], destinoY = [];

  // Dibujar etiqueta de grupo para orígenes (mismo estilo que dibujarRed)
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#00796b";
  ctx.fillText(tipoProblema === 'buses' ? "Buses" : "Orígenes", origenX, 40);

  // Dibujar nodos de orígenes (mismo estilo que dibujarRed)
  for (let i = 0; i < m; i++) {
    let y = 70 + i * spacingY;
    origenY.push(y);
    ctx.beginPath();
    ctx.arc(origenX, y, 20, 0, 2 * Math.PI); // Radio 20 como en dibujarRed
    ctx.fillStyle = "#b2dfdb";
    ctx.fill();
    ctx.strokeStyle = "#00796b";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Icono dentro del nodo (mismo estilo)
    const icon = tipoProblema === 'buses' ? '🚌' : '📦';
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#333";
    ctx.fillText(icon, origenX, y);

    // Nombre del origen debajo del nodo (mismo estilo)
    const nombre = document.getElementById(`origen${i}`).value.trim() ||
      (tipoProblema === 'buses' ? `Bus ${i + 1}` : `O${i + 1}`);
    ctx.font = "12px Arial";
    ctx.textAlign = "right";
    ctx.fillText(nombre, origenX - 30, y + 35);
  }
  //

  // Dibujar etiqueta de grupo para destinos (mismo estilo que dibujarRed)
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#2e7d32";
  ctx.fillText(tipoProblema === 'buses' ? "Ciudades" : "Destinos", destinoX, 40);

  // Dibujar nodos de destinos (mismo estilo que dibujarRed)
  for (let j = 0; j < n; j++) {
    let y = 70 + j * spacingY;
    destinoY.push(y);
    ctx.beginPath();
    ctx.arc(destinoX, y, 20, 0, 2 * Math.PI); // Radio 20 como en dibujarRed
    ctx.fillStyle = "#c8e6c9";
    ctx.fill();
    ctx.strokeStyle = "#2e7d32";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Icono dentro del nodo (mismo estilo)
    const icon = tipoProblema === 'buses' ? '🏙️' : '📍';
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#333";
    ctx.fillText(icon, destinoX, y);

    // Nombre del destino debajo del nodo (mismo estilo)
    const nombre = document.getElementById(`destino${j}`).value.trim() ||
      (tipoProblema === 'buses' ? `Ciudad ${j + 1}` : `D${j + 1}`);
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText(nombre, destinoX + 30, y + 35);
  }

  // Dibujar rutas válidas (con asignación > 0)
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (solucion[i][j] > 0) {
        // Color basado en la misma lógica que dibujarRed
        const color = colors[(i * n + j) % colors.length];
        
        // Dibujar flecha (mismo estilo que dibujarRed pero siempre completa)
        dibujarFlechaSolucion(ctx, origenX + 20, origenY[i], destinoX - 20, destinoY[j], 
                             color, solucion[i][j], costos[i][j]);
      }
    }
  }
}

// Función para dibujar flecha de solución (basada en dibujarFlecha de dibujarRed)
function dibujarFlechaSolucion(ctx, fromX, fromY, toX, toY, color, asignacion, costo) {
  const headLength = 12; // Mismo tamaño que en dibujarRed
  const angle = Math.atan2(toY - fromY, toX - fromX);

  // Dibujar línea de la flecha (mismo estilo)
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2; // Mismo grosor que en dibujarRed
  ctx.stroke();

  // Dibujar cabeza de la flecha (mismo estilo que en dibujarRed)
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  // Dibujar texto de asignación (cerca del origen, mismo estilo que "Xij" en dibujarRed)
  const fracAsignacion = 0.15; // 15% de la distancia desde el origen
  const posX_asignacion = fromX + (toX - fromX) * fracAsignacion;
  const posY_asignacion = fromY + (toY - fromY) * fracAsignacion;
  ctx.font = "22px Arial"; // Mismo tamaño que en dibujarRed
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(0,0,0,0.6)"; // Misma transparencia
  ctx.fillText(asignacion.toString(), posX_asignacion, posY_asignacion - 10);

  // Dibujar texto de costo (cerca del destino, mismo estilo que "Cij" en dibujarRed)
  const fracCosto = 0.85; // 85% de la distancia desde el origen
  const posX_costo = fromX + (toX - fromX) * fracCosto;
  const posY_costo = fromY + (toY - fromY) * fracCosto;
  ctx.fillText(`$${costo}`, posX_costo, posY_costo - 10);
}


window.onload = function () {
  actualizarEtiquetas();
};
