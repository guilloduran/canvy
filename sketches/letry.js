const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const math = require("canvas-sketch-util/math");
const Tweakpane = require("tweakpane");

// Global variables
let manager;
let renderedCanvas = null;

// Settings for canvas-sketch
const settings = {
	dimensions: [1080, 1080],
	animate: true,
        fps: 60
};

// Parameters for Tweakpane and sketch
const params = {
	// Text Settings
	text: 'B',
	fontSize: 50,
	fontFamily: 'sans-serif',
	keyboardInput: true,

	// Grid Settings
	randomSize: 0.1,
	baseSize: 2,
	maxSize: 6,

	// Colors
	backgroundColor: 'rgba(0, 0, 0, 1)',
	color: '#FF0000',
	colorCycling: false,
	colorCycleSpeed: 0.5,

	// Animation Settings
	animate: true,
	freq: 0.001,
	amp: 0.2,
	frame: 0,
	pattern: 'noise',
	pulseEffect: false,
	pulseSpeed: 0.5,
	pulseStrength: 0.3,

	// Glyphs
	glyph1: '.',
	glyph2: '-',
	glyph3: '+',
	glyph4: '_',
};

// Available glyphs for randomization
const availableGlyphs = '._=-+/\\|~!@#$%^&*(){}[]?<>'.split('');

// Initialize glyph inputs for Tweakpane
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

// Function to get cycled color
const getCycledColor = (frame) => {
	if (!params.colorCycling) return params.color;
	const hue = (frame * params.colorCycleSpeed) % 360;
	return `hsl(${hue}, 100%, 50%)`;
};

// Function to get pulse size
const getPulseSize = (frame, baseSize) => {
	if (!params.pulseEffect) return baseSize;
	const pulse = Math.sin(frame * params.pulseSpeed * 0.1) * params.pulseStrength;
	return baseSize * (1 + pulse);
};

// Function to determine glyph based on red channel
const getGlyph = (v) => {
	if (v < 50) return '';
	if (v < 100) return params.glyph1;
	if (v < 150) return params.glyph2;
	if (v < 200) return params.glyph3;
	return params.glyph4;
};

// Function to calculate animation angle
const getAnimationAngle = (x, y, frame, width, height) => {
        const centerX = width / 2;
        const centerY = height / 2;
        const dx = x - centerX;
        const dy = y - centerY;

        let angle = Math.atan2(dy, dx);
        const dist = Math.sqrt(dx * dx + dy * dy);

        switch (params.pattern) {
                case 'noise':
                        angle += random.noise3D(x, y, frame, params.freq) * Math.PI * params.amp;
                        break;
                case 'wave':
                        angle += Math.sin((x + y) * params.freq + frame * params.freq) * params.amp;
                        break;
                case 'spiral':
                        angle += (dist * params.freq + frame * params.freq) * params.amp;
                        break;
                case 'ripple':
                        angle += Math.sin(dist * params.freq - frame * params.freq) * params.amp;
                        break;
                case 'orbit':
                        angle = frame * params.freq + Math.atan2(dy, dx);
                        break;
                default:
                        break;
        }

        const rotationSpeed = 0.01;
        return angle + frame * rotationSpeed;
};

// Sketch function
const sketch = ({ canvas }) => {
	// Assign the canvas to renderedCanvas for export
	renderedCanvas = canvas;
	console.log('Canvas assigned to renderedCanvas:', renderedCanvas);

	const cell = 25;
	const cols = Math.floor(renderedCanvas.width / cell);
	const rows = Math.floor(renderedCanvas.height / cell);
	const numCells = cols * rows;

	const typeCanvas = document.createElement('canvas');
	const typeContext = typeCanvas.getContext('2d', { willReadFrequently: true });
	typeCanvas.width = cols;
	typeCanvas.height = rows;

	return ({ context, width, height, frame }) => {
		const f = params.animate ? frame : params.frame;

		typeContext.fillStyle = 'black';
		typeContext.fillRect(0, 0, cols, rows);

		const fontSize = cols * 0.8;
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

// Function to handle keyboard input
const onKeyUp = (e) => {
	if (params.keyboardInput) {
		// Only update if a single character is pressed
		if (e.key.length === 1) {
			params.text = e.key.toUpperCase();
			textInput.refresh();
			manager.render();
		}
	}
};
document.addEventListener('keyup', onKeyUp);

// Function to create Tweakpane UI
let textInput; // Declare textInput globally to access in onKeyUp

const createPane = () => {
	const pane = new Tweakpane.Pane();

	// General Settings
	const generalFolder = pane.addFolder({ title: "General" });
	generalFolder.addInput(params, 'text', { label: 'Text' });
	const keyboardToggle = generalFolder.addInput(params, 'keyboardInput', { label: 'Keyboard' });

	keyboardToggle.on('change', (ev) => {
		if (textInput) {
			textInput.disabled = ev.value;
		}
	});

	generalFolder.addInput(params, 'fontSize', { min: 10, max: 200, label: 'Font Size' });
	generalFolder.addInput(params, 'fontFamily', {
		options: {
			'Sans Serif': 'sans-serif',
			'Serif': 'serif',
			'Monospace': 'monospace'
		},
		label: 'Font Family'
	});

	// Grid Settings
	const gridFolder = pane.addFolder({ title: "Grid" });
	gridFolder.addInput(params, 'randomSize', { min: 0, max: 1, step: 0.01, label: 'Random Size' });
	gridFolder.addInput(params, 'baseSize', { min: 1, max: 5, step: 0.1, label: 'Base Size' });
	gridFolder.addInput(params, 'maxSize', { min: 3, max: 12, step: 0.5, label: 'Max Size' });

	// Colors
	const colorFolder = pane.addFolder({ title: "Colors" });
	colorFolder.addInput(params, 'backgroundColor', {
		label: 'Background',
		view: 'color'
	});
	colorFolder.addInput(params, 'color', {
		label: 'Color',
		view: 'color'
	});

	// Color Effects
	colorFolder.addInput(params, 'colorCycling', { label: 'Color Cycling' });
	colorFolder.addInput(params, 'colorCycleSpeed', { min: 0.1, max: 2, step: 0.1, label: 'Cycle Speed' });

	// Animation Settings
	const animationFolder = pane.addFolder({ title: "Animation" });
	const animateControl = animationFolder.addInput(params, 'animate', { label: 'Animate' });
        animationFolder.addInput(params, 'pattern', {
                label: 'Pattern',
                options: {
                        'Noise': 'noise',
                        'Wave': 'wave',
                        'Spiral': 'spiral',
                        'Ripple': 'ripple',
                        'Orbit': 'orbit'
                }
        }).on('change', () => {
                if (manager && manager.render) {
                        manager.render();
                }
        });
	animationFolder.addInput(params, 'freq', { min: -0.01, max: 0.01, step: 0.0001, label: 'Frequency' });
	animationFolder.addInput(params, 'amp', { min: 0, max: 1, step: 0.01, label: 'Amplitude' });
	animationFolder.addInput(params, 'frame', { min: 0, max: 999, step: 1, label: 'Frame' });

	// Animation Effects
	animationFolder.addInput(params, 'pulseEffect', { label: 'Pulse Effect' });
	animationFolder.addInput(params, 'pulseSpeed', { min: 0.1, max: 2, step: 0.1, label: 'Pulse Speed' });
	animationFolder.addInput(params, 'pulseStrength', { min: 0.1, max: 1, step: 0.1, label: 'Pulse Strength' });

	// Glyphs Settings
	const glyphFolder = pane.addFolder({ title: "Glyphs" });
	glyphInputs.glyph1 = glyphFolder.addInput(params, 'glyph1', { label: 'Glyph 1' });
	glyphInputs.glyph2 = glyphFolder.addInput(params, 'glyph2', { label: 'Glyph 2' });
	glyphInputs.glyph3 = glyphFolder.addInput(params, 'glyph3', { label: 'Glyph 3' });
	glyphInputs.glyph4 = glyphFolder.addInput(params, 'glyph4', { label: 'Glyph 4' });

	glyphFolder.addButton({ title: 'Randomize' }).on('click', () => {
		randomizeGlyphs();
	});

	// Export Settings
	const exportFolder = pane.addFolder({ title: "Export" });
	exportFolder
		.addButton({ title: "Export PNG" })
		.on("click", () => {
			exportPNG();
		});


	// Optional: Refresh Render on Change
	pane.on('change', () => {
		if (manager && manager.render) {
			manager.render();
		}
	});

	// Handle Animate Control to play/pause the sketch
	animateControl.on('change', (ev) => {
		if (ev.value) {
			manager.play();
		} else {
			manager.pause();
		}
	});
};

// Function to export the canvas as PNG
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

// Async function to initialize canvasSketch and Tweakpane
const start = async () => {
	try {
		// Initialize canvasSketch and assign manager
		manager = await canvasSketch(sketch, settings);
		console.log('CanvasSketch Manager initialized:', manager);

		// Verify renderedCanvas
		if (!renderedCanvas) {
			console.error('renderedCanvas is undefined.');
			return;
		}

		console.log('Canvas element:', renderedCanvas);

		// Create Tweakpane UI
		createPane();

		// Add keydown listener for CTRL+S or CMD+S
		window.addEventListener('keydown', (event) => {
			const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
			const isInputFocused = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable;

			if (isInputFocused) {
				// Don't trigger export if the user is typing in an input field
				return;
			}

			if (
				(isMac && event.metaKey && event.key.toLowerCase() === 's') ||
				(!isMac && event.ctrlKey && event.key.toLowerCase() === 's')
			) {
				event.preventDefault();
				exportPNG();
			}
		});

		console.log('Initialization complete.');
	} catch (error) {
		console.error('Error initializing canvasSketch:', error);
	}
};

// Start the application
start();