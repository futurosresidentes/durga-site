// ========================================
// DURGA — Bed Color Changer (Canvas)
// Tiñe dinámicamente la tela de la cama
// según los colores seleccionados
// ========================================

class BedColorChanger {
  constructor(canvasElement, imageSrc) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.ready = false;
    this.originalData = null;
    this._onReady = null;
    this.image = new Image();

    this.image.onload = () => {
      this.canvas.width = this.image.naturalWidth;
      this.canvas.height = this.image.naturalHeight;
      this.ctx.drawImage(this.image, 0, 0);
      this.originalData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      this.ready = true;
      if (this._onReady) this._onReady();
    };

    this.image.onerror = () => {
      console.warn('BedColorChanger: no se pudo cargar la imagen base');
    };

    this.image.src = imageSrc;
  }

  onReady(cb) {
    if (this.ready) cb();
    else this._onReady = cb;
  }

  applyColors(topHex, bottomHex) {
    if (!this.ready || !this.originalData) return;

    const topHSL = hexToHSL(topHex);
    const bottomHSL = hexToHSL(bottomHex);

    const imageData = new ImageData(
      new Uint8ClampedArray(this.originalData.data),
      this.originalData.width,
      this.originalData.height
    );

    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;

    // Umbrales calibrados con cama-base-web.jpg (1600x900)
    const MAX_SAT = 8;
    const TOP_Y_MIN = 0.47;
    const TOP_Y_MAX = 0.66;
    const BOT_Y_MIN = 0.66;
    const BOT_Y_MAX = 0.76;
    const X_MIN = 0.0;
    const TOP_X_MAX = 0.75;
    const BOT_X_MAX = 0.73;
    const TOP_L_MIN = 45;
    const TOP_L_MAX = 83;
    const BOT_L_MIN = 8;
    const BOT_L_MAX = 32;
    const REF_TOP_L = 72;
    const REF_BOT_L = 22;
    const BOT_SHADOW = 0.65;

    for (let i = 0; i < data.length; i += 4) {
      const idx = i >> 2;
      const x = idx % w;
      const y = (idx - x) / w;
      const ry = y / h;
      const rx = x / w;

      // Filtro rápido de posición
      if (ry < TOP_Y_MIN || ry > BOT_Y_MAX) continue;
      if (rx < X_MIN) continue;

      const r = data[i], g = data[i + 1], b = data[i + 2];
      const pHSL = rgbToHSL(r, g, b);
      const pS = pHSL[1], pL = pHSL[2];

      if (pS > MAX_SAT) continue;

      let target, newL;

      if (ry < TOP_Y_MAX && rx < TOP_X_MAX && pL > TOP_L_MIN && pL < TOP_L_MAX) {
        // Tela superior
        target = topHSL;
        newL = target.l * (pL / REF_TOP_L);
      } else if (ry >= BOT_Y_MIN && rx < BOT_X_MAX && pL >= BOT_L_MIN && pL <= BOT_L_MAX) {
        // Franja inferior
        target = bottomHSL;
        newL = target.l * (pL / REF_BOT_L) * BOT_SHADOW;
      } else {
        continue;
      }

      newL = Math.max(2, Math.min(98, newL));
      const newS = target.s * 0.88;

      const rgb = hslToRGB(target.h, newS, newL);
      data[i] = rgb[0];
      data[i + 1] = rgb[1];
      data[i + 2] = rgb[2];
    }

    this.ctx.putImageData(imageData, 0, 0);
  }
}

// ========================================
// Conversión de colores
// ========================================

function hexToHSL(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0, s = 0, l = (max + min) / 2;
  if (d > 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function rgbToHSL(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0, s = 0, l = (max + min) / 2;
  if (d > 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

function hslToRGB(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
