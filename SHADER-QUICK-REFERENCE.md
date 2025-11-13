# Quick Shader Reference

## How to Add a New Shader Mode

1. **Define shader in `src/shaders.ts`:**
```typescript
export const myShader = {
  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    precision highp float;
    
    varying vec2 vUv;
    uniform float uTime;
    uniform float uLevel;
    uniform vec2 uResolution;
    
    void main() {
      // Your shader code here
      vec3 color = vec3(vUv, 0.5 + 0.5 * sin(uTime));
      gl_FragColor = vec4(color, 1.0);
    }
  `
};
```

2. **Add mode to type in `src/scene.ts`:**
```typescript
export type VisMode = 'sphere' | 'waveform' | 'bars' | 'tunnel' | 'galaxy' | 'fractals' | 'water' | 'texture' | 'melt' | 'mymode';
```

3. **Create factory method in `src/scene.ts`:**
```typescript
private makeMyShader() {
  const geometry = new THREE.PlaneGeometry(4, 4);
  const material = createShaderMaterial(myShader, this.uniforms);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = 0;
  (mesh as any).isShader = true;
  return mesh;
}
```

4. **Add case to setMode switch in `src/scene.ts`:**
```typescript
case 'mymode':
  this.visualObject = this.makeMyShader();
  break;
```

5. **Add to modes array in `src/main.ts`:**
```typescript
const modes: VisMode[] = ['sphere', 'waveform', 'bars', 'tunnel', 'galaxy', 'fractals', 'water', 'texture', 'melt', 'mymode'];
```

6. **Update documentation in `index.html`:**
```html
<li><strong>MYMODE</strong> - Description of your mode</li>
```

## Available Uniforms

All shaders have access to these uniforms:

```typescript
uniform float uTime;        // Elapsed time in seconds
uniform float uLevel;       // Audio level (0.0 to 1.0, smoothed)
uniform vec2 uResolution;   // Screen width and height in pixels
```

## Common Shader Patterns

### Time-based animation
```glsl
float wave = sin(uTime * speed);
```

### Audio-reactive scaling
```glsl
vec2 uv = vUv * (1.0 + uLevel * 2.0);
```

### Distance from center
```glsl
vec2 center = vec2(0.5, 0.5);
float dist = length(vUv - center);
```

### Color mixing
```glsl
vec3 color1 = vec3(1.0, 0.0, 0.0);  // Red
vec3 color2 = vec3(0.0, 0.0, 1.0);  // Blue
vec3 color = mix(color1, color2, factor);
```

### Smooth transitions
```glsl
float smooth = smoothstep(0.0, 1.0, value);
```

### Circular patterns
```glsl
float angle = atan(uv.y - 0.5, uv.x - 0.5);
float radius = length(uv - 0.5);
```

### Screen-space coordinates
```glsl
vec2 screenUV = gl_FragCoord.xy / uResolution;
```

## Debugging Tips

### 1. Visualize UVs
```glsl
gl_FragColor = vec4(vUv, 0.0, 1.0);
```

### 2. Visualize audio level
```glsl
gl_FragColor = vec4(vec3(uLevel), 1.0);
```

### 3. Visualize time
```glsl
float t = fract(uTime * 0.1);
gl_FragColor = vec4(vec3(t), 1.0);
```

### 4. Check distance
```glsl
float dist = length(vUv - 0.5);
gl_FragColor = vec4(vec3(dist), 1.0);
```

### 5. Test compilation
```glsl
void main() {
  gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);  // Magenta = working
}
```

## Performance Tips

1. **Minimize noise function calls** - They're expensive
2. **Use `mediump` for mobile** - Lower precision but faster
3. **Cache calculations** - Don't repeat expensive operations
4. **Simplify conditionals** - Use `step()` and `smoothstep()` instead of `if`
5. **Reduce loop iterations** - Each fragment runs this many times

## Useful GLSL Functions

```glsl
// Math
sin(x), cos(x), tan(x)
pow(x, y)
exp(x), log(x)
sqrt(x)
abs(x)
sign(x)
floor(x), ceil(x), fract(x)
mod(x, y)
min(x, y), max(x, y)
clamp(x, min, max)

// Interpolation
mix(a, b, t)              // Linear interpolation
smoothstep(edge0, edge1, x)  // Smooth hermite interpolation
step(edge, x)             // 0 if x < edge, else 1

// Vector
length(v)
distance(a, b)
dot(a, b)
cross(a, b)
normalize(v)
reflect(I, N)
refract(I, N, eta)

// Trigonometry
atan(y, x)  // Angle in radians
degrees(rad)
radians(deg)
```

## Color Palettes

### Neon
```glsl
vec3 cyan = vec3(0.0, 1.0, 1.0);
vec3 magenta = vec3(1.0, 0.0, 1.0);
vec3 yellow = vec3(1.0, 1.0, 0.0);
```

### Heat
```glsl
vec3 red = vec3(1.0, 0.0, 0.0);
vec3 orange = vec3(1.0, 0.5, 0.0);
vec3 yellow = vec3(1.0, 1.0, 0.0);
vec3 white = vec3(1.0, 1.0, 1.0);
```

### Ocean
```glsl
vec3 deepBlue = vec3(0.0, 0.2, 0.4);
vec3 blue = vec3(0.0, 0.5, 1.0);
vec3 cyan = vec3(0.0, 1.0, 0.8);
vec3 white = vec3(1.0, 1.0, 1.0);
```

### Signal Bloom Default
```glsl
vec3 accentGreen = vec3(0.0, 1.0, 0.53);
vec3 cyan = vec3(0.0, 0.8, 1.0);
vec3 pink = vec3(1.0, 0.3, 0.8);
```

## Example: Simple Audio-Reactive Gradient

```glsl
precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform float uLevel;
uniform vec2 uResolution;

void main() {
  // Horizontal gradient
  float grad = vUv.x;
  
  // Add audio reactivity
  grad += uLevel * 0.5;
  
  // Add animation
  grad += sin(uTime + vUv.y * 10.0) * 0.1;
  
  // Color
  vec3 color1 = vec3(1.0, 0.0, 0.5);
  vec3 color2 = vec3(0.0, 0.5, 1.0);
  vec3 color = mix(color1, color2, grad);
  
  gl_FragColor = vec4(color, 1.0);
}
```

## Resources

- [GLSL Sandbox](http://glslsandbox.com/) - Test shaders online
- [Shadertoy](https://www.shadertoy.com/) - Huge shader gallery
- [The Book of Shaders](https://thebookofshaders.com/) - Learn GLSL
- [Inigo Quilez Articles](https://iquilezles.org/articles/) - Advanced techniques
