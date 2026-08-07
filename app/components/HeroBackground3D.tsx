'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export const HeroBackground3D = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Détection du mode mobile/tactile pour désactiver la parallaxe lourde
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Valeurs de mouvement pour la parallaxe
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 40, damping: 25 });
  const smoothY = useSpring(mouseY, { stiffness: 40, damping: 25 });

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const translateXSlow = useTransform(smoothX, [-0.5, 0.5], [-15, 15]);
  const translateYSlow = useTransform(smoothY, [-0.5, 0.5], [-15, 15]);

  useEffect(() => {
    if (isMobile) return; // Désactivation des écouteurs sur mobile

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX.set(e.clientX / innerWidth - 0.5);
      mouseY.set(e.clientY / innerHeight - 0.5);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile, mouseX, mouseY]);

  return (
    <div
      className="absolute inset-0 h-[500px] sm:h-[600px] md:h-[700px] w-full overflow-hidden pointer-events-none select-none bg-slate-950 [perspective:1000px]"
      aria-hidden="true"
    >
      {/* 1. Dégradé de fond réponsif */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_-10%,rgba(56,189,248,0.2),rgba(15,23,42,0))]" />

      {/* 2. Layer principal de la scène */}
      <motion.div
        style={isMobile ? undefined : { rotateX, rotateY }}
        className="relative w-full h-full transform-style-3d"
      >
        {/* Halo central néon (Taille adaptée pour mobile) */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-64 w-64 sm:h-80 sm:w-80 md:h-[500px] md:w-[500px] rounded-full bg-gradient-to-tr from-cyan-500/30 via-indigo-600/20 to-fuchsia-500/30 blur-[60px] sm:blur-[90px] md:blur-[130px]"
        />

        {/* Faisceau lumineux diagonal (Uniquement sur écran desktop/tablette) */}
        {!isMobile && (
          <motion.div
            animate={{
              opacity: [0.15, 0.35, 0.15],
              x: ['-10%', '10%', '-10%'],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-40 left-1/4 w-[600px] h-[300px] bg-gradient-to-br from-cyan-400/20 via-transparent to-transparent blur-3xl rotate-[25deg] will-change-transform"
          />
        )}

        {/* 3. Formes géométriques flottantes */}
        <motion.div
          style={isMobile ? undefined : { x: translateXSlow, y: translateYSlow }}
          className="absolute inset-0"
        >
          {/* Anneau Orbit cybernétique - Adapté mobile */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute left-[5%] sm:left-[15%] top-[18%] h-36 w-36 sm:h-52 sm:w-52 md:h-64 md:w-64 rounded-full border border-dashed border-cyan-400/25 bg-cyan-500/5 backdrop-blur-sm sm:backdrop-blur-md shadow-[0_0_30px_rgba(34,211,238,0.1)]"
          />

          {/* Sphère Néon Fuchsia - Position réponsive */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute right-[5%] sm:right-[12%] top-[25%] h-24 w-24 sm:h-36 sm:w-36 md:h-44 md:w-44 rounded-2xl sm:rounded-3xl border border-fuchsia-500/25 bg-gradient-to-br from-fuchsia-500/10 to-transparent backdrop-blur-sm sm:backdrop-blur-xl shadow-[0_0_30px_rgba(217,70,239,0.1)] rotate-12"
          />
        </motion.div>

        {/* 4. Particules lumineuses fixes (sans surcoût GPU) */}
        <div className="absolute left-[15%] top-[45%] h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
        <div className="absolute right-[20%] top-[20%] h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-fuchsia-400 shadow-[0_0_12px_#e879f9] animate-pulse" />

        {/* 5. Grille de fond réponsive */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415518_1px,transparent_1px),linear-gradient(to_bottom,#33415518_1px,transparent_1px)] bg-[size:2rem_2rem] sm:bg-[size:3rem_3rem] md:bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_20%,#000_60%,transparent_100%)]" />

        {/* 6. Matrice de points holographiques */}
        <div className="absolute inset-0 opacity-20 sm:opacity-25 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] sm:[background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,#000_50%,transparent_100%)]" />
      </motion.div>

      {/* 7. Fondu de transition vers le contenu */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 md:h-40 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
    </div>
  );
};

export default HeroBackground3D;