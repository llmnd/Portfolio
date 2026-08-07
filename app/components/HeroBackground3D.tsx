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
  p.yz *= rot2D(0.08); 
  p.xz *= rot2D(uTime * 0.1 + uMouse.x * 0.8);
  p.xy *= rot2D(sin(uTime * 0.08) * 0.03 + uMouse.y * 0.4);

  vec3 pScreen = p - vec3(0.0, 0.0, 0.0);
  float dDisplay = sdRoundedBox(pScreen, vec3(0.85, 0.85, 0.015), 0.03);

  matID = 2.0;
  texCoord = vec2(
    (pScreen.x / 0.85) * 0.5 + 0.5,
    1.0 - ((pScreen.y / 0.85) * 0.5 + 0.5)
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

  float camDist = uIsMobile ? -2.8 : -2.3;
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

    vec4 ideSample = texture(uIdeTexture, hitTexCoord);
    color = ideSample.rgb + spec * vec3(0.15) + fresnel * vec3(0.0, 0.4, 0.8) * 0.3;
  }

  float radialDist = length(uv);
  color += vec3(0.08, 0.3, 0.65) * (0.06 / (radialDist + 0.45));

  float noise = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.012;
  color += noise;

  fragColor = vec4(color, 1.0);
}
`;

export const FloatingScreenGame = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const joystickRef = useRef<HTMLDivElement | null>(null);

  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const targetMouseRef = useRef({ x: 0, y: 0 });
  const currentMouseRef = useRef({ x: 0, y: 0 });

  // État du jeu (Mutable refs pour garder la boucle de rendu WebGL à 60 FPS)
  const gameState = useRef({
    playerX: 512,
    playerY: 850,
    bullets: [] as { x: number; y: number }[],
    bugs: [] as { x: number; y: number; speed: number; label: string }[],
    keys: {} as Record<string, boolean>,
    score: 0,
    isOver: false,
    lastShot: 0,
  });

  const resetGame = () => {
    gameState.current = {
      playerX: 512,
      playerY: 850,
      bullets: [],
      bugs: [],
      keys: {},
      score: 0,
      isOver: false,
      lastShot: 0,
    };
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      gameState.current.keys[e.code] = true;
      if (e.code === 'Space' && gameState.current.isOver) {
        resetGame();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      gameState.current.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', {
      powerPreference: 'high-performance',
      antialias: false,
      alpha: false,
    });

    if (!gl) return;

    const ideCanvas = document.createElement('canvas');
    ideCanvas.width = 1024;
    ideCanvas.height = 1024;
    const ctx = ideCanvas.getContext('2d');

    const bugLabels = ['404', 'BUG', 'NULL', 'RAM', 'ERR'];

    const updateAndDrawGame = (time: number) => {
      if (!ctx) return;
      const w = ideCanvas.width;
      const h = ideCanvas.height;
      const state = gameState.current;

      // Fond de l'écran IDE
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      // En-tête / Barre supérieure
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, w, 60);

      ctx.font = 'bold 22px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`SCORE: ${state.score}`, 30, 38);

      ctx.fillStyle = state.isOver ? '#ef4444' : '#10b981';
      ctx.fillText(state.isOver ? 'STATUS: CRASHED' : 'STATUS: DEBUGGING...', w - 280, 38);

      if (!state.isOver) {
        // --- LOGIQUE D'ACTION DE JEU ---

        // Controls Flèches / QSD
        if (state.keys['ArrowLeft'] || state.keys['KeyA']) state.playerX -= 12;
        if (state.keys['ArrowRight'] || state.keys['KeyD']) state.playerX += 12;
        state.playerX = Math.max(50, Math.min(w - 50, state.playerX));

        // Tir automatique ou Espace
        if ((state.keys['Space'] || state.keys['ArrowUp'] || true) && time - state.lastShot > 0.15) {
          state.bullets.push({ x: state.playerX, y: state.playerY - 20 });
          state.lastShot = time;
        }

        // Apparition des bugs (ennemis)
        if (Math.random() < 0.04) {
          state.bugs.push({
            x: Math.random() * (w - 100) + 50,
            y: 70,
            speed: 3 + Math.random() * 4,
            label: bugLabels[Math.floor(Math.random() * bugLabels.length)],
          });
        }

        // Mise à jour des projectiles
        state.bullets.forEach((b) => (b.y -= 16));
        state.bullets = state.bullets.filter((b) => b.y > 60);

        // Mise à jour des ennemis et collisions
        for (let i = state.bugs.length - 1; i >= 0; i--) {
          const bug = state.bugs[i];
          bug.y += bug.speed;

          // Impact tir / ennemi
          for (let j = state.bullets.length - 1; j >= 0; j--) {
            const bullet = state.bullets[j];
            if (Math.hypot(bug.x - bullet.x, bug.y - bullet.y) < 35) {
              state.bugs.splice(i, 1);
              state.bullets.splice(j, 1);
              state.score += 100;
              setScore(state.score);
              break;
            }
          }

          // Game Over (contact joueur ou bas d'écran)
          if (bug.y > h - 80) {
            state.isOver = true;
            setGameOver(true);
            break;
          }
        }
      }

      // --- RENDU GRAPHIQUE DU JEU ---

      // Projectiles
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      state.bullets.forEach((b) => {
        ctx.fillRect(b.x - 3, b.y, 6, 18);
      });

      // Vaisseau du joueur
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(state.playerX, state.playerY - 25);
      ctx.lineTo(state.playerX - 25, state.playerY + 20);
      ctx.lineTo(state.playerX + 25, state.playerY + 20);
      ctx.closePath();
      ctx.fill();

      // Ennemis (Bugs)
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.font = 'bold 20px monospace';
      state.bugs.forEach((bug) => {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(bug.x, bug.y, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.fillText(bug.label, bug.x - 18, bug.y + 6);
      });

      ctx.shadowBlur = 0; // Reset ombre

      // Écran Game Over
      if (state.isOver) {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 50px monospace';
        ctx.fillText('SYSTEM CRASHED', w / 2 - 200, h / 2 - 20);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '24px monospace';
        ctx.fillText(`FINAL SCORE: ${state.score}`, w / 2 - 110, h / 2 + 30);
        ctx.fillText('PRESS SPACE OR BUTTON TO RESTART', w / 2 - 230, h / 2 + 80);
      }
    };

    updateAndDrawGame(0);

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

      updateAndDrawGame(elapsedTime);

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

  // Contrôles tactiles (Mobile)
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
  };

  const updateJoystick = (touch: React.Touch) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const maxRadius = 45;

    let deltaX = touch.clientX - centerX;
    deltaX = Math.max(-maxRadius, Math.min(maxRadius, deltaX));

    setJoystickPos({ x: deltaX, y: 0 });

    // Déplace le joueur selon la position du joystick
    gameState.current.playerX += (deltaX / maxRadius) * 12;
    gameState.current.playerX = Math.max(50, Math.min(974, gameState.current.playerX));
  };

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden bg-[#030712] select-none">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full block" />

      {/* Interface overlay */}
      <div className="absolute top-6 left-6 z-20 font-mono text-cyan-400 text-sm bg-slate-900/80 p-4 rounded-lg border border-cyan-500/30 backdrop-blur-md">
        <p className="font-bold mb-1">🎮 CONTRÔLES :</p>
        <p>• Flèches G/D ou A/D : Déplacer</p>
        <p>• Espace : Redémarrer</p>
      </div>

      {gameOver && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-cyan-500 text-slate-950 font-mono font-bold rounded-lg shadow-lg hover:bg-cyan-400 transition"
          >
            RECOMMENCER LA PARTIE
          </button>
        </div>
      )}

      {/* Joystick Tactile */}
      {isMobileDevice && (
        <div className="absolute bottom-8 right-8 z-30 flex flex-col items-center gap-2">
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase opacity-70">
            Move Player
          </span>
          <div
            ref={joystickRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative w-28 h-28 rounded-full bg-slate-900/60 border border-cyan-500/30 backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.15)] touch-none"
          >
            <div
              className="w-12 h-12 rounded-full border border-cyan-400/60 bg-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.4)] flex items-center justify-center"
              style={{ transform: `translate3d(${joystickPos.x}px, 0, 0)` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingScreenGame;