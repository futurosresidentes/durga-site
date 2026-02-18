// ========================================
// DURGA — Datos de Productos
// ========================================

const productosData = {
  semiortopedica: {
    id: 'semiortopedica',
    nombre: 'Cama Semiortopédica Durga',
    nombreCorto: 'Semiortopédica',
    descripcion: 'Cama premium con soporte semiortopédico, perfecta para el descanso diario de tu mascota. Combina confort y durabilidad con materiales de alta calidad. Puedes elegir dos colores: uno para la parte superior y otro para la base.',
    caracteristicas: [
      'Soporte semiortopédico para mayor confort',
      'Materiales de alta durabilidad',
      'Funda removible y lavable',
      'Base antideslizante',
      'Relleno hipoalergénico',
      'Personalizable: elige 2 colores'
    ],
    tallas: {
      M: { medidas: '70 × 50 cm', precio: 209000, pesoRecomendado: 'Hasta 10 kg' },
      L: { medidas: '90 × 70 cm', precio: 259000, pesoRecomendado: '10 - 25 kg' },
      XL: { medidas: '110 × 90 cm', precio: 309000, pesoRecomendado: '25 - 40 kg' }
    },
    badge: 'Popular',
    badgeClass: ''
  },
  ortopedica: {
    id: 'ortopedica',
    nombre: 'Cama Ortopédica Durga',
    nombreCorto: 'Ortopédica',
    descripcion: 'Cama premium con soporte ortopédico de alta densidad, ideal para perros con necesidades especiales o de edad avanzada. Máximo confort y cuidado para las articulaciones. Personalízala con tu combinación de colores favorita.',
    caracteristicas: [
      'Espuma ortopédica de alta densidad',
      'Alivio de presión en articulaciones',
      'Recomendada para perros mayores',
      'Funda removible y lavable',
      'Base antideslizante',
      'Relleno hipoalergénico premium',
      'Personalizable: elige 2 colores'
    ],
    tallas: {
      M: { medidas: '70 × 50 cm', precio: 259000, pesoRecomendado: 'Hasta 10 kg' },
      L: { medidas: '90 × 70 cm', precio: 319000, pesoRecomendado: '10 - 25 kg' },
      XL: { medidas: '110 × 90 cm', precio: 379000, pesoRecomendado: '25 - 40 kg' }
    },
    badge: 'Premium',
    badgeClass: 'premium'
  }
};

// 9 colores disponibles (orden según la imagen de referencia)
const coloresConfig = {
  gris:        { hex: '#B8B8C8', nombre: 'Gris',         numero: 1 },
  negro:       { hex: '#1E1E2E', nombre: 'Negro',        numero: 2 },
  coral:       { hex: '#E8838A', nombre: 'Coral',        numero: 3 },
  azul:        { hex: '#3A9BD5', nombre: 'Azul',         numero: 4 },
  azulMarino:  { hex: '#1A2744', nombre: 'Azul Marino',  numero: 5 },
  crema:       { hex: '#F0E6D3', nombre: 'Crema',        numero: 6 },
  camel:       { hex: '#C4A46E', nombre: 'Camel',        numero: 7 },
  lila:        { hex: '#B8A8C8', nombre: 'Lila',         numero: 8 },
  azulJean:    { hex: '#7A9EB8', nombre: 'Azul Jean',    numero: 9 }
};

// Lista ordenada de colores para renderizar
const coloresOrden = ['gris', 'negro', 'coral', 'azul', 'azulMarino', 'crema', 'camel', 'lila', 'azulJean'];

// Función para obtener imagen del producto
// Patrón: /img/productos/{tipo}-{talla}-{colorArriba}-{colorAbajo}.jpg
function getProductImage(productoId, talla, colorArriba, colorAbajo) {
  return `/img/productos/${productoId}-${talla}-${colorArriba}-${colorAbajo}.jpg`;
}

// Imagen placeholder por defecto
const PLACEHOLDER_IMG = '/img/hero/562072963_18024946214743705_1687434606148405914_n.jpg';

// Función para formatear precio en COP
function formatearPrecio(precio) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio);
}

// ========================================
// Lógica de la página de detalle de producto
// ========================================

function initProductoDetalle() {
  const params = new URLSearchParams(window.location.search);
  const productoId = params.get('id');

  if (!productoId || !productosData[productoId]) {
    window.location.href = '/productos.html';
    return;
  }

  const producto = productosData[productoId];
  const tallasKeys = Object.keys(producto.tallas);
  const state = {
    tipo: productoId,
    talla: tallasKeys[0],
    colorArriba: 'gris',
    colorAbajo: 'negro'
  };

  // Llenar datos estáticos
  document.getElementById('productoBadge').textContent = producto.badge;
  if (producto.badgeClass) {
    document.getElementById('productoBadge').classList.add(producto.badgeClass);
  }
  document.getElementById('productoNombre').textContent = producto.nombre;
  document.getElementById('productoDescripcion').textContent = producto.descripcion;

  // Breadcrumb
  document.getElementById('breadcrumbProducto').textContent = producto.nombreCorto;

  // Tipo activo
  document.querySelectorAll('.tipo-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tipo === productoId);
  });

  // Renderizar tallas
  renderTallas(producto, state);

  // Renderizar colores (arriba y abajo)
  renderColores('colorArribaContainer', state.colorArriba);
  renderColores('colorAbajoContainer', state.colorAbajo);
  setColorNombre('colorArribaNombre', state.colorArriba);
  setColorNombre('colorAbajoNombre', state.colorAbajo);

  // Renderizar características
  renderCaracteristicas(producto);

  // Actualizar vista
  actualizarVista(producto, state);

  // Event: cambio de tipo
  document.querySelectorAll('.tipo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = `/producto.html?id=${btn.dataset.tipo}`;
    });
  });

  // Event: cambio de talla
  document.getElementById('tallasContainer').addEventListener('click', (e) => {
    const btn = e.target.closest('.talla-btn');
    if (!btn) return;
    state.talla = btn.dataset.talla;
    document.querySelectorAll('.talla-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    actualizarVista(producto, state);
  });

  // Event: cambio de color arriba
  document.getElementById('colorArribaContainer').addEventListener('click', (e) => {
    const btn = e.target.closest('.color-btn');
    if (!btn) return;
    state.colorArriba = btn.dataset.color;
    document.querySelectorAll('#colorArribaContainer .color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    setColorNombre('colorArribaNombre', state.colorArriba);
    actualizarVista(producto, state);
  });

  // Event: cambio de color abajo
  document.getElementById('colorAbajoContainer').addEventListener('click', (e) => {
    const btn = e.target.closest('.color-btn');
    if (!btn) return;
    state.colorAbajo = btn.dataset.color;
    document.querySelectorAll('#colorAbajoContainer .color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    setColorNombre('colorAbajoNombre', state.colorAbajo);
    actualizarVista(producto, state);
  });

  // Event: comprar por WhatsApp
  document.getElementById('btnComprar').addEventListener('click', () => {
    const tallaInfo = producto.tallas[state.talla];
    const colorArribaNombre = coloresConfig[state.colorArriba].nombre;
    const colorAbajoNombre = coloresConfig[state.colorAbajo].nombre;
    const precio = formatearPrecio(tallaInfo.precio);
    const msg = `¡Hola! Me interesa la ${producto.nombre}.\n\n` +
      `Talla: ${state.talla} (${tallaInfo.medidas})\n` +
      `Color arriba: ${colorArribaNombre}\n` +
      `Color abajo: ${colorAbajoNombre}\n` +
      `Precio: ${precio}\n\n` +
      `¿Está disponible?`;
    window.open(`https://wa.me/573009028252?text=${encodeURIComponent(msg)}`, '_blank');
  });

  // Event: consultar por WhatsApp
  document.getElementById('btnConsultar').addEventListener('click', () => {
    const msg = `¡Hola! Tengo preguntas sobre la ${producto.nombre}. ¿Me pueden ayudar?`;
    window.open(`https://wa.me/573009028252?text=${encodeURIComponent(msg)}`, '_blank');
  });
}

function setColorNombre(elementId, colorKey) {
  const el = document.getElementById(elementId);
  el.textContent = coloresConfig[colorKey].nombre;
  el.style.color = coloresConfig[colorKey].hex;
}

function renderTallas(producto, state) {
  const container = document.getElementById('tallasContainer');
  container.innerHTML = '';
  Object.entries(producto.tallas).forEach(([talla, info]) => {
    const btn = document.createElement('button');
    btn.className = `talla-btn${talla === state.talla ? ' active' : ''}`;
    btn.dataset.talla = talla;
    btn.innerHTML = `
      <span class="talla-letra">${talla}</span>
      <span class="talla-medidas">${info.medidas}</span>
      <span class="talla-peso">${info.pesoRecomendado}</span>
    `;
    container.appendChild(btn);
  });
}

function renderColores(containerId, activeColor) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  coloresOrden.forEach(color => {
    const btn = document.createElement('button');
    btn.className = `color-btn${color === activeColor ? ' active' : ''}`;
    btn.dataset.color = color;
    btn.setAttribute('aria-label', coloresConfig[color].nombre);
    btn.title = coloresConfig[color].nombre;
    btn.innerHTML = `<span class="color-circle" style="background: ${coloresConfig[color].hex}"></span>`;
    container.appendChild(btn);
  });
}

function renderCaracteristicas(producto) {
  const lista = document.getElementById('caracteristicasLista');
  lista.innerHTML = '';
  producto.caracteristicas.forEach(c => {
    const li = document.createElement('li');
    li.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--verde)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>${c}`;
    lista.appendChild(li);
  });
}

function actualizarVista(producto, state) {
  const tallaInfo = producto.tallas[state.talla];

  // Precio
  document.getElementById('precioValor').textContent = formatearPrecio(tallaInfo.precio);

  // Medidas info
  document.getElementById('medidasInfo').textContent = `${state.talla} — ${tallaInfo.medidas} — ${tallaInfo.pesoRecomendado}`;

  // Imagen principal
  const mainImg = document.getElementById('productoImgMain');
  const imgPath = getProductImage(state.tipo, state.talla, state.colorArriba, state.colorAbajo);
  mainImg.src = imgPath;
  mainImg.onerror = function () {
    this.src = PLACEHOLDER_IMG;
    this.onerror = null;
  };
  mainImg.alt = `${producto.nombre} — ${state.talla} ${coloresConfig[state.colorArriba].nombre} / ${coloresConfig[state.colorAbajo].nombre}`;

  // Preview de combinación de colores
  updateColorPreview(state);
}

function updateColorPreview(state) {
  const preview = document.getElementById('colorPreview');
  if (!preview) return;
  const arribaHex = coloresConfig[state.colorArriba].hex;
  const abajoHex = coloresConfig[state.colorAbajo].hex;
  preview.innerHTML = `
    <div class="preview-half preview-top" style="background: ${arribaHex}"></div>
    <div class="preview-half preview-bottom" style="background: ${abajoHex}"></div>
  `;
}

// Inicializar si estamos en la página de detalle
if (document.getElementById('productoDetalle')) {
  document.addEventListener('DOMContentLoaded', initProductoDetalle);
}
