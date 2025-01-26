const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const Tweakpane = require('tweakpane');

const settings = {
	dimensions: [1080, 1080],
	animate: true,
	duration: 4,
	fps: 60
};

// Available glyphs for randomization
const availableGlyphs = '._=-+/\\|~!@#$%^&*(){}[]?<>'.split('');

const params = {
	text: 'B',
	fontSize: 50,
	fontFamily: 'sans-serif',
	color: '#FF0000',
	backgroundColor: 'rgba(0, 0, 0, 1)',
	randomSize: 0.1,
	baseSize: 2,
	maxSize: 6,
	keyboardInput: true,
	glyph1: '.',
	glyph2: '-',
	glyph3: '+',
	glyph4: '_',
	// Animation parameters
	animate: true,
	freq: 0.001,
	amp: 0.2,
	frame: 0,
	// Animation pattern
	pattern: 'noise',
	// Effects
	pulseEffect: false,
	pulseSpeed: 0.5,
	pulseStrength: 0.3,
	colorCycling: false,
	colorCycleSpeed: 0.5
};

// Animation patterns
const getAnimationAngle = (x, y, frame, width, height) => {
	const f = frame * 0.5;

	switch (params.pattern) {
		case 'wave':
			return Math.sin(x * 0.01 + f * 0.1) * params.amp;
		case 'spiral':
			const dx = x - width / 2;
			const dy = y - height / 2;
			const distance = Math.sqrt(dx * dx + dy * dy);
			return (distance * 0.01 + f * 0.1) * params.amp;
		case 'ripple':
			const xDist = x - width / 2;
			const yDist = y - height / 2;
			const dist = Math.sqrt(xDist * xDist + yDist * yDist);
			return Math.sin(dist * 0.02 + f * 0.1) * params.amp;
		case 'orbit':
			const angle = Math.atan2(y - height / 2, x - width / 2);
			return angle + f * 0.1 * params.amp;
		default: // 'noise'
			return random.noise3D(x, y, f, params.freq) * Math.PI * params.amp;
	}
};

let glyphInputs = {
	glyph1: null,
	glyph2: null,
	glyph3: null,
	glyph4: null
};

// Function to randomize glyphs
const randomizeGlyphs = () => {
	const shuffled = [...availableGlyphs].sort(() => Math.random() - 0.5);
	params.glyph1 = shuffled[0];
	params.glyph2 = shuffled[1];
	params.glyph3 = shuffled[2];
	params.glyph4 = shuffled[3];

	glyphInputs.glyph1.refresh();
	glyphInputs.glyph2.refresh();
	glyphInputs.glyph3.refresh();
	glyphInputs.glyph4.refresh();

	manager.render();
};

// Color cycling function
const getCycledColor = (frame) => {
	if (!params.colorCycling) return params.color;
	const hue = (frame * params.colorCycleSpeed) % 360;
	return `hsl(${hue}, 100%, 50%)`;
};

// Pulse effect function
const getPulseSize = (frame, baseSize) => {
	if (!params.pulseEffect) return baseSize;
	const pulse = Math.sin(frame * params.pulseSpeed * 0.1) * params.pulseStrength;
	return baseSize * (1 + pulse);
};

let manager;
let text = params.text;
let fontSize = params.fontSize;
let fontFamily = params.fontFamily;
let textInput;

const typeCanvas = document.createElement('canvas');
const typeContext = typeCanvas.getContext('2d', { willReadFrequently: true });

const sketch = ({ context, width, height }) => {
	const cell = 25;
	const cols = Math.floor(width / cell);
	const rows = Math.floor(height / cell);
	const numCells = cols * rows;

	typeCanvas.width = cols;
	typeCanvas.height = rows;

	return ({ context, width, height, frame }) => {
		const f = params.animate ? frame : params.frame;

		typeContext.fillStyle = 'black';
		typeContext.fillRect(0, 0, cols, rows);

		fontSize = cols * 0.8;

		typeContext.fillStyle = params.color;
		typeContext.font = `${params.fontSize}px ${params.fontFamily}`;
		typeContext.textBaseline = 'top';

		const metrics = typeContext.measureText(params.text);
		const mx = metrics.actualBoundingBoxLeft * -1;
		const my = metrics.actualBoundingBoxAscent * -1;
		const mw = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
		const mh = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

		const tx = (cols - mw) * 0.5 - mx;
		const ty = (rows - mh) * 0.5 - my;

		typeContext.save();
		typeContext.translate(tx, ty);
		typeContext.beginPath();
		typeContext.rect(mx, my, mw, mh);
		typeContext.stroke();
		typeContext.fillText(params.text, 0, 0);
		typeContext.restore();

		const typeData = typeContext.getImageData(0, 0, cols, rows).data;

		context.fillStyle = params.backgroundColor;
		context.fillRect(0, 0, width, height);

		context.textBaseline = 'middle';
		context.textAlign = 'center';

		for (let i = 0; i < numCells; i++) {
			const col = i % cols;
			const row = Math.floor(i / cols);

			const x = col * cell;
			const y = row * cell;

			const r = typeData[i * 4 + 0];
			const g = typeData[i * 4 + 1];
			const b = typeData[i * 4 + 2];
			const a = typeData[i * 4 + 3];

			const angle = getAnimationAngle(x, y, f, width, height);

			const glyph = getGlyph(r);

			// Apply pulse effect to font size
			const baseSize = cell * params.baseSize;
			const pulsedSize = getPulseSize(f, baseSize);

			context.font = `${pulsedSize}px ${params.fontFamily}`;
			if (Math.random() < params.randomSize)
				context.font = `${cell * params.maxSize}px ${params.fontFamily}`;

			// Apply color cycling
			context.fillStyle = getCycledColor(f);

			context.save();
			context.translate(x, y);
			context.translate(cell * 0.5, cell * 0.5);
			context.rotate(angle);

			context.fillText(glyph, 0, 0);

			context.restore();
		}
	};
};

const getGlyph = (v) => {
	if (v < 50) return '';
	if (v < 100) return params.glyph1;
	if (v < 150) return params.glyph2;
	if (v < 200) return params.glyph3;
	return params.glyph4;
};

const onKeyUp = (e) => {
	if (params.keyboardInput) {
		params.text = e.key.toUpperCase();
		textInput.refresh();
		manager.render();
	}
};

document.addEventListener('keyup', onKeyUp);

const createPane = () => {
	const pane = new Tweakpane.Pane();
	let folder;

	folder = pane.addFolder({ title: 'Text' });
	textInput = folder.addInput(params, 'text');
	const keyboardToggle = folder.addInput(params, 'keyboardInput', { label: 'Enable Keyboard' });

	keyboardToggle.on('change', (ev) => {
		textInput.disabled = ev.value;
	});

	folder.addInput(params, 'fontSize', { min: 10, max: 2000 });
	folder.addInput(params, 'fontFamily', {
		options: {
			'Sans Serif': 'sans-serif',
			'Serif': 'serif',
			'Monospace': 'monospace'
		}
	});

	folder = pane.addFolder({ title: 'Grid' });
	folder.addInput(params, 'randomSize', { min: 0, max: 1 });
	folder.addInput(params, 'baseSize', { min: 1, max: 5 });
	folder.addInput(params, 'maxSize', { min: 3, max: 12 });

	folder = pane.addFolder({ title: 'Color' });
	folder.addInput(params, 'backgroundColor', {
		options: {
			'Black': 'rgba(0, 0, 0, 1)',
			'White': 'rgba(255, 255, 255, 1)',
			'Blue': 'rgba(0, 0, 255, 1)',
			'Red': 'rgba(255, 0, 0, 1)'
		}
	});
	folder.addInput(params, 'color', {
		options: {
			'Red': 'rgba(255, 0, 0, 1)',
			'White': 'rgba(255, 255, 255, 1)',
			'Blue': 'rgba(0, 0, 255, 1)',
			'Green': 'rgba(0, 255, 0, 1)'
		}
	});

	// New color cycling controls
	folder.addInput(params, 'colorCycling');
	folder.addInput(params, 'colorCycleSpeed', { min: 0.1, max: 2 });

	folder = pane.addFolder({ title: 'Animation' });
	const animateControl = folder.addInput(params, 'animate');
	folder.addInput(params, 'pattern', {
		options: {
			'Noise': 'noise',
			'Wave': 'wave',
			'Spiral': 'spiral',
			'Ripple': 'ripple',
			'Orbit': 'orbit'
		}
	});
	folder.addInput(params, 'freq', { min: -0.01, max: 0.01 });
	folder.addInput(params, 'amp', { min: 0, max: 1 });
	folder.addInput(params, 'frame', { min: 0, max: 999 });

	// New pulse effect controls
	folder.addInput(params, 'pulseEffect');
	folder.addInput(params, 'pulseSpeed', { min: 0.1, max: 2 });
	folder.addInput(params, 'pulseStrength', { min: 0.1, max: 1 });

	folder = pane.addFolder({ title: 'Glyphs' });
	glyphInputs.glyph1 = folder.addInput(params, 'glyph1', { label: 'Glyph 1 (Outer Edge)' });
	glyphInputs.glyph2 = folder.addInput(params, 'glyph2', { label: 'Glyph 2 (Mid Outer)' });
	glyphInputs.glyph3 = folder.addInput(params, 'glyph3', { label: 'Glyph 3 (Mid Inner)' });
	glyphInputs.glyph4 = folder.addInput(params, 'glyph4', { label: 'Glyph 4 (Inner)' });

	folder.addButton({ title: 'Randomize Glyphs' }).on('click', () => {
		randomizeGlyphs();
	});

	pane.on('change', (ev) => {
		manager.render();
	});

	textInput.disabled = params.keyboardInput;

	return () => {
		if (manager) {
			animateControl.on('change', (ev) => {
				if (ev.value) {
					manager.play();
				} else {
					manager.pause();
				}
			});
		}
	};
};

const start = async () => {
	const setupAnimationControls = createPane();
	manager = await canvasSketch(sketch, settings);
	setupAnimationControls();
};

start();