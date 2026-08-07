'use client';

import { motion } from 'framer-motion';

export const HeroBackground3D = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="absolute inset-0 h-[500px] overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,212,255,0.16),_transparent_45%),linear-gradient(135deg,_#020617_0%,_#0f172a_50%,_#111827_100%)]" />
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/20 blur-3xl" />
      <div className="absolute left-[10%] top-[20%] h-40 w-40 rounded-full border border-cyan-400/20" />
      <div className="absolute bottom-[15%] right-[10%] h-28 w-28 rounded-full border border-fuchsia-400/20" />
      
      {/* VIDEO IN CIRCLE */}
     
      
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle,_rgba(255,255,255,0.9)_1px,_transparent_1px)] [background-size:22px_22px]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.06)_50%,transparent_100%)]" />
    </motion.div>
  );
};

export default HeroBackground3D;
