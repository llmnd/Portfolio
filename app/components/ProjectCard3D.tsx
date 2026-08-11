'use client';

import { motion } from 'framer-motion';

interface ProjectCard3DProps {
  children: React.ReactNode;
  gradient: string;
  index: number;
}

export const ProjectCard3D = ({ children, gradient, index }: ProjectCard3DProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl`}
      />

      <div className="relative bg-[var(--surface)] rounded-2xl border border-[var(--line)] overflow-hidden transition-all duration-300 group-hover:border-[var(--accent)]/50 group-hover:shadow-lg">
        {children}
      </div>
    </motion.div>
  );
};

export default ProjectCard3D;