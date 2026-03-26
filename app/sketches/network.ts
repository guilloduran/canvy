import { Vector, mapRange, randomRange } from "../lib/math";

export interface NetworkParams {
  particleCount: number;
  minWidth: number;
  maxWidth: number;
  radius: number;
  repelStrength: number;
  speed: number;
  bgColor: string;
  particleColor: string;
  lineColor: string;
}

export const defaultNetworkParams: NetworkParams = {
  particleCount: 40,
  minWidth: 1,
  maxWidth: 12,
  radius: 200,
  repelStrength: 0.03,
  speed: 1,
  bgColor: "#000000",
  particleColor: "#ffffff",
  lineColor: "#ffffff",
};

interface Agent {
  pos: Vector;
  vel: Vector;
  radius: number;
}

export class NetworkState {
  agents: Agent[] = [];

  init(width: number, height: number, count: number) {
    this.agents = Array.from({ length: count }, () => ({
      pos: new Vector(randomRange(0, width), randomRange(0, height)),
      vel: new Vector(randomRange(-1, 1), randomRange(-1, 1)),
      radius: randomRange(4, 12),
    }));
  }

  ensureAgents(width: number, height: number, count: number) {
    if (this.agents.length === 0) {
      this.init(width, height, count);
      return;
    }
    while (this.agents.length < count) {
      this.agents.push({
        pos: new Vector(randomRange(0, width), randomRange(0, height)),
        vel: new Vector(randomRange(-1, 1), randomRange(-1, 1)),
        radius: randomRange(4, 12),
      });
    }
    if (this.agents.length > count) {
      this.agents.length = count;
    }
  }
}

export function drawNetwork(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: NetworkParams,
  state: NetworkState,
  mousePos: { x: number; y: number }
) {
  state.ensureAgents(width, height, params.particleCount);

  // Background
  ctx.fillStyle = params.bgColor;
  ctx.fillRect(0, 0, width, height);

  const agents = state.agents;

  // Draw connections
  ctx.strokeStyle = params.lineColor;
  for (let i = 0; i < agents.length; i++) {
    for (let j = i + 1; j < agents.length; j++) {
      const dist = agents[i].pos.getDistance(agents[j].pos);
      if (dist > params.radius) continue;

      ctx.lineWidth = mapRange(
        dist,
        0,
        params.radius,
        params.maxWidth,
        params.minWidth
      );
      ctx.beginPath();
      ctx.moveTo(agents[i].pos.x, agents[i].pos.y);
      ctx.lineTo(agents[j].pos.x, agents[j].pos.y);
      ctx.stroke();
    }
  }

  // Update and draw agents
  for (const agent of agents) {
    // Mouse repulsion
    const distToMouse = agent.pos.getDistance(mousePos);
    if (distToMouse < params.radius && distToMouse > 0) {
      const dx = agent.pos.x - mousePos.x;
      const dy = agent.pos.y - mousePos.y;
      agent.vel.x += (dx * params.repelStrength) / distToMouse;
      agent.vel.y += (dy * params.repelStrength) / distToMouse;
    }

    // Move
    agent.pos.x += agent.vel.x * params.speed;
    agent.pos.y += agent.vel.y * params.speed;

    // Bounce
    if (agent.pos.x <= 0 || agent.pos.x >= width) agent.vel.x *= -1;
    if (agent.pos.y <= 0 || agent.pos.y >= height) agent.vel.y *= -1;

    // Clamp inside bounds
    agent.pos.x = Math.max(0, Math.min(width, agent.pos.x));
    agent.pos.y = Math.max(0, Math.min(height, agent.pos.y));

    // Draw particle
    ctx.fillStyle = params.particleColor;
    ctx.beginPath();
    ctx.arc(agent.pos.x, agent.pos.y, agent.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
