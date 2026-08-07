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

float sdRoundedBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

float map(vec3 p, out float matID, out vec3 localUv) {
  p.xz *= rot2D(uTime * 0.1 + uMouse.x * 1.4);
  p.xy *= rot2D(sin(uTime * 0.08) * 0.05 + uMouse.y * 0.8);

  // 1. Substrat PCB
  vec3 pPCB = p - vec3(0.0, -0.05, 0.0);
  float dPCB = sdRoundedBox(pPCB, vec3(1.1, 0.04, 1.1), 0.03);

  vec3 pNotch = pPCB - vec3(-1.0, 0.02, -1.0);
  float dNotch = sdRoundedBox(pNotch, vec3(0.12, 0.05, 0.12), 0.01);
  dPCB = max(dPCB, -dNotch);

  // 2. Heat Spreader (IHS)
  vec3 pIHS = p - vec3(0.0, 0.05, 0.0);
  float dIHSBase = sdRoundedBox(pIHS, vec3(0.82, 0.05, 0.82), 0.02);
  vec3 pIHSLip = pIHS - vec3(0.0, 0.025, 0.0);
  float dIHSLip = sdRoundedBox(pIHSLip, vec3(0.7, 0.035, 0.7), 0.015);
  float dIHS = min(dIHSBase, dIHSLip);

  // 3. Cœur / Silicon Die
  vec3 pDie = pIHS - vec3(0.0, 0.05, 0.0);
  float dDie = sdRoundedBox(pDie, vec3(0.4, 0.02, 0.4), 0.005);

  float dAcc = dPCB;
  matID = 1.0;
  localUv = pPCB.xyz;

  if (dIHS < dAcc) {
    dAcc = dIHS;
    matID = 2.0;
    localUv = pIHS.xyz;
  }
  if (dDie < dAcc) {
    dAcc = dDie;
    matID = 3.0;
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

vec3 getCircuitTexture(vec2 uv, float time) {
  vec2 st = uv * 8.0;
  vec2 id = floor(st);
  vec2 f = fract(st);

  float grid = step(0.92, f.x) + step(0.92, f.y);
  float pulse = pow(sin(id.x * 2.1 + id.y * 3.4 + time * 3.0) * 0.5 + 0.5, 4.0);

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

  vec3 color = vec3(0.011, 0.027, 0.070);

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
      vec3 pcbColor = vec3(0.03, 0.07, 0.06);
      color = pcbColor + spec * vec3(0.2) + fresnel * vec3(0.1, 0.3, 0.2);
      color *= (diff * 0.5 + 0.5) * ao;
    } else if (hitMat == 2.0) {
      vec3 metalColor = vec3(0.15, 0.18, 0.22);
      color = mix(metalColor, vec3(0.8, 0.88, 0.98), fresnel * 0.7);
      color += spec * vec3(0.9, 0.95, 1.0) * 0.85;
      color *= (diff * 0.5 + 0.5) * ao;
    } else if (hitMat == 3.0) {
      vec3 circuits = getCircuitTexture(hitUv.xz, uTime);
      color = circuits + spec * vec3(1.0) * 0.5 + fresnel * vec3(0.1, 0.5, 0.9);
    }
  }

  float radialDist = length(uv);
  color += vec3(0.1, 0.35, 0.7) * (0.05 / (radialDist + 0.4));

  float noise = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.012;
  color += noise;

  fragColor = vec4(color, 1.0);
}
`;

export const HeroBackground3D = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const joystickRef = useRef<HTMLDivElement | null>(null);

  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const targetMouseRef = useRef({ x: 0, y: 0 });
  const currentMouseRef = useRef({ x: 0, y: 0 });

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

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth >= 768) {
        targetMouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
        targetMouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      }
    };

    const handleResize = () => {
      if (!canvas) return;
      const mobile = window.innerWidth < 768;
      setIsMobileDevice(mobile);

      const dpr = mobile ? Math.min(window.devicePixelRatio || 1, 1.25) : Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    handleResize();

    const render = (now: number) => {
      currentMouseRef.current.x += (targetMouseRef.current.x - currentMouseRef.current.x) * 0.08;
      currentMouseRef.current.y += (targetMouseRef.current.y - currentMouseRef.current.y) * 0.08;

      gl.useProgram(program);
      gl.bindVertexArray(vao);

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(mouseLocation, currentMouseRef.current.x, currentMouseRef.current.y);
      gl.uniform1f(timeLocation, (now - startTime) * 0.001);
      gl.uniform1i(isMobileLocation, isMobileDevice ? 1 : 0);

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
  }, [isMobileDevice]);

  // Logique du Joystick Tactile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updateJoystick(e.touches[0]);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    updateJoystick(e.touches[0]);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setJoystickPos({ x: 0, y: 0 });
    targetMouseRef.current = { x: 0, y: 0 };
  };

  const updateJoystick = (touch: React.Touch) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxRadius = 45;
    let deltaX = touch.clientX - centerX;
    let deltaY = touch.clientY - centerY;

    const distance = Math.hypot(deltaX, deltaY);
    if (distance > maxRadius) {
      deltaX = (deltaX / distance) * maxRadius;
      deltaY = (deltaY / distance) * maxRadius;
    }

    setJoystickPos({ x: deltaX, y: deltaY });

    targetMouseRef.current = {
      x: deltaX / maxRadius,
      y: -deltaY / maxRadius,
    };
  };

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-[#030712] select-none">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full block" />

      {/* Grille technique UI */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] md:bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#030712] to-transparent pointer-events-none" />

      {/* Contrôleur Joystick Analogique (Placé à droite en mode mobile) */}
      {isMobileDevice && (
        <div className="absolute bottom-8 right-8 z-30 flex flex-col items-center gap-2">
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase opacity-70">
            Rotate CPU
          </span>
          <div
            ref={joystickRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative w-28 h-28 rounded-full bg-slate-900/60 border border-cyan-500/30 backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.15)] touch-none"
          >
            <div className="absolute w-full h-[1px] bg-cyan-500/10" />
            <div className="absolute h-full w-[1px] bg-cyan-500/10" />

            <div
              className={`w-12 h-12 rounded-full border border-cyan-400/60 bg-gradient-to-b from-cyan-500/40 to-slate-800/80 shadow-[0_0_10px_rgba(6,182,212,0.4)] flex items-center justify-center transition-transform ${
                !isDragging ? 'duration-300 ease-out' : 'duration-0'
              }`}
              style={{
                transform: `translate3d(${joystickPos.x}px, ${joystickPos.y}px, 0)`,
              }}
            >
              <div className="w-3 h-3 rounded-full bg-cyan-300 shadow-[0_0_6px_#06b6d4]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroBackground3D;