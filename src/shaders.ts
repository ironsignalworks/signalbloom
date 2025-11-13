import * as THREE from 'three';

// Water shader - atmospheric volumetric effect with reduced brightness
export const waterShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    precision highp float;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    uniform float uTime;
    uniform float uLevel;
    uniform vec2 uResolution;
    
    // Noise function for water turbulence
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    // Flow-based wave elevation
    float wavesElevation(vec3 position) {
      float flowSpeed = uTime * 0.6;
      
      vec2 pos2d = position.xy;
      float flowAngle = uTime * 0.3 + uLevel * 2.0;
      vec2 flowDir = vec2(cos(flowAngle), sin(flowAngle));
      
      float elevation = sin(dot(pos2d, flowDir) * 2.0 + flowSpeed) *
                       cos(pos2d.x * 1.2 - flowSpeed * 0.7) * 0.1;
      
      float turbulenceFlow = flowSpeed * 0.5;
      
      for(float i = 1.0; i <= 4.0; i += 1.0) {
        vec2 noiseInput = (pos2d + vec2(turbulenceFlow * i * 0.5, turbulenceFlow * i * 0.3)) * (1.5 + i * 0.5);
        float wave = snoise(noiseInput) * (0.08 / i);
        wave *= (0.7 + uLevel * 0.5);
        elevation += wave;
      }
      
      return elevation;
    }
    
    void main() {
      // Spherical coordinates for atmospheric effect
      vec3 viewDir = normalize(vWorldPosition - cameraPosition);
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
      
      float elevation = wavesElevation(vPosition);
      
      // Much darker base colors
      vec3 deepColor = vec3(0.01, 0.03, 0.08);      // Very deep blue
      vec3 surfaceColor = vec3(0.0, 0.1 + sin(uTime * 0.1) * 0.05, 0.2); // Dim cyan
      vec3 emissiveColor = vec3(0.0, 0.15, 0.25);   // Subtle cyan glow
      
      // Softer diffuse
      float lightAngle = uTime * 0.2;
      vec3 lightDir = normalize(vec3(cos(lightAngle), 0.8, sin(lightAngle)));
      float diffuse = max(dot(vNormal, lightDir), 0.0) * 0.3;
      
      vec3 color = mix(deepColor, surfaceColor, diffuse + 0.2);
      
      // Much subtler emissive
      float emissive = smoothstep(-0.1, 0.3, elevation) * (0.1 + uLevel * 0.15);
      color += emissiveColor * emissive;
      
      // Shimmer
      float shimmer = snoise(vUv * 10.0 + uTime * 0.4) * 0.1 + 0.9;
      color *= shimmer;
      
      // Overall dimmer
      color *= 0.4 + uLevel * 0.2;
      
      // Atmospheric fade based on viewing angle
      float alpha = fresnel * (0.3 + uLevel * 0.2);
      
      gl_FragColor = vec4(color, alpha);
    }
  `
};

// Texture shader - atmospheric volumetric effect
export const textureShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    precision highp float;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    uniform float uTime;
    uniform float uLevel;
    uniform vec2 uResolution;
    
    float hash21(vec2 p) {
      p = fract(p * vec2(234.34, 435.345));
      p += dot(p, p + 34.23);
      return fract(p.x * p.y);
    }
    
    vec3 hash33(vec3 p) {
      p = fract(p * vec3(443.897, 441.423, 437.195));
      p += dot(p, p.yzx + 19.19);
      return fract((p.xxy + p.yxx) * p.zyx);
    }
    
    vec3 voronoi(vec2 uv, float time) {
      vec2 gv = fract(uv) - 0.5;
      vec2 id = floor(uv);
      
      float minDist = 100.0;
      vec2 minP;
      vec2 minId;
      
      for(float y = -1.0; y <= 1.0; y++) {
        for(float x = -1.0; x <= 1.0; x++) {
          vec2 offset = vec2(x, y);
          vec2 neighborId = id + offset;
          float h = hash21(neighborId);
          
          float angle = time * 0.3 + h * 6.2831;
          vec2 p = offset + vec2(cos(angle), sin(angle)) * 0.3;
          
          float d = length(gv - p);
          
          if(d < minDist) {
            minDist = d;
            minP = p;
            minId = neighborId;
          }
        }
      }
      
      return vec3(minDist, minId);
    }
    
    void main() {
      // Spherical mapping for volumetric effect
      vec3 viewDir = normalize(vWorldPosition - cameraPosition);
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 1.5);
      
      // Use spherical position for pattern
      vec2 uv = vPosition.xy * 4.0;
      
      float breathe = sin(uTime * 0.4) * 0.3 + 1.0;
      float scale = breathe + uLevel * 0.5;
      uv *= scale;
      
      vec3 vor = voronoi(uv, uTime + uLevel * 0.5);
      float dist = vor.x;
      vec2 cellId = vor.yz;
      
      float edges = smoothstep(0.0, 0.08, dist);
      
      vec3 baseColor = hash33(vec3(cellId, 1.0));
      
      float flowX = uv.x * 0.1 + uTime * 0.15;
      float flowY = uv.y * 0.1 - uTime * 0.1;
      
      vec3 color1 = vec3(0.0, 0.3 + sin(flowX) * 0.15, 0.5);
      vec3 color2 = vec3(0.4 + cos(flowY) * 0.1, 0.2, 0.5);
      vec3 color3 = vec3(0.5, 0.25 + sin(flowX + flowY) * 0.15, 0.3);
      
      float mixFactor1 = sin(flowX * 2.0 + cellId.x) * 0.5 + 0.5;
      float mixFactor2 = cos(flowY * 2.0 + cellId.y) * 0.5 + 0.5;
      
      vec3 cellColor = mix(color1, color2, mixFactor1);
      cellColor = mix(cellColor, color3, mixFactor2);
      cellColor *= baseColor * 1.2;
      
      float breatheIntensity = sin(uTime * 0.6 + hash21(cellId) * 6.28) * 0.15 + 0.85;
      cellColor *= breatheIntensity;
      
      cellColor *= 0.5 + uLevel * 0.3;
      
      vec3 finalColor = cellColor * edges;
      vec3 edgeGlow = mix(color1, color2, 0.5) * (1.0 - edges) * (0.2 + uLevel * 0.2);
      finalColor += edgeGlow;
      
      // Atmospheric fade
      float alpha = fresnel * (0.4 + uLevel * 0.2);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

// Melt shader - atmospheric volumetric effect
export const meltShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying float vDepth;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vDepth = -mvPosition.z;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  
  fragmentShader: `
    precision highp float;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying float vDepth;
    uniform float uTime;
    uniform float uLevel;
    uniform vec2 uResolution;
    
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 =   v - i + dot(i, C.xxx) ;
      
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      
      i = mod289(i);
      vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      
      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;
      
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }
    
    void main() {
      // Spherical mapping
      vec3 viewDir = normalize(vWorldPosition - cameraPosition);
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 1.8);
      
      vec2 uv = vUv;
      
      float flowTime = uTime * 0.4;
      float viscosity = 0.5 + uLevel * 0.3;
      
      float distort1 = snoise(vec3(uv.x * 3.0, uv.y * 2.5 - flowTime * viscosity, uTime * 0.15));
      float distort2 = snoise(vec3(uv.x * 5.0, uv.y * 3.5 - flowTime * viscosity * 1.2, uTime * 0.18));
      float distort3 = snoise(vec3(uv.x * 7.0, uv.y * 4.5 - flowTime * viscosity * 0.8, uTime * 0.12));
      
      float flowDistort = (distort1 * 0.12 + distort2 * 0.08 + distort3 * 0.05) * (0.8 + uLevel * 0.4);
      
      uv.y += flowDistort;
      uv.x += sin(uv.y * 6.0 + uTime * 0.5) * 0.015;
      uv.x += cos(uv.y * 3.0 - uTime * 0.3) * 0.01;
      
      float colorFlow = uv.y * 0.5 + uTime * 0.2;
      float texture = snoise(vec3(uv * 8.0, uTime * 0.08)) * 0.5 + 0.5;
      
      vec3 color1 = vec3(0.4 + sin(colorFlow) * 0.1, 0.05, 0.0);
      vec3 color2 = vec3(0.5, 0.15 + cos(colorFlow * 1.5) * 0.1, 0.0);
      vec3 color3 = vec3(0.5, 0.3 + sin(colorFlow * 2.0) * 0.1, 0.0);
      vec3 color4 = vec3(0.45, 0.2, 0.3 + cos(colorFlow) * 0.1);
      
      float mix1 = smoothstep(0.0, 0.3, uv.y);
      float mix2 = smoothstep(0.3, 0.6, uv.y);
      float mix3 = smoothstep(0.6, 1.0, uv.y);
      
      vec3 color = mix(color1, color2, mix1);
      color = mix(color, color3, mix2);
      color = mix(color, color4, mix3 * uLevel);
      
      color = mix(color, color * texture * 1.3, 0.4);
      
      color *= 0.5 + flowDistort * 0.25;
      
      float glow = abs(distort1) * 0.3;
      vec3 glowColor = mix(vec3(0.5, 0.25, 0.15), vec3(0.5, 0.15, 0.35), uLevel);
      color += glowColor * glow * (0.15 + uLevel * 0.15);
      
      float shimmer = sin(uv.y * 15.0 + uTime * 0.8) * cos(uv.x * 10.0 - uTime * 0.6);
      shimmer = shimmer * 0.05 + 0.95;
      color *= shimmer;
      
      float chromatic = smoothstep(0.4, 0.8, uLevel) * 0.008;
      if(chromatic > 0.001) {
        float offsetR = snoise(vec3(uv * 15.0, uTime * 0.1)) * chromatic;
        float offsetB = snoise(vec3(uv * 15.0, uTime * 0.1 + 100.0)) * chromatic;
        color.r += offsetR;
        color.b += offsetB;
      }
      
      color *= 0.6 + uLevel * 0.2;
      
      // Atmospheric fade
      float alpha = fresnel * (0.5 + uLevel * 0.2);
      
      gl_FragColor = vec4(color, alpha);
    }
  `
};

// Helper function to create shader material
export function createShaderMaterial(
  shader: { vertexShader: string; fragmentShader: string },
  uniforms: {
    uTime: { value: number };
    uLevel: { value: number };
    uResolution: { value: THREE.Vector2 };
  }
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
}
