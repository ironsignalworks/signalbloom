# 🎵 Signal Bloom

An audio-reactive 3D visualizer built with Three.js and Web Audio API.

![Signal Bloom](public/icon.svg)

## Features

- **8 Visualization Modes**
  - Sphere - 60k particle sphere with dynamic colors
  - Waveform - Real-time frequency waveform
  - Bars - 128-bar circular spectrum analyzer
  - Tunnel - Speed-reactive particle tunnel
  - Galaxy - 5-armed spiral galaxy
  - Fractals - Recursive 3D geometric shapes
  - Texture - Procedural animated surface
  - Water - Wave simulation with shimmer

- **Audio Input**
  - Microphone support with recording indicator
  - Audio file upload (MP3, WAV, etc.)
  - Play/Pause controls
  - Volume control

- **Interactive**
  - Orbital camera controls
  - Auto-rotation
  - Adjustable gain/sensitivity
  - FPS counter
  - Fullscreen mode (Press F)
  - Reset functionality

- **Professional UI**
  - Minimal, sleek design
  - Animated recording indicator
  - Fullscreen mode
  - About modal with instructions
  - Built by Iron Signal Works

## Tech Stack

- **Three.js** - 3D rendering
- **Web Audio API** - Real-time audio analysis
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Post-processing** - Bloom effects
- **Custom Shaders** - GPU-accelerated animations

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Usage

1. Click **Mic** to enable microphone input (shows ● REC indicator), or
2. Click **File** to upload an audio file
3. Use **Mode** button to cycle through 8 visualizations
4. Adjust **Gain** for sensitivity and **Vol** for playback volume
5. Press **F** for fullscreen mode
6. Click **Reset** to reset camera and audio position
7. Click **?** for help

## Controls

- **Click + Drag** - Rotate camera
- **Scroll** - Zoom in/out
- **F Key** - Toggle fullscreen mode
- **ESC** - Exit fullscreen or close modal
- **Space** - Play/Pause (when file loaded)

## Visualization Modes

### 1. Sphere (60k particles)
Massive particle sphere with dynamic color shifting and audio-reactive expansion.

### 2. Waveform
Real-time frequency waveform display showing audio spectrum.

### 3. Bars (128 bars)
Circular spectrum analyzer with rainbow colors.

### 4. Tunnel
Speed-reactive particle tunnel that zooms based on audio.

### 5. Galaxy (80k particles)
5-armed spiral galaxy with color gradients.

### 6. Fractals
Recursive 3D octahedron structures with wireframe rendering.

### 7. Texture
Procedural animated surface with wave displacement and shifting colors.

### 8. Water
Realistic wave simulation with 3-layer waves, shimmer effects, and foam.

## Button Behavior

### Microphone Button
- **Click once**: Start microphone → Shows ● REC (pulsing red dot)
- **Click again**: Stop microphone → Back to "Mic"
- When active: File button is disabled

### File Button
- **Click**: Opens file selector
- **After loading**: Shows filename, stops mic if active
- When active: Mic button is disabled

### Play/Pause Button
- Only visible when audio file is loaded
- Toggle between play (▶) and pause (⏸) states
- Independent of mic/file switching

### Reset Button
- Stops all audio
- Resets camera to default position
- Clears all states
- Re-enables all buttons

## Generating Images

To generate the favicon and social card images:

1. Open `public/generate-images.html` in your browser
2. Click the download buttons to generate:
   - `card.png` (1200x630) - Social media preview card
   - `favicon-32x32.png` - 32x32 favicon
   - `favicon-16x16.png` - 16x16 favicon
3. Save files to `/public` folder

Alternatively, see `public/IMAGE-GENERATION-GUIDE.md` for other methods.

## Project Structure

```
signal-bloom/
├── public/
│   ├── favicon.svg           # SVG favicon (works everywhere)
│   ├── favicon-32x32.png     # PNG favicon (32x32)
│   ├── favicon-16x16.png     # PNG favicon (16x16)
│   ├── card.png              # Social media card (1200x630)
│   ├── icon.svg              # Small icon for footer
│   └── generate-images.html  # Tool to generate PNG images
├── src/
│   ├── main.ts               # Entry point & UI logic
│   ├── scene.ts              # Three.js scene & 8 visualizations
│   ├── audio.ts              # Web Audio API handling
│   └── styles.css            # Minimal UI styles
├── index.html                # Main HTML
└── package.json
```

## Browser Support

- Modern browsers with WebGL support
- Web Audio API support required
- Microphone requires HTTPS (or localhost)
- Recommended: Chrome, Firefox, Edge, Safari (latest versions)

## Performance

- **FPS Target**: 60 FPS on modern hardware
- **Particle Counts**: 
  - Sphere: 60,000 particles
  - Galaxy: 80,000 particles
  - Tunnel: 30,000 particles
- **Optimized**: Fractals reduced to 3 levels for smooth performance

## Troubleshooting

### Texture/Water Not Visible
- Hard refresh (Ctrl+Shift+R)
- Check browser console for WebGL errors
- Try different browser
- These modes require WebGL support

### Microphone Not Working
- Grant microphone permissions
- Use HTTPS or localhost
- Check browser settings

### Low FPS
- Reduce browser window size
- Close other tabs
- Update graphics drivers

## Credits

Built by [Iron Signal Works](https://ironsignalworks.com)

## License

MIT
