# ![Signal Bloom](public/icon.svg) Signal Bloom

An audio-reactive 3D visualizer built with Three.js and Web Audio API.

## Features

- **9 Visualization Modes**
  - Sphere - 60k particle sphere with dynamic colors
  - Waveform - Real-time frequency waveform
  - Bars - 128-bar circular spectrum analyzer
  - Tunnel - Speed-reactive particle tunnel
  - Galaxy - 5-armed spiral galaxy
  - Fractals - Recursive 3D geometric shapes
  - Water - Volumetric underwater atmosphere surrounding the viewer
  - Texture - Immersive Voronoi atmosphere with flowing colors
  - Melt - Enveloping liquid distortion environment

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
3. Use **Mode** button to cycle through 9 visualizations
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

### 7. Water (WebGL Shader)
Atmospheric volumetric fluid simulation rendered as a surrounding sphere. Gentle flowing wave motion with subtle lighting and soft emissive glow that creates an immersive underwater ambiance.

### 8. Texture (WebGL Shader)
Volumetric Voronoi cell atmosphere that surrounds the viewer. Breathing color gradients flow continuously across the spherical surface, creating an enveloping abstract environment.

### 9. Melt (WebGL Shader)
Atmospheric liquid distortion rendered volumetrically around the camera. Smooth flowing heat effects with gentle chromatic aberration create an immersive molten environment.

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

## Credits

Built by [Iron Signal Works](https://ironsignalworks.com)

## License

MIT

## Deployment

**Note**: Microphone works on `localhost` without HTTPS, but requires HTTPS on deployed sites.
