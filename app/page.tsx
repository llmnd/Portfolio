'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Download, Github, Layers,
  Linkedin, Mail, Menu, ServerCog, Smartphone,
  Terminal, X, Activity, Globe, CheckCircle, Signal, LucideIcon
} from 'lucide-react';

import NeuralExhibit from './NeuralExhibit';
import HeroExhibit from './HeroExhibit';
import ThreeExperience from './ThreeExperience';
import HeroBackground3D from './components/HeroBackground3D';
import { ProjectCard3D } from './components/ProjectCard3D';

// ============================================
// TYPES & INTERFACES
// ============================================

interface Project {
  index: string;
  title: string;
  description: string;
  tech: string[];
  demo: string;
  icon: LucideIcon;
  gradient: string;
}

interface Service {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  features?: string[];
}

// ============================================
// DATA CONFIGURATION
// ============================================

const STACK = ['React', 'Next.js', 'Django', 'PostgreSQL', 'Docker', 'Tailwind CSS', 'Flutter', 'Git'];

const PROJECTS: Project[] = [
  {
    index: '01',
    title: 'Mbaymi',
    description: "Plateforme agritech mobile pour le suivi en temps réel des cultures et cheptels.",
    tech: ['Flutter', 'Dart', 'Firebase'],
    demo: 'https://mbaymi.vercel.app',
    icon: Smartphone,
    gradient: 'from-emerald-500/20 to-teal-500/0',
  },
  {
    index: '02',
    title: 'Bitik Platform',
    description: "Marketplace e-commerce distribuée avec catalogue synchrone haute vitesse.",
    tech: ['Next.js', 'Tailwind', 'REST API'],
    demo: 'https://bitik.vercel.app',
    icon: Layers,
    gradient: 'from-amber-500/20 to-orange-500/0',
  },
  {
    index: '03',
    title: 'Fisafi Groupe',
    description: "Vitrine institutionnelle réactive, optimisée SEO avec un score Lighthouse 95+.",
    tech: ['Next.js', 'SEO', 'Tailwind'],
    demo: 'https://fisafigroupe.com',
    icon: Globe,
    gradient: 'from-orange-500/20 to-red-500/0',
  },
];

const SERVICES: Service[] = [
  { 
    title: 'Interfaces Modernes', 
    description: 'Design épuré, performances WebGL/React et fluidité maximale sur tous les écrans.',
    icon: Layers,
    gradient: 'from-amber-500/10 to-orange-500/0',
    features: ['UI/UX Responsive', 'Animations Smooth', 'Lighthouse 95+']
  },
  { 
    title: 'Applications Mobiles', 
    description: 'Développement multiplateforme avec Flutter pour des performances proches du natif.',
    icon: Smartphone,
    gradient: 'from-emerald-500/10 to-teal-500/0',
    features: ['Flutter', 'iOS & Android', 'Mode Offline']
  },
  { 
    title: 'Architecture Backend', 
    description: 'APIs REST scalables, modélisation de bases de données et conteneurisation.',
    icon: ServerCog,
    gradient: 'from-blue-500/10 to-indigo-500/0',
    features: ['Django / Node', 'PostgreSQL', 'Docker']
  },
];

// ============================================
// HOOKS
// ============================================

const useScrollLock = (active: boolean) => {
  useEffect(() => {
    if (active) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [active]);
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function Home() {
  const [navOpen, setNavOpen] = useState(false);
  useScrollLock(navOpen);

  const toggleNav = useCallback(() => setNavOpen((prev) => !prev), []);

  return (
    <main className="bg-[var(--bg)] text-[var(--ink)] min-h-screen font-sans selection:bg-[var(--accent)] selection:text-black overflow-x-hidden">
      
      {/* HEADER MINIMALISTE */}
      <AnimatePresence>
        {!navOpen && (
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/80 backdrop-blur-md"
          >
            <div className="container mx-auto flex h-16 items-center justify-between px-6">
              <a href="#" className="flex items-center gap-2 font-mono text-sm tracking-tight font-medium">
                <Terminal className="h-4 w-4 text-[var(--accent)]" />
                <span>LAMINE<span className="text-[var(--accent)]">.SYS</span></span>
              </a>
              
              <nav className="hidden items-center gap-8 md:flex font-mono text-xs uppercase tracking-widest text-[var(--mute)]">
                <a href="#work" className="hover:text-[var(--accent)] transition-colors">Projets</a>
                <a href="#services" className="hover:text-[var(--accent)] transition-colors">Services</a>
                <a href="#about" className="hover:text-[var(--accent)] transition-colors">À Propos</a>
                <a href="#contact" className="hover:text-[var(--accent)] transition-colors">Contact</a>
              </nav>

              <div className="flex items-center gap-4">
                <a 
                  href="#contact" 
                  className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-1.5 font-mono text-xs text-[var(--ink)] hover:border-[var(--accent)] transition-all"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Disponible</span>
                </a>

                <button
                  type="button"
                  onClick={toggleNav}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--ink)] md:hidden hover:border-[var(--accent)] transition-colors"
                  aria-label="Toggle Menu"
                >
                  <Menu className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* NAVIGATION MOBILE OVERLAY PLEIN ÉCRAN - OPAQUE BLANC/CLAIR AVEC LISIBILITÉ OPTIMISÉE */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-white text-zinc-950 md:hidden flex flex-col justify-between p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* EN-TÊTE DU MENU MOBILE */}
            <div className="flex justify-between items-center border-b border-zinc-200 pb-6">
              <div className="flex items-center gap-2 font-mono text-sm font-bold tracking-tight text-zinc-900">
                <Terminal className="h-4 w-4 text-orange-600" />
                <span>LAMINE<span className="text-orange-600">.SYS</span></span>
              </div>
              <button 
                onClick={() => setNavOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300 text-zinc-900 hover:bg-zinc-100 transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* LIENS DE NAVIGATION */}
            <nav className="flex flex-col space-y-6 font-mono text-lg font-semibold uppercase tracking-wider py-8">
              <a 
                href="#work" 
                onClick={() => setNavOpen(false)} 
                className="flex items-center justify-between text-zinc-900 hover:text-orange-600 transition-colors"
              >
                <span>01. Projets</span>
                <ArrowUpRight className="h-5 w-5 text-orange-600" />
              </a>
              <a 
                href="#services" 
                onClick={() => setNavOpen(false)} 
                className="flex items-center justify-between text-zinc-900 hover:text-orange-600 transition-colors"
              >
                <span>02. Services</span>
                <ArrowUpRight className="h-5 w-5 text-orange-600" />
              </a>
              <a 
                href="#about" 
                onClick={() => setNavOpen(false)} 
                className="flex items-center justify-between text-zinc-900 hover:text-orange-600 transition-colors"
              >
                <span>03. À propos</span>
                <ArrowUpRight className="h-5 w-5 text-orange-600" />
              </a>
              <a 
                href="#contact" 
                onClick={() => setNavOpen(false)} 
                className="flex items-center justify-between text-zinc-900 hover:text-orange-600 transition-colors"
              >
                <span>04. Contact</span>
                <ArrowUpRight className="h-5 w-5 text-orange-600" />
              </a>
            </nav>

            {/* PIED DE MENU / RÉSEAUX */}
            <div className="pt-6 border-t border-zinc-200 flex justify-between items-center text-zinc-600">
              <div className="flex gap-6 font-mono text-xs font-medium">
                <a href="https://github.com/llmnd" target="_blank" rel="noreferrer" className="hover:text-orange-600 flex items-center gap-1">
                  <Github className="h-4 w-4" /> GitHub
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-orange-600 flex items-center gap-1">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
              </div>
              <a href="mailto:papendiaye511@gmail.com" className="hover:text-orange-600">
                <Mail className="h-5 w-5 text-orange-600" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-0 pb-20 border-b border-[var(--line)] min-h-[70vh] md:min-h-[78vh] xl:min-h-[88vh]">
        <HeroBackground3D />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              {/* BADGE HERO MIS À JOUR */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/60 px-3.5 py-1.5 font-mono text-xs text-[var(--accent)] backdrop-blur-md mb-6"
              >
                <Activity className="h-3.5 w-3.5 animate-pulse" />
                <span>DAKAR, SN •</span>
              </motion.div>
            </div>

            <div className="flex justify-center">
              <HeroExhibit />
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-6 flex flex-wrap justify-center gap-4">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 font-mono text-xs font-bold text-black transition-transform hover:scale-105"
          >
            <span>Lancer un projet</span>
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="https://res.cloudinary.com/dcs9vkwe0/image/upload/fl_attachment/v1775085940/fisafi/brochures/rraqn8hdzxqswwqccnre.pdf"
            download="Lamine_NDIAYE_CV.pdf"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-3 font-mono text-xs text-[var(--ink)] hover:border-[var(--accent)] transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span>CV (PDF)</span>
          </a>
        </div>
      </section>

      {/* TECH STACK 3D SHOWCASE */}
      <section className="py-20 border-b border-[var(--line)] bg-[var(--surface)]/20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="font-mono text-xs text-[var(--accent)] uppercase tracking-widest">// STACK TECHNIQUE</span>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold uppercase text-[var(--ink)] mt-1">
                Technologies Clés
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {STACK.map((tech) => (
                <span key={tech} className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-1 font-mono text-xs text-[var(--mute)]">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="h-[320px] w-full overflow-hidden rounded-2xl border border-[var(--line)] bg-[#030712]">
            <ThreeExperience techs={STACK} />
          </div>
        </div>
      </section>

      {/* PROJETS SÉLECTIONNÉS */}
      <section id="work" className="py-24 border-b border-[var(--line)]">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <span className="font-mono text-xs text-[var(--accent)] uppercase tracking-widest">// PORTFOLIO</span>
            <h2 className="font-display text-3xl font-semibold uppercase text-[var(--ink)] mt-1">
              Projets Récents
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.map((project, index) => (
              <ProjectCard3D key={project.title} gradient={project.gradient} index={index}>
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col justify-between p-6 bg-[var(--surface)] border border-[var(--line)] rounded-2xl h-full hover:border-[var(--accent)]/50 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between font-mono text-xs text-[var(--mute)]">
                      <span className="text-[var(--accent)] font-bold">{project.index}</span>
                      <ArrowUpRight className="h-4 w-4 text-[var(--accent)] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                    
                    <h3 className="font-display mt-6 text-xl font-medium text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                      {project.title}
                    </h3>
                    <p className="mt-2 font-mono text-xs leading-relaxed text-[var(--mute)]">
                      {project.description}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-[var(--line)]">
                    {project.tech.map((t) => (
                      <span key={t} className="font-mono text-[0.65rem] text-[var(--accent)] bg-[var(--accent)]/5 px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </a>
              </ProjectCard3D>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 border-b border-[var(--line)] bg-[var(--surface)]/30">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center max-w-xl mx-auto">
            <span className="font-mono text-xs text-[var(--accent)] uppercase tracking-widest">// EXPERTISE</span>
            <h2 className="font-display text-3xl font-semibold uppercase text-[var(--ink)] mt-1">
              Services &amp; Solutions
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.title} className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] flex flex-col justify-between">
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] mb-4">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-medium text-[var(--ink)]">{service.title}</h3>
                    <p className="mt-2 font-mono text-xs text-[var(--mute)] leading-relaxed">{service.description}</p>
                  </div>
                  {service.features && (
                    <div className="mt-6 space-y-2 pt-4 border-t border-[var(--line)] font-mono text-[0.65rem] text-[var(--mute)]">
                      {service.features.map((f) => (
                        <div key={f} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-[var(--accent)]" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* NEURAL EXHIBIT */}
      <section className="py-16 border-b border-[var(--line)]">
        <div className="container mx-auto px-6">
          <NeuralExhibit />
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <span className="font-mono text-xs text-[var(--accent)] uppercase tracking-widest">// CONTACT</span>
              <h2 className="font-display text-3xl font-semibold uppercase text-[var(--ink)] mt-1">
                Démarrer un Projet
              </h2>
              <p className="mt-4 font-mono text-xs leading-relaxed text-[var(--mute)]">
                Un projet en tête ? Contactez-moi directement pour discuter d&apos;une collaboration.
              </p>

              <div className="mt-8 space-y-3 font-mono text-xs">
                <a href="mailto:papendiaye511@gmail.com" className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--accent)] transition-all">
                  <Mail className="h-4 w-4 text-[var(--accent)]" />
                  <span>papendiaye511@gmail.com</span>
                </a>
                <a href="https://github.com/llmnd" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--accent)] transition-all">
                  <Github className="h-4 w-4 text-[var(--accent)]" />
                  <span>GitHub / llmnd</span>
                </a>
              </div>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4 p-6 bg-[var(--surface)] rounded-2xl border border-[var(--line)]">
              <div>
                <label className="font-mono text-[0.65rem] uppercase text-[var(--mute)]">Nom</label>
                <input type="text" required placeholder="Votre nom" className="mt-1 w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2 font-mono text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none" />
              </div>
              <div>
                <label className="font-mono text-[0.65rem] uppercase text-[var(--mute)]">Email</label>
                <input type="email" required placeholder="votre@email.com" className="mt-1 w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2 font-mono text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none" />
              </div>
              <div>
                <label className="font-mono text-[0.65rem] uppercase text-[var(--mute)]">Message</label>
                <textarea rows={3} required placeholder="Détails du projet..." className="mt-1 w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2 font-mono text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none resize-none" />
              </div>
              <button type="submit" className="w-full rounded-lg bg-[var(--accent)] py-2.5 font-mono text-xs font-bold text-black hover:opacity-90 transition-opacity">
                Envoyer
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--line)] py-6 font-mono text-[0.65rem] text-[var(--mute)]">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <p>© 2026 LAMINE NDIAYE</p>
          <div className="flex items-center gap-2 text-emerald-400">
            <Signal className="h-3 w-3" />
            <span>ALL SYSTEMS READY</span>
          </div>
        </div>
      </footer>
    </main>
  );
}