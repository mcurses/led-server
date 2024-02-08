const express = require('express');
const cors = require('cors');
const ws281x = require('rpi-ws281x-native');

const LED_COUNT = 15; // Number of LEDs
const app = express();
const port = 80;

// Initialize LED state
let ledStates = new Array(LED_COUNT).fill({r: 0, g: 0, b: 0});

// Initialize ws281x
ws281x.init({ leds: LED_COUNT });

// Middleware
app.use(cors()); // Use CORS to avoid cross-origin issues
app.use(express.json()); // For parsing application/json

// Set LED color
app.get('/led', (req, res) => {
    const index = parseInt(req.query.index);
    const color = req.query.color; // Expecting a hex color (e.g., "ff0000" for red)
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 4), 16);
    const b = parseInt(color.substr(4, 6), 16);

    // Check if index is within the range
    if (index < 0 || index >= LED_COUNT) {
        return res.status(400).send('Index out of range');
    }

    // Update LED state
    ledStates[index] = { r, g, b };
    const pixelData = new Uint32Array(LED_COUNT);

    // Update LED colors based on state
    // for (let i = 0; i < LED_COUNT; i++) {
    //     pixelData[i] = ws281x.color(ledStates[i].r, ledStates[i].g, ledStates[i].b);
    // }

    // Apply changes
    // ws281x.render(pixelData);

    res.send(`LED at index ${index} set to color #${color}`);
});

// Get LED states
app.get('/ledState', (req, res) => {
    res.json(ledStates.map((state, index) => ({
        index: index,
        color: `#${state.r.toString(16).padStart(2, '0')}${state.g.toString(16).padStart(2, '0')}${state.b.toString(16).padStart(2, '0')}`
    })));
});

// Handle not found
app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!");
});

// Start server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

// Clean up on exit
process.on('SIGINT', () => {
    ws281x.reset();
    process.exit();
});

