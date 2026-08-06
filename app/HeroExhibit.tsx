'use client';

import { useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/* Tokens — synced with globals.css                                    */
/* ------------------------------------------------------------------ */
const BG = 'var(--bg)';
const INK = 'var(--ink)';
const MUTE = 'var(--mute)';
const ACCENT = 'var(--accent)';
const LINE = 'var(--line)';

/* ------------------------------------------------------------------ */
/* Hook to detect mobile and reduce animation complexity             */
/* ------------------------------------------------------------------ */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

/* ------------------------------------------------------------------ */
/* Code editor visualization with animated parsing/compilation        */
/* ------------------------------------------------------------------ */
function CodeEditor({ animate, hovered }: { animate: boolean; hovered: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const isMobile = useIsMobile();
  const fontSize = isMobile ? 9 : 11;
  const titleFontSize = isMobile ? 8 : 10;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 200 240"
      preserveAspectRatio="xMidYMid meet"
      style={{ 
        width: '100%', 
        height: 'auto', 
        overflow: 'visible',
        willChange: 'transform',
        backfaceVisibility: 'hidden'
      }}
      aria-hidden="true"
    >
      {/* Window frame */}
      <rect x="10" y="10" width="180" height="220" fill="none" stroke={INK} strokeWidth={isMobile ? "0.9" : "1.2"} rx="2" />

      {/* Title bar */}
      <line x1="10" y1="32" x2="190" y2="32" stroke={LINE} strokeWidth="0.8" />
      <circle cx="22" cy="21" r={isMobile ? "1.5" : "2"} fill={MUTE} opacity="0.6" />
      <circle cx="32" cy="21" r={isMobile ? "1.5" : "2"} fill={MUTE} opacity="0.6" />
      <circle cx="42" cy="21" r={isMobile ? "1.5" : "2"} fill={MUTE} opacity="0.6" />
      <text x="100" y="24" fontSize={titleFontSize} fill={MUTE} textAnchor="middle" opacity="0.7">
        function.js
      </text>

      {/* Code lines - animated with staggered delays */}
      <g 
        opacity={animate ? 1 : 0} 
        style={{ 
          transition: 'opacity 1.2s ease .3s',
          willChange: 'opacity'
        }}
      >
        {/* Line 1: const */}
        <text x="16" y={isMobile ? "54" : "58"} fontSize={fontSize} fill={MUTE} opacity="0.6" fontFamily="monospace" fontWeight="400">
          01
        </text>
        <text x={isMobile ? "32" : "40"} y={isMobile ? "54" : "58"} fontSize={fontSize} fill={ACCENT} fontFamily="monospace" fontWeight="600">
          const
        </text>
        <text x={isMobile ? "60" : "70"} y={isMobile ? "54" : "58"} fontSize={fontSize} fill={INK} fontFamily="monospace">
          {' '}build = {'{'}
        </text>

        {/* Line 2: indented content */}
        <text x="16" y={isMobile ? "70" : "78"} fontSize={fontSize} fill={MUTE} opacity="0.6" fontFamily="monospace" fontWeight="400">
          02
        </text>
        <text x={isMobile ? "48" : "55"} y={isMobile ? "70" : "78"} fontSize={fontSize} fill={INK} fontFamily="monospace">
          return {'{'}
        </text>

        {/* Line 3: nested */}
        <text x="16" y={isMobile ? "86" : "98"} fontSize={fontSize} fill={MUTE} opacity="0.6" fontFamily="monospace" fontWeight="400">
          03
        </text>
        <text x={isMobile ? "65" : "75"} y={isMobile ? "86" : "98"} fontSize={fontSize} fill={ACCENT} fontFamily="monospace" fontWeight="600">
          code
        </text>
        <text x={isMobile ? "88" : "100"} y={isMobile ? "86" : "98"} fontSize={fontSize} fill={INK} fontFamily="monospace">
          {': true,'}
        </text>

        {/* Line 4: scale */}
        <text x="16" y={isMobile ? "102" : "118"} fontSize={fontSize} fill={MUTE} opacity="0.6" fontFamily="monospace" fontWeight="400">
          04
        </text>
        <text x={isMobile ? "65" : "75"} y={isMobile ? "102" : "118"} fontSize={fontSize} fill={ACCENT} fontFamily="monospace" fontWeight="600">
          scale
        </text>
        <text x={isMobile ? "92" : "105"} y={isMobile ? "102" : "118"} fontSize={fontSize} fill={INK} fontFamily="monospace">
          {': fast,'}
        </text>

        {/* Line 5: closing brace */}
        <text x="16" y={isMobile ? "118" : "138"} fontSize={fontSize} fill={INK} opacity="0.8" fontFamily="monospace">
          {'}'}
        </text>

        {/* Line 6: closing */}
        <text x="16" y={isMobile ? "134" : "158"} fontSize={fontSize} fill={INK} opacity="0.8" fontFamily="monospace">
          {'}'}
        </text>
      </g>

      {/* Parsing/Compilation visualization - animated bars */}
      <g 
        opacity={animate ? 1 : 0} 
        style={{ 
          transition: 'opacity 1.2s ease .3s',
          willChange: 'opacity'
        }}
      >
        {/* Status indicator */}
        <circle cx="22" cy="190" r="2.5" fill={ACCENT}>
          <animate
            attributeName="opacity"
            values="0.3;1;0.3"
            dur={isMobile ? "1.4s" : "2s"}
            repeatCount="indefinite"
          />
        </circle>
        <text x="35" y="194" fontSize={isMobile ? "8" : "9"} fill={MUTE} fontFamily="monospace" opacity="0.7">
          compiled
        </text>

        {/* Progress visualization - optimized for mobile */}
        {[0, 1, 2].map((barIndex) => (
          <line
            key={`bar-${barIndex}`}
            x1={120 + barIndex * 15}
            y1="187"
            x2={120 + barIndex * 15}
            y2="200"
            stroke={ACCENT}
            strokeWidth={isMobile ? "1" : "1.5"}
            opacity={hovered ? 1 : 0.4}
            style={{ 
              transition: 'opacity 0.3s ease',
              willChange: 'y1, y2'
            }}
          >
            <animate
              attributeName="y1"
              values="187;175;187"
              dur={`${isMobile ? 1.8 : 2.4}s`}
              repeatCount="indefinite"
              begin={`${barIndex * (isMobile ? 0.2 : 0.3)}s`}
            />
            <animate
              attributeName="y2"
              values="200;212;200"
              dur={`${isMobile ? 1.8 : 2.4}s`}
              repeatCount="indefinite"
              begin={`${barIndex * (isMobile ? 0.2 : 0.3)}s`}
            />
          </line>
        ))}
      </g>

      {/* Cursor blink animation */}
      <line
        x1="158"
        y1="158"
        x2="158"
        y2="166"
        stroke={ACCENT}
        strokeWidth="1.2"
        opacity={animate ? 1 : 0}
        style={{ 
          transition: 'opacity 1.2s ease .3s',
          transformOrigin: '158px 162px'
        }}
      >
        <animate 
          attributeName="opacity" 
          values="1;1;0;0" 
          dur={isMobile ? "0.8s" : "1s"} 
          repeatCount="indefinite" 
        />
      </line>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Parallel execution visualization                                     */
/* ------------------------------------------------------------------ */
function ExecutionFlow({ animate }: { animate: boolean }) {
  const isMobile = useIsMobile();
  const baseDuration = isMobile ? 1.8 : 2.4;
  const spacing = isMobile ? 28 : 35;
  const startY = isMobile ? 35 : 30;

  return (
    <svg
      viewBox="0 0 200 120"
      preserveAspectRatio="xMidYMid meet"
      style={{ 
        width: '100%', 
        height: 'auto', 
        overflow: 'visible',
        willChange: 'transform'
      }}
      aria-hidden="true"
    >
      {/* Three parallel execution threads */}
      {[0, 1].map((i) => (
        <g 
          key={i} 
          opacity={animate ? 1 : 0} 
          style={{ 
            transition: `opacity ${isMobile ? '0.8s' : '1.2s'} ease ${isMobile ? 0.2 + i * 0.05 : 0.4 + i * 0.1}s`,
            willChange: 'opacity'
          }}
        >
          {/* Thread line */}
          <line 
            x1="20" 
            y1={startY + i * spacing} 
            x2="180" 
            y2={startY + i * spacing} 
            stroke={LINE} 
            strokeWidth="0.8" 
            strokeDasharray="2,3"
            opacity="0.6"
          />

          {/* Execution dots - moving along the line */}
          <circle cx="50" cy={startY + i * spacing} r="2.5" fill={ACCENT}>
            <animate
              attributeName="cx"
              values="20;180;20"
              dur={`${baseDuration + i * 0.15}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="r"
              values="2.5;3.5;2.5"
              dur={`${baseDuration + i * 0.15}s`}
              repeatCount="indefinite"
            />
          </circle>

          {/* Start node */}
          <circle cx="20" cy={startY + i * spacing} r="2" fill="none" stroke={INK} strokeWidth="0.8" opacity="0.7" />

          {/* End node */}
          <circle cx="180" cy={startY + i * spacing} r="2" fill="none" stroke={INK} strokeWidth="0.8" opacity="0.7" />
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Hero Exhibit Component                                              */
/* ------------------------------------------------------------------ */
export default function HeroExhibit() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isMobile = useIsMobile();
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
    <div
      ref={ref}
      className="frame relative flex aspect-[4/5] items-center justify-center cursor-pointer touch-manipulation"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setHovered((h) => !h)}
      style={{ 
        backfaceVisibility: 'hidden',
        WebkitFontSmoothing: 'antialiased'
      }}
    >
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-code {
          animation: fadeInUp 0.8s ease 0.2s both;
          will-change: opacity, transform;
        }

        .hero-flow {
          animation: fadeInUp 0.8s ease 0.5s both;
          will-change: opacity, transform;
        }

        @media (max-width: 640px) {
          .hero-code {
            animation: fadeInUp 0.6s ease 0.1s both;
          }

          .hero-flow {
            animation: fadeInUp 0.6s ease 0.3s both;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-code,
          .hero-flow {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 sm:gap-6 sm:p-6">
        <div className="w-full max-w-xs hero-code">
          <CodeEditor animate={visible} hovered={hovered} />
        </div>

        <div className="w-full max-w-xs hero-flow">
          <ExecutionFlow animate={visible} />
        </div>
      </div>
    </div>
  );
}