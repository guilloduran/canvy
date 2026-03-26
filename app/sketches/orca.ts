import { mapRange } from "../lib/math";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const random = require("canvas-sketch-util/random");

export interface OrcaParams {
  cols: number;
  rows: number;
  scaleMin: number;
  scaleMax: number;
  lineCap: CanvasLineCap;
  freq: number;
  amp: number;
  lineColor: string;
  gradient: boolean;
  gradientA: string;
  gradientB: string;
  gradientWidth: number;
  bgColor: string;
  radialGradient: boolean;
  bgGradientA: string;
  bgGradientB: string;
}

export const defaultOrcaParams: OrcaParams = {
  cols: 10,
  rows: 10,
  scaleMin: 1,
  scaleMax: 30,
  lineCap: "butt",
  freq: 0.001,
  amp: 0.2,
  lineColor: "rgb(255, 255, 255)",
  gradient: false,
  gradientA: "rgb(0, 0, 0)",
  gradientB: "rgb(255, 255, 255)",
  gradientWidth: 50,
  bgColor: "rgb(0, 0, 0)",
  radialGradient: false,
  bgGradientA: "rgb(0, 0, 0)",
  bgGradientB: "rgb(255, 255, 255)",
};

export function drawOrca(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: number,
  params: OrcaParams
) {
  const { cols, rows } = params;
  const gridW = width * 0.8;
  const gridH = height * 0.8;
  const cellW = gridW / cols;
  const cellH = gridH / rows;
  const marginX = (width - gridW) * 0.5;
  const marginY = (height - gridH) * 0.5;

  // Background
  if (params.radialGradient) {
    const grad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      width
    );
    grad.addColorStop(0, params.bgGradientA);
    grad.addColorStop(1, params.bgGradientB);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = params.bgColor;
  }
  ctx.fillRect(0, 0, width, height);

  // Grid lines
  const f = frame;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellW;
      const y = row * cellH;
      const w = cellW * 0.8;

      const n = random.noise3D(x, y, f * 10, params.freq);
      const angle = n * Math.PI * params.amp;
      const scale = mapRange(n, -1, 1, params.scaleMin, params.scaleMax);

      ctx.save();
      ctx.translate(marginX + x + cellW * 0.5, marginY + y + cellH * 0.5);
      ctx.rotate(angle);

      // Stroke style
      if (params.gradient) {
        const grad = ctx.createLinearGradient(-w * 0.5, 0, params.gradientWidth, 0);
        grad.addColorStop(0.2, params.gradientA);
        grad.addColorStop(0.8, params.gradientB);
        ctx.strokeStyle = grad;
      } else {
        ctx.strokeStyle = params.lineColor;
      }

      ctx.lineWidth = scale;
      ctx.lineCap = params.lineCap;

      ctx.beginPath();
      ctx.moveTo(-w * 0.5, 0);
      ctx.lineTo(w * 0.5, 0);
      ctx.stroke();

      ctx.restore();
    }
  }
}
