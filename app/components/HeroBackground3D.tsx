'use client';

import { useEffect, useRef, useState } from 'react';

/* =========================================================
   PALETTE & CONSTANTES
   ========================================================= */

const COLORS = {
  bgPage: '#020617',
  textMuted: '#64748b',
  textMain: '#f8fafc',
  accent: '#00f3ff',
  border: 'rgba(0, 243, 255, 0.25)',

  gameBg: '#030712',
  gameGrid: 'rgba(56, 189, 248, 0.04)',

  playerPrimary: '#00f3ff',
  playerCockpit: '#e0f2fe',
  
  enemyAce: '#f43f5e',
  enemyAceDark: '#9f1239',
  enemyBomber: '#fbbf24',

  starGold: '#facc15',
  bulletPlayer: '#38bdf8',
  bulletEnemy: '#fb7185',
};

const GAME_W = 1024;
const GAME_H = 1024;
const HUD_H = 80;

/* =========================================================
   WEBGL SHADERS
   ========================================================= */

const VERTEX_SHADER = `#version 300 es
in vec2 aPosition;
out vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  vUv.y = 1.0 - vUv.y;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uTime;
uniform float uBankAngle;
uniform sampler2D uGameTexture;

#define SURF_DIST 0.001
#define MAX_DIST 20.0

mat2 rot2D(float a) { float s=sin(a), c=cos(a); return mat2(c,-s,s,c); }

float sdRoundedBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

float map(vec3 p, out vec2 texCoord) {
  p.xz *= rot2D(uMouse.x * 0.1 + uBankAngle * 0.15);
  p.yz *= rot2D(uMouse.y * 0.08);

  float dDisplay = sdRoundedBox(p, vec3(0.96, 0.96, 0.015), 0.03);
  texCoord = vec2((p.x / 0.96) * 0.5 + 0.5, 1.0 - ((p.y / 0.96) * 0.5 + 0.5));
  return dDisplay;
}

vec4 getPostProcessedTexture(sampler2D tex, vec2 uv) {
  float shift = 0.002;
  float r = texture(tex, uv + vec2(shift, 0.0)).r;
  float g = texture(tex, uv).g;
  float b = texture(tex, uv - vec2(shift, 0.0)).b;
  
  float scanline = sin(uv.y * 900.0) * 0.03;
  vec3 col = vec3(r, g, b) - scanline;

  return vec4(col, 1.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);
  vec3 ro = vec3(0.0, 0.0, -2.3);
  vec3 rd = normalize(vec3(uv, 1.3));

  float dO = 0.0;
  vec2 hitTexCoord;
  bool hit = false;

  for(int i = 0; i < 60; i++) {
    vec3 p = ro + rd * dO;
    float dS = map(p, hitTexCoord);
    dO += dS;
    if(dS < SURF_DIST) { hit = true; break; }
    if(dO > MAX_DIST) break;
  }

  vec3 color = vec3(0.01, 0.03, 0.06) + vec3(0.0, 0.04, 0.08) * (1.0 - length(uv));

  if(hit) {
    vec4 texSample = getPostProcessedTexture(uGameTexture, hitTexCoord);
    vec3 p = ro + rd * dO;
    vec2 e = vec2(0.001, 0);
    vec3 n = normalize(map(p, hitTexCoord) - vec3(map(p-e.xyy, hitTexCoord), map(p-e.yxy, hitTexCoord), map(p-e.yyx, hitTexCoord)));
    
    float fresnel = pow(1.0 + dot(rd, n), 4.0);
    float spec = pow(max(0.0, dot(reflect(rd, n), normalize(vec3(1, 2, -2)))), 32.0);
    
    color = texSample.rgb + fresnel * vec3(0.0, 0.7, 1.0) * 0.3 + spec * vec3(0.8, 0.95, 1.0) * 0.2;
  }

  color *= 1.0 - length(uv) * 0.35;
  fragColor = vec4(color, 1.0);
}
`;

/* =========================================================
   TYPES GAMEPLAY
   ========================================================= */

type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  size: number; color: string;
  life: number; maxLife: number;
};

type StarCoin = {
  x: number; y: number;
  vy: number; radius: number;
  rotation: number;
};

type Aircraft = {
  x: number; y: number;
  vx: number; vy: number;
  type: 'ACE' | 'BOMBER';
  radius: number;
  hp: number;
  shootTimer: number;
};

type Bullet = {
  x: number; y: number;
  vx: number; vy: number;
  isEnemy: boolean;
};

type Cloud = {
  x: number; y: number;
  scale: number; speed: number; opacity: number;
};

/* =========================================================
   COMPOSANT PRINCIPAL
   ========================================================= */

export const AeroArcadeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [gameState, setGameState] = useState({
    hasStarted: false,
    isPaused: false,
    gameOver: false,
    score: 0,
    health: 100,
    escapedEnemies: 0,
    maxEscaped: 15,
    starsCollected: 0,
  });

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const [isMobile, setIsMobile] = useState(false);

  const game = useRef({
    playerX: GAME_W / 2,
    playerY: GAME_H - 140,
    playerVx: 0,
    playerVy: 0,
    playerBank: 0,

    bullets: [] as Bullet[],
    enemies: [] as Aircraft[],
    particles: [] as Particle[],
    starCoins: [] as StarCoin[],
    clouds: [] as Cloud[],
    keys: {} as Record<string, boolean>,

    screenShake: 0,
    lastShot: 0,
    lastSpawn: 0,
    elapsed: 0,

    moveLeft: false,
    moveRight: false,
    moveUp: false,
    moveDown: false,
  });

  const mouseRef = useRef({ targetX: 0, targetY: 0, currentX: 0, currentY: 0 });

  /* ---------------------------------------------------------
     EFFETS SONORES SYNTHÉTIQUES
     --------------------------------------------------------- */
  const playSound = (type: 'laser' | 'boom' | 'coin' | 'hit') => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      if (type === 'boom') {
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(30, now + 0.4);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(150, now);
        sub.frequency.exponentialRampToValueAtTime(30, now + 0.3);

        subGain.gain.setValueAtTime(0.3, now);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        sub.connect(subGain);
        subGain.connect(ctx.destination);

        noise.start(now);
        sub.start(now);
        noise.stop(now + 0.4);
        sub.stop(now + 0.3);
      } else if (type === 'laser') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.09);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.09);
        osc.start(now); osc.stop(now + 0.09);
      } else if (type === 'coin') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
      } else if (type === 'hit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
      }
    } catch (e) { /* Audio facultatif */ }
  };

  /* ---------------------------------------------------------
     INIT ENVIRONNEMENT
     --------------------------------------------------------- */
  const initClouds = () => {
    const list: Cloud[] = [];
    for (let i = 0; i < 8; i++) {
      list.push({
        x: Math.random() * GAME_W,
        y: Math.random() * GAME_H,
        scale: Math.random() * 0.8 + 0.6,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.15 + 0.05,
      });
    }
    game.current.clouds = list;
  };

  /* ---------------------------------------------------------
     DESSIN VECTORIEL
     --------------------------------------------------------- */
  const drawPlayerJet = (ctx: CanvasRenderingContext2D, bank: number) => {
    ctx.save();
    ctx.scale(1 - Math.abs(bank) * 0.2, 1);
    ctx.rotate(bank * 0.25);

    ctx.fillStyle = COLORS.playerPrimary;
    ctx.shadowBlur = 15; ctx.shadowColor = COLORS.playerPrimary;
    ctx.beginPath();
    ctx.moveTo(-8, 22); ctx.lineTo(0, 42 + Math.random() * 12); ctx.lineTo(8, 22);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = COLORS.playerPrimary;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, -38);
    ctx.lineTo(8, -12);
    ctx.lineTo(34, 12);
    ctx.lineTo(26, 24);
    ctx.lineTo(10, 18);
    ctx.lineTo(12, 32);
    ctx.lineTo(0, 26);
    ctx.lineTo(-12, 32);
    ctx.lineTo(-10, 18);
    ctx.lineTo(-26, 24);
    ctx.lineTo(-34, 12);
    ctx.lineTo(-8, -12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -38); ctx.lineTo(0, 26);
    ctx.moveTo(-18, 5); ctx.lineTo(18, 5);
    ctx.stroke();

    const grad = ctx.createLinearGradient(0, -22, 0, 2);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, COLORS.playerCockpit);
    grad.addColorStop(1, '#0284c7');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, -10, 5, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const drawEnemyJet = (ctx: CanvasRenderingContext2D, enemy: Aircraft) => {
    ctx.save();
    ctx.scale(1, -1);

    const isAce = enemy.type === 'ACE';
    const mainColor = isAce ? COLORS.enemyAce : COLORS.enemyBomber;
    const darkColor = isAce ? COLORS.enemyAceDark : '#b45309';

    ctx.shadowBlur = 10; ctx.shadowColor = mainColor;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, -enemy.radius * 1.2);
    ctx.lineTo(enemy.radius * 0.3, -enemy.radius * 0.3);
    ctx.lineTo(enemy.radius * 1.2, enemy.radius * 0.5);
    ctx.lineTo(enemy.radius * 0.6, enemy.radius * 0.8);
    ctx.lineTo(0, enemy.radius * 0.6);
    ctx.lineTo(-enemy.radius * 0.6, enemy.radius * 0.8);
    ctx.lineTo(-enemy.radius * 1.2, enemy.radius * 0.5);
    ctx.lineTo(-enemy.radius * 0.3, -enemy.radius * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.moveTo(0, -enemy.radius * 0.8);
    ctx.lineTo(enemy.radius * 0.4, 0);
    ctx.lineTo(-enemy.radius * 0.4, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.ellipse(0, -enemy.radius * 0.2, 4, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  /* ---------------------------------------------------------
     LOGIQUE DU JEU
     --------------------------------------------------------- */
  const updateAndDraw = (ctx: CanvasRenderingContext2D, delta: number, time: number) => {
    const g = game.current;
    const currentGameState = gameStateRef.current;

    ctx.save();
    if (g.screenShake > 0) {
      ctx.translate((Math.random() - 0.5) * g.screenShake, (Math.random() - 0.5) * g.screenShake);
      g.screenShake = Math.max(0, g.screenShake - delta * 35);
    }

    ctx.fillStyle = COLORS.gameBg;
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    // Nuages
    g.clouds.forEach(c => {
      if (!currentGameState.isPaused) {
        c.y += c.speed * (currentGameState.hasStarted ? 1.5 : 0.5);
        if (c.y > GAME_H + 100) { c.y = -100; c.x = Math.random() * GAME_W; }
      }
      ctx.fillStyle = `rgba(148, 163, 184, ${c.opacity})`;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 40 * c.scale, 0, Math.PI * 2);
      ctx.arc(c.x + 25 * c.scale, c.y - 10 * c.scale, 30 * c.scale, 0, Math.PI * 2);
      ctx.arc(c.x - 25 * c.scale, c.y - 10 * c.scale, 30 * c.scale, 0, Math.PI * 2);
      ctx.fill();
    });

    // Grille
    ctx.strokeStyle = COLORS.gameGrid;
    ctx.lineWidth = 1;
    for (let x = 0; x < GAME_W; x += 64) {
      ctx.beginPath(); ctx.moveTo(x, HUD_H); ctx.lineTo(x, GAME_H); ctx.stroke();
    }

    if (currentGameState.hasStarted && !currentGameState.isPaused && !currentGameState.gameOver) {
      g.elapsed += delta;
      const difficulty = 1 + g.elapsed * 0.02;

      // Augmentation du score avec le temps
      setGameState(s => ({ ...s, score: s.score + Math.floor(delta * 10) }));

      let targetVx = 0;
      let targetVy = 0;

      if (g.keys['ArrowLeft'] || g.keys['KeyA'] || g.moveLeft) targetVx = -12 * difficulty;
      if (g.keys['ArrowRight'] || g.keys['KeyD'] || g.moveRight) targetVx = 12 * difficulty;
      if (g.keys['ArrowUp'] || g.keys['KeyW'] || g.moveUp) targetVy = -10 * difficulty;
      if (g.keys['ArrowDown'] || g.keys['KeyS'] || g.moveDown) targetVy = 10 * difficulty;

      g.playerVx += (targetVx - g.playerVx) * 0.15;
      g.playerVy += (targetVy - g.playerVy) * 0.15;

      g.playerX += g.playerVx;
      g.playerY += g.playerVy;

      g.playerX = Math.max(40, Math.min(GAME_W - 40, g.playerX));
      g.playerY = Math.max(HUD_H + 40, Math.min(GAME_H - 60, g.playerY));

      g.playerBank = g.playerVx / 12;

      // Tirs Joueur
      if (time * 1000 - g.lastShot > 140) {
        g.bullets.push({ x: g.playerX - 18, y: g.playerY - 20, vx: 0, vy: -26, isEnemy: false });
        g.bullets.push({ x: g.playerX + 18, y: g.playerY - 20, vx: 0, vy: -26, isEnemy: false });
        playSound('laser');
        g.lastShot = time * 1000;
      }

      // Spawn Ennemis
      if (time * 1000 - g.lastSpawn > Math.max(350, 850 - g.elapsed * 10)) {
        const isBomber = Math.random() < 0.25;
        g.enemies.push({
          x: Math.random() * (GAME_W - 140) + 70,
          y: HUD_H - 40,
          vx: (Math.random() - 0.5) * 3,
          vy: (isBomber ? 2 : 3.5) * difficulty,
          type: isBomber ? 'BOMBER' : 'ACE',
          radius: isBomber ? 30 : 22,
          hp: isBomber ? 4 : 1,
          shootTimer: 0,
        });
        g.lastSpawn = time * 1000;
      }

      // Mises à jour des balles
      g.bullets.forEach(b => { b.x += b.vx; b.y += b.vy; });
      g.bullets = g.bullets.filter(b => b.y > HUD_H && b.y < GAME_H && b.x > 0 && b.x < GAME_W);

      // Pièces étoiles
      g.starCoins.forEach(s => {
        s.y += s.vy;
        s.rotation += 0.05;
        const dist = Math.hypot(s.x - g.playerX, s.y - g.playerY);
        if (dist < 120) {
          s.x += (g.playerX - s.x) * 0.1;
          s.y += (g.playerY - s.y) * 0.1;
        }
      });

      for (let i = g.starCoins.length - 1; i >= 0; i--) {
        const coin = g.starCoins[i];
        if (Math.hypot(coin.x - g.playerX, coin.y - g.playerY) < coin.radius + 25) {
          g.starCoins.splice(i, 1);
          playSound('coin');
          setGameState(s => ({
            ...s,
            starsCollected: s.starsCollected + 1,
            score: s.score + 100,
            health: Math.min(100, s.health + 5),
          }));
        }
      }
      g.starCoins = g.starCoins.filter(s => s.y < GAME_H + 20);

      // Traitement des ennemis
      for (let i = g.enemies.length - 1; i >= 0; i--) {
        const enemy = g.enemies[i];
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        if (enemy.x < enemy.radius || enemy.x > GAME_W - enemy.radius) enemy.vx *= -1;

        enemy.shootTimer += delta;
        if (enemy.type === 'BOMBER' && enemy.shootTimer > 1.2) {
          enemy.shootTimer = 0;
          g.bullets.push({ x: enemy.x, y: enemy.y + 20, vx: 0, vy: 8, isEnemy: true });
        }

        if (enemy.y > GAME_H + enemy.radius) {
          g.enemies.splice(i, 1);
          setGameState(s => {
            const nextEscaped = s.escapedEnemies + 1;
            return {
              ...s,
              escapedEnemies: nextEscaped,
              gameOver: nextEscaped >= s.maxEscaped,
            };
          });
          continue;
        }

        // Tirs du joueur touchant un ennemi
        for (let j = g.bullets.length - 1; j >= 0; j--) {
          const bul = g.bullets[j];
          if (!bul.isEnemy && Math.hypot(enemy.x - bul.x, enemy.y - bul.y) < enemy.radius + 8) {
            g.bullets.splice(j, 1);
            enemy.hp--;

            for (let k = 0; k < 4; k++) {
              g.particles.push({
                x: bul.x, y: bul.y,
                vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
                size: 2, color: COLORS.bulletPlayer, life: 0, maxLife: 10,
              });
            }

            if (enemy.hp <= 0) {
              playSound('boom');
              g.screenShake = 12;

              for (let k = 0; k < 20; k++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = Math.random() * 5 + 1;
                g.particles.push({
                  x: enemy.x, y: enemy.y,
                  vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
                  size: Math.random() * 5 + 2,
                  color: enemy.type === 'ACE' ? COLORS.enemyAce : COLORS.enemyBomber,
                  life: 0, maxLife: 25,
                });
              }

              if (Math.random() < 0.6) {
                g.starCoins.push({ x: enemy.x, y: enemy.y, vy: 2, radius: 10, rotation: 0 });
              }

              g.enemies.splice(i, 1);
              setGameState(s => ({
                ...s,
                score: s.score + (enemy.type === 'BOMBER' ? 250 : 100),
              }));
              break;
            }
          }
        }

        // Collision direct Ennemi - Joueur (Diminution santé)
        if (Math.hypot(enemy.x - g.playerX, enemy.y - g.playerY) < enemy.radius + 24) {
          g.enemies.splice(i, 1);
          playSound('hit');
          g.screenShake = 22;
          setGameState(s => {
            const nextHp = Math.max(0, s.health - 25);
            return { ...s, health: nextHp, gameOver: nextHp <= 0 };
          });
        }
      }

      // Balles ennemies touchant le Joueur (Diminution santé)
      for (let j = g.bullets.length - 1; j >= 0; j--) {
        const bul = g.bullets[j];
        if (bul.isEnemy && Math.hypot(g.playerX - bul.x, g.playerY - bul.y) < 22) {
          g.bullets.splice(j, 1);
          playSound('hit');
          g.screenShake = 15;
          setGameState(s => {
            const nextHp = Math.max(0, s.health - 15);
            return { ...s, health: nextHp, gameOver: nextHp <= 0 };
          });
        }
      }

      g.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life++; });
      g.particles = g.particles.filter(p => p.life < p.maxLife);
    }

    // Rendu Particules
    g.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 1 - p.life / p.maxLife;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Star Coins
    g.starCoins.forEach(s => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation);
      ctx.shadowBlur = 10; ctx.shadowColor = COLORS.starGold;
      ctx.fillStyle = COLORS.starGold;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * s.radius, -Math.sin((18 + i * 72) * Math.PI / 180) * s.radius);
        ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (s.radius / 2), -Math.sin((54 + i * 72) * Math.PI / 180) * (s.radius / 2));
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // Projectiles
    g.bullets.forEach(b => {
      ctx.save();
      ctx.shadowBlur = 8;
      ctx.shadowColor = b.isEnemy ? COLORS.bulletEnemy : COLORS.bulletPlayer;
      ctx.fillStyle = b.isEnemy ? COLORS.bulletEnemy : COLORS.bulletPlayer;
      ctx.fillRect(b.x - 2, b.y, 4, 16);
      ctx.restore();
    });

    // Ennemis
    g.enemies.forEach(enemy => {
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      drawEnemyJet(ctx, enemy);
      ctx.restore();
    });

    // Joueur
    ctx.save();
    ctx.translate(g.playerX, g.playerY);
    drawPlayerJet(ctx, g.playerBank);
    ctx.restore();

    // HUD
    ctx.fillStyle = COLORS.gameBg;
    ctx.fillRect(0, 0, GAME_W, HUD_H);
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, HUD_H); ctx.lineTo(GAME_W, HUD_H); ctx.stroke();

    ctx.fillStyle = COLORS.textMuted; ctx.font = '10px monospace';
    ctx.fillText('SCORE MISSION', 24, 26);
    ctx.fillText('INTEGRITÉ STRUCTURE', GAME_W - 200, 26);
    ctx.fillText('ÉVASIONS ENNEMIES (MAX 15)', 260, 26);

    ctx.fillStyle = COLORS.textMain; ctx.font = 'bold 22px monospace';
    ctx.fillText(currentGameState.score.toString().padStart(6, '0'), 24, 54);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(260, 38, 160, 14);
    ctx.fillStyle = currentGameState.escapedEnemies > 10 ? COLORS.enemyAce : COLORS.accent;
    ctx.fillRect(260, 38, (currentGameState.escapedEnemies / currentGameState.maxEscaped) * 160, 14);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(GAME_W - 200, 38, 170, 14);
    ctx.fillStyle = currentGameState.health > 30 ? COLORS.accent : COLORS.enemyAce;
    ctx.fillRect(GAME_W - 200, 38, (Math.max(0, currentGameState.health) / 100) * 170, 14);

    ctx.restore();
  };

  /* ---------------------------------------------------------
     PIPELINE WEBGL
     --------------------------------------------------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: false });
    if (!gl) return;

    initClouds();

    const ideCanvas = document.createElement('canvas');
    ideCanvas.width = GAME_W; ideCanvas.height = GAME_H;
    const ctx2d = ideCanvas.getContext('2d')!;

    const createShader = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src); gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, createShader(gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const resLoc = gl.getUniformLocation(program, 'uResolution');
    const mouseLoc = gl.getUniformLocation(program, 'uMouse');
    const timeLoc = gl.getUniformLocation(program, 'uTime');
    const bankLoc = gl.getUniformLocation(program, 'uBankAngle');

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      setIsMobile(window.innerWidth < 768);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    let animId: number;
    let lastTime = 0;

    const render = (now: number) => {
      const time = now * 0.001;
      const delta = lastTime ? time - lastTime : 0.016;
      lastTime = time;

      updateAndDraw(ctx2d, delta, time);

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ideCanvas);

      const m = mouseRef.current;
      m.currentX += (m.targetX - m.currentX) * 0.08;
      m.currentY += (m.targetY - m.currentY) * 0.08;

      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform2f(mouseLoc, m.currentX, m.currentY);
      gl.uniform1f(timeLoc, time);
      gl.uniform1f(bankLoc, game.current.playerBank);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
    };
  }, []);

  /* ---------------------------------------------------------
     CONTROLES & ACTIONS
     --------------------------------------------------------- */
  const startGame = () => {
    game.current = {
      playerX: GAME_W / 2, playerY: GAME_H - 140,
      playerVx: 0, playerVy: 0, playerBank: 0,
      bullets: [], enemies: [], particles: [], starCoins: [], clouds: game.current.clouds,
      keys: {}, screenShake: 0, lastShot: 0, lastSpawn: 0, elapsed: 0,
      moveLeft: false, moveRight: false, moveUp: false, moveDown: false,
    };
    setGameState({
      hasStarted: true, isPaused: false, gameOver: false,
      score: 0, health: 100, escapedEnemies: 0, maxEscaped: 15, starsCollected: 0,
    });
  };

  const togglePause = () => {
    if (!gameState.hasStarted || gameState.gameOver) return;
    setGameState(s => ({ ...s, isPaused: !s.isPaused }));
  };

  const quitGame = () => {
    setGameState({
      hasStarted: false,
      isPaused: false,
      gameOver: false,
      score: 0,
      health: 100,
      escapedEnemies: 0,
      maxEscaped: 15,
      starsCollected: 0,
    });
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      game.current.keys[e.code] = true;
      if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
      if (gameState.gameOver && e.code === 'Space') startGame();
    };
    const up = (e: KeyboardEvent) => { game.current.keys[e.code] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [gameState.gameOver, gameState.hasStarted]);

  return (
    <main className="relative w-full h-screen overflow-hidden select-none bg-slate-950 font-sans">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-0" />

      {/* --- UI OVERLAYS --- */}
      <div className="absolute inset-0 z-10 flex flex-col pointer-events-none">
        {gameState.hasStarted && (
          <header className="w-full p-6 flex justify-between items-center pointer-events-auto">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-xs font-mono text-slate-400 tracking-widest">AERO_STRIKER</span>
            </div>
            <button 
              onClick={togglePause}
              className="px-5 py-2 rounded-full border border-slate-700 bg-slate-900/80 backdrop-blur-md text-slate-300 font-mono text-xs tracking-widest hover:bg-slate-800 transition"
            >
              {gameState.isPaused ? 'RESUME' : 'PAUSE'}
            </button>
          </header>
        )}

        {/* Écran de démarrage */}
        {!gameState.hasStarted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 pointer-events-auto backdrop-blur-md bg-slate-950/90">
            <div className="text-center space-y-3">
              <h1 className="text-5xl font-light tracking-[0.25em] text-slate-200 uppercase font-sans">
                AERO STRIKER
              </h1>
              <div className="w-12 h-[1px] bg-slate-700 mx-auto" />
              <p className="text-xs font-mono text-slate-500 tracking-[0.2em] uppercase">Tactical Arcade Aviation</p>
            </div>
            <button
              onClick={startGame}
              className="mt-2 px-8 py-3 rounded border border-slate-700 bg-slate-900 text-slate-200 font-mono text-xs tracking-[0.2em] uppercase hover:bg-slate-800 hover:border-slate-500 transition-all duration-200"
            >
              START
            </button>
          </div>
        )}

        {/* Écran Game Over & Pause */}
        {(gameState.isPaused || gameState.gameOver) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 pointer-events-auto backdrop-blur-lg bg-slate-950/90">
            {gameState.gameOver ? (
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-light tracking-widest text-slate-200">
                  {gameState.escapedEnemies >= gameState.maxEscaped ? 'SECTOR DEFENSE FAILED' : 'AIRCRAFT DESTROYED'}
                </h2>
                <div className="space-y-1">
                  <p className="text-xs font-mono text-slate-500 tracking-widest">FINAL SCORE</p>
                  <p className="text-3xl font-mono text-slate-200 font-bold">{gameState.score.toString().padStart(6, '0')}</p>
                </div>
                <div className="flex gap-4 justify-center mt-6">
                  <button
                    onClick={startGame}
                    className="px-8 py-3 rounded border border-slate-700 bg-slate-900 text-slate-200 font-mono text-xs tracking-widest hover:bg-slate-800 transition"
                  >
                    REPLAY [SPACE]
                  </button>
                  <button
                    onClick={quitGame}
                    className="px-8 py-3 rounded border border-rose-900/50 bg-rose-950/30 text-rose-300 font-mono text-xs tracking-widest hover:bg-rose-900/50 transition"
                  >
                    QUIT
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <h2 className="text-2xl font-mono tracking-widest text-slate-300">PAUSED</h2>
                <div className="flex flex-col gap-3 items-center">
                  <button
                    onClick={togglePause}
                    className="w-48 py-3 rounded border border-slate-700 bg-slate-900 text-slate-200 font-mono text-xs tracking-widest hover:bg-slate-800 transition"
                  >
                    RESUME [P]
                  </button>
                  <button
                    onClick={quitGame}
                    className="w-48 py-3 rounded border border-rose-900/50 bg-rose-950/30 text-rose-300 font-mono text-xs tracking-widest hover:bg-rose-900/50 transition"
                  >
                    QUIT TO MENU
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contrôles Mobile */}
        {isMobile && gameState.hasStarted && !gameState.gameOver && !gameState.isPaused && (
          <div className="absolute bottom-6 inset-x-0 flex justify-center items-center pointer-events-none">
            <div className="relative w-48 h-48 rounded-full bg-slate-950/40 backdrop-blur-md border border-cyan-500/20 shadow-[0_0_25px_rgba(0,243,255,0.1)] p-2 pointer-events-auto flex items-center justify-center">
              
              {/* Bouton HAUT */}
              <button
                onTouchStart={() => { game.current.moveUp = true; }}
                onTouchEnd={() => { game.current.moveUp = false; }}
                className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-14 rounded-xl bg-slate-900/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center text-xl shadow-lg active:scale-95 active:bg-cyan-500/20 active:border-cyan-400 transition-all duration-75"
              >
                ▲
              </button>

              {/* Bouton BAS */}
              <button
                onTouchStart={() => { game.current.moveDown = true; }}
                onTouchEnd={() => { game.current.moveDown = false; }}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-14 h-14 rounded-xl bg-slate-900/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center text-xl shadow-lg active:scale-95 active:bg-cyan-500/20 active:border-cyan-400 transition-all duration-75"
              >
                ▼
              </button>

              {/* Bouton GAUCHE */}
              <button
                onTouchStart={() => { game.current.moveLeft = true; }}
                onTouchEnd={() => { game.current.moveLeft = false; }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-14 h-14 rounded-xl bg-slate-900/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center text-xl shadow-lg active:scale-95 active:bg-cyan-500/20 active:border-cyan-400 transition-all duration-75"
              >
                ◀
              </button>

              {/* Bouton DROITE */}
              <button
                onTouchStart={() => { game.current.moveRight = true; }}
                onTouchEnd={() => { game.current.moveRight = false; }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-14 h-14 rounded-xl bg-slate-900/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center text-xl shadow-lg active:scale-95 active:bg-cyan-500/20 active:border-cyan-400 transition-all duration-75"
              >
                ▶
              </button>

              <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </div>

            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AeroArcadeGame;