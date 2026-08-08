'use client';

import { useEffect, useRef, useState } from 'react';

const COVER_IMAGE_URL = '/e.jpg';

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
  if (!uIsMobile) {
    p.xz *= rot2D(uMouse.x * 0.1);
    p.yz *= rot2D(uMouse.y * 0.06);
  }

  vec3 pScreen = p - vec3(0.0, 0.0, 0.0);
  float dDisplay = sdRoundedBox(pScreen, vec3(0.9, 0.9, 0.015), 0.03);

  matID = 2.0;
  texCoord = vec2(
    (pScreen.x / 0.9) * 0.5 + 0.5,
    1.0 - ((pScreen.y / 0.9) * 0.5 + 0.5)
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

  float camDist = uIsMobile ? -2.45 : -2.25;
  vec3 ro = vec3(0.0, 0.0, camDist);
  vec3 rd = normalize(vec3(uv, 1.2));

  int maxSteps = uIsMobile ? 50 : 70;
  float dO = 0.0;
  vec2 hitTexCoord = vec2(0.0);

  for (int i = 0; i < 70; i++) {
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

  vec3 color = vec3(0.05, 0.03, 0.02);

  if (dO < MAX_DIST) {
    vec3 p = ro + rd * dO;
    vec3 n = getNormal(p);
    
    vec3 lightPos = vec3(uMouse.x * 2.0, 2.5, -2.0);
    vec3 l = normalize(lightPos - p);

    vec3 ref = reflect(rd, n);
    float spec = pow(max(0.0, dot(ref, l)), 32.0);
    float fresnel = pow(1.0 - max(0.0, dot(-rd, n)), 3.0);

    vec4 ideSample = texture(uIdeTexture, hitTexCoord);
    color = ideSample.rgb + spec * vec3(0.2) + fresnel * vec3(0.9, 0.4, 0.1) * 0.3;
  }

  float radialDist = length(uv);
  color += vec3(0.6, 0.25, 0.05) * (0.06 / (radialDist + 0.4));

  fragColor = vec4(color, 1.0);
}
`;

export const AestheticArcadeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showControlsHint, setShowControlsHint] = useState(true);

  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const targetMouseRef = useRef({ x: 0, y: 0 });
  const currentMouseRef = useRef({ x: 0, y: 0 });

  const gameState = useRef({
    playerX: 512,
    playerY: 880,
    moveLeft: false,
    moveRight: false,
    bullets: [] as { x: number; y: number }[],
    bugs: [] as { x: number; y: number; speed: number; label: string; radius: number }[],
    stars: Array.from({ length: 45 }, () => ({
      x: Math.random() * 1024,
      y: Math.random() * 1024,
      size: Math.random() * 2.5 + 1,
      speed: Math.random() * 2 + 1,
    })),
    keys: {} as Record<string, boolean>,
    score: 0,
    health: 100,
    isOver: false,
    lastShot: 0,
  });

  useEffect(() => {
    if (!gameStarted) return;

    const timer = setTimeout(() => {
      setShowControlsHint(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, [gameStarted]);

  const resetGame = () => {
    gameState.current.playerX = 512;
    gameState.current.playerY = 880;
    gameState.current.moveLeft = false;
    gameState.current.moveRight = false;
    gameState.current.bullets = [];
    gameState.current.bugs = [];
    gameState.current.score = 0;
    gameState.current.health = 100;
    gameState.current.isOver = false;
    gameState.current.lastShot = 0;
    setGameOver(false);
    setIsPaused(false);
    setGameStarted(true);
  };

  const quitGame = () => {
    setIsPaused(false);
    setGameOver(false);
    setGameStarted(false);
  };

  const togglePause = () => {
    if (gameStarted && !gameOver) {
      setIsPaused((prev) => !prev);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      gameState.current.keys[e.code] = true;
      if (e.code === 'KeyP' || e.code === 'Escape') {
        togglePause();
      }
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
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', {
      powerPreference: 'high-performance',
      antialias: true,
      alpha: false,
    });

    if (!gl) return;

    const ideCanvas = document.createElement('canvas');
    ideCanvas.width = 1024;
    ideCanvas.height = 1024;
    const ctx = ideCanvas.getContext('2d');

    const bugTypes = [
      { label: '404', radius: 24 },
      { label: 'NULL', radius: 20 },
      { label: 'BUG', radius: 28 },
      { label: 'ERR', radius: 22 },
    ];

    const updateAndDrawGame = (time: number) => {
      if (!ctx) return;
      const w = ideCanvas.width;
      const h = ideCanvas.height;

      const state = gameState.current;

      ctx.fillStyle = '#0a0806';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#f59e0b22';
      state.stars.forEach((star) => {
        if (!isPausedRef.current) {
          star.y += star.speed;
          if (star.y > h) star.y = 0;
        }
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      ctx.fillStyle = '#140c06';
      ctx.fillRect(0, 0, w, 76);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, 74, w, 2);

      ctx.font = 'bold 28px monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`SCORE: ${state.score.toString().padStart(6, '0')}`, 30, 48);

      ctx.fillStyle = '#26150a';
      ctx.fillRect(w - 280, 25, 250, 26);
      ctx.fillStyle = state.health > 40 ? '#f59e0b' : '#ef4444';
      ctx.fillRect(w - 280, 25, (state.health / 100) * 250, 26);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.strokeRect(w - 280, 25, 250, 26);

      if (!state.isOver && !isPausedRef.current) {
        const speed = 14;
        if (state.keys['ArrowLeft'] || state.keys['KeyA'] || state.keys['KeyQ'] || state.moveLeft) {
          state.playerX -= speed;
        }
        if (state.keys['ArrowRight'] || state.keys['KeyD'] || state.moveRight) {
          state.playerX += speed;
        }
        state.playerX = Math.max(50, Math.min(w - 50, state.playerX));

        if (time - state.lastShot > 0.11) {
          state.bullets.push({ x: state.playerX - 16, y: state.playerY - 24 });
          state.bullets.push({ x: state.playerX + 16, y: state.playerY - 24 });
          state.lastShot = time;
        }

        if (Math.random() < 0.05) {
          const type = bugTypes[Math.floor(Math.random() * bugTypes.length)];
          state.bugs.push({
            x: Math.random() * (w - 140) + 70,
            y: 80,
            speed: 3 + Math.random() * 4,
            label: type.label,
            radius: type.radius,
          });
        }

        state.bullets.forEach((b) => (b.y -= 20));
        state.bullets = state.bullets.filter((b) => b.y > 70);

        for (let i = state.bugs.length - 1; i >= 0; i--) {
          const bug = state.bugs[i];
          bug.y += bug.speed;

          for (let j = state.bullets.length - 1; j >= 0; j--) {
            const bullet = state.bullets[j];
            if (Math.hypot(bug.x - bullet.x, bug.y - bullet.y) < bug.radius + 8) {
              state.bugs.splice(i, 1);
              state.bullets.splice(j, 1);
              state.score += 100;
              break;
            }
          }

          if (bug.y > h - 70) {
            state.bugs.splice(i, 1);
            state.health -= 25;
            if (state.health <= 0) {
              state.isOver = true;
              setGameOver(true);
            }
          }
        }
      }

      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 10;
      state.bullets.forEach((b) => {
        ctx.fillRect(b.x - 3, b.y, 6, 18);
      });

      ctx.shadowColor = '#d97706';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(state.playerX, state.playerY - 32);
      ctx.lineTo(state.playerX - 30, state.playerY + 20);
      ctx.lineTo(state.playerX, state.playerY + 8);
      ctx.lineTo(state.playerX + 30, state.playerY + 20);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = Math.sin(time * 25) > 0 ? '#fbbf24' : '#b45309';
      ctx.beginPath();
      ctx.moveTo(state.playerX - 12, state.playerY + 14);
      ctx.lineTo(state.playerX, state.playerY + 32);
      ctx.lineTo(state.playerX + 12, state.playerY + 14);
      ctx.closePath();
      ctx.fill();

      state.bugs.forEach((bug) => {
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#1c0a00';
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(bug.x, bug.y, bug.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffedd5';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(bug.label, bug.x, bug.y + 6);
        ctx.textAlign = 'left';
      });

      ctx.shadowBlur = 0;

      if (state.isOver) {
        ctx.fillStyle = 'rgba(12, 6, 2, 0.94)';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 56px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SYSTEM CRASH', w / 2, h / 2 - 20);

        ctx.fillStyle = '#f59e0b';
        ctx.font = '24px monospace';
        ctx.fillText(`FINAL SCORE: ${state.score}`, w / 2, h / 2 + 40);
        ctx.textAlign = 'left';
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
      targetMouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
      if (!canvas) return;
      const mobile = window.innerWidth < 768;
      setIsMobileDevice(mobile);

      const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
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

      currentMouseRef.current.x += (targetMouseRef.current.x - currentMouseRef.current.x) * 0.1;
      currentMouseRef.current.y += (targetMouseRef.current.y - currentMouseRef.current.y) * 0.1;

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
  }, [isMobileDevice, gameStarted]);

  const startMoveLeft = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    gameState.current.moveLeft = true;
  };
  const stopMoveLeft = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    gameState.current.moveLeft = false;
  };
  const startMoveRight = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    gameState.current.moveRight = true;
  };
  const stopMoveRight = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    gameState.current.moveRight = false;
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#0a0705] select-none font-mono overflow-hidden flex items-center justify-center">
      {/* ÉCRAN D'ACCUEIL */}
      {!gameStarted && (
        <div className="w-full h-full flex flex-col items-center justify-between p-6 sm:p-8 bg-gradient-to-b from-[#f5f1eb] via-[#f2ede5] to-[#ede8e0] overflow-y-auto">
          <div className="w-full max-w-sm my-auto flex flex-col items-center space-y-6 text-center">
            <div className="w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-[#e8dcd3] border border-[#d4c9be]/50 shadow-md">
              <img
                src={COVER_IMAGE_URL}
                alt="Mission"
                className="w-full h-full object-cover opacity-90"
              />
            </div>

            <div className="w-full space-y-2">
              <p className="text-[#8b7d72] text-xs uppercase tracking-[0.25em] font-semibold">
                Escape Protocol
              </p>
              <p className="text-[#a89f94] text-xs sm:text-sm font-light leading-relaxed max-w-xs mx-auto">
                Éliminez les bugs avant la détection complète du système.
              </p>
            </div>

            <button
              onClick={resetGame}
              className="w-full py-4 bg-[#b8b8b8] text-[#1a1a1a] text-base font-extrabold uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.9)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all font-mono rounded-none"
            >
              Start Game
            </button>
          </div>

          <p className="hidden md:block text-[#b3a896] text-[0.65rem] uppercase tracking-[0.2em] font-light pb-2">
            Utilisez [←][→] ou [Q][D] pour déplacer | [P] ou [ECHAP] pour la Pause
          </p>
        </div>
      )}

      {/* Canvas WebGL */}
      {gameStarted && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      )}

      {/* BOUTON PAUSE ET EN-TÊTE D'ACTION */}
      {gameStarted && !gameOver && (
        <div className="absolute top-4 right-4 z-30 flex items-center gap-3">
          <button
            onClick={togglePause}
            className="w-11 h-11 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-400 font-bold text-sm backdrop-blur-md flex items-center justify-center active:scale-95 transition shadow-lg"
            aria-label="Pause"
          >
            {isPaused ? '▶' : '❚❚'}
          </button>
        </div>
      )}

      {/* INDICATION DE SOURIS / TOUCHES SUR PC */}
      {gameStarted && !isMobileDevice && showControlsHint && !isPaused && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 text-amber-300 text-xs bg-amber-950/90 border border-amber-700/50 px-6 py-2.5 rounded-full shadow-xl backdrop-blur-md animate-bounce">
          ⌨️ Touches <span className="text-white font-bold">[←] [→]</span> | Pause <span className="text-white font-bold">[P]</span>
        </div>
      )}

      {/* ÉCRAN DE PAUSE */}
      {gameStarted && isPaused && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
          <div className="w-full max-w-xs flex flex-col items-center space-y-4 text-center">
            <h2 className="text-amber-400 font-extrabold text-2xl tracking-widest uppercase">
              PAUSE
            </h2>

            <button
              onClick={togglePause}
              className="w-full py-3.5 bg-amber-500 text-zinc-950 text-sm font-black rounded-xl active:scale-95 transition shadow-lg uppercase tracking-wider"
            >
              Reprendre
            </button>

            <button
              onClick={resetGame}
              className="w-full py-3.5 bg-zinc-900 border border-amber-500/40 text-amber-300 text-sm font-bold rounded-xl active:scale-95 transition uppercase tracking-wider"
            >
              Recommencer
            </button>

            <button
              onClick={quitGame}
              className="w-full py-3.5 bg-red-950/60 border border-red-500/40 text-red-300 text-sm font-bold rounded-xl active:scale-95 transition uppercase tracking-wider"
            >
              Quitter
            </button>
          </div>
        </div>
      )}

      {/* ÉCRAN GAME OVER */}
      {gameOver && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-6">
          <div className="w-full max-w-xs flex flex-col items-center space-y-4">
            <button
              onClick={resetGame}
              className="w-full py-4 bg-amber-500 text-zinc-950 text-sm font-black rounded-2xl active:scale-95 transition shadow-[0_0_30px_rgba(245,158,11,0.5)] uppercase tracking-wider"
            >
              Recouvrer le système
            </button>

            <button
              onClick={quitGame}
              className="w-full py-3.5 bg-zinc-900 border border-amber-500/40 text-amber-300 text-sm font-bold rounded-2xl active:scale-95 transition uppercase tracking-wider"
            >
              Quitter
            </button>
          </div>
        </div>
      )}

      {/* COMMANDES TACTILES MOBILE */}
      {gameStarted && isMobileDevice && !isPaused && (
        <div className="absolute bottom-10 inset-x-0 z-30 flex justify-between items-center px-8 max-w-sm mx-auto pointer-events-auto pb-safe">
          <button
            onTouchStart={startMoveLeft}
            onTouchEnd={stopMoveLeft}
            onMouseDown={startMoveLeft}
            onMouseUp={stopMoveLeft}
            className="w-20 h-20 rounded-2xl bg-amber-950/80 border-2 border-amber-500/60 text-amber-300 font-black text-3xl backdrop-blur-lg flex items-center justify-center active:bg-amber-500 active:text-zinc-950 active:scale-90 transition-all touch-none shadow-2xl"
            aria-label="Gauche"
          >
            ◄
          </button>

          <button
            onTouchStart={startMoveRight}
            onTouchEnd={stopMoveRight}
            onMouseDown={startMoveRight}
            onMouseUp={stopMoveRight}
            className="w-20 h-20 rounded-2xl bg-amber-950/80 border-2 border-amber-500/60 text-amber-300 font-black text-3xl backdrop-blur-lg flex items-center justify-center active:bg-amber-500 active:text-zinc-950 active:scale-90 transition-all touch-none shadow-2xl"
            aria-label="Droite"
          >
            ►
          </button>
        </div>
      )}
    </div>
  );
};

export default AestheticArcadeGame;