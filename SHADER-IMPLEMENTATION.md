# WebGL Shader Implementation Guide

## Overview

This document describes the integration of three advanced WebGL shader-based visualization modes into Signal Bloom: **Water**, **Texture**, and **Melt**. Each shader incorporates techniques from professional three.js examples.

## Architecture

### File Structure
```
src/
??? shaders.ts          # Shader definitions and helper functions
??? scene.ts            # Scene management and mode switching
??? main.ts             # Main application logic
```

### Integration Pattern

Following the three.js best practices you provided, we used:

1. **ShaderMaterial** instead of RawShaderMaterial (automatically provides projection/modelView matrices)
2. **Full-screen quad** using PlaneGeometry(4, 4) positioned at z=0
3. **Shared uniforms** system with `uTime`, `uLevel`, and `uResolution`
4. **WebGL1-compatible syntax** (no `#version 300 es`, using `varying`/`attribute`)

## Shader Modes

### 1. Water Shader (Raging Sea Technique)

**Visual Effect**: Advanced fluid simulation with wave elevation, normal computation, and realistic lighting

**Inspiration**: Based on three.js "Raging Sea" example using TSL/WebGPU techniques adapted for WebGL1

**Key Features**:
- **Procedural Wave Elevation**: Large waves using sine functions + small waves using iterative noise
- **Normal Computation**: Calculates surface normals from neighboring wave elevations for realistic lighting
- **Multi-layer Waves**: Combines 3 noise layers with different frequencies and amplitudes
- **Emissive Peaks**: Wave crests glow using elevation remapping
- **Audio Reactivity**: Wave speed, frequency, and amplitude all respond to audio levels
- **Dynamic Lighting**: Diffuse lighting based on computed normals
- **Depth-based Coloring**: Deep blue in troughs, cyan on surface, white foam on peaks

**Technical Implementation**:
```glsl
// Wave elevation function (inspired by raging sea)
float wavesElevation(vec2 position) {
  // Large waves - sine-based
  float elevation = sin(pos.x * freq.x + time * speed) * 
                   sin(pos.y * freq.y + time * speed) * multiplier;
  
  // Small waves - noise-based with iterations
  for(float i = 1.0; i <= 3.0; i++) {
    float wave = snoise(position * frequency * i + time);
    elevation -= wave / i;  // Decreasing amplitude
  }
  
  return elevation;
}

// Normal computation from neighboring points
vec3 normal = cross(
  normalize(pointA - center),
  normalize(pointB - center)
);

// Emissive glow on peaks
float emissive = pow(max(elevation, 0.0), 3.0);
color += emissiveColor * emissive;
```

**Uniforms**:
- `uTime`: Animation time
- `uLevel`: Audio level controls wave speed, frequency, and amplitude
- `uResolution`: Screen dimensions

### 2. Texture Shader (Instancing Technique)

**Visual Effect**: Procedural Voronoi cells with dynamic color transitions and wave-based propagation

**Inspiration**: Based on three.js "Instancing Dynamic" example with TWEEN-style color cycling and distance-based wave propagation

**Key Features**:
- **Voronoi Tessellation**: Procedural cell generation with animated movement
- **Wave-based Color Propagation**: Colors spread outward from center like the instancing example
- **TWEEN-style Transitions**: Smooth interpolation between color palettes (cyan ? yellow ? magenta)
- **Per-cell Animation**: Each cell has unique hash-based timing
- **Audio-reactive Scaling**: Entire pattern scales and pulses with audio
- **Edge Highlighting**: Bright white edges between cells
- **Distance-based Phasing**: Color transitions propagate based on distance from center

**Technical Implementation**:
```glsl
// Wave propagation (like instancing color spread)
float centerDist = length(vUv - 0.5);
float wavePhase = fract(uTime * 0.3 - centerDist * 3.0);

// Smooth color transitions between palettes
vec3 currentPalette = color1;
vec3 nextPalette = color2;

// Cycle through 3 color schemes
float timePhase = fract(uTime * 0.2);
if(timePhase < 0.33) {
  currentPalette = color1; nextPalette = color2;
} else if(timePhase < 0.66) {
  currentPalette = color2; nextPalette = color3;
} else {
  currentPalette = color3; nextPalette = color1;
}

// Smooth interpolation at wave boundary
float waveMix = smoothstep(0.45, 0.55, wavePhase);
cellColor = mix(baseColor * currentPalette, 
                baseColor * nextPalette, 
                waveMix);
```

**Uniforms**:
- `uTime`: Animation and color cycling time
- `uLevel`: Controls scaling, pulsing, and edge brightness
- `uResolution`: Screen dimensions

### 3. Melt Shader (Depth of Field Technique)

**Visual Effect**: Liquid distortion with vertical dripping, depth-based focus, and heat effects

**Inspiration**: Based on three.js "PostProcessing DOF" example with bokeh and focal distance adapted as a visual effect

**Key Features**:
- **3D Simplex Noise**: Complex 3D noise for realistic liquid flow
- **Multi-layer Distortion**: 3 separate noise layers at different frequencies
- **Vertical Dripping**: Time-based downward flow with audio-reactive speed
- **Depth Simulation**: Uses view-space depth for bokeh-style blurring effect
- **Heat Gradient**: Colors flow from deep red ? orange ? yellow ? magenta
- **Chromatic Aberration**: RGB channel separation on high audio levels
- **Heat Shimmer**: Glow effect on upper regions
- **Edge Glow**: Bright outlines on distortion peaks

**Technical Implementation**:
```glsl
// Multi-layer distortion
float distort1 = snoise(vec3(uv.x * 4.0, uv.y - meltSpeed, time));
float distort2 = snoise(vec3(uv.x * 6.0, uv.y - meltSpeed * 1.5, time));
float distort3 = snoise(vec3(uv.x * 8.0, uv.y - meltSpeed * 0.8, time));

// DoF-style depth effects
float focusDistance = 2.5;
float depthDiff = abs(vDepth - focusDistance);
float bokeh = smoothstep(0.0, 2.0, depthDiff) * (0.3 + uLevel * 0.7);
color *= 1.0 - bokeh * 0.3;  // Darken out-of-focus

// Chromatic aberration on audio peaks
if(uLevel > 0.5) {
  float aberration = (uLevel - 0.5) * 0.01;
  color.r += noise * aberration;
  color.b -= noise * aberration;
}
```

**Uniforms**:
- `uTime`: Animation and drip speed
- `uLevel`: Controls drip intensity, heat glow, and chromatic aberration
- `uResolution`: Screen dimensions

**Additional Varyings**:
- `vDepth`: View-space depth for DoF effect

## Advanced Techniques Used

### From Raging Sea Example (Water Shader)
1. **Wave Elevation Function**: Combines sine-based large waves with noise-based small waves
2. **Normal Computation**: Calculates surface normals by sampling neighboring points
3. **Iterative Noise**: Loops through multiple octaves of noise for detail
4. **Emissive Remapping**: Uses `pow()` and `remap()` for dramatic peak glow
5. **Time-based Animation**: All parameters respond to uniform time

### From Instancing Dynamic Example (Texture Shader)
1. **Distance-based Wave Propagation**: Color transitions spread from center outward
2. **TWEEN-style Color Cycling**: Smooth interpolation between multiple color palettes
3. **Per-instance Variation**: Hash-based unique values for each cell
4. **Smooth Transitions**: Uses `smoothstep()` for wave boundary interpolation
5. **Cyclical Animation**: `fract(time)` creates repeating cycles

### From PostProcessing DOF Example (Melt Shader)
1. **Depth Calculation**: Computes view-space depth in vertex shader
2. **Focal Distance**: Simulates camera focus point
3. **Bokeh Effect**: Blurs areas outside focal range
4. **Depth-based Color**: Modulates color intensity by depth
5. **Chromatic Aberration**: Separates RGB channels for distortion effect

## Performance Characteristics

### Water Shader
- **Complexity**: High (normal computation + multiple noise samples)
- **Noise calls**: ~6 per fragment (3 in main + 3 in normal computation)
- **Math operations**: Heavy (cross products, normalizations, lighting)
- **Expected FPS**: 55-60 on modern hardware
- **Optimization**: Could reduce normal computation samples or iterations

### Texture Shader
- **Complexity**: Medium-High
- **Voronoi iterations**: 9 (3x3 grid per fragment)
- **Color computations**: Multiple mix operations
- **Expected FPS**: 60 on modern hardware
- **Optimization**: Already optimized with 3x3 grid instead of 5x5

### Melt Shader
- **Complexity**: High (3D noise + depth effects)
- **Noise calls**: 5 per fragment (3 distortion + 1 texture + 1 aberration)
- **Special features**: Chromatic aberration only on audio peaks
- **Expected FPS**: 55-60 on modern hardware
- **Optimization**: Conditional chromatic aberration reduces cost when quiet

## Audio Integration

All three shaders respond dynamically to the `uLevel` uniform:

**Water**:
- Wave frequency: `3.0 + uLevel * 2.0`
- Wave speed: `1.25 + uLevel * 1.5`
- Wave amplitude: `0.15 + uLevel * 0.3`
- Emissive intensity: `1.0 + uLevel * 2.0`

**Texture**:
- Pattern scale: `1.0 + uLevel * 2.0`
- Pulse speed: affects cell animation
- Edge brightness: `0.5 + uLevel * 0.5`
- Overall brightness: `1.0 + uLevel * 0.5`

**Melt**:
- Drip speed: `0.3 + uLevel * 0.7`
- Distortion amplitude: `1.0 + uLevel * 2.0`
- Bokeh amount: `0.3 + uLevel * 0.7`
- Chromatic aberration: only when `uLevel > 0.5`

## Technical Notes

### WebGL1 Compatibility

All shaders use WebGL1 syntax for maximum compatibility:
- `varying` instead of `in`/`out`
- `attribute` instead of `in` (vertex shader)
- `gl_FragColor` instead of custom `out` variables
- No `#version 300 es` directive
- `highp float` precision qualifiers

### Shader Uniforms

Uniforms are shared across all shader modes and automatically updated:

```typescript
private uniforms: Uniforms = {
  uTime: { value: 0 },
  uLevel: { value: 0 },
  uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
};

// Updated in render loop
update(level: number) {
  this.uniforms.uTime.value += delta;
  this.uniforms.uLevel.value = smoothedLevel;
}
```

## Future Enhancements

Possible improvements incorporating more three.js techniques:

1. **Render Targets**: Use feedback loops for trailing effects
2. **Multiple Passes**: Separate geometry and post-processing
3. **Frequency Band Integration**: Map different audio frequencies to different visual parameters
4. **Interactive Uniforms**: Mouse position, click events
5. **Particle Integration**: Combine shaders with particle systems
6. **Custom Post-processing**: Add shader-specific bloom or distortion

## Troubleshooting

### Water shader appears flat
- Check that normal computation is working
- Verify lighting direction
- Ensure elevation amplitude is sufficient

### Texture colors not transitioning
- Check `uTime` is incrementing
- Verify color palette array is correct
- Check wave phase calculation

### Melt shader too dark
- Adjust depth focus distance
- Reduce bokeh darkening amount
- Check drip distortion isn't too extreme

### Performance issues
- Reduce noise iterations in water shader
- Decrease Voronoi grid size in texture shader
- Disable chromatic aberration in melt shader
- Lower precision to `mediump float`

## References

- [Three.js Raging Sea Example](https://threejs.org/examples/#webgpu_raging_sea)
- [Three.js Instancing Dynamic Example](https://threejs.org/examples/#webgl_instancing_dynamic)
- [Three.js PostProcessing DoF Example](https://threejs.org/examples/#webgpu_postprocessing_dof)
- [The Book of Shaders](https://thebookofshaders.com/)
- [Inigo Quilez - Voronoi](https://iquilezles.org/articles/voronoise/)
- [Stefan Gustavson - Simplex Noise](https://weber.itn.liu.se/~stegu/simplexnoise/)

## Credits

Shader implementations created for Signal Bloom by adapting advanced three.js techniques (raging sea wave simulation, instancing color transitions, depth-of-field effects) with procedural noise algorithms and audio-reactive parameters.
