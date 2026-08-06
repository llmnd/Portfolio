'use client';

import { useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/* Tokens — pulled from globals.css so both files stay in sync         */
/* ------------------------------------------------------------------ */
const BG = 'var(--bg)';
const INK = 'var(--ink)';
const MUTE = 'var(--mute)';
const ACCENT = 'var(--accent)';
const LINE = 'var(--line)';

/* ------------------------------------------------------------------ */
/* Neural network geometry                                             */
/* ------------------------------------------------------------------ */
const LAYERS = [4, 6, 5, 1];
const VB_W = 760;
const VB_H = 320;
const X_POS = [40, 280, 520, 720];

type Node = { x: number; y: number };

function layerNodes(count: number, x: number): Node[] {
  const gap = VB_H / (count + 1);
  return Array.from({ length: count }, (_, i) => ({ x, y: gap * (i + 1) }));
}

const NODES: Node[][] = LAYERS.map((n, i) => layerNodes(n, X_POS[i]));

/* the single illuminated path: one node per layer */
const ACTIVE_IDX = [1, 3, 2, 0];
const ACTIVE_PATH = ACTIVE_IDX.map((idx, layer) => NODES[layer][idx]);

function Network({ hovered }: { hovered: boolean }) {
  const edges: { a: Node; b: Node; isActive: boolean; key: string }[] = [];
  for (let l = 0; l < NODES.length - 1; l++) {
    NODES[l].forEach((a, ai) => {
      NODES[l + 1].forEach((b, bi) => {
        const isActive = ACTIVE_IDX[l] === ai && ACTIVE_IDX[l + 1] === bi;
        edges.push({ a, b, isActive, key: `${l}-${ai}-${bi}` });
      });
    });
  }

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      aria-hidden="true"
    >
      {edges.filter((e) => !e.isActive).map((e) => (
        <line key={e.key} x1={e.a.x} y1={e.a.y} x2={e.b.x} y2={e.b.y} stroke={LINE} strokeWidth="1" />
      ))}

      {edges.filter((e) => e.isActive).map((e) => (
        <line
          key={e.key}
          x1={e.a.x}
          y1={e.a.y}
          x2={e.b.x}
          y2={e.b.y}
          stroke={ACCENT}
          strokeWidth={hovered ? 1.4 : 1}
          style={{ transition: 'stroke-width .5s ease' }}
        />
      ))}

      {NODES.flat().map((n, i) => {
        const isActive = ACTIVE_PATH.includes(n);
        return (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={isActive ? (hovered ? 5.5 : 4.5) : 3}
            fill={isActive ? ACCENT : BG}
            stroke={isActive ? ACCENT : 'var(--line-strong)'}
            strokeWidth="1"
            style={{ transition: 'r .5s ease' }}
          />
        );
      })}

      <circle r="4" fill={ACCENT}>
        <animateMotion
          dur="3.2s"
          repeatCount="indefinite"
          path={`M${ACTIVE_PATH.map((p) => `${p.x},${p.y}`).join(' L')}`}
        />
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.92;1" dur="3.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* House illustrations                                                 */
/* ------------------------------------------------------------------ */
function SketchHouse({ draw }: { draw: boolean }) {
  const path =
    'M20 100 L20 55 L60 20 L100 55 L100 100 Z M20 55 L100 55 M45 100 L45 75 L58 75 L58 100 M68 65 L82 65 L82 78 L68 78 Z';
  return (
    <svg viewBox="0 0 120 110" style={{ width: '100%', height: 'auto' }} aria-hidden="true">
      <path
        d={path}
        fill="none"
        stroke={INK}
        strokeWidth="1.1"
        strokeLinejoin="round"
        strokeLinecap="round"
        pathLength={1}
        style={{
          strokeDasharray: 1,
          strokeDashoffset: draw ? 0 : 1,
          transition: 'stroke-dashoffset 1.6s cubic-bezier(.4,0,.2,1)',
        }}
      />
    </svg>
  );
}

function RenderedHouse({ reveal }: { reveal: boolean }) {
  return (
    <svg
      viewBox="0 0 120 110"
      style={{
        width: '100%',
        height: 'auto',
        opacity: reveal ? 1 : 0,
        transform: reveal ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 1s ease .3s, transform 1s ease .3s',
      }}
      aria-hidden="true"
    >
      <path d="M18 100 L18 54 L60 18 L102 54 L102 100 Z" fill="none" stroke={INK} strokeWidth="1" />
      <line x1="18" y1="54" x2="102" y2="54" stroke={INK} strokeWidth="1" />
      <line x1="60" y1="18" x2="60" y2="8" stroke={INK} strokeWidth="0.75" />
      <rect x="44" y="72" width="15" height="28" fill="none" stroke={ACCENT} strokeWidth="1" />
      <rect x="70" y="64" width="14" height="13" fill="none" stroke={INK} strokeWidth="0.75" />
      <line x1="77" y1="64" x2="77" y2="77" stroke={INK} strokeWidth="0.5" />
      <line x1="70" y1="70.5" x2="84" y2="70.5" stroke={INK} strokeWidth="0.5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Exhibit component                                                    */
/* ------------------------------------------------------------------ */
export default function NeuralExhibit() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.25 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ padding: 'clamp(2.5rem, 6vw, 6rem) 0' }}>
      <style>{`
        .ne-fade { opacity:0; transform:translateY(14px); transition:opacity .9s ease, transform .9s ease; }
        .ne-fade.on { opacity:1; transform:translateY(0); }
        @media (prefers-reduced-motion: reduce) {
          .ne-fade { transition:none !important; opacity:1 !important; transform:none !important; }
        }
      `}</style>

      <p className="eyebrow">Comment ça fonctionne</p>
      <h2 className="font-display mt-4 text-3xl font-medium text-[var(--ink)] sm:text-4xl">
        Du croquis à la reconnaissance.
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '0.85fr 2fr 0.85fr',
          alignItems: 'center',
          gap: 'clamp(1.5rem, 4vw, 3rem)',
          marginTop: 'clamp(2.5rem, 6vw, 4rem)',
        }}
      >
        <div className={`ne-fade${visible ? ' on' : ''}`} style={{ maxWidth: 180, margin: '0 auto' }}>
          <SketchHouse draw={visible} />
        </div>

        <div
          className={`ne-fade${visible ? ' on' : ''}`}
          style={{ transitionDelay: '0.15s' }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Network hovered={hovered} />
        </div>

        <div className={`ne-fade${visible ? ' on' : ''}`} style={{ maxWidth: 180, margin: '0 auto', transitionDelay: '0.3s' }}>
          <RenderedHouse reveal={visible} />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '0.85fr 2fr 0.85fr',
          gap: 'clamp(1.5rem, 4vw, 3rem)',
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: `1px solid ${LINE}`,
        }}
      >
        <p className="cap" style={{ textAlign: 'center' }}>01 — vous dessinez</p>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <p className="cap">02 — convolution</p>
          <p className="cap">03 — classification</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p className="cap" style={{ marginBottom: '0.35rem' }}>la machine voit</p>
          <p className="font-serif" style={{ fontSize: '1.9rem', color: ACCENT, lineHeight: 1 }}>house</p>
        </div>
      </div>
    </div>
  );
}