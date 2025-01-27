const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');
const Tweakpane = require('tweakpane');

const settings = {
	dimensions: [window.innerWidth, window.innerHeight - 56],
	animate: true,
};

const params = {
	minWidth: 1,
	maxWidth: 12,
	radius: 200,
	repel: 0.03,
	speed: 1,
	bgColor: '#000000',
	agentColor: '#ffffff',
	lineColor: '#ffffff',
};

let mousePosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

window.addEventListener('mousemove', (event) => {
	mousePosition.x = event.clientX;
	mousePosition.y = event.clientY;
});

let agents = [];
let manager;
let renderedCanvas = null;

function createAgents(count, width, height) {
	agents = Array.from(new Array(count), () => {
		const x = random.range(0, width);
		const y = random.range(0, height);
		return new Agent(x, y);
	});
}

const sketch = ({ context, width, height, canvas }) => {
	// Assign the canvas to renderedCanvas for export
	renderedCanvas = canvas;
	console.log('Canvas assigned to renderedCanvas:', renderedCanvas);
	if (agents.length === 0) {
		createAgents(40, width, height); // Initialize with a count of 40 agents
	}

	return ({ context, width, height }) => {
		context.fillStyle = params.bgColor;
		context.fillRect(0, 0, width, height);

		for (let i = 0; i < agents.length; i++) {
			const agent = agents[i];

			for (let j = i + 1; j < agents.length; j++) {
				const other = agents[j];

				const dist = agent.pos.getDistance(other.pos);

				if (dist > params.radius) continue;

				context.lineWidth = math.mapRange(
					dist,
					0,
					params.radius,
					params.maxWidth,
					params.minWidth
				);

				context.beginPath();
				context.moveTo(agent.pos.x, agent.pos.y);
				context.lineTo(other.pos.x, other.pos.y);
				context.strokeStyle = params.lineColor;
				context.stroke();
			}
		}

		agents.forEach((agent) => {
			const distanceToMouse = agent.pos.getDistance(mousePosition);

			if (distanceToMouse < params.radius) {
				const dx = agent.pos.x - mousePosition.x;
				const dy = agent.pos.y - mousePosition.y;

				agent.vel.x += (dx * params.repel) / distanceToMouse;
				agent.vel.y += (dy * params.repel) / distanceToMouse;
			}

			agent.update(params.speed);
			agent.draw(context);
			agent.bounce(width, height);
		});
	};
};

class Vector {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	getDistance(v) {
		const dx = this.x - v.x;
		const dy = this.y - v.y;
		return Math.sqrt(dx * dx + dy * dy);
	}
}

class Agent {
	constructor(x, y) {
		this.pos = new Vector(x, y);
		this.vel = new Vector(random.range(-1, 1), random.range(-1, 1));
		this.radius = random.range(4, 12);
	}

	bounce(width, height) {
		if (this.pos.x <= 0 || this.pos.x >= width) this.vel.x *= -1;
		if (this.pos.y <= 0 || this.pos.y >= height) this.vel.y *= -1;
	}

	update(speed) {
		this.pos.x += this.vel.x * speed;
		this.pos.y += this.vel.y * speed;
	}

	draw(context) {
		context.save();
		context.translate(this.pos.x, this.pos.y);

		context.lineWidth = 4;
		context.fillStyle = params.agentColor;
		context.strokeStyle = params.agentColor;

		context.beginPath();
		context.arc(0, 0, this.radius, 0, Math.PI * 2);
		context.fill();
		context.stroke();

		context.restore();
	}
}

const createPane = () => {
	const pane = new Tweakpane.Pane();
	const folder = pane.addFolder({
		title: 'Settings',
		expanded: true,
	});

	folder.addInput(params, 'minWidth', { min: 1, max: 20, label: 'Min Width' });
	folder.addInput(params, 'maxWidth', { min: 1, max: 20, label: 'Max Width' });
	folder.addInput(params, 'radius', { min: 50, max: 400, label: 'Radius' });
	folder.addInput(params, 'repel', { min: 0.01, max: 0.1, label: 'Repel' });
	folder.addInput(params, 'speed', { min: 0.5, max: 5, label: 'Speed' });
	folder.addInput(params, 'bgColor', { label: 'Background' });
	folder.addInput(params, 'agentColor', { label: 'Agent' });
	folder.addInput(params, 'lineColor', { label: 'Line' });

	// Add Export PNG button
	const exportFolder = pane.addFolder({ title: "Export" });
	exportFolder
		.addButton({ title: "Export PNG" })
		.on("click", () => {
			exportPNG();
		});


	pane.on('change', () => {
		if (manager && manager.render) {
			manager.render();
		}
	});
};

const exportPNG = () => {
	console.log('Attempting to export PNG...');

	if (!renderedCanvas) {
		console.error('Canvas reference not found.');
		return;
	}

	console.log('Canvas Width:', renderedCanvas.width);
	console.log('Canvas Height:', renderedCanvas.height);

	const exportCanvas = document.createElement('canvas');
	exportCanvas.width = renderedCanvas.width;
	exportCanvas.height = renderedCanvas.height;
	const exportContext = exportCanvas.getContext('2d');

	exportContext.drawImage(renderedCanvas, 0, 0);

	const link = document.createElement('a');
	link.download = 'canvas-export.png';
	link.href = exportCanvas.toDataURL('image/png');
	link.click();

	console.log('Canvas exported successfully.');
};

const start = async () => {
	createPane();
	manager = await canvasSketch(sketch, settings);
	console.log('CanvasSketch Manager:', manager); // For debugging
};

start();