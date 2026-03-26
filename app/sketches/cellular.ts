export interface CellularParams {
  gridWidth: number;
  gridHeight: number;
  cellSize: number;
  rule: string;
  customBirth: string;
  customSurvive: string;
  initialDensity: number;
  stepsPerFrame: number;
  cellShape: string;
  colorMode: string;
  aliveColor: string;
  youngColor: string;
  oldColor: string;
  maxAge: number;
  deadColor: string;
  bgColor: string;
  glow: boolean;
  glowRadius: number;
  trail: boolean;
  trailLength: number;
}

export const defaultCellularParams: CellularParams = {
  gridWidth: 80,
  gridHeight: 80,
  cellSize: 13,
  rule: "life",
  customBirth: "3",
  customSurvive: "23",
  initialDensity: 0.4,
  stepsPerFrame: 1,
  cellShape: "square",
  colorMode: "age",
  aliveColor: "#ffffff",
  youngColor: "#00ff88",
  oldColor: "#ff0044",
  maxAge: 60,
  deadColor: "#111111",
  bgColor: "#000000",
  glow: false,
  glowRadius: 6,
  trail: false,
  trailLength: 20,
};

const RULES: Record<string, { birth: number[]; survive: number[] }> = {
  life: { birth: [3], survive: [2, 3] },
  highlife: { birth: [3, 6], survive: [2, 3] },
  seeds: { birth: [2], survive: [] },
  "day-night": { birth: [3, 6, 7, 8], survive: [3, 4, 6, 7, 8] },
};

function parseRule(s: string): number[] {
  return s.split("").map(Number).filter((n) => !isNaN(n));
}

export class CellularState {
  grid: Float32Array = new Float32Array(0);
  ages: Float32Array = new Float32Array(0);
  deadTimers: Float32Array = new Float32Array(0);
  prevGrid: Float32Array = new Float32Array(0);
  width = 0;
  height = 0;
  initialized = false;

  init(w: number, h: number, density: number) {
    this.width = w;
    this.height = h;
    this.grid = new Float32Array(w * h);
    this.ages = new Float32Array(w * h);
    this.deadTimers = new Float32Array(w * h);
    this.prevGrid = new Float32Array(w * h);

    for (let i = 0; i < w * h; i++) {
      this.grid[i] = Math.random() < density ? 1 : 0;
      this.ages[i] = 0;
      this.deadTimers[i] = 0;
    }
    this.initialized = true;
  }

  step(ruleKey: string, customBirth: string, customSurvive: string) {
    const rule = RULES[ruleKey] || {
      birth: parseRule(customBirth),
      survive: parseRule(customSurvive),
    };
    const { width: w, height: h } = this;

    this.prevGrid.set(this.grid);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let neighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = (x + dx + w) % w;
            const ny = (y + dy + h) % h;
            neighbors += this.prevGrid[ny * w + nx];
          }
        }

        const idx = y * w + x;
        const alive = this.prevGrid[idx];

        if (alive) {
          if (rule.survive.includes(neighbors)) {
            this.grid[idx] = 1;
            this.ages[idx]++;
          } else {
            this.grid[idx] = 0;
            this.ages[idx] = 0;
            this.deadTimers[idx] = 1;
          }
        } else {
          if (rule.birth.includes(neighbors)) {
            this.grid[idx] = 1;
            this.ages[idx] = 0;
            this.deadTimers[idx] = 0;
          } else {
            this.grid[idx] = 0;
            if (this.deadTimers[idx] > 0) {
              this.deadTimers[idx]++;
            }
          }
        }
      }
    }
  }
}

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

export function drawCellular(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frame: number,
  params: CellularParams,
  state: CellularState
) {
  if (!state.initialized || state.width !== params.gridWidth || state.height !== params.gridHeight) {
    state.init(params.gridWidth, params.gridHeight, params.initialDensity);
  }

  // Step simulation
  for (let s = 0; s < params.stepsPerFrame; s++) {
    state.step(params.rule, params.customBirth, params.customSurvive);
  }

  // Draw
  ctx.fillStyle = params.bgColor;
  ctx.fillRect(0, 0, width, height);

  const cellW = width / params.gridWidth;
  const cellH = height / params.gridHeight;

  if (params.glow) {
    ctx.shadowBlur = params.glowRadius;
  }

  for (let y = 0; y < params.gridHeight; y++) {
    for (let x = 0; x < params.gridWidth; x++) {
      const idx = y * params.gridWidth + x;
      const alive = state.grid[idx];
      const age = state.ages[idx];
      const deadTimer = state.deadTimers[idx];

      let color: string | null = null;

      if (alive) {
        if (params.colorMode === "age") {
          const t = Math.min(age / params.maxAge, 1);
          color = lerpHex(params.youngColor, params.oldColor, t);
        } else if (params.colorMode === "state-change") {
          color = age === 0 ? params.youngColor : params.aliveColor;
        } else {
          color = params.aliveColor;
        }
      } else if (params.trail && deadTimer > 0 && deadTimer <= params.trailLength) {
        const fade = 1 - deadTimer / params.trailLength;
        if (params.colorMode === "age") {
          color = lerpHex(params.bgColor, params.oldColor, fade * 0.5);
        } else {
          color = lerpHex(params.bgColor, params.deadColor, fade);
        }
      }

      if (!color) continue;

      if (params.glow && alive) {
        ctx.shadowColor = color;
      }

      ctx.fillStyle = color;
      const px = x * cellW;
      const py = y * cellH;

      if (params.cellShape === "circle") {
        ctx.beginPath();
        ctx.arc(px + cellW / 2, py + cellH / 2, cellW * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (params.cellShape === "rounded") {
        const r = cellW * 0.15;
        ctx.beginPath();
        ctx.roundRect(px + 0.5, py + 0.5, cellW - 1, cellH - 1, r);
        ctx.fill();
      } else {
        ctx.fillRect(px, py, cellW, cellH);
      }
    }
  }

  ctx.shadowBlur = 0;
}
