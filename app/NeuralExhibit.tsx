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
/* Network geometry — unchanged                                        */
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
/* Illustrations — recontextualized: brief sketch → deployed product   */
/* ------------------------------------------------------------------ */
function SketchWireframe({ draw }: { draw: boolean }) {
  const path =
    'M10 15 L130 15 L130 90 L10 90 Z M10 30 L130 30 M20 22 L40 22 M50 22 L68 22 M20 40 L60 40 L60 65 L20 65 Z M70 40 L120 40 L120 55 L70 55 Z M70 62 L118 62 M70 68 L104 68 M20 75 L46 75 L46 85 L20 85 Z';
  return (
    <svg viewBox="0 0 140 100" style={{ width: '100%', height: 'auto' }} aria-hidden="true">
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

function RenderedProduct({ reveal }: { reveal: boolean }) {
  return (
    <svg
      viewBox="0 0 140 100"
      style={{
        width: '100%',
        height: 'auto',
        opacity: reveal ? 1 : 0,
        transform: reveal ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 1s ease .3s, transform 1s ease .3s',
      }}
      aria-hidden="true"
    >
      <rect x="8" y="10" width="124" height="82" fill="none" stroke={INK} strokeWidth="1" />
      <line x1="8" y1="26" x2="132" y2="26" stroke={INK} strokeWidth="1" />
      <circle cx="16" cy="18" r="1.4" fill="none" stroke={INK} strokeWidth="0.75" />
      <circle cx="22" cy="18" r="1.4" fill="none" stroke={INK} strokeWidth="0.75" />
      <circle cx="28" cy="18" r="1.4" fill="none" stroke={INK} strokeWidth="0.75" />
      <rect x="16" y="34" width="108" height="24" fill="none" stroke={INK} strokeWidth="0.75" />
      <line x1="16" y1="66" x2="90" y2="66" stroke={INK} strokeWidth="0.5" />
      <line x1="16" y1="72" x2="70" y2="72" stroke={INK} strokeWidth="0.5" />
      <rect x="16" y="80" width="32" height="10" fill="none" stroke={ACCENT} strokeWidth="1" />
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
    <div ref={ref} className="py-16 md:py-20 lg:py-24">
      <style>{`
        .ne-fade { opacity:0; transform:translateY(14px); transition:opacity .9s ease, transform .9s ease; }
        .ne-fade.on { opacity:1; transform:translateY(0); }
        @media (prefers-reduced-motion: reduce) {
          .ne-fade { transition:none !important; opacity:1 !important; transform:none !important; }
        }
      `}</style>

      <p className="eyebrow text-center md:text-left">Mon process</p>
      <h2 className="font-display mt-4 text-center text-3xl font-medium text-[var(--ink)] sm:text-4xl md:text-left">
        De l&rsquo;idée au produit.
      </h2>

      {/* the three exhibits — one column on mobile, three on md+ */}
      <div className="mt-10 grid grid-cols-1 items-center gap-8 md:mt-14 md:grid-cols-[0.85fr_2fr_0.85fr] md:gap-8 lg:gap-14">
        <div className={`ne-fade${visible ? ' on' : ''} mx-auto w-full max-w-[190px]`}>
          <SketchWireframe draw={visible} />
        </div>

        {/* connector, mobile only */}
        <div className="mx-auto h-8 w-px bg-[var(--line)] md:hidden" aria-hidden="true" />

        <div
          className={`ne-fade${visible ? ' on' : ''} cursor-pointer touch-manipulation`}
          style={{ transitionDelay: '0.15s' }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => setHovered((h) => !h)}
        >
          <Network hovered={hovered} />
        </div>

        <div className="mx-auto h-8 w-px bg-[var(--line)] md:hidden" aria-hidden="true" />

        <div
          className={`ne-fade${visible ? ' on' : ''} mx-auto w-full max-w-[190px]`}
          style={{ transitionDelay: '0.3s' }}
        >
          <RenderedProduct reveal={visible} />
        </div>
      </div>

      {/* captions — stacked on mobile, aligned under each exhibit on md+ */}
      <div className="mt-8 grid grid-cols-1 gap-6 border-t border-[var(--line)] pt-5 text-center md:mt-7 md:grid-cols-[0.85fr_2fr_0.85fr] md:gap-8 lg:gap-14">
        <p className="cap">01 — vous décrivez</p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          <p className="cap">02 — architecture</p>
          <p className="cap">03 — développement</p>
        </div>
        <div>
          <p className="cap mb-1">le résultat</p>
          <p className="font-serif text-[1.9rem] leading-none text-[var(--accent)]">en ligne.</p>
        </div>
      </div>
    </div>
  );
}