const AVAILABLE_GLYPHS = "._=-+/\\|~!@#$%^&*(){}[]?<>".split("");

// Deterministic hash-based random so output is stable for a given frame
function seededRandom(col: number, row: number, frame: number): number {
  const n = Math.sin(col * 127.1 + row * 311.7 + frame * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

export interface LetryParams {
  text: string;
  fontSize: number;
  fontFamily: string;
  keyboardInput: boolean;
  cellSize: number;
  randomSizeChance: number;
  baseScale: number;
  maxScale: number;
  bgColor: string;
  textColor: string;
  colorCycling: boolean;
  cycleSpeed: number;
  rotationSpeed: number;
  pulseEffect: boolean;
  pulseSpeed: number;
  pulseStrength: number;
  glyph1: string;
  glyph2: string;
  glyph3: string;
  glyph4: string;
}

export const defaultLetryParams: LetryParams = {
  text: "B",
  fontSize: 50,
  fontFamily: "sans-serif",
  keyboardInput: true,
  cellSize: 25,
  randomSizeChance: 0.1,
  baseScale: 2,
  maxScale: 6,
  bgColor: "#000000",
  textColor: "#FF0000",
  colorCycling: false,
  cycleSpeed: 0.5,
  rotationSpeed: 0.01,
  pulseEffect: false,
  pulseSpeed: 0.5,
  pulseStrength: 0.3,
  glyph1: ".",
  glyph2: "-",
  glyph3: "+",
  glyph4: "_",
};

export function randomizeGlyphs(): Pick<LetryParams, "glyph1" | "glyph2" | "glyph3" | "glyph4"> {
  const shuffled = [...AVAILABLE_GLYPHS].sort(() => Math.random() - 0.5);
  return {
    glyph1: shuffled[0],
    glyph2: shuffled[1],
    glyph3: shuffled[2],
    glyph4: shuffled[3],
  };
}

function getGlyph(brightness: number, params: LetryParams): string {
  if (brightness < 50) return "";
  if (brightness < 100) return params.glyph1;
  if (brightness < 150) return params.glyph2;
  if (brightness < 200) return params.glyph3;
  return params.glyph4;
}

function getCycledColor(frame: number, params: LetryParams): string {
  if (!params.colorCycling) return params.textColor;
  const hue = (frame * params.cycleSpeed) % 360;
  return `hsl(${hue}, 100%, 50%)`;
}

export class LetryState {
  offscreenCanvas: OffscreenCanvas | null = null;
  offscreenCtx: OffscreenCanvasRenderingContext2D | null = null;

  ensureOffscreen(cols: number, rows: number) {
    if (
      !this.offscreenCanvas ||
      this.offscreenCanvas.width !== cols ||
      this.offscreenCanvas.height !== rows
    ) {
      this.offscreenCanvas = new OffscreenCanvas(cols, rows);
      this.offscreenCtx = this.offscreenCanvas.getContext("2d", {
        willReadFrequently: true,
      }) as OffscreenCanvasRenderingContext2D;
    }
  }
}

export function drawLetry(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: number,
  params: LetryParams,
  state: LetryState
) {
  const cell = params.cellSize;
  const cols = Math.floor(width / cell);
  const rows = Math.floor(height / cell);

  state.ensureOffscreen(cols, rows);
  const offCtx = state.offscreenCtx!;

  // Render text to offscreen canvas for sampling
  offCtx.fillStyle = "black";
  offCtx.fillRect(0, 0, cols, rows);
  offCtx.fillStyle = "white";
  offCtx.font = `${params.fontSize}px ${params.fontFamily}`;
  offCtx.textBaseline = "top";

  const metrics = offCtx.measureText(params.text);
  const mx = -(metrics.actualBoundingBoxLeft ?? 0);
  const my = -(metrics.actualBoundingBoxAscent ?? 0);
  const mw = (metrics.actualBoundingBoxLeft ?? 0) + (metrics.actualBoundingBoxRight ?? metrics.width);
  const mh = (metrics.actualBoundingBoxAscent ?? 0) + (metrics.actualBoundingBoxDescent ?? params.fontSize);

  const tx = (cols - mw) * 0.5 - mx;
  const ty = (rows - mh) * 0.5 - my;

  offCtx.save();
  offCtx.translate(tx, ty);
  offCtx.fillText(params.text, 0, 0);
  offCtx.restore();

  const imageData = offCtx.getImageData(0, 0, cols, rows).data;

  // Draw background
  ctx.fillStyle = params.bgColor;
  ctx.fillRect(0, 0, width, height);

  // Draw glyphs
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  const f = frame;
  const color = getCycledColor(f, params);
  ctx.fillStyle = color;

  const centerX = width / 2;
  const centerY = height / 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = (row * cols + col) * 4;
      const r = imageData[i];

      const glyph = getGlyph(r, params);
      if (!glyph) continue;

      const x = col * cell + cell * 0.5;
      const y = row * cell + cell * 0.5;

      // Rotation from center
      const dx = x - centerX;
      const dy = y - centerY;
      const angle = Math.atan2(dy, dx) + f * params.rotationSpeed;

      // Font size with pulse
      let size = cell * params.baseScale;
      if (params.pulseEffect) {
        const pulse = Math.sin(f * params.pulseSpeed * 0.1) * params.pulseStrength;
        size *= 1 + pulse;
      }
      if (seededRandom(col, row, Math.floor(f)) < params.randomSizeChance) {
        size = cell * params.maxScale;
      }

      ctx.font = `${size}px ${params.fontFamily}`;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(glyph, 0, 0);
      ctx.restore();
    }
  }
}
