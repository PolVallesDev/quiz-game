/**
 * QUIZ GAME - LÓGICA PRINCIPAL (VANILLA JAVASCRIPT ES6+)
 * --------------------------------------------------
 * Script modular para la gestión del flujo de pantallas (#start-screen, 
 * #quiz-screen, #results-screen), evaluación de respuestas y puntuación.
 */

// ==========================================
// 1. ESTRUCTURA DE DATOS (PREGUNTAS Y OPCIONES)
// ==========================================
const BANCO_PREGUNTAS = {
  deportes: [
    {
      pregunta: "¿Cuántos jugadores hay en un equipo de fútbol sobre el campo?",
      opciones: ["9 jugadores", "10 jugadores", "11 jugadores", "12 jugadores"],
      correcta: 2 // Índice de la respuesta correcta (11 jugadores)
    },
    {
      pregunta: "¿Cuánto dura un partido oficial de baloncesto en la NBA?",
      opciones: ["40 minutos", "48 minutos", "60 minutos", "50 minutos"],
      correcta: 1 // 48 minutos
    },
    {
      pregunta: "¿Qué país se proclamó campeón del Mundial de Fútbol 2022?",
      opciones: ["Francia", "Brasil", "Argentina", "España"],
      correcta: 2 // Argentina
    }
  ],
  comida: [
    {
      pregunta: "¿Cuál es el ingrediente principal del guacamole tradicional?",
      opciones: ["Tomate", "Aguacate", "Pepino", "Cebolla"],
      correcta: 1 // Aguacate
    },
    {
      pregunta: "¿De qué país es oriundo el plato tradicional de la Pizza?",
      opciones: ["Grecia", "Italia", "España", "Francia"],
      correcta: 1 // Italia
    },
    {
      pregunta: "¿Qué tipo de pasta italiana destaca por tener forma de tubo corto inclinado?",
      opciones: ["Spaghetti", "Macarrones", "Penne", "Fusilli"],
      correcta: 2 // Penne
    }
  ]
};

const PUNTOS_POR_ACIERTO = 10;

// ==========================================
// 2. ESTADO GLOBAL DE LA APLICACIÓN
// ==========================================
const estadoJuego = {
  nombreJugador: "",
  categoriaActual: "",
  preguntas: [],
  indicePreguntaActual: 0,
  puntuacion: 0,
  respuestasCorrectas: 0,
  respuestasIncorrectas: 0
};

// ==========================================
// 3. CACHÉ Y REFERENCIAS AL DOM
// ==========================================
const DOM = {
  // Secciones / Pantallas principales
  startScreen: document.getElementById("start-screen"),
  quizScreen: document.getElementById("quiz-screen"),
  resultsScreen: document.getElementById("results-screen"),
  pantallas: document.querySelectorAll(".screen"),

  // Formulario e Inputs
  inputNombre: document.getElementById("player-name"),
  btnsCategoria: document.querySelectorAll(".btn-category"),

  // Interfaz de Preguntas
  displayNombre: document.getElementById("display-player-name"),
  displayPuntuacion: document.getElementById("current-score"),
  displayTimer: document.getElementById("timer"),
  progressBar: document.getElementById("progress-bar"),
  questionNumber: document.getElementById("question-number"),
  questionText: document.getElementById("question-text"),
  optionsContainer: document.getElementById("options-container"),
  nextBtn: document.getElementById("next-btn"),

  // Interfaz de Resultados
  finalPlayerName: document.getElementById("final-player-name"),
  finalScore: document.getElementById("final-score"),
  correctCount: document.getElementById("correct-count"),
  incorrectCount: document.getElementById("incorrect-count"),
  restartBtn: document.getElementById("restart-btn"),
  exitBtn: document.getElementById("exit-btn")
};

// ==========================================
// 4. CONTROL DE PANTALLAS (TRANSICIONES)
// ==========================================
/**
 * Oculta todas las pantallas agregando la clase CSS .hidden 
 * y remueve la clase de la sección objetivo.
 * @param {HTMLElement} pantallaAMostrar 
 */
function cambiarPantalla(pantallaAMostrar) {
  DOM.pantallas.forEach(pantalla => pantalla.classList.add("hidden"));
  if (pantallaAMostrar) {
    pantallaAMostrar.classList.remove("hidden");
  }
}

// ==========================================
// 5. INICIALIZACIÓN DE PARTIDA
// ==========================================
/**
 * Inicializa el estado para una partida con la categoría seleccionada.
 * @param {string} claveCategoria 
 */
function iniciarJuego(claveCategoria) {
  const nombreInput = DOM.inputNombre ? DOM.inputNombre.value.trim() : "";
  estadoJuego.nombreJugador = nombreInput !== "" ? nombreInput : "Jugador";
  estadoJuego.categoriaActual = claveCategoria;
  estadoJuego.preguntas = [...BANCO_PREGUNTAS[claveCategoria]];
  estadoJuego.indicePreguntaActual = 0;
  estadoJuego.puntuacion = 0;
  estadoJuego.respuestasCorrectas = 0;
  estadoJuego.respuestasIncorrectas = 0;

  // Actualizar UI inicial
  if (DOM.displayNombre) DOM.displayNombre.textContent = estadoJuego.nombreJugador;
  if (DOM.displayPuntuacion) DOM.displayPuntuacion.textContent = estadoJuego.puntuacion;

  // Transición a la pantalla de juego
  cambiarPantalla(DOM.quizScreen);

  // Cargar primera pregunta
  cargarPreguntaActual();
}

// ==========================================
// 6. CARGA Y RENDERING DE PREGUNTAS
// ==========================================
/**
 * Inyecta la pregunta activa y sus opciones de respuesta en el DOM.
 */
function cargarPreguntaActual() {
  const preguntaObjeto = estadoJuego.preguntas[estadoJuego.indicePreguntaActual];
  const totalPreguntas = estadoJuego.preguntas.length;

  // Ocultar botón Siguiente hasta responder
  if (DOM.nextBtn) DOM.nextBtn.classList.add("hidden");

  // Actualizar contador y enunciado
  if (DOM.questionNumber) {
    DOM.questionNumber.textContent = `Pregunta ${estadoJuego.indicePreguntaActual + 1} de ${totalPreguntas}`;
  }
  if (DOM.questionText) {
    DOM.questionText.textContent = preguntaObjeto.pregunta;
  }

  // Actualizar ancho de la barra de progreso
  if (DOM.progressBar) {
    const porcentajeProgreso = (estadoJuego.indicePreguntaActual / totalPreguntas) * 100;
    DOM.progressBar.style.width = `${porcentajeProgreso}%`;
  }

  // Generar dinámicamente los botones de respuesta
  if (DOM.optionsContainer) {
    DOM.optionsContainer.innerHTML = "";
    preguntaObjeto.opciones.forEach((opcionTexto, indice) => {
      const btnOpcion = document.createElement("button");
      btnOpcion.type = "button";
      btnOpcion.classList.add("option-btn");
      btnOpcion.textContent = opcionTexto;

      // EventListener para evaluar la opción seleccionada
      btnOpcion.addEventListener("click", () => evaluarRespuesta(indice, btnOpcion));

      DOM.optionsContainer.appendChild(btnOpcion);
    });
  }
}

let tiempoRestante = 15;

let temporizadorInterval = null;

function iniciarTemporizador() {

  clearInterval(temporizadorInterval);

  tiempoRestante = 15;

  document.getElementById("timer").textContent = tiempoRestante;

  temporizadorInterval = setInterval(() => {

    tiempoRestante--;

    document.getElementById("timer").textContent = tiempoRestante;

    if (tiempoRestante <= 0) {

      clearInterval(temporizadorInterval);

      bloquearOpciones();

      document.getElementById("next-btn").classList.remove("hidden");

    }

  }, 1000);

}

// ==========================================
// 7. EVALUACIÓN Y FEEDBACK EN TIEMPO REAL
// ==========================================
/**
 * Evalúa si la respuesta elegida es correcta o incorrecta.
 * @param {number} indiceSeleccionado 
 * @param {HTMLButtonElement} botonClickeado 
 */
function evaluarRespuesta(indiceSeleccionado, botonClickeado) {
  const preguntaActual = estadoJuego.preguntas[estadoJuego.indicePreguntaActual];
  const esCorrecta = indiceSeleccionado === preguntaActual.correcta;

  // Bloquear todas las opciones para prevenir múltiples respuestas
  bloquearOpciones();

  if (esCorrecta) {
    botonClickeado.style.backgroundColor = "var(--success, #22c55e)";
    botonClickeado.style.borderColor = "var(--success, #22c55e)";
    estadoJuego.puntuacion += PUNTOS_POR_ACIERTO;
    estadoJuego.respuestasCorrectas++;
  } else {
    botonClickeado.style.backgroundColor = "var(--danger, #ef4444)";
    botonClickeado.style.borderColor = "var(--danger, #ef4444)";
    estadoJuego.respuestasIncorrectas++;

    // Revelar la opción correcta en verde
    const botones = DOM.optionsContainer.querySelectorAll(".option-btn");
    if (botones[preguntaActual.correcta]) {
      botones[preguntaActual.correcta].style.backgroundColor = "var(--success, #22c55e)";
      botones[preguntaActual.correcta].style.borderColor = "var(--success, #22c55e)";
    }
  }

  // Actualizar puntuación acumulada en pantalla
  if (DOM.displayPuntuacion) {
    DOM.displayPuntuacion.textContent = estadoJuego.puntuacion;
  }

  // Mostrar botón para avanzar
  if (DOM.nextBtn) {
    DOM.nextBtn.classList.remove("hidden");
  }
}

/**
 * Deshabilita los botones de opciones una vez seleccionada una respuesta.
 */
function bloquearOpciones() {
  const botones = DOM.optionsContainer.querySelectorAll(".option-btn");
  botones.forEach(btn => {
    btn.disabled = true;
    btn.style.cursor = "not-allowed";
  });
}

/**
 * Avanza a la siguiente pregunta o dispara la pantalla final.
 */
function avanzarSiguientePregunta() {
  estadoJuego.indicePreguntaActual++;

  if (estadoJuego.indicePreguntaActual < estadoJuego.preguntas.length) {
    cargarPreguntaActual();
  } else {
    if (DOM.progressBar) DOM.progressBar.style.width = "100%";
    mostrarPantallaResultados();
  }
}

// ==========================================
// 8. PANTALLA DE RESULTADOS
// ==========================================
/**
 * Puebla los datos finales y conmuta la vista a #results-screen.
 */
function mostrarPantallaResultados() {
  if (DOM.finalPlayerName) DOM.finalPlayerName.textContent = estadoJuego.nombreJugador;
  if (DOM.finalScore) DOM.finalScore.textContent = estadoJuego.puntuacion;
  if (DOM.correctCount) DOM.correctCount.textContent = estadoJuego.respuestasCorrectas;
  if (DOM.incorrectCount) DOM.incorrectCount.textContent = estadoJuego.respuestasIncorrectas;

  cambiarPantalla(DOM.resultsScreen);
}

// ==========================================
// 9. EVENT LISTENERS E INICIALIZACIÓN
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Selección de categoría e inicio
  DOM.btnsCategoria.forEach(btn => {
    btn.addEventListener("click", () => {
      const categoria = btn.dataset.category || btn.getAttribute("data-category");
      if (BANCO_PREGUNTAS[categoria]) {
        iniciarJuego(categoria);
      }
    });
  });

  // Botón Siguiente Pregunta
  if (DOM.nextBtn) {
    DOM.nextBtn.addEventListener("click", avanzarSiguientePregunta);
  }

  // Botón Volver a Jugar
  if (DOM.restartBtn) {
    DOM.restartBtn.addEventListener("click", () => {
      if (estadoJuego.categoriaActual) {
        iniciarJuego(estadoJuego.categoriaActual);
      } else {
        cambiarPantalla(DOM.startScreen);
      }
    });
  }

  // Botón Salir
  if (DOM.exitBtn) {
    DOM.exitBtn.addEventListener("click", () => {
      if (DOM.inputNombre) DOM.inputNombre.value = "";
      cambiarPantalla(DOM.startScreen);
    });
  }
});