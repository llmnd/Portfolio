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
        @media (prefers-reduced-motion: reduce) {
          .ts-fade { transition: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      {/* RÉSEAU VISUEL SVG */}
      <div className={`ts-fade${visible ? ' on' : ''} flex justify-center`}>
        <svg
          viewBox="0 0 800 220"
          className="w-full max-w-4xl h-auto"
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

                      {/* Texte du nœud */}
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