const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [window.innerWidth, window.innerHeight - 56],
  animate: true,
};

const params = {
  count: 60,
  speed: 2,
  radius: 3,
  color: '#ffffff',
  bgColor: '#000000',
};

let particles = [];

const createParticles = (width, height) => {
  particles = Array.from({ length: params.count }).map(() => ({
    pos: [random.range(0, width), random.range(0, height)],
    vel: [random.range(-params.speed, params.speed), random.range(-params.speed, params.speed)],
  }));
};

const sketch = ({ width, height }) => {
  if (particles.length === 0) createParticles(width, height);

  return ({ context, width, height }) => {
    context.fillStyle = params.bgColor;
    context.fillRect(0, 0, width, height);

    particles.forEach((p) => {
      p.pos[0] += p.vel[0];
      p.pos[1] += p.vel[1];

      if (p.pos[0] < 0 || p.pos[0] > width) p.vel[0] *= -1;
      if (p.pos[1] < 0 || p.pos[1] > height) p.vel[1] *= -1;

      context.beginPath();
      context.arc(p.pos[0], p.pos[1], params.radius, 0, Math.PI * 2);
      context.fillStyle = params.color;
      context.fill();
    });
  };
};

canvasSketch(sketch, settings);
