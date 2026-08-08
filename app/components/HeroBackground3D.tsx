'use client';

import { useEffect, useRef, useState } from 'react';

/* =========================================================
   PALETTE
   ========================================================= */

const COLORS = {
  cream: '#f4ecdd',
  creamSoft: '#eee3d1',
  beige: '#dcc4aa',
  beigeDark: '#c9a88b',
  brown: '#9b765d',
  brownDark: '#725643',

  gameBg: '#151411',
  gamePanel: '#1c1a16',
  gameGrid: '#332d26',
  gameLine: '#4a4035',

  white: '#f8f2e8',
  muted: '#b9aa98',

  enemy: '#c99d79',
  enemyDark: '#8d6b52',

  player: '#ead5bc',
  bullet: '#e4c09b',
};

/* =========================================================
   WEBGL VERTEX SHADER
   ========================================================= */

const VERTEX_SHADER = `#version 300 es

in vec2 aPosition;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

/* =========================================================
   WEBGL FRAGMENT SHADER
   ========================================================= */

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
  float s = sin(angle);
  float c = cos(angle);

  return mat2(
    c, -s,
    s, c
  );
}

float sdRoundedBox(
  vec3 p,
  vec3 b,
  float r
) {
  vec3 q = abs(p) - b;

  return length(max(q, 0.0))
    + min(
        max(q.x, max(q.y, q.z)),
        0.0
      )
    - r;
}

float map(
  vec3 p,
  out float matID,
  out vec2 texCoord
) {

  if (!uIsMobile) {

    p.xz *= rot2D(
      uMouse.x * 0.12
    );

    p.yz *= rot2D(
      uMouse.y * 0.08
    );
  }

  vec3 pScreen = p;

  float dDisplay = sdRoundedBox(
    pScreen,
    vec3(0.9, 0.9, 0.015),
    0.03
  );

  matID = 2.0;

  texCoord = vec2(
    (pScreen.x / 0.9) * 0.5 + 0.5,
    1.0 -
      (
        (pScreen.y / 0.9) * 0.5 +
        0.5
      )
  );

  return dDisplay;
}

float mapDistOnly(vec3 p) {

  float dummyMat;
  vec2 dummyUv;

  return map(
    p,
    dummyMat,
    dummyUv
  );
}

vec3 getNormal(vec3 p) {

  float d = mapDistOnly(p);

  vec2 e = vec2(
    0.001,
    0.0
  );

  vec3 n =
    d -
    vec3(
      mapDistOnly(
        p - e.xyy
      ),

      mapDistOnly(
        p - e.yxy
      ),

      mapDistOnly(
        p - e.yyx
      )
    );

  return normalize(n);
}

void main() {

  vec2 uv =
    (
      gl_FragCoord.xy -
      0.5 * uResolution.xy
    )
    /
    min(
      uResolution.x,
      uResolution.y
    );

  float camDist =
    uIsMobile
      ? -2.35
      : -2.25;

  vec3 ro = vec3(
    0.0,
    0.0,
    camDist
  );

  vec3 rd = normalize(
    vec3(
      uv,
      1.2
    )
  );

  int maxSteps =
    uIsMobile
      ? 50
      : 70;

  float dO = 0.0;

  vec2 hitTexCoord =
    vec2(0.0);

  for (
    int i = 0;
    i < 70;
    i++
  ) {

    if (i >= maxSteps) {
      break;
    }

    vec3 p =
      ro + rd * dO;

    float currentMat;
    vec2 currentTexCoord;

    float dS =
      map(
        p,
        currentMat,
        currentTexCoord
      );

    dO += dS;

    if (
      dS <
      SURF_DIST
    ) {

      hitTexCoord =
        currentTexCoord;

      break;
    }

    if (
      dO >
      MAX_DIST
    ) {
      break;
    }
  }

  /*
   * Warm dark background
   */

  vec3 color =
    vec3(
      0.055,
      0.05,
      0.043
    );

  if (
    dO <
    MAX_DIST
  ) {

    vec3 p =
      ro + rd * dO;

    vec3 n =
      getNormal(p);

    /*
     * Warm light
     */

    vec3 lightPos =
      vec3(
        uMouse.x * 2.0,
        2.5,
        -2.0
      );

    vec3 l =
      normalize(
        lightPos - p
      );

    vec3 ref =
      reflect(
        rd,
        n
      );

    float spec =
      pow(
        max(
          0.0,
          dot(
            ref,
            l
          )
        ),
        32.0
      );

    float fresnel =
      pow(
        1.0 -
        max(
          0.0,
          dot(
            -rd,
            n
          )
        ),
        3.0
      );

    vec4 gameSample =
      texture(
        uIdeTexture,
        hitTexCoord
      );

    color =
      gameSample.rgb
      +
      spec *
      vec3(
        0.25,
        0.19,
        0.14
      )
      +
      fresnel *
      vec3(
        0.32,
        0.22,
        0.15
      ) *
      0.35;
  }

  /*
   * Subtle warm vignette
   */

  float radialDist =
    length(uv);

  color +=
    vec3(
      0.12,
      0.08,
      0.05
    )
    *
    (
      0.035 /
      (radialDist + 0.4)
    );

  fragColor =
    vec4(
      color,
      1.0
    );
}
`;

/* =========================================================
   COMPONENT
   ========================================================= */

export const AestheticArcadeGame = () => {

  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const audioContextRef =
    useRef<AudioContext | null>(
      null
    );

  const [isMobileDevice, setIsMobileDevice] =
    useState(false);

  const [gameOver, setGameOver] =
    useState(false);

  const [hasStarted, setHasStarted] =
    useState(false);

  const [isPaused, setIsPaused] =
    useState(false);

  const [showControlsHint, setShowControlsHint] =
    useState(true);

  const hasStartedRef =
    useRef(false);

  const isPausedRef =
    useRef(false);

  const targetMouseRef =
    useRef({
      x: 0,
      y: 0,
    });

  const currentMouseRef =
    useRef({
      x: 0,
      y: 0,
    });

  /* =======================================================
     GAME STATE
     ======================================================= */

  const gameState = useRef({

    playerX: 512,

    playerY: 880,

    moveLeft: false,

    moveRight: false,

    bullets: [] as {
      x: number;
      y: number;
    }[],

    bugs: [] as {
      x: number;
      y: number;
      speed: number;
      vx: number;
      label: string;
      radius: number;
      rotation: number;
      phase: number;
    }[],

    stars: Array.from(
      {
        length: 55,
      },
      () => ({
        x:
          Math.random() *
          1024,

        y:
          Math.random() *
          1024,

        size:
          Math.random() *
            1.8 +
          0.5,

        speed:
          Math.random() *
            1.5 +
          0.4,
      })
    ),

    keys:
      {} as Record<
        string,
        boolean
      >,

    score: 0,

    health: 100,

    isOver: false,

    lastShot: 0,

    lastSpawn: 0,

    elapsed: 0,
  });

  /* =======================================================
     KILL SOUND
     ======================================================= */

  const playKillSound = () => {

    try {

      let audio =
        audioContextRef.current;

      if (!audio) {

        audio =
          new AudioContext();

        audioContextRef.current =
          audio;
      }

      if (
        audio.state ===
        'suspended'
      ) {
        audio.resume();
      }

      const now =
        audio.currentTime;

      /*
       * Main short tone
       */

      const oscillator =
        audio.createOscillator();

      const gain =
        audio.createGain();

      oscillator.type =
        'sine';

      oscillator.frequency.setValueAtTime(
        420,
        now
      );

      oscillator.frequency.exponentialRampToValueAtTime(
        760,
        now + 0.055
      );

      oscillator.frequency.exponentialRampToValueAtTime(
        280,
        now + 0.13
      );

      gain.gain.setValueAtTime(
        0.0001,
        now
      );

      gain.gain.exponentialRampToValueAtTime(
        0.055,
        now + 0.008
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.14
      );

      oscillator.connect(
        gain
      );

      gain.connect(
        audio.destination
      );

      oscillator.start(
        now
      );

      oscillator.stop(
        now + 0.15
      );

      /*
       * Tiny second layer
       */

      const secondOscillator =
        audio.createOscillator();

      const secondGain =
        audio.createGain();

      secondOscillator.type =
        'triangle';

      secondOscillator.frequency.setValueAtTime(
        920,
        now
      );

      secondOscillator.frequency.exponentialRampToValueAtTime(
        540,
        now + 0.08
      );

      secondGain.gain.setValueAtTime(
        0.0001,
        now
      );

      secondGain.gain.exponentialRampToValueAtTime(
        0.025,
        now + 0.005
      );

      secondGain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.09
      );

      secondOscillator.connect(
        secondGain
      );

      secondGain.connect(
        audio.destination
      );

      secondOscillator.start(
        now
      );

      secondOscillator.stop(
        now + 0.1
      );

    } catch {
      /*
       * Audio is optional.
       * Never let sound break the game.
       */
    }
  };

  /* =======================================================
     RESET
     ======================================================= */

  const resetGame = () => {

    const state =
      gameState.current;

    state.playerX =
      512;

    state.playerY =
      880;

    state.moveLeft =
      false;

    state.moveRight =
      false;

    state.bullets =
      [];

    state.bugs =
      [];

    state.score =
      0;

    state.health =
      100;

    state.isOver =
      false;

    state.lastShot =
      0;

    state.lastSpawn =
      0;

    state.elapsed =
      0;

    setGameOver(
      false
    );

    setIsPaused(
      false
    );

    isPausedRef.current =
      false;
  };

  /* =======================================================
     START
     ======================================================= */

  const startGame = () => {

    /*
     * Unlock Web Audio after user gesture
     */

    try {

      if (
        !audioContextRef.current
      ) {

        audioContextRef.current =
          new AudioContext();
      }

      if (
        audioContextRef.current
          .state ===
        'suspended'
      ) {

        audioContextRef.current.resume();
      }

    } catch {
      // Audio remains optional.
    }

    resetGame();

    hasStartedRef.current =
      true;

    isPausedRef.current =
      false;

    setHasStarted(
      true
    );

    setIsPaused(
      false
    );

    setShowControlsHint(
      true
    );

    window.setTimeout(
      () => {

        setShowControlsHint(
          false
        );

      },
      4500
    );
  };

  /* =======================================================
     PAUSE
     ======================================================= */

  const pauseGame = () => {

    if (
      !hasStartedRef.current ||
      gameState.current.isOver
    ) {
      return;
    }

    const next =
      !isPausedRef.current;

    isPausedRef.current =
      next;

    setIsPaused(
      next
    );

    gameState.current.moveLeft =
      false;

    gameState.current.moveRight =
      false;
  };

  /* =======================================================
     QUIT
     ======================================================= */

  const quitGame = () => {

    hasStartedRef.current =
      false;

    isPausedRef.current =
      false;

    setIsPaused(
      false
    );

    setGameOver(
      false
    );

    setHasStarted(
      false
    );

    resetGame();
  };

  /* =======================================================
     KEYBOARD
     ======================================================= */

  useEffect(() => {

    const handleKeyDown =
      (e: KeyboardEvent) => {

        gameState.current.keys[
          e.code
        ] = true;

        /*
         * Pause
         */

        if (
          e.code ===
            'Escape' ||
          e.code ===
            'KeyP'
        ) {

          e.preventDefault();

          pauseGame();

          return;
        }

        /*
         * Restart
         */

        if (
          e.code ===
            'Space' &&
          gameState.current.isOver
        ) {

          e.preventDefault();

          startGame();
        }
      };

    const handleKeyUp =
      (e: KeyboardEvent) => {

        gameState.current.keys[
          e.code
        ] = false;
      };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    window.addEventListener(
      'keyup',
      handleKeyUp
    );

    return () => {

      window.removeEventListener(
        'keydown',
        handleKeyDown
      );

      window.removeEventListener(
        'keyup',
        handleKeyUp
      );
    };

  }, []);

  /* =======================================================
     WEBGL + GAME LOOP
     ======================================================= */

  useEffect(() => {

    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const gl =
      canvas.getContext(
        'webgl2',
        {
          powerPreference:
            'high-performance',

          antialias: true,

          alpha: false,
        }
      );

    if (!gl) {
      return;
    }

    /* =====================================================
       INTERNAL GAME CANVAS
       ===================================================== */

    const ideCanvas =
      document.createElement(
        'canvas'
      );

    ideCanvas.width =
      1024;

    ideCanvas.height =
      1024;

    const ctx =
      ideCanvas.getContext(
        '2d'
      );

    if (!ctx) {
      return;
    }

    /* =====================================================
       BUG TYPES
       ===================================================== */

    const bugTypes = [
      {
        label: '404',
        radius: 24,
        speed: 1.0,
        drift: 0.8,
      },

      {
        label: 'NULL',
        radius: 21,
        speed: 1.18,
        drift: 1.35,
      },

      {
        label: 'BUG',
        radius: 27,
        speed: 0.88,
        drift: 0.55,
      },

      {
        label: 'ERR',
        radius: 22,
        speed: 1.35,
        drift: 1.65,
      },
    ];

    /* =====================================================
       DRAW GAME
       ===================================================== */

    const updateAndDrawGame =
      (time: number) => {

        const w =
          ideCanvas.width;

        const h =
          ideCanvas.height;

        const state =
          gameState.current;

        /* =================================================
           BACKGROUND
           ================================================= */

        ctx.fillStyle =
          COLORS.gameBg;

        ctx.fillRect(
          0,
          0,
          w,
          h
        );

        /* =================================================
           STARS
           ================================================= */

        ctx.fillStyle =
          'rgba(238, 224, 205, 0.55)';

        state.stars.forEach(
          (star) => {

            if (
              hasStartedRef.current &&
              !isPausedRef.current &&
              !state.isOver
            ) {

              star.y +=
                star.speed;
            }

            if (
              star.y >
              h
            ) {

              star.y =
                76;
            }

            ctx.fillRect(
              star.x,
              star.y,
              star.size,
              star.size
            );
          }
        );

        /* =================================================
           GRID
           ================================================= */

        ctx.strokeStyle =
          'rgba(220, 196, 170, 0.065)';

        ctx.lineWidth =
          1;

        for (
          let x = 0;
          x < w;
          x += 64
        ) {

          ctx.beginPath();

          ctx.moveTo(
            x,
            76
          );

          ctx.lineTo(
            x,
            h
          );

          ctx.stroke();
        }

        for (
          let y = 140;
          y < h;
          y += 64
        ) {

          ctx.beginPath();

          ctx.moveTo(
            0,
            y
          );

          ctx.lineTo(
            w,
            y
          );

          ctx.stroke();
        }

        /* =================================================
           HUD
           ================================================= */

        ctx.fillStyle =
          'rgba(27, 25, 21, 0.96)';

        ctx.fillRect(
          0,
          0,
          w,
          76
        );

        ctx.strokeStyle =
          'rgba(220, 196, 170, 0.24)';

        ctx.lineWidth =
          1;

        ctx.beginPath();

        ctx.moveTo(
          0,
          75.5
        );

        ctx.lineTo(
          w,
          75.5
        );

        ctx.stroke();

        /* =================================================
           SCORE
           ================================================= */

        ctx.font =
          '11px Arial, sans-serif';

        ctx.fillStyle =
          COLORS.muted;

        ctx.fillText(
          'SCORE',
          30,
          28
        );

        ctx.font =
          '20px monospace';

        ctx.fillStyle =
          COLORS.white;

        ctx.fillText(
          state.score
            .toString()
            .padStart(
              6,
              '0'
            ),
          30,
          52
        );

        /* =================================================
           HEALTH
           ================================================= */

        ctx.font =
          '11px Arial, sans-serif';

        ctx.fillStyle =
          COLORS.muted;

        ctx.fillText(
          'HEALTH',
          w - 300,
          28
        );

        const healthSegments =
          7;

        const segmentWidth =
          22;

        const segmentGap =
          5;

        const totalWidth =
          healthSegments *
            segmentWidth +
          (healthSegments - 1) *
            segmentGap;

        const healthStart =
          w -
          30 -
          totalWidth;

        for (
          let i = 0;
          i < healthSegments;
          i++
        ) {

          const threshold =
            ((i + 1) /
              healthSegments) *
            100;

          const active =
            state.health >=
            threshold;

          ctx.fillStyle =
            active
              ? COLORS.beige
              : '#39332c';

          ctx.beginPath();

          ctx.roundRect(
            healthStart +
              i *
                (
                  segmentWidth +
                  segmentGap
                ),
            40,
            segmentWidth,
            10,
            3
          );

          ctx.fill();
        }

        /* =================================================
           GAMEPLAY
           ================================================= */

        if (
          hasStartedRef.current &&
          !isPausedRef.current &&
          !state.isOver
        ) {

          /*
           * Difficulty ramps up continuously instead of
           * becoming harder only through random luck.
           */
          state.elapsed += 1 / 60;

          const difficulty =
            Math.min(
              2.15,
              1 +
                state.elapsed * 0.012
            );

          const speed =
            11 + difficulty * 1.8;

          /* ===============================================
             MOVEMENT
             ===============================================
          */

          if (
            state.keys[
              'ArrowLeft'
            ] ||
            state.keys[
              'KeyA'
            ] ||
            state.keys[
              'KeyQ'
            ] ||
            state.moveLeft
          ) {

            state.playerX -=
              speed;
          }

          if (
            state.keys[
              'ArrowRight'
            ] ||
            state.keys[
              'KeyD'
            ] ||
            state.moveRight
          ) {

            state.playerX +=
              speed;
          }

          state.playerX =
            Math.max(
              50,
              Math.min(
                w - 50,
                state.playerX
              )
            );

          /* ===============================================
             AUTO SHOOT
             =============================================== */

          if (
            time -
              state.lastShot >
            Math.max(
              0.135,
              0.17 -
                state.elapsed * 0.0008
            )
          ) {

            state.bullets.push({
              x:
                state.playerX -
                16,

              y:
                state.playerY -
                24,
            });

            state.bullets.push({
              x:
                state.playerX +
                16,

              y:
                state.playerY -
                24,
            });

            state.lastShot =
              time;
          }

          /* ===============================================
             SPAWN BUGS
             =============================================== */

          /*
           * Spawn using time rather than a per-frame random
           * probability. This keeps the difficulty consistent
           * across 60/90/120Hz screens.
           */
          const spawnInterval =
            Math.max(
              260,
              760 -
                state.elapsed * 8
            );

          if (
            time * 1000 -
              state.lastSpawn >
            spawnInterval
          ) {
            const type =
              bugTypes[
                Math.floor(
                  Math.random() *
                    bugTypes.length
                )
              ];

            const baseSpeed =
              (2.8 +
                Math.random() * 2.2) *
              type.speed *
              difficulty;

            state.bugs.push({
              x:
                Math.random() *
                  (w - 140) +
                70,

              y:
                92,

              speed:
                baseSpeed,

              vx:
                (Math.random() * 2 - 1) *
                type.drift *
                difficulty,

              label:
                type.label,

              radius:
                type.radius,

              rotation:
                Math.random() *
                Math.PI *
                2,

              phase:
                Math.random() *
                Math.PI *
                2,
            });

            state.lastSpawn =
              time * 1000;
          }

          /* ===============================================
             BULLETS
             =============================================== */

          state.bullets.forEach(
            (bullet) => {

              bullet.y -=
                20;
            }
          );

          state.bullets =
            state.bullets.filter(
              (bullet) =>
                bullet.y >
                76
            );

          /* ===============================================
             BUGS
             =============================================== */

          for (
            let i =
              state.bugs.length -
              1;

            i >= 0;

            i--
          ) {

            const bug =
              state.bugs[i];

            /*
             * Enemies no longer fall in a perfectly straight
             * line: they drift, weave and gradually track the
             * player's horizontal position.
             */
            bug.phase += 0.045;

            const targetPull =
              (state.playerX - bug.x) *
              0.0009 *
              difficulty;

            bug.vx +=
              targetPull +
              Math.sin(bug.phase) *
                0.025;

            bug.vx *= 0.985;

            const maxDrift =
              2.8 +
              difficulty * 0.8;

            bug.vx =
              Math.max(
                -maxDrift,
                Math.min(
                  maxDrift,
                  bug.vx
                )
              );

            bug.x +=
              bug.vx;

            if (
              bug.x <
                bug.radius + 8 ||
              bug.x >
                w -
                  bug.radius -
                  8
            ) {
              bug.vx *=
                -0.85;

              bug.x =
                Math.max(
                  bug.radius + 8,
                  Math.min(
                    w -
                      bug.radius -
                      8,
                    bug.x
                  )
                );
            }

            bug.y +=
              bug.speed;

            bug.rotation +=
              0.01 +
              bug.speed * 0.001;

            /* =============================================
               COLLISIONS
               ============================================= */

            let killed =
              false;

            for (
              let j =
                state.bullets.length -
                1;

              j >= 0;

              j--
            ) {

              const bullet =
                state.bullets[j];

              const distance =
                Math.hypot(
                  bug.x -
                    bullet.x,

                  bug.y -
                    bullet.y
                );

              if (
                distance <
                bug.radius +
                  8
              ) {

                state.bugs.splice(
                  i,
                  1
                );

                state.bullets.splice(
                  j,
                  1
                );

                state.score +=
                  100;

                killed =
                  true;

                /*
                 * Kill sound
                 */

                playKillSound();

                break;
              }
            }

            if (killed) {
              continue;
            }

            /* =============================================
               BUG REACHED PLAYER
               ============================================= */

            /*
             * Real collision with the ship instead of an
             * arbitrary bottom-line hit.
             */
            const playerDistance =
              Math.hypot(
                bug.x -
                  state.playerX,
                bug.y -
                  state.playerY
              );

            if (
              playerDistance <
              bug.radius + 24
            ) {
              state.bugs.splice(
                i,
                1
              );

              state.health -=
                25;

              if (
                state.health <=
                0
              ) {
                state.health =
                  0;

                state.isOver =
                  true;

                setGameOver(
                  true
                );
              }
            } else if (
              bug.y >
              h + bug.radius
            ) {
              /*
               * Missing an enemy is less punishing than
               * taking a direct hit, but the enemy is gone.
               */
              state.bugs.splice(
                i,
                1
              );

              state.health -=
                10;

              if (
                state.health <=
                0
              ) {
                state.health =
                  0;

                state.isOver =
                  true;

                setGameOver(
                  true
                );
              }
            }
          }
        }

        /* =================================================
           BULLETS DRAW
           ================================================= */

        ctx.shadowColor =
          'rgba(228, 192, 155, 0.8)';

        ctx.shadowBlur =
          8;

        state.bullets.forEach(
          (bullet) => {

            ctx.fillStyle =
              COLORS.bullet;

            ctx.beginPath();

            ctx.roundRect(
              bullet.x - 2,
              bullet.y,
              4,
              18,
              2
            );

            ctx.fill();
          }
        );

        ctx.shadowBlur =
          0;

        /* =================================================
           PLAYER
           ================================================= */

        ctx.save();

        ctx.translate(
          state.playerX,
          state.playerY
        );

        ctx.shadowColor =
          'rgba(226, 193, 157, 0.5)';

        ctx.shadowBlur =
          18;

        ctx.fillStyle =
          COLORS.player;

        ctx.beginPath();

        ctx.moveTo(
          0,
          -32
        );

        ctx.lineTo(
          -30,
          20
        );

        ctx.lineTo(
          0,
          8
        );

        ctx.lineTo(
          30,
          20
        );

        ctx.closePath();

        ctx.fill();

        /*
         * Center
         */

        ctx.fillStyle =
          '#fff8ed';

        ctx.beginPath();

        ctx.moveTo(
          0,
          -20
        );

        ctx.lineTo(
          -8,
          10
        );

        ctx.lineTo(
          8,
          10
        );

        ctx.closePath();

        ctx.fill();

        /*
         * Engine
         */

        ctx.shadowBlur =
          10;

        ctx.fillStyle =
          Math.sin(
            time * 25
          ) > 0
            ? '#cba47e'
            : '#a77d5e';

        ctx.beginPath();

        ctx.moveTo(
          -9,
          15
        );

        ctx.lineTo(
          0,
          34
        );

        ctx.lineTo(
          9,
          15
        );

        ctx.closePath();

        ctx.fill();

        ctx.restore();

        /* =================================================
           BUGS DRAW
           ================================================= */

        state.bugs.forEach(
          (bug) => {

            ctx.save();

            ctx.translate(
              bug.x,
              bug.y
            );

            ctx.rotate(
              Math.sin(
                bug.rotation
              ) *
              0.08
            );

            ctx.shadowColor =
              'rgba(201, 157, 121, 0.55)';

            ctx.shadowBlur =
              12;

            /*
             * Body
             */

            ctx.fillStyle =
              COLORS.enemy;

            ctx.strokeStyle =
              COLORS.enemyDark;

            ctx.lineWidth =
              2;

            ctx.beginPath();

            ctx.arc(
              0,
              0,
              bug.radius,
              0,
              Math.PI * 2
            );

            ctx.fill();

            ctx.stroke();

            /*
             * Legs
             */

            ctx.shadowBlur =
              0;

            ctx.strokeStyle =
              COLORS.enemy;

            ctx.lineWidth =
              2;

            for (
              let i = -1;
              i <= 1;
              i++
            ) {

              ctx.beginPath();

              ctx.moveTo(
                -bug.radius + 4,
                i * 8
              );

              ctx.lineTo(
                -bug.radius - 7,
                i * 10
              );

              ctx.stroke();

              ctx.beginPath();

              ctx.moveTo(
                bug.radius - 4,
                i * 8
              );

              ctx.lineTo(
                bug.radius + 7,
                i * 10
              );

              ctx.stroke();
            }

            /*
             * Eyes
             */

            ctx.fillStyle =
              COLORS.gameBg;

            ctx.beginPath();

            ctx.arc(
              -7,
              -4,
              3,
              0,
              Math.PI * 2
            );

            ctx.arc(
              7,
              -4,
              3,
              0,
              Math.PI * 2
            );

            ctx.fill();

            /*
             * Label
             */

            ctx.fillStyle =
              COLORS.gameBg;

            ctx.font =
              'bold 10px monospace';

            ctx.textAlign =
              'center';

            ctx.textBaseline =
              'middle';

            ctx.fillText(
              bug.label,
              0,
              10
            );

            ctx.restore();
          }
        );

        /* =================================================
           GAME OVER
           ================================================= */

        if (
          state.isOver
        ) {

          ctx.fillStyle =
            'rgba(18, 16, 13, 0.88)';

          ctx.fillRect(
            0,
            0,
            w,
            h
          );

          ctx.fillStyle =
            COLORS.beige;

          ctx.font =
            '500 42px Arial, sans-serif';

          ctx.textAlign =
            'center';

          ctx.fillText(
            'GAME OVER',
            w / 2,
            h / 2 - 30
          );

          ctx.fillStyle =
            COLORS.muted;

          ctx.font =
            '16px monospace';

          ctx.fillText(
            `SCORE  ${state.score
              .toString()
              .padStart(
                6,
                '0'
              )}`,
            w / 2,
            h / 2 + 10
          );

          ctx.textAlign =
            'left';
        }

        /* =================================================
           PAUSE
           ================================================= */

        if (
          isPausedRef.current &&
          hasStartedRef.current &&
          !state.isOver
        ) {

          ctx.fillStyle =
            'rgba(15, 14, 12, 0.35)';

          ctx.fillRect(
            0,
            0,
            w,
            h
          );
        }
      };

    updateAndDrawGame(
      0
    );

    /* =====================================================
       TEXTURE
       ===================================================== */

    const ideTexture =
      gl.createTexture();

    gl.activeTexture(
      gl.TEXTURE0
    );

    gl.bindTexture(
      gl.TEXTURE_2D,
      ideTexture
    );

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      ideCanvas
    );

    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_WRAP_S,
      gl.CLAMP_TO_EDGE
    );

    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_WRAP_T,
      gl.CLAMP_TO_EDGE
    );

    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR
    );

    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MAG_FILTER,
      gl.LINEAR
    );

    /* =====================================================
       SHADERS
       ===================================================== */

    const createShader = (
      type: number,
      source: string
    ) => {

      const shader =
        gl.createShader(
          type
        );

      if (!shader) {
        return null;
      }

      gl.shaderSource(
        shader,
        source
      );

      gl.compileShader(
        shader
      );

      if (
        !gl.getShaderParameter(
          shader,
          gl.COMPILE_STATUS
        )
      ) {

        console.error(
          gl.getShaderInfoLog(
            shader
          )
        );

        gl.deleteShader(
          shader
        );

        return null;
      }

      return shader;
    };

    const vertShader =
      createShader(
        gl.VERTEX_SHADER,
        VERTEX_SHADER
      );

    const fragShader =
      createShader(
        gl.FRAGMENT_SHADER,
        FRAGMENT_SHADER
      );

    if (
      !vertShader ||
      !fragShader
    ) {
      return;
    }

    /* =====================================================
       PROGRAM
       ===================================================== */

    const program =
      gl.createProgram();

    if (!program) {
      return;
    }

    gl.attachShader(
      program,
      vertShader
    );

    gl.attachShader(
      program,
      fragShader
    );

    gl.linkProgram(
      program
    );

    if (
      !gl.getProgramParameter(
        program,
        gl.LINK_STATUS
      )
    ) {

      console.error(
        gl.getProgramInfoLog(
          program
        )
      );

      return;
    }

    /* =====================================================
       BUFFER
       ===================================================== */

    const positionBuffer =
      gl.createBuffer();

    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      positionBuffer
    );

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,

        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    );

    /* =====================================================
       VAO
       ===================================================== */

    const positionAttributeLocation =
      gl.getAttribLocation(
        program,
        'aPosition'
      );

    const vao =
      gl.createVertexArray();

    gl.bindVertexArray(
      vao
    );

    gl.enableVertexAttribArray(
      positionAttributeLocation
    );

    gl.vertexAttribPointer(
      positionAttributeLocation,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );

    /* =====================================================
       UNIFORMS
       ===================================================== */

    const resolutionLocation =
      gl.getUniformLocation(
        program,
        'uResolution'
      );

    const mouseLocation =
      gl.getUniformLocation(
        program,
        'uMouse'
      );

    const timeLocation =
      gl.getUniformLocation(
        program,
        'uTime'
      );

    const isMobileLocation =
      gl.getUniformLocation(
        program,
        'uIsMobile'
      );

    const ideTextureLocation =
      gl.getUniformLocation(
        program,
        'uIdeTexture'
      );

    /* =====================================================
       MOUSE
       ===================================================== */

    const handleMouseMove =
      (e: MouseEvent) => {

        targetMouseRef.current.x =
          (
            e.clientX /
            window.innerWidth
          ) *
            2 -
          1;

        targetMouseRef.current.y =
          -(
            e.clientY /
            window.innerHeight
          ) *
            2 +
          1;
      };

    /* =====================================================
       RESIZE
       ===================================================== */

    const handleResize =
      () => {

        if (!canvas) {
          return;
        }

        const mobile =
          window.innerWidth <
          768;

        setIsMobileDevice(
          mobile
        );

        const dpr =
          Math.min(
            window.devicePixelRatio ||
              1,
            2.5
          );

        canvas.width =
          window.innerWidth *
          dpr;

        canvas.height =
          window.innerHeight *
          dpr;

        gl.viewport(
          0,
          0,
          canvas.width,
          canvas.height
        );
      };

    window.addEventListener(
      'mousemove',
      handleMouseMove
    );

    window.addEventListener(
      'resize',
      handleResize
    );

    handleResize();

    /* =====================================================
       RENDER
       ===================================================== */

    let animationFrameId =
      0;

    const startTime =
      performance.now();

    const render =
      (now: number) => {

        const elapsedTime =
          (
            now -
            startTime
          ) *
          0.001;

        updateAndDrawGame(
          elapsedTime
        );

        /*
         * Update texture
         */

        gl.activeTexture(
          gl.TEXTURE0
        );

        gl.bindTexture(
          gl.TEXTURE_2D,
          ideTexture
        );

        gl.texSubImage2D(
          gl.TEXTURE_2D,
          0,
          0,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          ideCanvas
        );

        /*
         * Smooth mouse
         */

        currentMouseRef.current.x +=
          (
            targetMouseRef.current.x -
            currentMouseRef.current.x
          ) *
          0.1;

        currentMouseRef.current.y +=
          (
            targetMouseRef.current.y -
            currentMouseRef.current.y
          ) *
          0.1;

        /*
         * Render WebGL
         */

        gl.useProgram(
          program
        );

        gl.bindVertexArray(
          vao
        );

        gl.uniform2f(
          resolutionLocation,
          canvas.width,
          canvas.height
        );

        gl.uniform2f(
          mouseLocation,
          currentMouseRef.current.x,
          currentMouseRef.current.y
        );

        gl.uniform1f(
          timeLocation,
          elapsedTime
        );

        gl.uniform1i(
          isMobileLocation,
          isMobileDevice
            ? 1
            : 0
        );

        gl.uniform1i(
          ideTextureLocation,
          0
        );

        gl.drawArrays(
          gl.TRIANGLES,
          0,
          6
        );

        animationFrameId =
          requestAnimationFrame(
            render
          );
      };

    animationFrameId =
      requestAnimationFrame(
        render
      );

    /* =====================================================
       CLEANUP
       ===================================================== */

    return () => {

      cancelAnimationFrame(
        animationFrameId
      );

      window.removeEventListener(
        'mousemove',
        handleMouseMove
      );

      window.removeEventListener(
        'resize',
        handleResize
      );

      gl.deleteTexture(
        ideTexture
      );

      gl.deleteProgram(
        program
      );

      gl.deleteShader(
        vertShader
      );

      gl.deleteShader(
        fragShader
      );

      gl.deleteBuffer(
        positionBuffer
      );

      gl.deleteVertexArray(
        vao
      );
    };

  }, [isMobileDevice]);

  /* =========================================================
     MOBILE MOVEMENT
     ========================================================= */

  const startMoveLeft =
    () => {
      gameState.current.moveLeft =
        true;
    };

  const stopMoveLeft =
    () => {
      gameState.current.moveLeft =
        false;
    };

  const startMoveRight =
    () => {
      gameState.current.moveRight =
        true;
    };

  const stopMoveRight =
    () => {
      gameState.current.moveRight =
        false;
    };

  /* =========================================================
     RENDER
     ========================================================= */

  return (

    <section
      className={
        `relative w-full overflow-hidden select-none touch-pan-y ${
          hasStarted ? 'h-screen' : 'h-[50vh] md:h-screen'
        }`
      }
      style={{
        backgroundColor:
          COLORS.cream,
        height:
          hasStarted && isMobileDevice
            ? '100dvh'
            : undefined,
      }}
    >

      {/* ===================================================
          CANVAS
          pointer-events-none = le canvas ne bloque PAS
          le scroll de la page
          =================================================== */}

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 block h-full w-full"
      />

      {/* ===================================================
          COVER
          =================================================== */}

      {!hasStarted && (

        <div
          className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{
            backgroundColor:
              COLORS.cream,
          }}
        >

          <img
            src="/e.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-contain sm:object-cover"
            style={{
              /*
               * On small screens, avoid enlarging a portrait/low-res
               * cover image unnecessarily. Contain preserves its
               * sharpness; the cream background fills the remaining
               * space cleanly.
               */
              filter:
                isMobileDevice
                  ? 'brightness(1.10) contrast(1.08) saturate(1.04)'
                  : 'brightness(1.04) contrast(1.04)',
              objectPosition:
                isMobileDevice
                  ? 'center center'
                  : 'center center',
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                isMobileDevice
                  ? 'rgba(244,236,221,0.06)'
                  : 'rgba(244,236,221,0.12)',
            }}
          />

          <div className="relative z-10 flex flex-col items-center text-center">

            <div
              className="mb-7 h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor:
                  COLORS.brown,
              }}
            />

            <h1
              className="font-sans text-4xl font-light tracking-[0.38em] sm:text-6xl"
              style={{
                color:
                  COLORS.brown,
              }}
            >
              ARCADE
            </h1>

            <div
              className="mt-7 h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor:
                  COLORS.brown,
              }}
            />

            <button
              onClick={
                startGame
              }
              className="mt-8 min-w-[190px] rounded-md px-10 py-4 font-sans text-sm font-medium tracking-[0.2em] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
              style={{
                backgroundColor:
                  COLORS.beigeDark,

                color:
                  COLORS.white,

                boxShadow:
                  '0 12px 35px rgba(114,86,67,0.12)',
              }}
            >
              PLAY
            </button>

            <p
              className="mt-5 font-sans text-xs tracking-wide"
              style={{
                color:
                  COLORS.brown,
              }}
            >
              ← → to move
            </p>

          </div>

        </div>
      )}

      {/* ===================================================
          DESKTOP CONTROLS
          =================================================== */}

      {hasStarted &&
        !isMobileDevice && (

          <div
            className="pointer-events-none absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-6 py-5"
          >

            <div
              className="font-sans text-xs tracking-[0.16em]"
              style={{
                color:
                  COLORS.muted,
              }}
            >
              ← →
            </div>

            <div
              className="h-1 w-8 rounded-full"
              style={{
                backgroundColor:
                  COLORS.beigeDark,
              }}
            />

            <div className="pointer-events-auto flex items-center gap-2">

              <button
                onClick={
                  pauseGame
                }
                className="flex h-9 w-9 items-center justify-center rounded-md border transition-all hover:bg-white/5"
                style={{
                  borderColor:
                    'rgba(220,196,170,0.25)',

                  color:
                    COLORS.beige,
                }}
                aria-label={
                  isPaused
                    ? 'Resume'
                    : 'Pause'
                }
              >
                {isPaused
                  ? '▶'
                  : 'Ⅱ'}
              </button>

              <button
                onClick={
                  quitGame
                }
                className="flex h-9 items-center justify-center rounded-md border px-3 font-sans text-[10px] tracking-[0.14em] transition-all hover:bg-white/5"
                style={{
                  borderColor:
                    'rgba(220,196,170,0.25)',

                  color:
                    COLORS.muted,
                }}
              >
                MENU
              </button>

            </div>

          </div>
        )}

      {/* ===================================================
          CONTROLS HINT
          =================================================== */}

      {hasStarted &&
        !isMobileDevice &&
        showControlsHint &&
        !isPaused && (

          <div
            className="pointer-events-none absolute bottom-7 left-1/2 z-30 -translate-x-1/2 font-sans text-xs tracking-wide"
            style={{
              color:
                COLORS.muted,
            }}
          >
            Use ← → to move
          </div>
        )}

      {/* ===================================================
          PAUSE SCREEN
          =================================================== */}

      {hasStarted &&
        isPaused &&
        !gameOver && (

          <div
            className="absolute inset-0 z-40 flex items-center justify-center backdrop-blur-[5px]"
            style={{
              background:
                'rgba(18,16,13,0.76)',
            }}
          >

            <div className="flex w-[280px] flex-col items-center text-center">

              <div
                className="font-sans text-xs tracking-[0.4em]"
                style={{
                  color:
                    COLORS.beige,
                }}
              >
                · PAUSED ·
              </div>

              <button
                onClick={
                  pauseGame
                }
                className="mt-8 w-full rounded-md py-3 font-sans text-xs font-medium tracking-[0.2em] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                style={{
                  backgroundColor:
                    COLORS.cream,

                  color:
                    COLORS.brownDark,
                }}
              >
                RESUME
              </button>

              <button
                onClick={
                  quitGame
                }
                className="mt-3 w-full rounded-md py-3 font-sans text-xs font-medium tracking-[0.2em] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                style={{
                  backgroundColor:
                    COLORS.beigeDark,

                  color:
                    COLORS.white,
                }}
              >
                MENU
              </button>

              <p
                className="mt-6 font-sans text-[10px]"
                style={{
                  color:
                    COLORS.muted,
                }}
              >
                Press P to resume
              </p>

            </div>

          </div>
        )}

      {/* ===================================================
          GAME OVER
          =================================================== */}

      {gameOver && (

        <div
          className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-[5px]"
          style={{
            background:
              'rgba(18,16,13,0.82)',
          }}
        >

          <div className="flex w-[280px] flex-col items-center text-center">

            <div
              className="font-sans text-xs tracking-[0.4em]"
              style={{
                color:
                  COLORS.beige,
              }}
            >
              · GAME OVER ·
            </div>

            <div
              className="mt-7 font-mono text-3xl"
              style={{
                color:
                  COLORS.white,
              }}
            >
              {gameState.current.score
                .toString()
                .padStart(
                  6,
                  '0'
                )}
            </div>

            <div
              className="mt-1 font-sans text-[10px] tracking-[0.2em]"
              style={{
                color:
                  COLORS.muted,
              }}
            >
              SCORE
            </div>

            <button
              onClick={
                startGame
              }
              className="mt-8 w-full rounded-md py-3 font-sans text-xs font-medium tracking-[0.2em] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              style={{
                backgroundColor:
                  COLORS.cream,

                color:
                  COLORS.brownDark,
              }}
            >
              RETRY
            </button>

            <button
              onClick={
                quitGame
              }
              className="mt-3 w-full rounded-md py-3 font-sans text-xs font-medium tracking-[0.2em] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              style={{
                backgroundColor:
                  COLORS.beigeDark,

                color:
                  COLORS.white,
              }}
            >
              MENU
            </button>

            <p
              className="mt-6 font-sans text-[10px]"
              style={{
                color:
                  COLORS.muted,
              }}
            >
              Press SPACE to retry
            </p>

          </div>

        </div>
      )}

      {/* ===================================================
          MOBILE CONTROLS

          IMPORTANT:
          pointer-events-none sur le container
          pour ne pas bloquer le scroll.

          Les boutons réactivent pointer-events.
          =================================================== */}

      {isMobileDevice &&
        hasStarted &&
        !gameOver && (

          <div
            className="pointer-events-none absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-0 right-0 z-30 flex items-center justify-between px-6 sm:px-7"
          >

            <button
              onTouchStart={
                startMoveLeft
              }
              onTouchEnd={
                stopMoveLeft
              }
              onTouchCancel={
                stopMoveLeft
              }
              className="pointer-events-auto touch-none flex h-14 w-14 items-center justify-center rounded-full border font-sans text-lg transition-all active:scale-90"
              style={{
                borderColor:
                  'rgba(220,196,170,0.4)',

                backgroundColor:
                  'rgba(28,26,22,0.7)',

                color:
                  COLORS.beige,
              }}
            >
              ←
            </button>

            <button
              onClick={
                pauseGame
              }
              className="pointer-events-auto touch-none flex h-11 w-11 items-center justify-center rounded-full border font-sans text-xs transition-all active:scale-90"
              style={{
                borderColor:
                  'rgba(220,196,170,0.4)',

                backgroundColor:
                  'rgba(28,26,22,0.7)',

                color:
                  COLORS.beige,
              }}
            >
              Ⅱ
            </button>

            <button
              onTouchStart={
                startMoveRight
              }
              onTouchEnd={
                stopMoveRight
              }
              onTouchCancel={
                stopMoveRight
              }
              className="pointer-events-auto touch-none flex h-14 w-14 items-center justify-center rounded-full border font-sans text-lg transition-all active:scale-90"
              style={{
                borderColor:
                  'rgba(220,196,170,0.4)',

                backgroundColor:
                  'rgba(28,26,22,0.7)',

                color:
                  COLORS.beige,
              }}
            >
              →
            </button>

          </div>
        )}

    </section>
  );
};

export default AestheticArcadeGame;