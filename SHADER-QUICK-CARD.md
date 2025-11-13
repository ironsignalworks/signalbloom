# Flow-Based Shader Modes - Quick Reference

## ?? WATER (Mode 7)
**Technique**: Volumetric Atmospheric Fluid Simulation

### Visual Features
- ? Flowing wave surface with continuous motion
- ?? Rotating directional lighting
- ?? Gentle emissive undulation
- ?? 4 layers of continuous noise turbulence
- ?? Deep blue atmosphere ? Dim cyan ? Subtle glow

### Audio Response (Flow-based)
- ?? **Flow Direction**: Continuously rotates + audio modulation
- ?? **Turbulence**: Smooth amplitude changes (0.7 ? 1.2)
- ?? **Emissive**: Subtle glow (0.1 ? 0.25 strength)
- ?? **Brightness**: Gentle (0.4 ? 0.6 range)

### Key Effect
Continuous flowing waves with gentle audio-driven energy changes, not rhythmic peaks

---

## ?? TEXTURE (Mode 8)
**Technique**: Volumetric Breathing Voronoi Atmosphere

### Visual Features
- ?? Voronoi cells with circular orbital motion
- ?? Flowing color gradients across entire sphere
- ?? Breathing scale animation (sin wave)
- ? Continuous smooth transitions
- ? Soft edge glow

### Audio Response (Flow-based)
- ?? **Breathe Scale**: Gentle expansion (1.0 ? 1.5)
- ?? **Color Flow**: Continuous gradient shifts
- ?? **Edge Glow**: Subtle (0.2 ? 0.4)
- ?? **Brightness**: Smooth (0.5 ? 0.8)

### Key Effect
Continuous breathing and flowing colors, not discrete wave propagation

---

## ?? MELT (Mode 9)
**Technique**: Volumetric Liquid Flow with Soft Effects

### Visual Features
- ?? Continuous gentle dripping (not abrupt)
- ?? Smooth flowing distortion (3 layers)
- ?? Gradual chromatic aberration fade
- ?? Flowing heat gradient colors
- ? Gentle shimmer and glow

### Audio Response (Flow-based)
- ?? **Viscosity**: Smooth changes (0.5 ? 0.8)
- ?? **Flow Speed**: Constant with gentle modulation
- ?? **Chromatic**: Gradual fade-in (smoothstep 0.4 ? 0.8)
- ?? **Brightness**: Soft (0.6 ? 0.8)

### Key Effect
Continuous flowing liquid, gentle chromatic effects, no harsh drip changes

---

## Comparison Table

| Feature | Water | Texture | Melt |
|---------|-------|---------|------|
| **Rendering** | Volumetric Sphere | Volumetric Sphere | Volumetric Sphere |
| **Geometry** | BackSide (inside) | BackSide (inside) | BackSide (inside) |
| **FPS Target** | 55-60 | 60 | 55-60 |
| **Noise Calls** | 4 layers/frame | 9 voronoi | 3 layers/frame |
| **Transparency** | Fresnel-based | Fresnel-based | Fresnel-based |
| **Motion Style** | Continuous flow | Breathing/flowing | Liquid flow |
| **Audio Style** | Smooth energy | Gentle breathing | Viscosity changes |

---

## Technical Details

### Uniforms (All Modes)
```typescript
uTime: number       // Elapsed time in seconds
uLevel: number      // Audio level 0.0-1.0 (smoothed)
uResolution: vec2   // Screen width x height
```

### Additional Varyings
```glsl
// All shaders
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;           // For atmospheric effects
varying vec3 vWorldPosition;    // For fresnel calculation

// Melt only
varying float vDepth;  // View-space depth
```

---

## Audio Level Response (Flow-based)

### Quiet Audio (uLevel ? 0.0-0.3)
- **Water**: Gentle flow, minimal turbulence, subtle glow
- **Texture**: Small breathing scale, slow color shifts
- **Melt**: Low viscosity, gentle drip, no chromatic

### Medium Audio (uLevel ? 0.3-0.7)
- **Water**: Moderate turbulence, visible gentle waves
- **Texture**: Medium breathing, active color gradients
- **Melt**: Increased viscosity, moderate flow speed

### Loud Audio (uLevel ? 0.7-1.0)
- **Water**: Higher turbulence, brighter subtle glow
- **Texture**: Larger breathing scale, vivid color flow
- **Melt**: High viscosity, gradual chromatic fade-in

---

## Atmospheric Rendering

### Fresnel-based Transparency

All shaders use fresnel to create atmospheric depth:

```glsl
vec3 viewDir = normalize(vWorldPosition - cameraPosition);
float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), power);
float alpha = fresnel * (baseAlpha + uLevel * audioMod);
```

**Effect**:
- Edges of sphere glow more
- Center is more transparent
- Creates volumetric atmosphere
- 360° immersive environment

---

## Performance Notes

### Optimization Tips
1. **Water**: Already optimized with 4 iterations (down from original proposal)
2. **Texture**: 3x3 voronoi grid is optimal for quality/performance
3. **Melt**: Chromatic aberration only when uLevel > 0.4
4. **All**: Using `BackSide` rendering minimizes overdraw

### GPU Load
- **Water**: Medium-High (4 noise iterations + lighting)
- **Texture**: Medium (9 voronoi samples)
- **Melt**: Medium-High (3D noise + conditional chromatic)

### Geometry
- **All modes**: SphereGeometry(2.5, 64, 64) = ~8k triangles
- **Rendering**: Inside faces only (BackSide)
- **Blending**: Additive for volumetric glow

---

## Shader Evolution

### Water
- **Original**: Flat plane, bright colors, rhythmic peaks
- **Flow-based**: Continuous flow direction, smooth turbulence
- **Volumetric**: Surrounding sphere, dark atmospheric colors
- **Current**: Gentle underwater ambiance, 60% darker

### Texture
- **Original**: Flat voronoi, wave propagation
- **Flow-based**: Breathing scale, flowing color gradients
- **Volumetric**: Enveloping sphere atmosphere
- **Current**: Infinite abstract kaleidoscope environment

### Melt
- **Original**: Flat drip effect, discrete color bands
- **Flow-based**: Continuous viscosity, flowing gradients
- **Volumetric**: Molten environment surrounding camera
- **Current**: Smooth liquid atmosphere with soft chromatic

---

## Usage Tips

### When to Use Water
- Ambient music
- Meditation/relaxation
- Continuous drone sounds
- Underwater/oceanic themes

### When to Use Texture
- Electronic soundscapes
- Abstract visualization
- Slow evolving music
- Kaleidoscopic effects

### When to Use Melt
- Experimental/noise music
- Heat/energy themes
- Ethereal atmospheres
- Liquid/molten visuals

---

## Keyboard Shortcuts

Press **Mode** button to cycle through modes:
1. Sphere (rhythmic)
2. Waveform (rhythmic)
3. Bars (rhythmic)
4. Tunnel (rhythmic)
5. Galaxy (rhythmic)
6. Fractals (rhythmic)
7. **Water** ? Flow-based volumetric
8. **Texture** ? Flow-based volumetric
9. **Melt** ? Flow-based volumetric

**Tip**: Modes 1-6 are rhythmic/beat-driven. Modes 7-9 are flow-based atmospheres.

---

## Flow-Based Features

### Water
- Rotating flow direction: `uTime * 0.3 + uLevel * 2.0`
- Continuous turbulence layers
- Smooth lighting rotation
- Gentle emissive undulation

### Texture
- Breathing animation: `sin(uTime * 0.4) * 0.3 + 1.0`
- Circular cell orbits
- Flowing color gradients with sin/cos
- Continuous smooth transitions

### Melt
- Constant flow time: `uTime * 0.4`
- Smooth viscosity: `0.5 + uLevel * 0.3`
- Gradual chromatic fade
- Continuous heat shimmer

---

## Brightness Levels

### Water (Darkest)
- Deep color: RGB(3, 8, 20) - Very dark blue
- Surface: RGB(0, 26, 51) - Dim cyan
- Emissive: RGB(0, 38, 64) - Subtle glow
- Overall: 40-60% brightness

### Texture (Medium)
- Dynamic colors: 30-50% brightness range
- Edge glow: 20-40% on edges
- Atmospheric fade: Fresnel-based

### Melt (Medium-Warm)
- Heat colors: 40-60% brightness
- Flowing gradients
- Soft glow effects

---

Built with flow-based continuous motion for ambient, meditative audio visualization. ???
