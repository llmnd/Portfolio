'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface ProjectCard3DProps {
  children: React.ReactNode;
  gradient: string;
  index: number;
}

export const ProjectCard3D = ({ children, gradient, index }: ProjectCard3DProps) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [shine, setShine] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotY = ((x / rect.width) - 0.5) * 8;
    const rotX = ((0.5 - (y / rect.height)) * 8);

    setRotateX(rotX);
    setRotateY(rotY);
    setShine({ x, y });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative preserve-3d"
      style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d',
      } as React.CSSProperties}
    >
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl`}
      />

      <motion.div
        animate={{
          rotateX,
          rotateY,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'perspective(1200px)',
        } as React.CSSProperties}
      >
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-50 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${shine.x}px ${shine.y}px, rgba(255,255,255,0.8) 0%, transparent 50%)`,
            zIndex: 10,
          }}
        />

        <div className="relative card p-6 bg-[var(--surface)] rounded-2xl border border-[var(--line)] overflow-hidden transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-[var(--accent)]/20">
          {children}
        </div>
      </motion.div>

      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-32 w-32 bg-gradient-to-t from-[var(--accent)]/10 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full -z-10"
        style={{
          filter: 'blur(60px)',
        }}
      />
    </motion.div>
  );
};

export default ProjectCard3D;
