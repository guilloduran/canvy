export interface GlitchGridParams {
  cols: number;
  rows: number;
  palette: string;
  customColor1: string;
  customColor2: string;
  customColor3: string;
  glitchIntensity: number;
  shiftAmount: number;
  duplicationChance: number;
  scanLines: boolean;
  scanLineOpacity: number;
  noiseOverlay: boolean;
  noiseAmount: number;
  animateSpeed: number;
  bgColor: string;
  blockStyle: string;
}

export const defaultGlitchGridParams: GlitchGridParams = {
  cols: 20,
  rows: 20,
  palette: "neon",
  customColor1: "#ff0044",
  customColor2: "#00ff88",
  customColor3: "#0066ff",
  glitchIntensity: 0.3,
  shiftAmount: 5,
  duplicationChance: 0.1,
  scanLines: true,
  scanLineOpacity: 0.15,
  noiseOverlay: false,
  noiseAmount: 0.05,
  animateSpeed: 1,
  bgColor: "#000000",
  blockStyle: "fill",
};

const PALETTES: Record<string, string[]> = {
  neon: ["#ff0044", "#00ff88", "#0066ff", "#ffff00", "#ff00ff"],
  monochrome: ["#ffffff", "#cccccc", "#999999", "#666666", "#333333"],
  vapor: ["#ff71ce", "#01cdfe", "#05ffa1", "#b967ff", "#fffb96"],
};

function seededRandom(seed: number): number {
  const n = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
}

export class GlitchGridState {
  gridCanvas: OffscreenCanvas | null = null;
  gridCtx: OffscreenCanvasRenderingContext2D | null = null;

  ensureCanvas(width: number, height: number) {
    if (!this.gridCanvas || this.gridCanvas.width !== width || this.gridCanvas.height !== height) {
      this.gridCanvas = new OffscreenCanvas(width, height);
      this.gridCtx = this.gridCanvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
    }
  }
}

export function drawGlitchGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: number,
  params: GlitchGridParams,
  state: GlitchGridState
) {
  state.ensureCanvas(width, height);
  const offCtx = state.gridCtx!;
  const offCanvas = state.gridCanvas!;

  const { cols, rows } = params;
  const cellW = width / cols;
  const cellH = height / rows;

  const colors = params.palette === "custom"
    ? [params.customColor1, params.customColor2, params.customColor3]
    : PALETTES[params.palette] || PALETTES.neon;

  // Draw clean grid to offscreen
  offCtx.fillStyle = params.bgColor;
  offCtx.fillRect(0, 0, width, height);

  const glitchFrame = Math.floor(frame * params.animateSpeed);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const seed = row * cols + col + glitchFrame * 0.01;
      const colorIdx = Math.floor(seededRandom(seed * 1.7) * colors.length);
      const color = colors[colorIdx];
      const x = col * cellW;
      const y = row * cellH;

      if (params.blockStyle === "outline" || (params.blockStyle === "mixed" && seededRandom(seed * 2.3) > 0.5)) {
        offCtx.strokeStyle = color;
        offCtx.lineWidth = 2;
        offCtx.strokeRect(x + 1, y + 1, cellW - 2, cellH - 2);
      } else {
        offCtx.fillStyle = color;
        offCtx.fillRect(x, y, cellW, cellH);
      }
    }
  }

  // Draw to main canvas with glitch effects
  ctx.fillStyle = params.bgColor;
  ctx.fillRect(0, 0, width, height);

  // Row-based glitch: shift and duplicate rows
  for (let row = 0; row < rows; row++) {
    const ry = Math.floor(row * cellH);
    const rh = Math.ceil(cellH);
    const rowSeed = row + glitchFrame * 3.7;

    if (seededRandom(rowSeed) < params.glitchIntensity) {
      // Horizontal shift
      const shift = Math.floor((seededRandom(rowSeed * 2.1) - 0.5) * 2 * params.shiftAmount * cellW / cols);
      ctx.drawImage(offCanvas, 0, ry, width, rh, shift, ry, width, rh);

      // RGB channel separation
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.5;
      ctx.drawImage(offCanvas, 0, ry, width, rh, shift + 3, ry, width, rh);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    } else {
      ctx.drawImage(offCanvas, 0, ry, width, rh, 0, ry, width, rh);
    }

    // Row duplication
    if (seededRandom(rowSeed * 4.3) < params.duplicationChance) {
      const targetRow = Math.floor(seededRandom(rowSeed * 5.1) * rows);
      const ty = Math.floor(targetRow * cellH);
      ctx.drawImage(offCanvas, 0, ry, width, rh, 0, ty, width, rh);
    }
  }

  // Scan lines
  if (params.scanLines) {
    ctx.fillStyle = `rgba(0,0,0,${params.scanLineOpacity})`;
    for (let y = 0; y < height; y += 3) {
      ctx.fillRect(0, y, width, 1);
    }
  }

  // Noise overlay
  if (params.noiseOverlay) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const amount = params.noiseAmount * 255;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * amount;
      data[i] += noise;
      data[i + 1] += noise;
      data[i + 2] += noise;
    }
    ctx.putImageData(imageData, 0, 0);
  }
}
