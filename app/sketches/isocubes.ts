// eslint-disable-next-line @typescript-eslint/no-require-imports
const random = require("canvas-sketch-util/random");

export interface IsoCubesParams {
  gridSize: number;
  cubeSize: number;
  maxHeight: number;
  noiseScale: number;
  noiseSpeed: number;
  topColor: string;
  leftColor: string;
  rightColor: string;
  strokeColor: string;
  strokeWidth: number;
  bgColor: string;
  colorByHeight: boolean;
  heightColorLow: string;
  heightColorHigh: string;
}

export const defaultIsoCubesParams: IsoCubesParams = {
  gridSize: 10,
  cubeSize: 40,
  maxHeight: 5,
  noiseScale: 0.15,
  noiseSpeed: 0.01,
  topColor: "#4488ff",
  leftColor: "#2255aa",
  rightColor: "#113366",
  strokeColor: "#000000",
  strokeWidth: 1,
  bgColor: "#0a0a0a",
  colorByHeight: false,
  heightColorLow: "#2222aa",
  heightColorHigh: "#ff4444",
};

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function lerpHex(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${bl})`;
}

function darken(hex: string, factor: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgb(${Math.round(r * factor)},${Math.round(g * factor)},${Math.round(b * factor)})`;
}

export function drawIsoCubes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: number,
  params: IsoCubesParams
) {
  ctx.fillStyle = params.bgColor;
  ctx.fillRect(0, 0, width, height);

  const { gridSize, cubeSize, maxHeight } = params;
  const time = frame * params.noiseSpeed;

  // Isometric basis vectors
  const isoW = cubeSize;
  const isoH = cubeSize * 0.5;
  const cubeH = cubeSize * 0.6;

  // Center the grid
  const cx = width / 2;
  const cy = height / 2 - (gridSize * isoH) / 4;

  // Convert grid coords to screen coords
  function toScreen(col: number, row: number) {
    return {
      x: cx + (col - row) * isoW * 0.5,
      y: cy + (col + row) * isoH * 0.5,
    };
  }

  // Draw back-to-front
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const n = random.noise3D(col * params.noiseScale, row * params.noiseScale, time);
      const heightVal = ((n + 1) / 2) * maxHeight;
      const h = heightVal * cubeH;
      const heightNorm = heightVal / maxHeight;

      const pos = toScreen(col, row);
      const x = pos.x;
      const y = pos.y;

      // Determine face colors
      let top: string, left: string, right: string;
      if (params.colorByHeight) {
        const baseColor = lerpHex(params.heightColorLow, params.heightColorHigh, heightNorm);
        top = baseColor;
        left = darken(baseColor, 0.6);
        right = darken(baseColor, 0.35);
      } else {
        top = params.topColor;
        left = params.leftColor;
        right = params.rightColor;
      }

      // Top face
      ctx.beginPath();
      ctx.moveTo(x, y - h);
      ctx.lineTo(x + isoW * 0.5, y + isoH * 0.5 - h);
      ctx.lineTo(x, y + isoH - h);
      ctx.lineTo(x - isoW * 0.5, y + isoH * 0.5 - h);
      ctx.closePath();
      ctx.fillStyle = top;
      ctx.fill();
      if (params.strokeWidth > 0) {
        ctx.strokeStyle = params.strokeColor;
        ctx.lineWidth = params.strokeWidth;
        ctx.stroke();
      }

      // Left face
      ctx.beginPath();
      ctx.moveTo(x - isoW * 0.5, y + isoH * 0.5 - h);
      ctx.lineTo(x, y + isoH - h);
      ctx.lineTo(x, y + isoH);
      ctx.lineTo(x - isoW * 0.5, y + isoH * 0.5);
      ctx.closePath();
      ctx.fillStyle = left;
      ctx.fill();
      if (params.strokeWidth > 0) {
        ctx.strokeStyle = params.strokeColor;
        ctx.lineWidth = params.strokeWidth;
        ctx.stroke();
      }

      // Right face
      ctx.beginPath();
      ctx.moveTo(x + isoW * 0.5, y + isoH * 0.5 - h);
      ctx.lineTo(x, y + isoH - h);
      ctx.lineTo(x, y + isoH);
      ctx.lineTo(x + isoW * 0.5, y + isoH * 0.5);
      ctx.closePath();
      ctx.fillStyle = right;
      ctx.fill();
      if (params.strokeWidth > 0) {
        ctx.strokeStyle = params.strokeColor;
        ctx.lineWidth = params.strokeWidth;
        ctx.stroke();
      }
    }
  }
}
