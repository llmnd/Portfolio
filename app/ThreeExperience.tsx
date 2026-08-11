'use client';

import { useState, useRef, useEffect, useId } from 'react';

interface TechStackVizProps {
  techs: string[];
  onTechClick?: (tech: string) => void;
}

export default function TechStackViz({ techs, onTechClick }: TechStackVizProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const filterId = useId();

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const accentColor = '#ea580c'; // Deep Orange
  const accentGlow = '#f97316';  // Bright Orange Glow
  const muteColor = '#a1a1aa';

  return (
    <div ref={ref} className="py-6 w-full max-w-5xl mx-auto px-4">
      <style>{`
        .ts-fade { 
          opacity: 0; 
          transform: translateY(12px); 
          transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1); 
        }
        .ts-fade.on { 
          opacity: 1; 
          transform: translateY(0); 
        }
        .tech-pill {
          background: rgba(24, 24, 27, 0.7);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tech-pill:hover, .tech-pill.active {
          border-color: rgba(249, 115, 22, 0.5);
          background: rgba(234, 88, 12, 0.15);
          box-shadow: 0 0 15px -3px rgba(249, 115, 22, 0.3);
          transform: translateY(-2px);
        }
        @media (prefers-reduced-motion: reduce) {
          .ts-fade { transition: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      {/* 1. LISTE DES STACKS (Placée en HAUT pour garantir sa visibilité immédiate) */}
      <div className={`ts-fade${visible ? ' on' : ''} mb-8`}>
        <div className="flex flex-wrap gap-2.5 justify-center">
          {techs.map((tech) => {
            const isHovered = hovered === tech;
            return (
              <button
                key={tech}
                type="button"
                onClick={() => onTechClick?.(tech)}
                onMouseEnter={() => setHovered(tech)}
                onMouseLeave={() => setHovered(null)}
                className={`tech-pill px-4 py-2 rounded-xl text-xs font-mono transition-all duration-300 ${
                  isHovered ? 'active text-orange-400' : 'text-zinc-400'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                      isHovered ? 'bg-orange-500 shadow-[0_0_8px_#f97316]' : 'bg-zinc-600'
                    }`}
                  />
                  {tech}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. RÉSEAU VISUEL SVG (Resserré et compact au centre) */}
      <div className={`ts-fade${visible ? ' on' : ''} flex justify-center`} style={{ transitionDelay: '0.1s' }}>
        <svg
          viewBox="0 0 800 220"
          className="w-full max-w-3xl h-auto"
          aria-hidden="true"
        >
          <defs>
            <filter id={`glow-${filterId}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Lignes du réseau (Centrées à Y = 110) */}
          <path
            d="M 120 110 L 300 55 M 120 110 L 300 165 M 300 55 L 500 110 M 300 165 L 500 110 M 500 110 L 680 110"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Nœuds et Libellés */}
          {[0, 1, 2, 3].map((layer) => {
            const layerTechs = techs.slice(layer * 2, (layer + 1) * 2 + 1);
            const xPos = 120 + layer * 180;

            return (
              <g key={`layer-${layer}`}>
                {layerTechs.map((tech, i) => {
                  const yPos = layerTechs.length === 1 ? 110 : 55 + i * 110;
                  const isHovered = hovered === tech;

                  return (
                    <g
                      key={tech}
                      onMouseEnter={() => setHovered(tech)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => onTechClick?.(tech)}
                      className="cursor-pointer group"
                    >
                      {/* Aura lumineuse */}
                      {isHovered && (
                        <circle
                          cx={xPos}
                          cy={yPos}
                          r={18}
                          fill={accentGlow}
                          opacity={0.15}
                          filter={`url(#glow-${filterId})`}
                        />
                      )}

                      {/* Point du nœud */}
                      <circle
                        cx={xPos}
                        cy={yPos}
                        r={isHovered ? 6 : 4}
                        fill={isHovered ? accentGlow : '#09090b'}
                        stroke={isHovered ? accentGlow : '#3f3f46'}
                        strokeWidth={isHovered ? 2 : 1.5}
                        className="transition-all duration-300"
                      />

                      {/* Texte du nœud (Placé de manière sécurisée au-dessus) */}
                      <text
                        x={xPos}
                        y={yPos - 16}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="transition-all duration-300 select-none"
                        style={{
                          fontSize: isHovered ? '11px' : '10px',
                          fontFamily: 'var(--font-mono, monospace)',
                          fill: isHovered ? '#fafafa' : muteColor,
                          fontWeight: isHovered ? 600 : 400,
                          letterSpacing: '0.04em',
                        }}
                      >
                        {tech}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Signal de données animé */}
          <circle r="3" fill={accentGlow} filter={`url(#glow-${filterId})`}>
            <animateMotion
              dur="3.5s"
              repeatCount="indefinite"
              path="M120,110 L300,55 L500,110 L680,110"
              keyPoints="0;0.33;0.66;1"
              keyTimes="0;0.4;0.7;1"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.15;0.85;1"
              dur="3.5s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>
    </div>
  );
}