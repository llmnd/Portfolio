'use client';

import { useEffect, useRef, useState } from 'react';

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
uniform bool uIsMobile;

#define SURF_DIST 0.001
#define MAX_DIST 20.0

mat2 rot2D(float angle) {
  float s = sin(angle), c = cos(angle);
  return mat2(c, -s, s, c);
}

// SDF Boîte arrondie
float sdRoundedBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

// Scène 3D : Processeur / Puce électronique
float map(vec3 p, out float matID, out vec3 localUv) {
  // Movement d'orientation et d'inertie
  p.xz *= rot2D(uTime * 0.15 + uMouse.x * 0.8);
  p.xy *= rot2D(sin(uTime * 0.1) * 0.08 + uMouse.y * 0.4);

  // 1. Substrat Vert/Noir (PCB Substrate Base)
  vec3 pPCB = p - vec3(0.0, -0.05, 0.0);
  float dPCB = sdRoundedBox(pPCB, vec3(1.1, 0.04, 1.1), 0.03);

  // Évidement d'encoche du Pin 1 (Repère d'angle du processeur)
  vec3 pNotch = pPCB - vec3(-1.0, 0.02, -1.0);
  float dNotch = sdRoundedBox(pNotch, vec3(0.12, 0.05, 0.12), 0.01);
  dPCB = max(dPCB, -dNotch);

  // 2. Dispersateur de chaleur métallique (IHS Metal Cap)
  vec3 pIHS = p - vec3(0.0, 0.05, 0.0);
  float dIHSBase = sdRoundedBox(pIHS, vec3(0.82, 0.05, 0.82), 0.02);
  
  // Rebord central surélevé de l'IHS
  vec3 pIHSLip = pIHS - vec3(0.0, 0.025, 0.0);
  float dIHSLip = sdRoundedBox(pIHSLip, vec3(0.7, 0.035, 0.7), 0.015);
  float dIHS = min(dIHSBase, dIHSLip);

  // 3. Puce centrale de Silicium / Cœur (Die)
  vec3 pDie = pIHS - vec3(0.0, 0.05, 0.0);
  float dDie = sdRoundedBox(pDie, vec3(0.4, 0.02, 0.4), 0.005);

  // Matériaux
  float dAcc = dPCB;
  matID = 1.0; // Substrat PCB
  localUv = pPCB.xyz;

  if (dIHS < dAcc) {
    dAcc = dIHS;
    matID = 2.0; // Métal Nickel/Aluminium
    localUv = pIHS.xyz;
  }
  if (dDie < dAcc) {
    dAcc = dDie;
    matID = 3.0; // Silicium émissif / Cœur du CPU
    localUv = pDie.xyz;
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
  for (int i = 0; i < 4; i++) {
    float hr = 0.01 + 0.12 * float(i) / 3.0;
    float d = mapDistOnly(p + n * hr);
    occ += (hr - d) * sca;
    sca *= 0.85;
  }
  return clamp(1.0 - 3.0 * occ, 0.0, 1.0);
}

// Motif procédural de circuits imprimés & impulsions lumineuses
vec3 getCircuitTexture(vec2 uv, float time) {
  vec2 st = uv * 8.0;
  vec2 id = floor(st);
  vec2 f = fract(st);

  // Grille de pistes orthogonales
  float grid = step(0.92, f.x) + step(0.92, f.y);
  
  // Impulsion du flux de données émissif
  float pulse = sin(id.x * 2.1 + id.y * 3.4 + time * 3.0) * 0.5 + 0.5;
  pulse = pow(pulse, 4.0);

  vec3 baseCircuit = vec3(0.02, 0.12, 0.22);
  vec3 glowColor = mix(vec3(0.0, 0.6, 1.0), vec3(0.2, 0.9, 0.6), pulse);

  return mix(baseCircuit, glowColor, grid * pulse * 0.85);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);

  float camDist = uIsMobile ? -3.8 : -2.8;
  vec3 ro = vec3(0.0, 0.2, camDist);
  vec3 rd = normalize(vec3(uv, 1.1));

  int maxSteps = uIsMobile ? 48 : 80;
  float dO = 0.0;
  float hitMat = 0.0;
  vec3 hitUv = vec3(0.0);

  for (int i = 0; i < 80; i++) {
    if (i >= maxSteps) break;
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
    float spec = pow(max(0.0, dot(ref, l)), 48.0);
    float fresnel = pow(1.0 - max(0.0, dot(-rd, n)), 3.2);
    float ao = getAO(p, n);

    if (hitMat == 1.0) {
      // Substrat PCB Vert/Noir mat d'ingénierie
      vec3 pcbColor = vec3(0.03, 0.07, 0.06);
      color = pcbColor + spec * vec3(0.2) + fresnel * vec3(0.1, 0.3, 0.2);
      color *= (diff * 0.5 + 0.5) * ao;
    } else if (hitMat == 2.0) {
      // IHS Aluminium / Nickel brillant brossé
      vec3 metalColor = vec3(0.15, 0.18, 0.22);
      color = mix(metalColor, vec3(0.8, 0.88, 0.98), fresnel * 0.7);
      color += spec * vec3(0.9, 0.95, 1.0) * 0.85;
      color *= (diff * 0.5 + 0.5) * ao;
    } else if (hitMat == 3.0) {
      // Cœur de processeur émissif avec micro-circuits
      vec3 circuits = getCircuitTexture(hitUv.xz, uTime);
      color = circuits + spec * vec3(1.0) * 0.5 + fresnel * vec3(0.1, 0.5, 0.9);
    }
  }

  // Halo lumineux de fond
  float radialDist = length(uv);
  color += vec3(0.1, 0.35, 0.7) * (0.05 / (radialDist + 0.4));

  // Anti-banding grain
  float noise = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.012;
  color += noise;

  fragColor = vec4(color, 1.0);
}
`;

interface GameControllerProps {
  onMove: (x: number, y: number) => void;
  isMobile: boolean;
}

const GameController = ({ onMove, isMobile }: GameControllerProps) => {
  const touchRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });

  const handleStart = (clientX: number, clientY: number) => {
    if (!touchRef.current) return;
    const rect = touchRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    startPosRef.current = { x: centerX, y: centerY };
    setIsDragging(true);
    handleMove(clientX, clientY);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !touchRef.current) return;
    const rect = touchRef.current.getBoundingClientRect();
    const radius = rect.width / 2 - 20;
    let dx = clientX - startPosRef.current.x;
    let dy = clientY - startPosRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > radius) {
      dx = (dx / distance) * radius;
      dy = (dy / distance) * radius;
    }
    
    const normalizedX = dx / radius;
    const normalizedY = -dy / radius;
    setPosition({ x: dx, y: dy });
    onMove(normalizedX, normalizedY);
  };

  const handleEnd = () => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onMove(0, 0);
  };

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-8 left-8 z-50">
      <div
        ref={touchRef}
        className="relative w-32 h-32 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg touch-none"
        onTouchStart={(e) => {
          e.preventDefault();
          handleStart(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleEnd();
        }}
        onTouchCancel={handleEnd}
      >
        {/* Cercles concentriques décoratifs */}
        <div className="absolute inset-0 rounded-full border border-white/5" />
        <div className="absolute inset-4 rounded-full border border-white/5" />
        <div className="absolute inset-8 rounded-full border border-white/5" />
        
        {/* Point central */}
        <div className="absolute top-1/2 left-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20" />
        
        {/* Stick de contrôle */}
        <div
          className="absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-lg transition-all duration-75"
          style={{
            left: `calc(50% + ${position.x}px)`,
            top: `calc(50% + ${position.y}px)`,
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/5 to-transparent" />
        </div>

        {/* Labels */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-white/40 text-xs font-mono tracking-wider">
          MOVE
        </div>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/20 text-[10px] font-mono">
          ← → ↑ ↓
        </div>
      </div>
    </div>
  );
};

// Bouton d'action minimaliste
const ActionButton = ({ label, onPress }: { label: string; onPress: () => void }) => {
  return (
    <button
      onClick={onPress}
      className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg flex items-center justify-center text-white/60 text-sm font-mono tracking-wider hover:bg-white/10 transition-all active:scale-95 touch-none select-none"
    >
      {label}
    </button>
  );
};

export const HeroBackground3D = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mouseTarget, setMouseTarget] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const handleControllerMove = (x: number, y: number) => {
    setMouseTarget({ x, y });
  };

  const handleAction = () => {
    // Action déclenchée par le bouton (ex: reset, interaction, etc.)
    setMouseTarget({ x: 0, y: 0 });
  };

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
    const isMobileLocation = gl.getUniformLocation(program, 'uIsMobile');

    let animationFrameId: number;
    let startTime = performance.now();
    let currentMouse = { x: 0, y: 0 };

    const handleResize = () => {
      if (!canvas) return;
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      const dpr = mobile ? Math.min(window.devicePixelRatio || 1, 1.25) : Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const render = (now: number) => {
      // Lissage du mouvement (inertie)
      currentMouse.x += (mouseTarget.x - currentMouse.x) * 0.08;
      currentMouse.y += (mouseTarget.y - currentMouse.y) * 0.08;

      gl.useProgram(program);
      gl.bindVertexArray(vao);

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(mouseLocation, currentMouse.x, currentMouse.y);
      gl.uniform1f(timeLocation, (now - startTime) * 0.001);
      gl.uniform1i(isMobileLocation, isMobile ? 1 : 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
    };
  }, [mouseTarget]);

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-[#030712] touch-none">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full block" />

      {/* Grille technique vectorielle */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] md:bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#030712] to-transparent pointer-events-none" />

      {/* Contrôleurs de jeu mobiles */}
      <GameController onMove={handleControllerMove} isMobile={isMobile} />
      <ActionButton label="A" onPress={handleAction} />
      
      {/* Indicateur de contrôle */}
      {isMobile && (
        <div className="fixed bottom-[6.5rem] left-1/2 -translate-x-1/2 z-50 text-white/10 text-[10px] font-mono tracking-[0.3em] uppercase select-none">
          Touch & drag to explore
        </div>
      )}
    </div>
  );
};

export default HeroBackground3D;