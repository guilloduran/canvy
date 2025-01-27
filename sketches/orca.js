const canvasSketch = require("canvas-sketch");
const random = require("canvas-sketch-util/random");
const math = require("canvas-sketch-util/math");
const Tweakpane = require("tweakpane");

// Global variables
let manager;
let renderedCanvas = null;

// Settings for canvas-sketch
const settings = {
    dimensions: [1080, 1080 - 56],
    animate: true,
};

// Parameters for Tweakpane and sketch
const params = {
    // Grid Settings
    cols: 10,
    rows: 10,
    scaleMin: 1,
    scaleMax: 30,
    lineCap: "butt",

    // Noise Settings
    freq: 0.001,
    amp: 0.2,
    frame: 0,
    animate: true,

    // Stroke Settings
    lines: "rgb(255, 255, 255)",
    gradient: false,
    gradientA: "rgb(0, 0, 0)",
    gradientB: "rgb(255, 255, 255)",
    gradientSlider: 0,

    // Background Settings
    background: "rgb(0, 0, 0)",
    radialGradient: false,
    bgGradientA: "rgb(0, 0, 0)",
    bgGradientB: "rgb(255, 255, 255)",
    custom: false,
    x0: 0,
    y0: 0,
    r0: 0,
    x1: 0,
    y1: 0,
    r1: 500,
};

// Sketch function
const sketch = ({ canvas }) => {
    // Assign the canvas to renderedCanvas for export
    renderedCanvas = canvas;
    console.log('Canvas assigned to renderedCanvas:', renderedCanvas);

    return ({ context, width, height, frame }) => {
        const cols = params.cols;
        const rows = params.rows;
        const numCells = cols * rows;

        const gridw = width * 0.8;
        const gridh = height * 0.8;
        const cellw = gridw / cols;
        const cellh = gridh / rows;
        const margx = (width - gridw) * 0.5;
        const margy = (height - gridh) * 0.5;

        // Create background gradients
        const bgGradient = context.createRadialGradient(
            width / 2,
            height / 2,
            0,
            width / 2,
            height / 2,
            width
        );
        bgGradient.addColorStop(0, params.bgGradientA);
        bgGradient.addColorStop(1, params.bgGradientB);

        const bgGradientCustom = context.createRadialGradient(
            params.x0,
            params.y0,
            params.r0,
            params.x1,
            params.y1,
            params.r1
        );
        bgGradientCustom.addColorStop(0, params.bgGradientA);
        bgGradientCustom.addColorStop(1, params.bgGradientB);

        // Set background style
        params.radialGradient
            ? (context.fillStyle = params.custom ? bgGradientCustom : bgGradient)
            : (context.fillStyle = params.background);

        context.fillRect(0, 0, width, height);

        // Draw grid lines
        for (let i = 0; i < numCells; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);

            const x = col * cellw;
            const y = row * cellh;
            const w = cellw * 0.8;

            const f = params.animate ? frame : params.frame;

            // Generate noise
            const n = random.noise3D(x, y, f * 10, params.freq);

            const angle = n * Math.PI * params.amp;
            const scale = math.mapRange(n, -1, 1, params.scaleMin, params.scaleMax);

            context.save();
            context.translate(x, y);
            context.translate(margx, margy);
            context.translate(cellw * 0.5, cellh * 0.5);
            context.rotate(angle);

            // Create gradient stroke if enabled
            const strokeGradient = context.createLinearGradient(
                w * -0.5,
                0,
                params.gradientSlider,
                0
            );
            strokeGradient.addColorStop(0.2, params.gradientA);
            strokeGradient.addColorStop(0.8, params.gradientB);

            context.strokeStyle = params.gradient ? strokeGradient : params.lines;
            context.lineWidth = scale;
            context.lineCap = params.lineCap;

            context.beginPath();
            context.moveTo(w * -0.5, 0);
            context.lineTo(w * 0.5, 0);
            context.stroke();

            context.restore();
        }
    };
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

// Function to create Tweakpane UI
const createPane = () => {
    const pane = new Tweakpane.Pane();

    // Grid Settings
    const gridFolder = pane.addFolder({ title: "Grid Settings" });
    gridFolder.addInput(params, "lineCap", {
        options: { butt: "butt", round: "round", square: "square" },
        label: "Line Cap",
    });

    gridFolder.addInput(params, "cols", { min: 2, max: 50, step: 1, label: "Columns" });
    gridFolder.addInput(params, "rows", { min: 2, max: 50, step: 1, label: "Rows" });
    gridFolder.addInput(params, "scaleMin", { min: 1, max: 100, label: "Scale Min" });
    gridFolder.addInput(params, "scaleMax", { min: 1, max: 100, label: "Scale Max" });

    // Noise Settings
    const noiseFolder = pane.addFolder({ title: "Noise Settings" });
    noiseFolder.addInput(params, "freq", { min: -0.01, max: 0.01, label: "Frequency" });
    noiseFolder.addInput(params, "amp", { min: 0, max: 1, label: "Amplitude" });
    noiseFolder.addInput(params, "animate", { label: "Animate" });
    noiseFolder.addInput(params, "frame", { min: 0, max: 999, label: "Frame" });

    // Stroke Settings
    const strokeFolder = pane.addFolder({ title: "Stroke Settings" });
    strokeFolder.addInput(params, "lines", { label: "Lines" });
    strokeFolder.addInput(params, "gradient", { label: "Gradient" });
    strokeFolder.addInput(params, "gradientA", { label: "Gradient A" });
    strokeFolder.addInput(params, "gradientB", { label: "Gradient B" });
    strokeFolder.addInput(params, "gradientSlider", { min: 1, max: 100, label: "Gradient Slider" });

    // Background Settings
    const bgFolder = pane.addFolder({ title: "Background Settings" });
    bgFolder.addInput(params, "background", { label: "Background Color" });
    bgFolder.addInput(params, "radialGradient", { label: "Radial Gradient" });
    bgFolder.addInput(params, "bgGradientA", { label: "BG Gradient A" });
    bgFolder.addInput(params, "bgGradientB", { label: "BG Gradient B" });
    bgFolder.addInput(params, "custom", { label: "Custom" });
    bgFolder.addInput(params, "x0", { min: 0, max: 999, label: "X0" });
    bgFolder.addInput(params, "y0", { min: 0, max: 999, label: "Y0" });
    bgFolder.addInput(params, "r0", { min: 0, max: 999, label: "R0" });
    bgFolder.addInput(params, "x1", { min: 0, max: 999, label: "X1" });
    bgFolder.addInput(params, "y1", { min: 0, max: 999, label: "Y1" });
    bgFolder.addInput(params, "r1", { min: 0, max: 999, label: "R1" });

    // Export Settings
    const exportFolder = pane.addFolder({ title: "Export" });
    exportFolder
        .addButton({ title: "Export PNG" })
        .on("click", () => {
            exportPNG();
        });

    // Optional: Refresh Render on Change
    pane.on("change", () => {
        if (manager && manager.render) {
            manager.render();
        }
    });
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