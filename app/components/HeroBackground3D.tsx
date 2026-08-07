'use client';

import { useEffect, useRef } from 'react';

const VERTEX_SHADER = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

out vec4 fragColor;

uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uTime;

#define MAX_STEPS 90
#define SURF_DIST 0.001
#define MAX_DIST 20.0

mat2 rot2D(float angle) {
  float s = sin(angle), c = cos(angle);
  return mat2(c, -s, s, c);
}

float sdRoundedBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

// Scene Distance Field: Laptop réaliste
float map(vec3 p, out float matID, out vec3 localUv) {
  // Animation et orientation avec inertie
  p.xz *= rot2D(uTime * 0.15 + uMouse.x * 0.7);
  p.xy *= rot2D(sin(uTime * 0.1) * 0.05 + uMouse.y * 0.35);

  // 1. Châssis principal (Base)
  vec3 pBase = p - vec3(0.0, -0.4, 0.0);
  float dBase = sdRoundedBox(pBase, vec3(1.25, 0.035, 0.85), 0.04);

  // Creux du clavier
  vec3 pKeyRecess = pBase - vec3(0.0, 0.03, -0.12);
  float dKeyRecess = sdRoundedBox(pKeyRecess, vec3(1.05, 0.02, 0.45), 0.02);
  dBase = max(dBase, -dKeyRecess);

  // Clavier sculpté (Grille de touches)
  vec3 pKeys = pKeyRecess;
  pKeys.xz = mod(pKeys.xz + vec2(0.08, 0.08), vec2(0.16, 0.15)) - vec2(0.08, 0.075);
  float dKeys = sdRoundedBox(pKeys, vec3(0.068, 0.022, 0.058), 0.008);
  // Limiter le clavier à la zone du renfoncement
  dKeys = max(dKeys, sdRoundedBox(pKeyRecess, vec3(1.02, 0.03, 0.42), 0.01));

  // Trackpad
  vec3 pTrackpad = pBase - vec3(0.0, 0.035, 0.48);
  float dTrackpad = sdRoundedBox(pTrackpad, vec3(0.38, 0.01, 0.22), 0.01);

  // Charnière centrale
  vec3 pHinge = p - vec3(0.0, -0.365, -0.83);
  float dHinge = sdRoundedBox(pHinge, vec3(0.4, 0.028, 0.028), 0.015);

  float dChassis = min(min(dBase, dTrackpad), min(dKeys, dHinge));

  // 2. Écran déplié à 115°
  vec3 pScreen = p - vec3(0.0, -0.365, -0.83);
  pScreen.yz *= rot2D(-2.0); // Angle 115°
  pScreen.y -= 0.75;

  float dScreenFrame = sdRoundedBox(pScreen, vec3(1.25, 0.78, 0.018), 0.03);

  // Dalle d'écran en verre
  vec3 pGlass = pScreen - vec3(0.0, 0.0, 0.012);
  float dGlass = sdRoundedBox(pGlass, vec3(1.18, 0.72, 0.004), 0.005);

  // Attribution des matériaux
  float dAcc = dChassis;
  matID = 1.0; // Métal aluminium
  localUv = p.xyz;

  if (dKeys < dAcc) {
    dAcc = dKeys;
    matID = 3.0; // Touches sombres du clavier
  }
  if (dScreenFrame < dAcc) {
    dAcc = dScreenFrame;
    matID = 1.0;
  }
  if (dGlass < dAcc) {
    dAcc = dGlass;
    matID = 2.0; // Dalle d'écran IDE
    localUv = pGlass.xyz;
  }

  return dAcc;
}

float mapDistOnly(vec3 p) {
  float dummyMat;
  vec3 dummyUv;
  return map(p, dummyMat, dummyUv);
}

vec3 getNormal(vec3 p) {
  float d = mapDistOnly(p);
  vec2 e = vec2(0.001, 0.0);
  vec3 n = d - vec3(mapDistOnly(p - e.xyy), mapDistOnly(p - e.yxy), mapDistOnly(p - e.yyx));
  return normalize(n);
}

float getAO(vec3 p, vec3 n) {
  float occ = 0.0;
  float sca = 1.0;
  for (int i = 0; i < 5; i++) {
    float hr = 0.01 + 0.12 * float(i) / 4.0;
    float d = mapDistOnly(p + n * hr);
    occ += (hr - d) * sca;
    sca *= 0.85;
  }
  return clamp(1.0 - 3.0 * occ, 0.0, 1.0);
}

// Générateur procédural d'interface IDE de code
vec3 getIDETexture(vec2 uv) {
  // Normaliser UV écran [-1, 1] vers [0, 1]
  vec2 st = uv * vec2(0.42, 0.68) + 0.5;

  // Arrière-plan du thème sombre de l'éditeur (#0d1117)
  vec3 codeBg = vec3(0.05, 0.07, 0.1);

  // Barre supérieure d'outils
  if (st.y > 0.92) {
    vec3 topBar = vec3(0.09, 0.11, 0.15);
    // Boutons de contrôle MacOS (Rouge, Jaune, Vert)
    if (st.x < 0.08) {
      if (length(st - vec2(0.02, 0.96)) < 0.008) return vec3(0.95, 0.35, 0.35);
      if (length(st - vec2(0.04, 0.96)) < 0.008) return vec3(0.95, 0.75, 0.25);
      if (length(st - vec2(0.06, 0.96)) < 0.008) return vec3(0.25, 0.85, 0.45);
    }
    return topBar;
  }

  // Volet latéral de fichiers
  if (st.x < 0.18) {
    float sidebarLine = floor(st.y * 35.0);
    float lineHash = fract(sin(sidebarLine * 12.9898) * 43758.5453);
    if (lineHash > 0.4 && mod(st.y * 35.0, 1.0) < 0.6) {
      return vec3(0.2, 0.28, 0.38);
    }
    return vec3(0.07, 0.09, 0.13);
  }

  // Zone d'édition du code (Lignes colorées procédurales)
  float line = floor((1.0 - st.y) * 28.0);
  float lineX = st.x - 0.2;
  float lineNoise = fract(sin(line * 45.123) * 9123.456);
  float indent = floor(fract(line * 0.31) * 3.0) * 0.06;

  if (lineX > indent && lineX < indent + lineNoise * 0.45) {
    if (mod((1.0 - st.y) * 28.0, 1.0) < 0.55) {
      // Coloration syntaxique dynamique
      if (lineNoise < 0.25) return vec3(0.95, 0.4, 0.6);  // Mots-clés (Rose/Rouge)
      if (lineNoise < 0.5)  return vec3(0.3, 0.75, 0.95); // Fonctions (Cyan)
      if (lineNoise < 0.75) return vec3(0.9, 0.8, 0.35); // Chaînes / Variables (Jaune)
      return vec3(0.4, 0.85, 0.5);                       // Commentaires (Vert)
    }
  }

  return codeBg;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);

  vec3 ro = vec3(0.0, 0.1, -3.3);
  vec3 rd = normalize(vec3(uv, 1.1));

  float dO = 0.0;
  float hitMat = 0.0;
  vec3 hitUv = vec3(0.0);
  
  for (int i = 0; i < MAX_STEPS; i++) {
    vec3 p = ro + rd * dO;
    float currentMat;
    vec3 currentUv;
    float dS = map(p, currentMat, currentUv);
    dO += dS;
    if (dS < SURF_DIST) {
      hitMat = currentMat;
      hitUv = currentUv;
      break;
    }
    if (dO > MAX_DIST) break;
  }

  vec3 bgColor = vec3(0.011, 0.027, 0.070);
  vec3 color = bgColor;

  if (dO < MAX_DIST) {
    vec3 p = ro + rd * dO;
    vec3 n = getNormal(p);
    vec3 lightPos = vec3(2.5 * sin(uMouse.x * 2.0), 3.5, -2.0);
    vec3 l = normalize(lightPos - p);

    float diff = max(0.0, dot(n, l));
    vec3 ref = reflect(rd, n);
    float spec = pow(max(0.0, dot(ref, l)), 64.0);
    float fresnel = pow(1.0 - max(0.0, dot(-rd, n)), 3.5);
    float ao = getAO(p, n);

    if (hitMat == 1.0) {
      // Aluminium anodisé (Space Gray / Silver)
      vec3 metalColor = vec3(0.1, 0.12, 0.16);
      color = mix(metalColor, vec3(0.75, 0.85, 0.98), fresnel * 0.7);
      color += spec * vec3(0.9, 0.95, 1.0) * 0.9;
      color *= (diff * 0.5 + 0.5) * ao;
    } else if (hitMat == 2.0) {
      // Écran émissif avec code IDE
      vec3 ideTexture = getIDETexture(hitUv.xy);
      color = ideTexture + spec * vec3(1.0) * 0.4 + fresnel * vec3(0.2, 0.4, 0.8) * 0.5;
    } else if (hitMat == 3.0) {
      // Touches du clavier
      vec3 keyColor = vec3(0.03, 0.04, 0.05);
      color = keyColor + spec * vec3(0.3) * 0.5;
      color *= (diff * 0.4 + 0.6) * ao;
    }
  }

  // Halo lumineux de fond
  float radialDist = length(uv);
  color += vec3(0.1, 0.35, 0.7) * (0.05 / (radialDist + 0.4));

  // Grain cinématique anti-banding
  float noise = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.012;
  color += noise;

  fragColor = vec4(color, 1.0);
}
`;

export const HeroBackground3D = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', {
      powerPreference: 'high-performance',
      antialias: false,
      alpha: false,
    });

    if (!gl) return;

    const createShader = (gl: WebGL2RenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionAttributeLocation = gl.getAttribLocation(program, 'aPosition');
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, 'uResolution');
    const mouseLocation = gl.getUniformLocation(program, 'uMouse');
    const timeLocation = gl.getUniformLocation(program, 'uTime');

    let animationFrameId: number;
    let startTime = performance.now();
    let targetMouse = { x: 0, y: 0 };
    let currentMouse = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    handleResize();

    const render = (now: number) => {
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.05;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.05;

      gl.useProgram(program);
      gl.bindVertexArray(vao);

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(mouseLocation, currentMouse.x, currentMouse.y);
      gl.uniform1f(timeLocation, (now - startTime) * 0.001);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
    };
  }, []);

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-[#030712] pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full block" />

      {/* Grille technique */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />

      {/* Ligne d'horizon */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Fondu de fin */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#030712] to-transparent" />
    </div>
  );
};

export default HeroBackground3D;