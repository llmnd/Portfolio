'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type TrafficCar = {
  lane: number;
  z: number;
  speed: number;
  color: string;
};

type Particle = {
  x: number;
  y: number;
  life: number;
  speed: number;
};

const COLORS = {
  skyTop: '#080a0e',
  skyBottom: '#17181b',
  road: '#171719',
  roadLight: '#242427',
  line: '#d5c4aa',
  cream: '#f1e8d8',
  beige: '#d8c2a6',
  muted: '#8d887f',
  car: '#c9b49a',
  carDark: '#716455',
  red: '#b86659',
  white: '#fff4dc',
};

const LANES = [-1, 0, 1];

export default function NightDrive() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const keys = useRef({
    left: false,
    right: false,
  });

  const game = useRef({
    running: false,
    paused: false,
    over: false,

    playerX: 0,
    targetX: 0,

    speed: 0,
    distance: 0,

    roadOffset: 0,

    traffic: [] as TrafficCar[],
    particles: [] as Particle[],

    lastTime: 0,
    spawnTimer: 0,

    audio: null as AudioContext | null,
  });

  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [distance, setDistance] = useState(0);

  /*
   * ---------------------------------------------------------
   * AUDIO
   * ---------------------------------------------------------
   */

  const ensureAudio = useCallback(() => {
    const state = game.current;

    if (!state.audio) {
      state.audio = new AudioContext();
    }

    if (state.audio.state === 'suspended') {
      state.audio.resume();
    }

    return state.audio;
  }, []);

  const playSound = useCallback(
    (
      type: 'start' | 'collision' | 'pass'
    ) => {
      try {
        const audio = ensureAudio();

        const now = audio.currentTime;

        const oscillator = audio.createOscillator();
        const gain = audio.createGain();

        oscillator.connect(gain);
        gain.connect(audio.destination);

        if (type === 'start') {
          oscillator.type = 'sine';

          oscillator.frequency.setValueAtTime(
            180,
            now
          );

          oscillator.frequency.exponentialRampToValueAtTime(
            520,
            now + 0.25
          );

          gain.gain.setValueAtTime(
            0.0001,
            now
          );

          gain.gain.exponentialRampToValueAtTime(
            0.08,
            now + 0.02
          );

          gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + 0.3
          );

          oscillator.start(now);
          oscillator.stop(now + 0.32);
        }

        if (type === 'pass') {
          oscillator.type = 'triangle';

          oscillator.frequency.setValueAtTime(
            700,
            now
          );

          oscillator.frequency.exponentialRampToValueAtTime(
            300,
            now + 0.1
          );

          gain.gain.setValueAtTime(
            0.0001,
            now
          );

          gain.gain.exponentialRampToValueAtTime(
            0.025,
            now + 0.01
          );

          gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + 0.12
          );

          oscillator.start(now);
          oscillator.stop(now + 0.13);
        }

        if (type === 'collision') {
          oscillator.type = 'sawtooth';

          oscillator.frequency.setValueAtTime(
            130,
            now
          );

          oscillator.frequency.exponentialRampToValueAtTime(
            40,
            now + 0.4
          );

          gain.gain.setValueAtTime(
            0.0001,
            now
          );

          gain.gain.exponentialRampToValueAtTime(
            0.14,
            now + 0.01
          );

          gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + 0.42
          );

          oscillator.start(now);
          oscillator.stop(now + 0.45);
        }
      } catch {
        // Audio is optional.
      }
    },
    [ensureAudio]
  );

  /*
   * ---------------------------------------------------------
   * RESET
   * ---------------------------------------------------------
   */

  const resetGame = useCallback(() => {
    const state = game.current;

    state.running = true;
    state.paused = false;
    state.over = false;

    state.playerX = 0;
    state.targetX = 0;

    state.speed = 0;
    state.distance = 0;

    state.roadOffset = 0;

    state.traffic = [];
    state.particles = [];

    state.lastTime = 0;
    state.spawnTimer = 0;

    setDistance(0);
    setPaused(false);
    setGameOver(false);
  }, []);

  const startGame = useCallback(() => {
    ensureAudio();

    resetGame();

    setStarted(true);

    playSound('start');
  }, [ensureAudio, resetGame, playSound]);

  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  const togglePause = useCallback(() => {
    const state = game.current;

    if (!state.running || state.over) {
      return;
    }

    state.paused = !state.paused;

    setPaused(state.paused);
  }, []);

  /*
   * ---------------------------------------------------------
   * CONTROLS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (
        event.code === 'ArrowLeft' ||
        event.code === 'KeyA' ||
        event.code === 'KeyQ'
      ) {
        event.preventDefault();
        keys.current.left = true;
      }

      if (
        event.code === 'ArrowRight' ||
        event.code === 'KeyD'
      ) {
        event.preventDefault();
        keys.current.right = true;
      }

      if (
        event.code === 'Space' &&
        game.current.over
      ) {
        event.preventDefault();
        restartGame();
      }

      if (
        event.code === 'KeyP' ||
        event.code === 'Escape'
      ) {
        event.preventDefault();
        togglePause();
      }
    };

    const up = (event: KeyboardEvent) => {
      if (
        event.code === 'ArrowLeft' ||
        event.code === 'KeyA' ||
        event.code === 'KeyQ'
      ) {
        keys.current.left = false;
      }

      if (
        event.code === 'ArrowRight' ||
        event.code === 'KeyD'
      ) {
        keys.current.right = false;
      }
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);

    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [restartGame, togglePause]);

  /*
   * ---------------------------------------------------------
   * CANVAS GAME
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    let animationFrame = 0;

    const resize = () => {
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      canvas.width =
        window.innerWidth * dpr;

      canvas.height =
        window.innerHeight * dpr;

      canvas.style.width =
        `${window.innerWidth}px`;

      canvas.style.height =
        `${window.innerHeight}px`;

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );
    };

    resize();

    window.addEventListener(
      'resize',
      resize
    );

    /*
     * -------------------------------------------------------
     * HELPERS
     * -------------------------------------------------------
     */

    const random = (
      min: number,
      max: number
    ) => {
      return (
        Math.random() *
          (max - min) +
        min
      );
    };

    const roadWidthAt = (
      y: number,
      height: number,
      width: number
    ) => {
      const horizon =
        height * 0.38;

      const progress =
        Math.max(
          0,
          Math.min(
            1,
            (y - horizon) /
              (height - horizon)
          )
        );

      const bottomWidth =
        Math.min(
          width * 0.94,
          1000
        );

      return (
        80 +
        progress *
          (bottomWidth - 80)
      );
    };

    const roadCenterAt = (
      y: number,
      height: number,
      width: number
    ) => {
      const horizon =
        height * 0.38;

      const progress =
        Math.max(
          0,
          Math.min(
            1,
            (y - horizon) /
              (height - horizon)
          )
        );

      return (
        width / 2 +
        Math.sin(
          game.current.roadOffset +
            progress * 2.5
        ) *
          70 *
          progress
      );
    };

    /*
     * -------------------------------------------------------
     * DRAW SKY
     * -------------------------------------------------------
     */

    const drawSky = (
      width: number,
      height: number
    ) => {
      const gradient =
        ctx.createLinearGradient(
          0,
          0,
          0,
          height * 0.55
        );

      gradient.addColorStop(
        0,
        COLORS.skyTop
      );

      gradient.addColorStop(
        1,
        COLORS.skyBottom
      );

      ctx.fillStyle =
        gradient;

      ctx.fillRect(
        0,
        0,
        width,
        height
      );

      /*
       * Moon
       */

      ctx.beginPath();

      ctx.arc(
        width * 0.78,
        height * 0.19,
        30,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        'rgba(241,232,216,0.75)';

      ctx.fill();

      /*
       * Stars
       */

      ctx.fillStyle =
        'rgba(241,232,216,0.42)';

      for (
        let i = 0;
        i < 90;
        i++
      ) {
        const x =
          (i * 97) %
          width;

        const y =
          (i * 43) %
          (height * 0.34);

        const size =
          i % 5 === 0
            ? 1.5
            : 0.7;

        ctx.fillRect(
          x,
          y,
          size,
          size
        );
      }

      /*
       * Distant city
       */

      ctx.fillStyle =
        'rgba(20,20,22,0.9)';

      const horizon =
        height * 0.39;

      for (
        let i = 0;
        i < 35;
        i++
      ) {
        const buildingWidth =
          15 + (i % 4) * 7;

        const buildingHeight =
          20 + (i % 7) * 9;

        const x =
          i * 45 -
          10;

        ctx.fillRect(
          x,
          horizon -
            buildingHeight,
          buildingWidth,
          buildingHeight
        );
      }
    };

    /*
     * -------------------------------------------------------
     * DRAW ROAD
     * -------------------------------------------------------
     */

    const drawRoad = (
      width: number,
      height: number
    ) => {
      const horizon =
        height * 0.38;

      const bottom =
        height;

      const topCenter =
        roadCenterAt(
          horizon,
          height,
          width
        );

      const bottomCenter =
        roadCenterAt(
          bottom,
          height,
          width
        );

      const topRoadWidth =
        roadWidthAt(
          horizon,
          height,
          width
        );

      const bottomRoadWidth =
        roadWidthAt(
          bottom,
          height,
          width
        );

      /*
       * Road
       */

      ctx.beginPath();

      ctx.moveTo(
        topCenter -
          topRoadWidth / 2,
        horizon
      );

      ctx.lineTo(
        bottomCenter -
          bottomRoadWidth / 2,
        bottom
      );

      ctx.lineTo(
        bottomCenter +
          bottomRoadWidth / 2,
        bottom
      );

      ctx.lineTo(
        topCenter +
          topRoadWidth / 2,
        horizon
      );

      ctx.closePath();

      ctx.fillStyle =
        COLORS.road;

      ctx.fill();

      /*
       * Road glow
       */

      ctx.strokeStyle =
        'rgba(216,194,166,0.08)';

      ctx.lineWidth = 3;

      ctx.beginPath();

      ctx.moveTo(
        topCenter -
          topRoadWidth / 2,
        horizon
      );

      ctx.lineTo(
        bottomCenter -
          bottomRoadWidth / 2,
        bottom
      );

      ctx.stroke();

      ctx.beginPath();

      ctx.moveTo(
        topCenter +
          topRoadWidth / 2,
        horizon
      );

      ctx.lineTo(
        bottomCenter +
          bottomRoadWidth / 2,
        bottom
      );

      ctx.stroke();

      /*
       * Lane markings
       */

      const laneLines =
        [-0.333, 0.333];

      laneLines.forEach(
        (lane) => {
          for (
            let i = 0;
            i < 14;
            i++
          ) {
            const p =
              (
                i / 14 +
                game.current.roadOffset *
                  0.045
              ) % 1;

            const y =
              horizon +
              Math.pow(
                p,
                1.75
              ) *
                (height -
                  horizon);

            const nextP =
              Math.min(
                p + 0.055,
                1
              );

            const nextY =
              horizon +
              Math.pow(
                nextP,
                1.75
              ) *
                (height -
                  horizon);

            const roadW =
              roadWidthAt(
                y,
                height,
                width
              );

            const center =
              roadCenterAt(
                y,
                height,
                width
              );

            const nextRoadW =
              roadWidthAt(
                nextY,
                height,
                width
              );

            const nextCenter =
              roadCenterAt(
                nextY,
                height,
                width
              );

            const x =
              center +
              roadW *
                lane;

            const nextX =
              nextCenter +
              nextRoadW *
                lane;

            ctx.strokeStyle =
              'rgba(216,194,166,0.32)';

            ctx.lineWidth =
              1 +
              p * 4;

            ctx.beginPath();

            ctx.moveTo(
              x,
              y
            );

            ctx.lineTo(
              nextX,
              nextY
            );

            ctx.stroke();
          }
        }
      );

      /*
       * Street lights
       */

      for (
        let i = 0;
        i < 10;
        i++
      ) {
        const p =
          (
            i / 10 +
            game.current.roadOffset *
              0.025
          ) % 1;

        const y =
          horizon +
          Math.pow(
            p,
            1.8
          ) *
            (height -
              horizon);

        if (p < 0.1) continue;

        const roadW =
          roadWidthAt(
            y,
            height,
            width
          );

        const center =
          roadCenterAt(
            y,
            height,
            width
          );

        const side =
          i % 2 === 0
            ? -1
            : 1;

        const x =
          center +
          side *
            (roadW / 2 +
              35 +
              p * 80);

        const lampHeight =
          30 +
          p * 110;

        ctx.strokeStyle =
          'rgba(216,194,166,0.35)';

        ctx.lineWidth =
          1 +
          p * 2;

        ctx.beginPath();

        ctx.moveTo(
          x,
          y
        );

        ctx.lineTo(
          x,
          y -
            lampHeight
        );

        ctx.stroke();

        ctx.fillStyle =
          'rgba(255,241,210,0.7)';

        ctx.beginPath();

        ctx.arc(
          x,
          y -
            lampHeight,
          2 +
            p * 4,
          0,
          Math.PI * 2
        );

        ctx.fill();

        /*
         * Glow
         */

        const gradient =
          ctx.createRadialGradient(
            x,
            y -
              lampHeight,
            0,
            x,
            y -
              lampHeight,
            35 +
              p * 40
          );

        gradient.addColorStop(
          0,
          'rgba(255,235,190,0.12)'
        );

        gradient.addColorStop(
          1,
          'rgba(255,235,190,0)'
        );

        ctx.fillStyle =
          gradient;

        ctx.beginPath();

        ctx.arc(
          x,
          y -
            lampHeight,
          40 +
            p * 40,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }
    };

    /*
     * -------------------------------------------------------
     * DRAW TRAFFIC CAR
     * -------------------------------------------------------
     */

    const drawTrafficCar = (
      car: TrafficCar,
      width: number,
      height: number
    ) => {
      const horizon =
        height * 0.38;

      const progress =
        Math.max(
          0,
          Math.min(
            1,
            car.z
          )
        );

      const y =
        horizon +
        Math.pow(
          progress,
          1.8
        ) *
          (height -
            horizon);

      const roadW =
        roadWidthAt(
          y,
          height,
          width
        );

      const center =
        roadCenterAt(
          y,
          height,
          width
        );

      const x =
        center +
        car.lane *
          roadW *
          0.28;

      const carWidth =
        18 +
        progress * 95;

      const carHeight =
        carWidth * 1.45;

      ctx.save();

      ctx.translate(
        x,
        y
      );

      /*
       * Shadow
       */

      ctx.fillStyle =
        'rgba(0,0,0,0.45)';

      ctx.beginPath();

      ctx.ellipse(
        0,
        5,
        carWidth * 0.7,
        carHeight * 0.28,
        0,
        0,
        Math.PI * 2
      );

      ctx.fill();

      /*
       * Body
       */

      ctx.fillStyle =
        car.color;

      ctx.beginPath();

      ctx.roundRect(
        -carWidth / 2,
        -carHeight / 2,
        carWidth,
        carHeight,
        carWidth * 0.18
      );

      ctx.fill();

      /*
       * Rear window
       */

      ctx.fillStyle =
        'rgba(7,9,12,0.8)';

      ctx.beginPath();

      ctx.roundRect(
        -carWidth * 0.34,
        -carHeight * 0.25,
        carWidth * 0.68,
        carHeight * 0.28,
        carWidth * 0.08
      );

      ctx.fill();

      /*
       * Tail lights
       */

      ctx.fillStyle =
        COLORS.red;

      ctx.shadowColor =
        'rgba(184,102,89,0.65)';

      ctx.shadowBlur =
        8 +
        progress * 15;

      ctx.fillRect(
        -carWidth * 0.37,
        carHeight * 0.25,
        carWidth * 0.2,
        carHeight * 0.08
      );

      ctx.fillRect(
        carWidth * 0.17,
        carHeight * 0.25,
        carWidth * 0.2,
        carHeight * 0.08
      );

      ctx.restore();
    };

    /*
     * -------------------------------------------------------
     * DRAW PLAYER
     * -------------------------------------------------------
     */

    const drawPlayer = (
      width: number,
      height: number
    ) => {
      const center =
        roadCenterAt(
          height,
          height,
          width
        );

      const roadW =
        roadWidthAt(
          height,
          height,
          width
        );

      const x =
        center +
        game.current.playerX *
          roadW *
          0.32;

      const y =
        height * 0.83;

      const carWidth =
        Math.min(
          100,
          width * 0.13
        );

      const carHeight =
        carWidth * 1.5;

      ctx.save();

      ctx.translate(
        x,
        y
      );

      /*
       * Headlight glow
       */

      const glow =
        ctx.createRadialGradient(
          0,
          -carHeight * 0.45,
          0,
          0,
          -carHeight * 0.45,
          180
        );

      glow.addColorStop(
        0,
        'rgba(255,243,213,0.18)'
      );

      glow.addColorStop(
        1,
        'rgba(255,243,213,0)'
      );

      ctx.fillStyle =
        glow;

      ctx.beginPath();

      ctx.arc(
        0,
        -carHeight * 0.4,
        180,
        0,
        Math.PI * 2
      );

      ctx.fill();

      /*
       * Shadow
       */

      ctx.fillStyle =
        'rgba(0,0,0,0.65)';

      ctx.beginPath();

      ctx.ellipse(
        0,
        12,
        carWidth * 0.7,
        carWidth * 0.22,
        0,
        0,
        Math.PI * 2
      );

      ctx.fill();

      /*
       * Main body
       */

      ctx.fillStyle =
        COLORS.car;

      ctx.beginPath();

      ctx.moveTo(
        0,
        -carHeight / 2
      );

      ctx.lineTo(
        -carWidth * 0.46,
        carHeight * 0.32
      );

      ctx.quadraticCurveTo(
        -carWidth * 0.5,
        carHeight * 0.48,
        -carWidth * 0.28,
        carHeight * 0.5
      );

      ctx.lineTo(
        carWidth * 0.28,
        carHeight * 0.5
      );

      ctx.quadraticCurveTo(
        carWidth * 0.5,
        carHeight * 0.48,
        carWidth * 0.46,
        carHeight * 0.32
      );

      ctx.closePath();

      ctx.fill();

      /*
       * Windshield
       */

      ctx.fillStyle =
        'rgba(12,15,19,0.88)';

      ctx.beginPath();

      ctx.moveTo(
        0,
        -carHeight * 0.35
      );

      ctx.lineTo(
        -carWidth * 0.3,
        carHeight * 0.03
      );

      ctx.lineTo(
        carWidth * 0.3,
        carHeight * 0.03
      );

      ctx.closePath();

      ctx.fill();

      /*
       * Headlights
       */

      ctx.fillStyle =
        COLORS.white;

      ctx.shadowColor =
        COLORS.white;

      ctx.shadowBlur =
        14;

      ctx.beginPath();

      ctx.roundRect(
        -carWidth * 0.38,
        carHeight * 0.25,
        carWidth * 0.22,
        carHeight * 0.1,
        3
      );

      ctx.roundRect(
        carWidth * 0.16,
        carHeight * 0.25,
        carWidth * 0.22,
        carHeight * 0.1,
        3
      );

      ctx.fill();

      ctx.restore();
    };

    /*
     * -------------------------------------------------------
     * SPAWN TRAFFIC
     * -------------------------------------------------------
     */

    const spawnTraffic = () => {
      const state =
        game.current;

      const lane =
        LANES[
          Math.floor(
            Math.random() *
              LANES.length
          )
        ];

      const colors = [
        '#a88f76',
        '#706f72',
        '#8e7564',
        '#b1a18c',
        '#54575c',
      ];

      state.traffic.push({
        lane,
        z: 0.02,
        speed:
          random(
            0.14,
            0.24
          ),
        color:
          colors[
            Math.floor(
              Math.random() *
                colors.length
            )
          ],
      });
    };

    /*
     * -------------------------------------------------------
     * PARTICLES
     * -------------------------------------------------------
     */

    const updateParticles = (
      width: number,
      height: number,
      dt: number
    ) => {
      const state =
        game.current;

      if (
        Math.random() <
        0.4
      ) {
        state.particles.push({
          x:
            width / 2 +
            random(
              -width * 0.35,
              width * 0.35
            ),

          y:
            height * 0.7,

          life: 1,

          speed:
            random(
              40,
              130
            ),
        });
      }

      state.particles.forEach(
        (particle) => {
          particle.y +=
            particle.speed *
            dt;

          particle.life -=
            dt * 0.8;
        }
      );

      state.particles =
        state.particles.filter(
          (particle) =>
            particle.life > 0 &&
            particle.y <
              height
        );

      ctx.fillStyle =
        'rgba(216,194,166,0.13)';

      state.particles.forEach(
        (particle) => {
          ctx.globalAlpha =
            particle.life;

          ctx.fillRect(
            particle.x,
            particle.y,
            1,
            1
          );
        }
      );

      ctx.globalAlpha = 1;
    };

    /*
     * -------------------------------------------------------
     * COLLISION
     * -------------------------------------------------------
     */

    const checkCollision = (
      car: TrafficCar
    ) => {
      const state =
        game.current;

      const laneDistance =
        Math.abs(
          car.lane -
            state.playerX / 0.32
        );

      return (
        car.z > 0.78 &&
        laneDistance <
          0.62
      );
    };

    /*
     * -------------------------------------------------------
     * UPDATE
     * -------------------------------------------------------
     */

    const update = (
      dt: number
    ) => {
      const state =
        game.current;

      if (
        !state.running ||
        state.paused ||
        state.over
      ) {
        return;
      }

      /*
       * Speed
       */

      state.speed +=
        (1 -
          state.speed) *
        dt *
        0.4;

      /*
       * Difficulty
       */

      const difficulty =
        Math.min(
          1,
          state.distance /
            5000
        );

      /*
       * Player
       */

      const direction =
        (keys.current.right
          ? 1
          : 0) -
        (keys.current.left
          ? 1
          : 0);

      state.targetX +=
        direction *
        dt *
        2.5;

      state.targetX =
        Math.max(
          -1,
          Math.min(
            1,
            state.targetX
          )
        );

      state.playerX +=
        (
          state.targetX -
          state.playerX
        ) *
        dt *
        8;

      /*
       * Road
       */

      state.roadOffset +=
        dt *
        (
          0.35 +
          state.speed *
            0.7
        );

      /*
       * Distance
       */

      state.distance +=
        dt *
        (
          55 +
          state.speed *
            80
        );

      /*
       * UI update
       */

      setDistance(
        Math.floor(
          state.distance / 100
        ) / 10
      );

      /*
       * Spawn
       */

      state.spawnTimer -=
        dt;

      const spawnRate =
        Math.max(
          0.38,
          0.9 -
            difficulty *
              0.35
        );

      if (
        state.spawnTimer <= 0
      ) {
        spawnTraffic();

        state.spawnTimer =
          spawnRate *
          random(
            0.75,
            1.25
          );
      }

      /*
       * Traffic
       */

      for (
        let i =
          state.traffic.length -
          1;

        i >= 0;

        i--
      ) {
        const car =
          state.traffic[i];

        car.z +=
          dt *
          (
            0.2 +
            state.speed *
              0.5 +
            car.speed *
              0.25
          );

        /*
         * Collision
         */

        if (
          checkCollision(
            car
          )
        ) {
          state.over = true;
          state.running = false;

          setGameOver(true);

          playSound(
            'collision'
          );

          /*
           * Collision particles
           */

          for (
            let j = 0;
            j < 35;
            j++
          ) {
            state.particles.push({
              x:
                window.innerWidth /
                  2 +
                random(
                  -40,
                  40
                ),

              y:
                window.innerHeight *
                  0.82 +
                random(
                  -20,
                  20
                ),

              life: 1,

              speed:
                random(
                  50,
                  220
                ),
            });
          }

          continue;
        }

        /*
         * Passed
         */

        if (
          car.z > 1.08
        ) {
          state.traffic.splice(
            i,
            1
          );

          playSound('pass');
        }
      }
    };

    /*
     * -------------------------------------------------------
     * LOOP
     * -------------------------------------------------------
     */

    const render = (
      time: number
    ) => {
      const width =
        window.innerWidth;

      const height =
        window.innerHeight;

      const state =
        game.current;

      if (
        state.lastTime === 0
      ) {
        state.lastTime =
          time;
      }

      const dt =
        Math.min(
          (
            time -
            state.lastTime
          ) / 1000,
          0.04
        );

      state.lastTime =
        time;

      update(dt);

      /*
       * Background
       */

      drawSky(
        width,
        height
      );

      /*
       * Road
       */

      drawRoad(
        width,
        height
      );

      /*
       * Particles
       */

      updateParticles(
        width,
        height,
        dt
      );

      /*
       * Traffic sorted by depth
       */

      const cars =
        [...state.traffic].sort(
          (a, b) =>
            a.z - b.z
        );

      cars.forEach(
        (car) =>
          drawTrafficCar(
            car,
            width,
            height
          )
      );

      /*
       * Player
       */

      drawPlayer(
        width,
        height
      );

      animationFrame =
        requestAnimationFrame(
          render
        );
    };

    animationFrame =
      requestAnimationFrame(
        render
      );

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        'resize',
        resize
      );
    };
  }, [playSound]);

  /*
   * ---------------------------------------------------------
   * MOBILE CONTROL HELPERS
   * ---------------------------------------------------------
   */

  const pressLeft = () => {
    keys.current.left = true;
  };

  const releaseLeft = () => {
    keys.current.left = false;
  };

  const pressRight = () => {
    keys.current.right = true;
  };

  const releaseRight = () => {
    keys.current.right = false;
  };

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <section
      className="relative h-screen min-h-[620px] w-full overflow-hidden bg-[#080a0e] select-none touch-pan-y"
    >
      {/*
       * Canvas DOES NOT capture pointer events.
       * Therefore the page can still scroll vertically.
       */}

      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      {/* ===================================================
          COVER
          =================================================== */}

      {!started && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#080a0e]">
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-6 h-px w-12 bg-[#d8c2a6]/50" />

            <p className="mb-4 text-[10px] tracking-[0.5em] text-[#8d887f]">
              INTERACTIVE EXPERIMENT
            </p>

            <h1 className="text-5xl font-light tracking-[0.28em] text-[#f1e8d8] sm:text-7xl">
              NIGHT DRIVE
            </h1>

            <p className="mt-5 text-xs tracking-[0.18em] text-[#8d887f]">
              DRIVE INTO THE NIGHT
            </p>

            <button
              onClick={startGame}
              className="mt-10 rounded-full border border-[#d8c2a6]/40 bg-[#d8c2a6]/10 px-10 py-3 text-xs tracking-[0.3em] text-[#f1e8d8] backdrop-blur-md transition-all hover:bg-[#d8c2a6]/20 active:scale-95"
            >
              START
            </button>

            <div className="mt-7 flex gap-5 text-[10px] tracking-[0.16em] text-[#8d887f]">
              <span>← →</span>
              <span>TO STEER</span>
            </div>
          </div>

          {/* Decorative lights */}

          <div className="absolute left-[12%] top-[25%] h-1 w-1 rounded-full bg-[#f1e8d8]/50 shadow-[0_0_30px_10px_rgba(241,232,216,0.08)]" />

          <div className="absolute right-[17%] top-[35%] h-1 w-1 rounded-full bg-[#d8c2a6]/40 shadow-[0_0_40px_15px_rgba(216,194,166,0.08)]" />
        </div>
      )}

      {/* ===================================================
          HUD
          =================================================== */}

      {started && (
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-start justify-between p-6 sm:p-8">
          <div>
            <p className="text-[9px] tracking-[0.35em] text-[#8d887f]">
              NIGHT DRIVE
            </p>

            <p className="mt-2 font-mono text-lg text-[#f1e8d8]">
              {distance.toFixed(1)}
              <span className="ml-1 text-[10px] text-[#8d887f]">
                KM
              </span>
            </p>
          </div>

          <div className="pointer-events-auto flex gap-2">
            <button
              onClick={togglePause}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8c2a6]/20 bg-[#080a0e]/40 text-xs text-[#d8c2a6] backdrop-blur-md"
            >
              {paused ? '▶' : 'Ⅱ'}
            </button>

            <button
              onClick={() => {
                setStarted(false);
                game.current.running = false;
              }}
              className="rounded-full border border-[#d8c2a6]/20 bg-[#080a0e]/40 px-4 text-[9px] tracking-[0.2em] text-[#8d887f] backdrop-blur-md"
            >
              EXIT
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          PAUSE
          =================================================== */}

      {paused && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#080a0e]/70 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-xs tracking-[0.4em] text-[#d8c2a6]">
              PAUSED
            </p>

            <button
              onClick={togglePause}
              className="mt-7 rounded-full border border-[#d8c2a6]/30 px-8 py-3 text-[10px] tracking-[0.25em] text-[#f1e8d8]"
            >
              CONTINUE
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          GAME OVER
          =================================================== */}

      {gameOver && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#080a0e]/80 backdrop-blur-md">
          <div className="w-[280px] text-center">
            <p className="text-[10px] tracking-[0.45em] text-[#d8c2a6]">
              THE NIGHT ENDS
            </p>

            <h2 className="mt-6 text-4xl font-light tracking-[0.15em] text-[#f1e8d8]">
              {distance.toFixed(1)}
              <span className="ml-2 text-xs text-[#8d887f]">
                KM
              </span>
            </h2>

            <p className="mt-2 text-[9px] tracking-[0.3em] text-[#8d887f]">
              DISTANCE
            </p>

            <button
              onClick={restartGame}
              className="mt-9 w-full rounded-full bg-[#d8c2a6] py-3 text-[10px] tracking-[0.3em] text-[#111214] transition-transform active:scale-95"
            >
              DRIVE AGAIN
            </button>

            <button
              onClick={() => {
                setStarted(false);
                setGameOver(false);
                game.current.running = false;
              }}
              className="mt-3 w-full rounded-full border border-[#d8c2a6]/25 py-3 text-[10px] tracking-[0.3em] text-[#8d887f]"
            >
              MENU
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          MOBILE CONTROLS
          =================================================== */}

      {started &&
        !gameOver && (
          <div className="pointer-events-none absolute bottom-6 left-0 right-0 z-20 flex items-center justify-between px-7 sm:hidden">
            <button
              onTouchStart={pressLeft}
              onTouchEnd={releaseLeft}
              onTouchCancel={releaseLeft}
              className="pointer-events-auto touch-none flex h-16 w-16 items-center justify-center rounded-full border border-[#d8c2a6]/30 bg-[#080a0e]/50 text-xl text-[#d8c2a6] backdrop-blur-md active:scale-90"
            >
              ←
            </button>

            <button
              onClick={togglePause}
              className="pointer-events-auto touch-none flex h-11 w-11 items-center justify-center rounded-full border border-[#d8c2a6]/20 bg-[#080a0e]/50 text-xs text-[#d8c2a6] backdrop-blur-md"
            >
              Ⅱ
            </button>

            <button
              onTouchStart={pressRight}
              onTouchEnd={releaseRight}
              onTouchCancel={releaseRight}
              className="pointer-events-auto touch-none flex h-16 w-16 items-center justify-center rounded-full border border-[#d8c2a6]/30 bg-[#080a0e]/50 text-xl text-[#d8c2a6] backdrop-blur-md active:scale-90"
            >
              →
            </button>
          </div>
        )}

      {/* ===================================================
          BOTTOM HINT
          =================================================== */}

      {started &&
        !gameOver &&
        !paused && (
          <div className="pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 text-[9px] tracking-[0.3em] text-[#8d887f] sm:block">
            ← → &nbsp; STEER
          </div>
        )}
    </section>
  );
}