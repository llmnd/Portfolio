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

  const accentColor = '#ea580c';
  const accentGlow = '#f97316';
  const muteColor = '#a1a1aa';

  // Adaptateur pour mobile - réduit les techs si nécessaire
  const displayTechs = techs.length > 8 ? techs.slice(0, 8) : techs;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div ref={ref} className="py-4 sm:py-6 w-full max-w-5xl mx-auto px-2 sm:px-4">
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
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .tech-pill:hover, .tech-pill.active {
          border-color: rgba(249, 115, 22, 0.5);
          background: rgba(234, 88, 12, 0.15);
          box-shadow: 0 0 15px -3px rgba(249, 115, 22, 0.3);
          transform: translateY(-2px);
        }
        .tech-pill:active {
          transform: scale(0.95);
        }
        @media (prefers-reduced-motion: reduce) {
          .ts-fade { transition: none !important; opacity: 1 !important; transform: none !important; }
        }
        @media (max-width: 640px) {
          .tech-pill {
            padding: 0.5rem 0.75rem;
            font-size: 0.65rem;
            border-radius: 0.75rem;
          }
          .tech-pill .dot {
            width: 0.4rem;
            height: 0.4rem;
          }
        }
      `}</style>

      {/* 1. LISTE DES STACKS - Version mobile adaptée */}
      <div className={`ts-fade${visible ? ' on' : ''} mb-4 sm:mb-8`}>
        <div className="flex flex-wrap gap-1.5 sm:gap-2.5 justify-center">
          {displayTechs.map((tech) => {
            const isHovered = hovered === tech;
            return (
              <button
                key={tech}
                type="button"
                onClick={() => onTechClick?.(tech)}
                onMouseEnter={() => setHovered(tech)}
                onMouseLeave={() => setHovered(null)}
                onTouchStart={() => setHovered(tech)}
                onTouchEnd={() => setTimeout(() => setHovered(null), 300)}
                className={`tech-pill px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[0.6rem] sm:text-xs font-mono transition-all duration-300 touch-manipulation ${
                  isHovered ? 'active text-orange-400' : 'text-zinc-400'
                }`}
                aria-label={`Tech: ${tech}`}
              >
                <span className="inline-flex items-center gap-1.5 sm:gap-2">
                  <span
                    className={`dot w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full transition-colors duration-300 ${
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

      {/* 2. RÉSEAU VISUEL SVG - Responsive */}
      <div className={`ts-fade${visible ? ' on' : ''} flex justify-center`} style={{ transitionDelay: '0.1s' }}>
        <svg
          viewBox={isMobile ? "0 0 800 280" : "0 0 800 220"}
          className="w-full max-w-3xl h-auto"
          aria-hidden="true"
          role="img"
          aria-label="Visualisation du réseau de technologies"
        >
          <defs>
            <filter id={`glow-${filterId}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation={isMobile ? "6" : "4"} result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Lignes du réseau */}
          <path
            d={isMobile 
              ? "M 100 140 L 260 80 L 420 140 L 580 80 L 700 140" 
              : "M 120 110 L 300 55 L 500 110 L 680 110"
            }
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={isMobile ? "2" : "1.5"}
            fill="none"
            className="transition-all duration-300"
          />

          {/* Nœuds et Libellés */}
          {[0, 1, 2, 3].map((layer) => {
            const layerTechs = displayTechs.slice(layer * 2, (layer + 1) * 2 + 1);
            const xPos = isMobile ? 100 + layer * 180 : 120 + layer * 180;

            return (
              <g key={`layer-${layer}`}>
                {layerTechs.map((tech, i) => {
                  const yPos = layerTechs.length === 1 
                    ? (isMobile ? 140 : 110) 
                    : (isMobile ? 80 + i * 120 : 55 + i * 110);
                  const isHovered = hovered === tech;

                  return (
                    <g
                      key={tech}
                      onMouseEnter={() => setHovered(tech)}
                      onMouseLeave={() => setHovered(null)}
                      onTouchStart={() => setHovered(tech)}
                      onTouchEnd={() => setTimeout(() => setHovered(null), 300)}
                      onClick={() => onTechClick?.(tech)}
                      className="cursor-pointer group"
                      role="button"
                      tabIndex={0}
                      aria-label={`Tech: ${tech}`}
                    >
                      {/* Aura lumineuse */}
                      {isHovered && (
                        <circle
                          cx={xPos}
                          cy={yPos}
                          r={isMobile ? 24 : 18}
                          fill={accentGlow}
                          opacity={0.15}
                          filter={`url(#glow-${filterId})`}
                        />
                      )}

                      {/* Point du nœud - agrandi sur mobile */}
                      <circle
                        cx={xPos}
                        cy={yPos}
                        r={isMobile ? (isHovered ? 8 : 6) : (isHovered ? 6 : 4)}
                        fill={isHovered ? accentGlow : '#09090b'}
                        stroke={isHovered ? accentGlow : '#3f3f46'}
                        strokeWidth={isMobile ? (isHovered ? 2.5 : 2) : (isHovered ? 2 : 1.5)}
                        className="transition-all duration-300"
                      />

                      {/* Texte du nœud - mieux dimensionné sur mobile */}
                      <text
                        x={xPos}
                        y={isMobile ? yPos - 24 : yPos - 16}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="transition-all duration-300 select-none"
                        style={{
                          fontSize: isMobile 
                            ? (isHovered ? '12px' : '10px')
                            : (isHovered ? '11px' : '10px'),
                          fontFamily: 'var(--font-mono, monospace)',
                          fill: isHovered ? '#fafafa' : muteColor,
                          fontWeight: isHovered ? 600 : 400,
                          letterSpacing: '0.04em',
                        }}
                      >
                        {tech}
                      </text>

                      {/* Petit point d'interaction pour mobile */}
                      <circle
                        cx={xPos}
                        cy={yPos}
                        r={isMobile ? 20 : 12}
                        fill="transparent"
                        className="touch-manipulation"
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Signal de données animé */}
          <circle r={isMobile ? 4 : 3} fill={accentGlow} filter={`url(#glow-${filterId})`}>
            <animateMotion
              dur="3.5s"
              repeatCount="indefinite"
              path={isMobile 
                ? "M100,140 L260,80 L420,140 L580,80 L700,140" 
                : "M120,110 L300,55 L500,110 L680,110"
              }
              keyPoints="0;0.25;0.5;0.75;1"
              keyTimes="0;0.25;0.5;0.75;1"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
            />
            <animate
              attributeName="opacity"
              values="0;1;1;1;0"
              keyTimes="0;0.1;0.9;0.95;1"
              dur="3.5s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>

      {/* Message pour les technologies supplémentaires sur mobile */}
      {techs.length > 8 && isMobile && (
        <p className="text-xs text-zinc-500 text-center mt-3 italic">
          +{techs.length - 8} autres technologies
        </p>
      )}
    </div>
  );
}