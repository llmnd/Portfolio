'use client';

import { useState, useId } from 'react';

interface TechStackVizProps {
  techs: string[];
  onTechClick?: (tech: string) => void;
}

export default function TechStackViz({ techs, onTechClick }: TechStackVizProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const filterId = useId();

  // Palette Dark Orange / Minimalist Dark
  const accentColor = '#f97316'; // Dark Orange vibrant
  const muteColor = '#71717a';   // Zinc 500
  const activeTextColor = '#fafafa';

  // Positions prédéfinies des nœuds pour garantir un équilibre parfait
  const nodes = [
    { id: techs[0] || 'Frontend', x: 100, y: 100 },
    { id: techs[1] || 'React', x: 280, y: 50 },
    { id: techs[2] || 'Next.js', x: 280, y: 150 },
    { id: techs[3] || 'WebGL', x: 500, y: 100 },
    { id: techs[4] || 'Tailwind', x: 680, y: 100 },
  ].filter(node => node.id);

  // Définition des connexions entre les index de nœuds
  const connections = [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
  ];

  return (
    <div className="relative w-full h-full min-h-[220px] flex items-center justify-center p-4 rounded-2xl bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/50 shadow-2xl overflow-hidden">
      {/* Halo d'ambiance en arrière-plan */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent pointer-events-none" 
      />

      <svg
        viewBox="0 0 780 200"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full max-w-4xl block z-10 overflow-visible"
        aria-hidden="true"
      >
        <defs>
          {/* Filtre Glow Haute Définition */}
          <filter id={`glow-${filterId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient linéaire pour les lignes réseau */}
          <linearGradient id={`line-grad-${filterId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#27272a" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#ea580c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#27272a" stopOpacity="0.4" />
          </linearGradient>

          {/* Gradient dynamique au survol */}
          <linearGradient id={`active-line-grad-${filterId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* LIGNES DE CONNEXION */}
        <g className="connections">
          {connections.map(({ from, to }, idx) => {
            const start = nodes[from];
            const end = nodes[to];
            if (!start || !end) return null;

            const isConnected = hovered === start.id || hovered === end.id;

            return (
              <line
                key={`conn-${idx}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={isConnected ? `url(#active-line-grad-${filterId})` : `url(#line-grad-${filterId})`}
                strokeWidth={isConnected ? 2 : 1.2}
                className="transition-all duration-500 ease-out"
              />
            );
          })}
        </g>

        {/* SIGNAL DE DONNÉES EN FLUX */}
        <circle r="2.5" fill={accentColor} filter={`url(#glow-${filterId})`}>
          <animateMotion
            dur="4s"
            repeatCount="indefinite"
            path={`M ${nodes[0]?.x || 100} ${nodes[0]?.y || 100} L ${nodes[1]?.x || 280} ${nodes[1]?.y || 50} L ${nodes[3]?.x || 500} ${nodes[3]?.y || 100} L ${nodes[4]?.x || 680} ${nodes[4]?.y || 100}`}
            keyTimes="0;0.35;0.7;1"
            calcMode="spline"
            keySplines="0.25 0.1 0.25 1; 0.25 0.1 0.25 1; 0.25 0.1 0.25 1"
          />
        </circle>

        {/* NŒUDS ET ÉTIQUETTES */}
        {nodes.map((node) => {
          const isHovered = hovered === node.id;

          return (
            <g
              key={node.id}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              onTouchStart={() => setHovered(node.id)}
              onTouchEnd={() => setHovered(null)}
              onClick={() => onTechClick?.(node.id)}
              className="cursor-pointer group"
            >
              {/* Halo d'accent au survol */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isHovered ? 22 : 0}
                fill={accentColor}
                opacity={isHovered ? 0.12 : 0}
                filter={`url(#glow-${filterId})`}
                className="transition-all duration-500 ease-out"
              />

              {/* Anneau extérieur du nœud */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isHovered ? 9 : 6}
                fill="#09090b"
                stroke={isHovered ? accentColor : '#3f3f46'}
                strokeWidth={isHovered ? 2 : 1.5}
                className="transition-all duration-300 ease-out"
              />

              {/* Cœur du nœud */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isHovered ? 3.5 : 2}
                fill={isHovered ? accentColor : '#a1a1aa'}
                className="transition-all duration-300 ease-out"
              />

              {/* Étiquette / Nom de la technologie */}
              <text
                x={node.x}
                y={node.y - 20}
                textAnchor="middle"
                dominantBaseline="middle"
                className="select-none transition-all duration-300 ease-out"
                style={{
                  fontSize: isHovered ? '11px' : '10px',
                  fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)',
                  fill: isHovered ? activeTextColor : muteColor,
                  fontWeight: isHovered ? 600 : 400,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {node.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}