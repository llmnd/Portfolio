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
uniform sampler2D uIdeTexture;

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

float map(vec3 p, out float matID, out vec2 texCoord) {
  // Rotations interactives de l'écran
  p.yz *= rot2D(0.1); 
  p.xz *= rot2D(uTime * 0.12 + uMouse.x * 1.4);
  p.xy *= rot2D(sin(uTime * 0.08) * 0.04 + uMouse.y * 0.8);

  // Écran plat simple (juste la dalle d'affichage)
  vec3 pScreen = p - vec3(0.0, 0.0, 0.0);
  float dDisplay = sdRoundedBox(pScreen, vec3(1.5, 0.88, 0.01), 0.02);

  matID = 2.0;
  // Projection UV avec inversion Y pour WebGL
  texCoord = vec2(
    (pScreen.x / 1.5) * 0.5 + 0.5,
    1.0 - ((pScreen.y / 0.88) * 0.5 + 0.5)
  );

  return dDisplay;
}

float mapDistOnly(vec3 p) {
  float dummyMat;
  vec2 dummyUv;
  return map(p, dummyMat, dummyUv);
}

vec3 getNormal(vec3 p) {
  float d = mapDistOnly(p);
  vec2 e = vec2(0.001, 0.0);
  vec3 n = d - vec3(mapDistOnly(p - e.xyy), mapDistOnly(p - e.yxy), mapDistOnly(p - e.yyx));
  return normalize(n);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);

  float camDist = uIsMobile ? -4.2 : -3.2;
  vec3 ro = vec3(0.0, 0.0, camDist);
  vec3 rd = normalize(vec3(uv, 1.2));

  int maxSteps = uIsMobile ? 50 : 80;
  float dO = 0.0;
  vec2 hitTexCoord = vec2(0.0);

  for (int i = 0; i < 80; i++) {
    if (i >= maxSteps) break;
    vec3 p = ro + rd * dO;
    float currentMat;
    vec2 currentTexCoord;
    float dS = map(p, currentMat, currentTexCoord);
    dO += dS;
    if (dS < SURF_DIST) {
      hitTexCoord = currentTexCoord;
      break;
    }
    if (dO > MAX_DIST) break;
  }

  vec3 color = vec3(0.011, 0.027, 0.070);

  if (dO < MAX_DIST) {
    vec3 p = ro + rd * dO;
    vec3 n = getNormal(p);
    vec3 lightPos = vec3(2.5 * sin(uMouse.x * 2.0), 3.5, -2.5);
    vec3 l = normalize(lightPos - p);

    vec3 ref = reflect(rd, n);
    float spec = pow(max(0.0, dot(ref, l)), 32.0);
    float fresnel = pow(1.0 - max(0.0, dot(-rd, n)), 3.0);

    // Texture IDE avec simulation de code animé
    vec4 ideSample = texture(uIdeTexture, hitTexCoord);
    color = ideSample.rgb + spec * vec3(0.12) + fresnel * vec3(0.0, 0.3, 0.6) * 0.25;
  }

  float radialDist = length(uv);
  color += vec3(0.08, 0.3, 0.65) * (0.06 / (radialDist + 0.45));

  float noise = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.012;
  color += noise;

  fragColor = vec4(color, 1.0);
}
`;

// Extrait de code source pour la simulation de frappe
const RAW_CODE = `import { useState, useEffect } from 'react';
import { Canvas3D } from '@/components/engine';

export const SimulatedIDE = () => {
  const [status, setStatus] = useState('Compiling...');
  const [fps, setFps] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setStatus('System Ready');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Canvas3D 
      fps={fps} 
      status={status} 
      renderLoop={true} 
    />
  );
};`;

export const FloatingScreenIDE = () => {
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

    // --- CANVAS 2D OFFSCREEN POUR SIMULER L'IDE ---
    const ideCanvas = document.createElement('canvas');
    ideCanvas.width = 1024;
    ideCanvas.height = 512;
    const ctx = ideCanvas.getContext('2d');

    const drawIDE = (time: number) => {
      if (!ctx) return;
      const w = ideCanvas.width;
      const h = ideCanvas.height;

      // Fond IDE
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Barre de titre
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, w, 40);

      // Boutons fenêtres
      const dotColors = ['#ef4444', '#f59e0b', '#10b981'];
      dotColors.forEach((color, i) => {
        ctx.beginPath();
        ctx.arc(20 + i * 20, 20, 6, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      // Onglet
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(90, 6, 170, 34);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(90, 6, 170, 3);
      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('AppSimulation.tsx', 105, 27);

      // Sidebar
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 40, 48, h - 40);
      ctx.fillStyle = '#334155';
      ctx.fillRect(16, 60, 16, 16);
      ctx.fillRect(16, 90, 16, 16);
      ctx.fillRect(16, 120, 16, 16);

      // SIMULATION DE FRAPPE DE CODE (Caractère par caractère)
      const charSpeed = 25; // Nombre de caractères par seconde
      const charCount = Math.floor(time * charSpeed) % (RAW_CODE.length + 30);
      const currentText = RAW_CODE.slice(0, Math.min(charCount, RAW_CODE.length));
      const lines = currentText.split('\n');

      const startX = 100;
      const startY = 75;
      const lineHeight = 28;
      ctx.font = 'bold 15px monospace';

      let lastX = startX;
      let lastY = startY;

      lines.forEach((lineText, idx) => {
        const y = startY + idx * lineHeight;
        lastY = y;

        // Numéro de ligne
        ctx.fillStyle = '#475569';
        ctx.fillText(String(idx + 1).padStart(2, ' '), 60, y);

        // Coloration rudimentaire du texte simulé
        ctx.fillStyle = '#38bdf8';
        if (lineText.includes('import') || lineText.includes('export') || lineText.includes('return')) {
          ctx.fillStyle = '#f472b6';
        } else if (lineText.includes('const') || lineText.includes('let')) {
          ctx.fillStyle = '#a78bfa';
        } else if (lineText.includes('<') || lineText.includes('/>')) {
          ctx.fillStyle = '#facc15';
        } else {
          ctx.fillStyle = '#e2e8f0';
        }

        ctx.fillText(lineText, startX, y);
        lastX = startX + ctx.measureText(lineText).width;
      });

      // Curseur clignotant au bout du texte en cours de frappe
      const blink = Math.sin(time * 10) > 0;
      if (blink) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(lastX + 4, lastY - 14, 9, 18);
      }

      // Barre de statut
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, h - 24, w, 24);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('● SIMULATION ACTIVE | Live Code Typing...', 12, h - 8);
    };

    drawIDE(0);

    const ideTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, ideTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ideCanvas);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

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
    const ideTextureLocation = gl.getUniformLocation(program, 'uIdeTexture');

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
      const elapsedTime = (now - startTime) * 0.001;

      // Mise à jour de la simulation de frappe dans le Canvas 2D
      drawIDE(elapsedTime);

      // Injection dans la texture WebGL
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, ideTexture);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, ideCanvas);

      currentMouseRef.current.x += (targetMouseRef.current.x - currentMouseRef.current.x) * 0.08;
      currentMouseRef.current.y += (targetMouseRef.current.y - currentMouseRef.current.y) * 0.08;

      gl.useProgram(program);
      gl.bindVertexArray(vao);

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(mouseLocation, currentMouseRef.current.x, currentMouseRef.current.y);
      gl.uniform1f(timeLocation, elapsedTime);
      gl.uniform1i(isMobileLocation, isMobileDevice ? 1 : 0);
      gl.uniform1i(ideTextureLocation, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      gl.deleteTexture(ideTexture);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
    };
  }, [isMobileDevice]);

  // Joystick Tactile (Mobile)
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

      {/* Grille de fond */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] md:bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Joystick Mobile */}
      {isMobileDevice && (
        <div className="absolute bottom-8 right-8 z-30 flex flex-col items-center gap-2">
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase opacity-70">
            Rotate Screen
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

export default FloatingScreenIDE;