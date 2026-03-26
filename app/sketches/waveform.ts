// eslint-disable-next-line @typescript-eslint/no-require-imports
const random = require("canvas-sketch-util/random");

export interface WaveformParams {
  lineCount: number;
  pointsPerLine: number;
  amplitude: number;
  noiseScale: number;
  noiseSpeed: number;
  lineSpacing: number;
  strokeWidth: number;
  fillBelow: boolean;
  perspective: number;
  centerBias: number;
  lineColor: string;
  colorByAmplitude: boolean;
  lowColor: string;
  highColor: string;
  bgColor: string;
  mirror: boolean;
}

export const defaultWaveformParams: WaveformParams = {
  lineCount: 40,
  pointsPerLine: 200,
  amplitude: 40,
  noiseScale: 0.01,
  noiseSpeed: 0.005,
  lineSpacing: 10,
  strokeWidth: 1.5,
  fillBelow: true,
  perspective: 0.3,
  centerBias: 0.6,
  lineColor: "#ffffff",
  colorByAmplitude: false,
  lowColor: "#333333",
  highColor: "#ffffff",
  bgColor: "#000000",
  mirror: false,
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

export function drawWaveform(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: number,
  params: WaveformParams
) {
  ctx.fillStyle = params.bgColor;
  ctx.fillRect(0, 0, width, height);

  const time = frame * params.noiseSpeed;
  const marginX = width * 0.1;
  const drawWidth = width - marginX * 2;
  const totalHeight = params.lineCount * params.lineSpacing;
  const startY = (height - totalHeight) / 2 + totalHeight;

  // Render back to front
  for (let i = 0; i < params.lineCount; i++) {
    const lineIdx = params.lineCount - 1 - i;
    const perspectiveFactor = 1 - params.perspective * (lineIdx / params.lineCount);
    const y = startY - lineIdx * params.lineSpacing * perspectiveFactor;

    const points: number[] = [];
    let maxAmp = 0;

    for (let j = 0; j <= params.pointsPerLine; j++) {
      const t = j / params.pointsPerLine;
      const x = marginX + t * drawWidth;

      // Center bias: gaussian-like curve
      const centerDist = Math.abs(t - 0.5) * 2;
      const bias = 1 - centerDist * params.centerBias;
      const biasMultiplier = Math.max(0, bias * bias);

      const n = random.noise3D(
        x * params.noiseScale,
        lineIdx * 0.5,
        time
      );

      const amp = n * params.amplitude * biasMultiplier * perspectiveFactor;
      if (Math.abs(amp) > maxAmp) maxAmp = Math.abs(amp);
      points.push(x, y + amp);
    }

    // Mirror
    if (params.mirror) {
      const centerX = width / 2;
      for (let j = 0; j <= params.pointsPerLine; j++) {
        const px = points[j * 2];
        const py = points[j * 2 + 1];
        const mirroredAmp = py - y;
        const mirroredX = centerX - (px - centerX);
        // Find closest point and average
        const idx = (params.pointsPerLine - j) * 2;
        if (idx < points.length) {
          points[idx + 1] = y + (points[idx + 1] - y + mirroredAmp) / 2;
        }
      }
    }

    // Fill below (occlusion effect)
    if (params.fillBelow) {
      ctx.beginPath();
      ctx.moveTo(points[0], points[1]);
      for (let j = 1; j <= params.pointsPerLine; j++) {
        ctx.lineTo(points[j * 2], points[j * 2 + 1]);
      }
      ctx.lineTo(marginX + drawWidth, height);
      ctx.lineTo(marginX, height);
      ctx.closePath();
      ctx.fillStyle = params.bgColor;
      ctx.fill();
    }

    // Stroke line
    const ampNorm = Math.min(maxAmp / params.amplitude, 1);
    if (params.colorByAmplitude) {
      ctx.strokeStyle = lerpHex(params.lowColor, params.highColor, ampNorm);
    } else {
      ctx.strokeStyle = params.lineColor;
    }
    ctx.lineWidth = params.strokeWidth;
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(points[0], points[1]);
    for (let j = 1; j <= params.pointsPerLine; j++) {
      ctx.lineTo(points[j * 2], points[j * 2 + 1]);
    }
    ctx.stroke();
  }
}
