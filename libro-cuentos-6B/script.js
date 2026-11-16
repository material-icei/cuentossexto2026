/* ==========================================================
   CUENTOS DE LA HISTORIA ARGENTINA · 6º grado B
   script.js — índice, navegación, carga de imágenes,
   control de páginas, audiocuentos y efecto Flipbook (StPageFlip)
   ========================================================== */

"use strict";

/* ----------------------------------------------------------
   1. DATOS DE LOS CUENTOS
   Para agregar o cambiar un cuento, editar solo este listado.
   - paginas: cantidad de imágenes en /paginas/cuentoN/ (p-1.jpg, p-2.jpg…)
   - pdf:     archivo original en /cuentos/
   - audio:   audiocuento en /audios/
   ---------------------------------------------------------- */
const CUENTOS = [
  {
    id: 1,
    titulo: "El misterio de los inmigrantes",
    anio: "Época de la inmigración",
    grupo: "Grupo 1",
    autores: "",
    resumen: "Felipe llega desde Francia a Buenos Aires y descubre que su documento de identidad desapareció de la valija. El detective Elliot Fash interroga a los pasajeros del barco.",
    paginas: 3,
    carpeta: "paginas/cuento1",
    pdf: "cuentos/cuento1.pdf",
    audio: "audios/audiocuento1.mp3"
  },
  {
    id: 2,
    titulo: "El robo del mapuche",
    anio: "1878",
    grupo: "Grupo 2",
    autores: "Allegra Lentini, Catalina Cullini, Santiago Gabarro, Renzo Basualdo, Juan Ignacio Tamagnone y Pedro Salinas",
    resumen: "Al pueblo del cacique Sayweke le roban los papeles que prueban que sus tierras les pertenecen. Gaspar sigue la huella de una bota de cuero hasta Buenos Aires.",
    paginas: 3,
    carpeta: "paginas/cuento2",
    pdf: "cuentos/cuento2.pdf",
    audio: "audios/audiocuento2.mp3"
  },
  {
    id: 3,
    titulo: "El enigma del Pacto de San José de Flores",
    anio: "1859",
    grupo: "Grupo 3",
    autores: "",
    resumen: "A horas de firmarse el pacto que uniría a Buenos Aires con la Confederación, el documento original desaparece. El detective Juan resuelve pistas con su cronómetro y su memoria prodigiosa.",
    paginas: 5,
    carpeta: "paginas/cuento3",
    pdf: "cuentos/cuento3.pdf",
    audio: "audios/audiocuento3.mp3"
  },
  {
    id: 4,
    titulo: "Un voto bajo sospecha",
    anio: "1880",
    grupo: "Grupo 4",
    autores: "",
    resumen: "En las elecciones entre Roca y Tejedor, los votos cambian a último momento. La detective Paloma González interroga a los tres últimos votantes.",
    paginas: 5,
    carpeta: "paginas/cuento4",
    pdf: "cuentos/cuento4.pdf",
    audio: "audios/audiocuento4.mp3"
  },
  {
    id: 5,
    titulo: "El caso de los derechos silenciados",
    anio: "1907",
    grupo: "Grupo 5",
    autores: "",
    resumen: "Durante la Huelga de Inquilinos en La Boca desaparece la petición firmada por los vecinos del conventillo. El detective Mateo Salvatierra busca al responsable.",
    paginas: 3,
    carpeta: "paginas/cuento5",
    pdf: "cuentos/cuento5.pdf",
    audio: "audios/audiocuento5.mp3"
  },
  {
    id: 6,
    titulo: "El caso de los derechos silenciados",
    anio: "1910",
    grupo: "Grupo 6",
    autores: "",
    resumen: "En Godoy Cruz, Mendoza, unos jóvenes denuncian que una fábrica contamina el arroyo del barrio. El detective Martín Suárez investiga quién hizo desaparecer las pruebas.",
    paginas: 4,
    carpeta: "paginas/cuento6",
    pdf: "cuentos/cuento6.pdf",
    audio: "audios/audiocuento6.mp3"
  }
];

/* Proporción de una hoja A4 (ancho / alto) */
const ANCHO_PAGINA = 595;
const ALTO_PAGINA = 842;

/* ----------------------------------------------------------
   2. REFERENCIAS AL DOM
   ---------------------------------------------------------- */
const $ = (sel) => document.querySelector(sel);

const vistaInicio   = $("#inicio");
const vistaLector   = $("#lector");
const listaCuentos  = $("#lista-cuentos");
const escenario     = $("#escenario");
const cargando      = $("#cargando");

const btnComenzar   = $("#btn-comenzar");
const btnInicio     = $("#btn-inicio");
const btnAnterior   = $("#btn-anterior");
const btnSiguiente  = $("#btn-siguiente");
const btnPantalla   = $("#btn-pantalla");

const lectorTitulo  = $("#lector-titulo");
const lectorGrupo   = $("#lector-grupo");
const paginaActual  = $("#pagina-actual");
const paginaTotal   = $("#pagina-total");
const progresoBarra = $(".progreso");
const progresoRelleno = $("#progreso-relleno");

/* Reproductor del lector */
const audioLector   = $("#audio-lector");
const btnAudio      = $("#btn-audio");
const audioBarra    = $("#audio-barra");
const audioTiempo   = $("#audio-tiempo");

/* Estado de la aplicación */
let libro = null;          // instancia de St.PageFlip
let cuentoAbierto = null;  // objeto del cuento que se está leyendo

/* ----------------------------------------------------------
   3. UTILIDADES
   ---------------------------------------------------------- */

/** Devuelve la ruta de la imagen de la página n (1, 2, 3…) */
function rutaPagina(cuento, n) {
  return `${cuento.carpeta}/p-${n}.jpg`;
}

/** Formatea segundos como m:ss */
function formatoTiempo(seg) {
  if (!isFinite(seg)) return "0:00";
  const m = Math.floor(seg / 60);
  const s = Math.floor(seg % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/** Pausa todos los audios de la página excepto el indicado */
function pausarOtrosAudios(excepto) {
  document.querySelectorAll("audio").forEach((a) => {
    if (a !== excepto && !a.paused) a.pause();
  });
}

/**
 * Conecta un elemento <audio> con su botón play/pausa, su barra y su texto de tiempo.
 * Se usa igual en las tarjetas del índice y en el lector.
 */
function conectarReproductor(audio, boton, barra, tiempo, contenedor) {
  const actualizarBarra = () => {
    const dur = audio.duration || 0;
    const pct = dur ? (audio.currentTime / dur) * 100 : 0;
    barra.value = pct;
    barra.style.setProperty("--avance", pct + "%");
    tiempo.textContent = `${formatoTiempo(audio.currentTime)} / ${formatoTiempo(dur)}`;
  };

  boton.addEventListener("click", () => {
    if (audio.paused) {
      pausarOtrosAudios(audio);
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", () => {
    contenedor.classList.add("sonando");
    boton.setAttribute("aria-label", "Pausar audiocuento");
  });
  audio.addEventListener("pause", () => {
    contenedor.classList.remove("sonando");
    boton.setAttribute("aria-label", "Reproducir audiocuento");
  });
  audio.addEventListener("timeupdate", actualizarBarra);
  audio.addEventListener("loadedmetadata", actualizarBarra);
  audio.addEventListener("ended", () => { audio.currentTime = 0; actualizarBarra(); });

  barra.addEventListener("input", () => {
    if (audio.duration) audio.currentTime = (barra.value / 100) * audio.duration;
    barra.style.setProperty("--avance", barra.value + "%");
  });

  actualizarBarra();
}

/* ----------------------------------------------------------
   4. ÍNDICE: tarjetas de cuentos con su audiocuento
   ---------------------------------------------------------- */
function crearIndice() {
  CUENTOS.forEach((cuento, i) => {
    const li = document.createElement("li");
    li.className = "tarjeta";
    li.style.animationDelay = `${i * 80}ms`;

    li.innerHTML = `
      <button class="tarjeta__miniatura" type="button" aria-label="Leer ${cuento.titulo}">
        <img src="${rutaPagina(cuento, 1)}" alt="" loading="lazy">
        <span class="tarjeta__numero">${cuento.id}</span>
        <span class="tarjeta__anio">${cuento.anio}</span>
      </button>
      <div class="tarjeta__cuerpo">
        <p class="tarjeta__grupo">${cuento.grupo} · 6º B</p>
        <h3 class="tarjeta__titulo">${cuento.titulo}</h3>
        <p class="tarjeta__resumen">${cuento.resumen}</p>

        <div class="reproductor">
          <button class="btn btn--icono" type="button" aria-label="Reproducir audiocuento">
            <svg class="icono icono--play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7L8 5Z"/></svg>
            <svg class="icono icono--pausa" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>
          </button>
          <div class="reproductor__linea">
            <span class="reproductor__etiqueta">Audiocuento</span>
            <input class="reproductor__barra" type="range" min="0" max="100" value="0" step="0.1" aria-label="Posición del audiocuento ${cuento.id}">
            <span class="reproductor__tiempo">0:00 / 0:00</span>
          </div>
          <audio preload="metadata" src="${cuento.audio}"></audio>
        </div>

        <div class="tarjeta__acciones">
          <button class="btn btn-leer" type="button">
            <svg class="icono" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Zm9-1.5h5.5c.8 0 1.5.7 1.5 1.5v13c0 .8-.7 1.5-1.5 1.5H13V4Z"/></svg>
            Leer cuento
          </button>
          <a class="btn btn--claro tarjeta__pdf" href="${cuento.pdf}" target="_blank" rel="noopener">PDF</a>
        </div>
      </div>`;

    // Abrir el libro desde la miniatura o el botón "Leer cuento"
    li.querySelector(".tarjeta__miniatura").addEventListener("click", () => irACuento(cuento.id));
    li.querySelector(".btn-leer").addEventListener("click", () => irACuento(cuento.id));

    // Reproductor del audiocuento en la tarjeta
    const rep = li.querySelector(".reproductor");
    conectarReproductor(
      rep.querySelector("audio"),
      rep.querySelector(".btn"),
      rep.querySelector(".reproductor__barra"),
      rep.querySelector(".reproductor__tiempo"),
      rep
    );

    listaCuentos.appendChild(li);
  });
}

/* ----------------------------------------------------------
   5. CONSTRUCCIÓN DE LAS PÁGINAS DEL LIBRO
   Tapa (dura) + páginas del cuento + [página "Fin" si hace falta] + contratapa (dura)
   StPageFlip necesita un total par de páginas cuando se muestran tapas.
   ---------------------------------------------------------- */
function crearPagina(html, clases = "", dura = false) {
  const div = document.createElement("div");
  div.className = `pagina ${clases}`;
  if (dura) div.dataset.density = "hard";   // tapa rígida: gira como cartón
  div.innerHTML = html;
  return div;
}

function construirPaginas(cuento) {
  const paginas = [];

  // TAPA con lomo
  paginas.push(crearPagina(`
    <div class="tapa tapa--frente">
      <div class="tapa__marco">
        <p class="tapa__sello">Cuentos de la Historia Argentina</p>
        <span class="tapa__ornamento" aria-hidden="true">❦</span>
        <h3 class="tapa__titulo">${cuento.titulo}</h3>
        <p class="tapa__anio">${cuento.anio}</p>
        <p class="tapa__autores">${cuento.grupo} · 6º grado B${cuento.autores ? "<br>" + cuento.autores : ""}</p>
      </div>
    </div>`, "pagina--tapa", true));

  // PÁGINAS INTERIORES (imágenes del cuento)
  for (let n = 1; n <= cuento.paginas; n++) {
    paginas.push(crearPagina(`
      <div class="pagina__contenido">
        <img src="${rutaPagina(cuento, n)}" alt="${cuento.titulo}, página ${n}" draggable="false">
      </div>`));
  }

  // Si las páginas interiores son impares, se agrega una hoja de cierre
  if (cuento.paginas % 2 !== 0) {
    paginas.push(crearPagina(`
      <div class="pagina__fin">
        <strong>Fin</strong>
        <span>❦</span>
      </div>`));
  }

  // CONTRATAPA
  paginas.push(crearPagina(`
    <div class="tapa tapa--dorso">
      <div class="tapa__marco">
        <span class="tapa__ornamento" aria-hidden="true">✒</span>
        <p class="tapa__texto">${cuento.resumen}</p>
        <p class="tapa__sello">6º grado B · 1853 – 1920</p>
      </div>
    </div>`, "pagina--tapa", true));

  return paginas;
}

/** Precarga las imágenes del cuento para que el volteo sea fluido */
function precargarImagenes(cuento) {
  const promesas = [];
  for (let n = 1; n <= cuento.paginas; n++) {
    promesas.push(new Promise((resolver) => {
      const img = new Image();
      img.onload = img.onerror = resolver;
      img.src = rutaPagina(cuento, n);
    }));
  }
  return Promise.all(promesas);
}

/* ----------------------------------------------------------
   6. FLIPBOOK (StPageFlip)
   ---------------------------------------------------------- */
async function abrirLibro(cuento) {
  // Cerrar el libro anterior si existía
  cerrarLibro();
  cuentoAbierto = cuento;

  // Datos del encabezado
  lectorTitulo.textContent = cuento.titulo;
  lectorGrupo.textContent = `${cuento.grupo} · ${cuento.anio}`;
  document.title = `${cuento.titulo} · Cuentos de 6º B`;

  // Audio del cuento
  audioLector.src = cuento.audio;
  audioLector.load();

  cargando.hidden = false;
  await precargarImagenes(cuento);
  if (cuentoAbierto !== cuento) return;   // el usuario cambió de cuento mientras cargaba

  cargando.hidden = true;
  montarLibro(0);
}

/**
 * Calcula el tamaño ideal del libro según el espacio disponible:
 * - dos páginas (apaisado) si entran cómodas una al lado de la otra;
 * - una sola página (vertical) en celulares y pantallas angostas.
 */
function calcularMedidas() {
  const estilo = getComputedStyle(escenario);
  const anchoDisp = escenario.clientWidth - parseFloat(estilo.paddingLeft) - parseFloat(estilo.paddingRight);
  const altoDisp  = escenario.clientHeight - parseFloat(estilo.paddingTop) - parseFloat(estilo.paddingBottom);
  const proporcion = ANCHO_PAGINA / ALTO_PAGINA;

  const anchoDoble   = Math.min(anchoDisp / 2, altoDisp * proporcion);  // ancho de página en modo doble
  const anchoSimple  = Math.min(anchoDisp, altoDisp * proporcion);      // ancho de página en modo simple
  const doble = anchoDoble >= 200 && anchoDoble >= anchoSimple * 0.7;

  const anchoPagina = Math.floor(doble ? anchoDoble : anchoSimple);
  return { doble, anchoPagina, anchoLibro: doble ? anchoPagina * 2 : anchoPagina };
}

/** Crea (o vuelve a crear) el flipbook en la página indicada */
function montarLibro(paginaInicial) {
  if (!cuentoAbierto) return;
  if (libro) {
    try { libro.destroy(); } catch (e) { /* ya destruido */ }
    libro = null;
  }
  escenario.querySelectorAll(".libro").forEach((n) => n.remove());

  const medidas = calcularMedidas();

  // Contenedor nuevo para cada libro
  const contenedor = document.createElement("div");
  contenedor.id = "libro";
  contenedor.className = "libro";
  escenario.appendChild(contenedor);

  libro = new St.PageFlip(contenedor, {
    width: ANCHO_PAGINA,          // proporción de UNA página (A4)
    height: ALTO_PAGINA,
    size: "stretch",              // la página se adapta al ancho del contenedor
    // minWidth define cuándo la biblioteca pasa a una sola página:
    // apaisado si el contenedor mide >= 2 × minWidth
    minWidth: medidas.doble ? Math.floor(medidas.anchoPagina * 0.9) : Math.ceil(medidas.anchoPagina * 0.6),
    maxWidth: 3000,
    minHeight: 100,
    maxHeight: 4000,
    startPage: paginaInicial,
    showCover: true,              // tapa y contratapa se muestran solas, como un libro real
    usePortrait: true,            // en pantallas angostas: una sola página
    drawShadow: true,             // sombras y profundidad durante el volteo
    maxShadowOpacity: 0.55,
    flippingTime: 900,            // duración del giro (ms): transición suave
    mobileScrollSupport: false,
    swipeDistance: 25,
    showPageCorners: true,        // la esquina se levanta al pasar el mouse
    autoSize: true
  });

  libro.loadFromHTML(construirPaginas(cuentoAbierto));

  // Ancho exacto del libro: la altura se calcula sola manteniendo la proporción A4
  contenedor.style.width = medidas.anchoLibro + "px";
  contenedor.style.minWidth = "0";
  contenedor.dataset.doble = medidas.doble;
  libro.update();

  // Eventos del libro
  libro.on("flip", actualizarInterfaz);
  libro.on("changeOrientation", actualizarInterfaz);
  libro.on("init", actualizarInterfaz);

  requestAnimationFrame(() => contenedor.classList.add("listo"));
  actualizarInterfaz();
}

/** Al cambiar el tamaño de la pantalla se rehace el libro conservando la página */
function reajustarLibro() {
  if (!libro || !cuentoAbierto) return;
  const actual = document.querySelector("#libro");
  const m = calcularMedidas();
  if (actual && actual.style.width === m.anchoLibro + "px" && actual.dataset.doble === String(m.doble)) return;
  montarLibro(libro.getCurrentPageIndex());
}

function cerrarLibro() {
  if (libro) {
    try { libro.destroy(); } catch (e) { /* ya destruido */ }
    libro = null;
  }
  escenario.querySelectorAll(".libro").forEach((n) => n.remove());
  audioLector.pause();
}

/** Indicador de página, progreso y estado de los botones */
function actualizarInterfaz() {
  if (!libro) return;

  const total = libro.getPageCount();
  const indice = libro.getCurrentPageIndex();       // 0 = tapa
  const apaisado = libro.getOrientation() === "landscape";

  // En modo doble página se muestra el par visible (ej.: 2-3 / 8)
  let textoActual = String(indice + 1);
  let ultimaVisible = indice + 1;
  if (apaisado && indice > 0 && indice < total - 1) {
    const izq = indice % 2 === 1 ? indice : indice - 1;   // las páginas impares van a la izquierda
    textoActual = `${izq + 1}-${izq + 2}`;
    ultimaVisible = izq + 2;
  }

  paginaActual.textContent = textoActual;
  paginaTotal.textContent = total;

  // Activar / desactivar botones en la primera y la última página
  btnAnterior.disabled = indice <= 0;
  btnSiguiente.disabled = ultimaVisible >= total;

  // Progreso de lectura
  const pct = Math.round((ultimaVisible / total) * 100);
  progresoRelleno.style.width = pct + "%";
  progresoBarra.setAttribute("aria-valuenow", pct);
}

/* ----------------------------------------------------------
   7. NAVEGACIÓN ENTRE VISTAS (con #cuento-N en la dirección)
   ---------------------------------------------------------- */
function irACuento(id) {
  location.hash = `cuento-${id}`;
}

function irAlInicio() {
  if (location.hash) {
    history.pushState("", document.title, location.pathname + location.search);
  }
  mostrarVista();
}

function mostrarVista() {
  const coincidencia = location.hash.match(/^#cuento-(\d+)$/);
  const cuento = coincidencia && CUENTOS.find((c) => c.id === Number(coincidencia[1]));

  if (cuento) {
    pausarOtrosAudios(null);
    vistaInicio.hidden = true;
    vistaLector.hidden = false;
    document.body.style.overflow = "hidden";
    abrirLibro(cuento);
  } else {
    salirPantallaCompleta();
    cerrarLibro();
    cuentoAbierto = null;
    vistaLector.hidden = true;
    vistaInicio.hidden = false;
    document.body.style.overflow = "";
    document.title = "Cuentos de la Historia Argentina · 6º grado B";
  }
}

/* ----------------------------------------------------------
   8. PANTALLA COMPLETA
   ---------------------------------------------------------- */
function hayPantallaCompleta() {
  return document.fullscreenElement || document.webkitFullscreenElement ||
         vistaLector.classList.contains("pantalla-simulada");
}

function alternarPantallaCompleta() {
  if (hayPantallaCompleta()) {
    salirPantallaCompleta();
    return;
  }
  const pedir = vistaLector.requestFullscreen || vistaLector.webkitRequestFullscreen;
  if (pedir) {
    const r = pedir.call(vistaLector);
    if (r && r.catch) r.catch(() => simularPantallaCompleta());
  } else {
    simularPantallaCompleta();   // iPhone: no tiene API de pantalla completa
  }
}

function simularPantallaCompleta() {
  vistaLector.classList.add("pantalla-simulada");
  alActualizarPantalla();
}

function salirPantallaCompleta() {
  if (document.fullscreenElement) document.exitFullscreen();
  else if (document.webkitFullscreenElement) document.webkitExitFullscreen();
  vistaLector.classList.remove("pantalla-simulada");
  alActualizarPantalla();
}

function alActualizarPantalla() {
  const activa = Boolean(hayPantallaCompleta());
  document.body.classList.toggle("en-pantalla-completa", activa);
  btnPantalla.setAttribute("aria-label", activa ? "Salir de pantalla completa" : "Pantalla completa");
  btnPantalla.title = activa ? "Salir de pantalla completa" : "Pantalla completa";
  // Recalcular el tamaño del libro tras el cambio
  setTimeout(reajustarLibro, 200);
}

/* ----------------------------------------------------------
   9. EVENTOS GENERALES
   ---------------------------------------------------------- */
btnComenzar.addEventListener("click", () => irACuento(CUENTOS[0].id));
btnInicio.addEventListener("click", irAlInicio);
btnAnterior.addEventListener("click", () => libro && libro.flipPrev("bottom"));
btnSiguiente.addEventListener("click", () => libro && libro.flipNext("bottom"));
btnPantalla.addEventListener("click", alternarPantallaCompleta);

document.addEventListener("fullscreenchange", alActualizarPantalla);
document.addEventListener("webkitfullscreenchange", alActualizarPantalla);
window.addEventListener("hashchange", mostrarVista);
window.addEventListener("popstate", mostrarVista);

// Teclado: flechas para pasar páginas, Esc para salir, F para pantalla completa
document.addEventListener("keydown", (e) => {
  if (vistaLector.hidden || e.target.matches("input")) return;
  if (e.key === "ArrowRight") { e.preventDefault(); libro && libro.flipNext("bottom"); }
  if (e.key === "ArrowLeft")  { e.preventDefault(); libro && libro.flipPrev("bottom"); }
  if (e.key === "f" || e.key === "F") alternarPantallaCompleta();
  if (e.key === "Escape" && vistaLector.classList.contains("pantalla-simulada")) salirPantallaCompleta();
});

// Recalcular el libro al girar el celular o cambiar el tamaño de la ventana
let temporizador;
window.addEventListener("resize", () => {
  clearTimeout(temporizador);
  temporizador = setTimeout(reajustarLibro, 200);
});

/* ----------------------------------------------------------
   10. INICIO DE LA APLICACIÓN
   ---------------------------------------------------------- */
crearIndice();
conectarReproductor(audioLector, btnAudio, audioBarra, audioTiempo, btnAudio.parentElement);
mostrarVista();
