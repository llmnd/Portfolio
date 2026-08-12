'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ArrowUpRight, Download, Github, Layers,
  Linkedin, Mail, Menu, ServerCog, Smartphone,
  Terminal, X, Globe, CheckCircle, Signal,
  GraduationCap, Award, Languages, LucideIcon
} from 'lucide-react';

import NeuralExhibit from './NeuralExhibit';
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

interface Certification {
  title: string;
  year: string;
  issuer: string;
}

interface Education {
  title: string;
  institution: string;
  period: string;
  details?: string;
}

// ============================================
// DATA CONFIGURATION
// ============================================

const STACK = ['React', 'Next.js', 'Angular', 'Django', 'PostgreSQL', 'Docker', 'Tailwind CSS', 'Flutter', 'Git'];

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

const CERTIFICATIONS: Certification[] = [
  { title: 'Networking Basics', issuer: 'Cisco Networking Academy', year: '2023' },
  { title: 'Introduction to Cybersecurity', issuer: 'Cisco Networking Academy', year: '2025' },
  { title: 'English for IT 2', issuer: 'Cisco Networking Academy', year: '2025' },
];

const EDUCATION: Education[] = [
  {
    title: 'Diplôme de Technicien Supérieur en Informatique',
    institution: 'ESP, Dakar',
    period: '2023–2025'
  },
  {
    title: 'Licence 1 Physique-Chimie',
    institution: 'Université',
    period: '2022–2023',
    details: 'non achevée, réorientation vers l’informatique'
  },
  {
    title: 'Baccalauréat Série S2',
    institution: 'Cours Sacré-Cœur, Dakar',
    period: '2022'
  }
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
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  useScrollLock(navOpen);

  const toggleNav = useCallback(() => setNavOpen((prev) => !prev), []);

  return (
    <main className="bg-[var(--bg)] text-[var(--ink)] min-h-screen font-sans selection:bg-[var(--accent)] selection:text-black overflow-x-hidden">
      
      {/* HEADER MINIMALISTE */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6 sm:px-10">
          
          <a href="#" className="flex items-center gap-2 font-mono text-sm tracking-tight font-medium">
            <Terminal className="h-4 w-4 text-[var(--accent)]" />
            <span>LAMINE<span className="text-[var(--accent)]">.SYS</span></span>
          </a>

          <div className="flex items-center gap-4">
            <a 
              href="https://res.cloudinary.com/dcs9vkwe0/image/upload/v1786368720/r2ehute4a7dtnkipi9bf.pdf"
              download="Lamine_NDIAYE_CV.pdf"
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-1.5 font-mono text-xs text-[var(--ink)] hover:border-[var(--accent)] transition-all"
            >
              <Download className="h-3 w-3 text-[var(--accent)]" />
              <span>CV</span>
            </a>

            <button
              type="button"
              onClick={toggleNav}
              className="inline-flex h-9 w-9 items-center justify-center text-[var(--ink)] hover:text-[var(--accent)] transition-colors md:hidden"
              aria-label="Toggle Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

        </div>
      </header>

      {/* NAVIGATION MOBILE OVERLAY PLEIN ÉCRAN */}
      {navOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-white text-zinc-950 md:hidden flex flex-col justify-between p-6 overflow-y-auto"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
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

            <nav className="flex flex-col space-y-4 font-mono text-base font-semibold uppercase tracking-wider py-6">
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
        </div>
      )}

      {/* HERO SECTION STYLE EDITORIAL / SOFIA MILLER */}
      <section className="relative py-12 md:py-20 border-b border-[var(--line)] bg-[var(--bg)]">
        <div className="container mx-auto px-6 sm:px-10 max-w-7xl">
          
          <div className="mb-10 text-center md:text-left">
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[9.5rem] font-light tracking-[-0.03em] leading-none uppercase text-[var(--ink)] select-none">
              LAMINE NDIAYE
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* CARTE PORTRAIT */}
            <div className="lg:col-span-5 relative group overflow-hidden rounded-3xl min-h-[360px] md:min-h-[440px] border border-[var(--line)] flex flex-col justify-between p-6 sm:p-8 bg-zinc-900">
              <img 
                src="https://res.cloudinary.com/dcs9vkwe0/image/upload/v1786026382/vgmefgmct86zjvcy0yrm.jpg" 
                alt="Lamine Ndiaye Portrait" 
                className="absolute inset-0 w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

              <div className="relative z-10">
                <span className="font-mono text-xs uppercase tracking-widest text-white/90 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  A PROPOS
                </span>
              </div>

              <div className="relative z-10">
                <h3 className="font-display text-xl sm:text-2xl font-normal text-white uppercase tracking-tight">
                  Full-Stack &amp; Creative Dev
                </h3>
                <p className="font-mono text-xs text-white/70 mt-1">
                  Basé à Dakar, Sénégal •Génie logiciel
                </p>
              </div>
            </div>

            {/* CARTE SLIDER VITRINE */}
            <div className="lg:col-span-7 relative rounded-3xl bg-[var(--surface)] border border-[var(--line)] p-6 sm:p-10 flex flex-col justify-between min-h-[360px] md:min-h-[440px] text-[var(--ink)]">
              
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1 rounded-full border border-[var(--accent)]/20">
                  {activeHeroSlide === 0 ? 'EXPERTISE & CREATIVE DEV' : activeHeroSlide === 1 ? 'APPLICATION MOBILE' : 'E-COMMERCE HIGH SPEED'}
                </span>

                <a 
                  href="#work" 
                  className="inline-flex items-center gap-1 font-mono text-xs uppercase text-[var(--mute)] hover:text-[var(--ink)] transition-colors"
                >
                  <span>Projets</span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>

              <div className="my-8">
                {activeHeroSlide === 0 && (
                  <div className="animate-fadeIn">
                    <h2 className="font-display text-2xl sm:text-4xl font-light leading-tight uppercase">
                      Conception d&apos;expériences web immersives &amp; WebGL
                    </h2>
                    <p className="mt-4 font-mono text-xs text-[var(--mute)] max-w-xl leading-relaxed">
                      Allier la vitesse des frameworks modernes (Next.js, React) au design haute précision pour des produits digitaux marquants.
                    </p>
                  </div>
                )}

                {activeHeroSlide === 1 && (
                  <div className="animate-fadeIn">
                    <h2 className="font-display text-2xl sm:text-4xl font-light leading-tight uppercase">
                      Mbaymi — Agritech Mobile Platform
                    </h2>
                    <p className="mt-4 font-mono text-xs text-[var(--mute)] max-w-xl leading-relaxed">
                      Suivi en temps réel des cultures et cheptels via Flutter, Dart et Firebase avec mode hors-ligne.
                    </p>
                  </div>
                )}

                {activeHeroSlide === 2 && (
                  <div className="animate-fadeIn">
                    <h2 className="font-display text-2xl sm:text-4xl font-light leading-tight uppercase">
                      Bitik Platform — Marketplace Distribuer
                    </h2>
                    <p className="mt-4 font-mono text-xs text-[var(--mute)] max-w-xl leading-relaxed">
                      Architecture e-commerce haute vitesse avec catalogue synchrone et interfaces ultra-réactives.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-[var(--line)]">
                {[0, 1, 2].map((slideIndex) => (
                  <button
                    key={slideIndex}
                    onClick={() => setActiveHeroSlide(slideIndex)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      activeHeroSlide === slideIndex 
                        ? 'w-8 bg-[var(--accent)]' 
                        : 'w-2.5 bg-[var(--line)] hover:bg-[var(--mute)]'
                    }`}
                    aria-label={`Slide ${slideIndex + 1}`}
                  />
                ))}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* TECH STACK 3D SHOWCASE */}
      <section className="py-16 md:py-20 border-b border-[var(--line)] bg-[var(--surface)]/20">
        <div className="container mx-auto px-6 sm:px-10 max-w-7xl">
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

          <div className="h-[260px] md:h-[320px] w-full overflow-hidden rounded-2xl border border-[var(--line)] bg-[#030712]">
            <ThreeExperience techs={STACK} />
          </div>
        </div>
      </section>

      {/* PROJETS SÉLECTIONNÉS */}
      <section id="work" className="py-16 md:py-24 border-b border-[var(--line)]">
        <div className="container mx-auto px-6 sm:px-10 max-w-7xl">
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

      {/* SECTION A PROPOS : FORMATIONS, CERTIFICATIONS & LANGUES */}
      <section id="about" className="py-16 md:py-24 border-b border-[var(--line)]">
        <div className="container mx-auto px-6 sm:px-10 max-w-7xl">
          <div className="mb-12">
            <span className="font-mono text-xs text-[var(--accent)] uppercase tracking-widest">// PARCOURS</span>
            <h2 className="font-display text-3xl font-semibold uppercase text-[var(--ink)] mt-1">
              À Propos &amp; Qualifications
            </h2>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {/* FORMATION */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[var(--line)] pb-3">
                <GraduationCap className="h-5 w-5 text-[var(--accent)]" />
                <h3 className="font-display text-lg font-semibold uppercase text-[var(--ink)]">Formation</h3>
              </div>
              <div className="space-y-6">
                {EDUCATION.map((item, idx) => (
                  <div key={idx} className="relative pl-4 border-l border-[var(--line)] hover:border-[var(--accent)] transition-colors">
                    <span className="font-mono text-[0.65rem] text-[var(--accent)] uppercase">{item.period}</span>
                    <h4 className="font-display text-sm font-medium text-[var(--ink)] mt-1">{item.title}</h4>
                    <p className="font-mono text-xs text-[var(--mute)] mt-0.5">{item.institution}</p>
                    {item.details && (
                      <p className="font-mono text-[0.7rem] text-[var(--mute)]/80 italic mt-1">{item.details}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CERTIFICATIONS */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[var(--line)] pb-3">
                <Award className="h-5 w-5 text-[var(--accent)]" />
                <h3 className="font-display text-lg font-semibold uppercase text-[var(--ink)]">Certifications</h3>
              </div>
              <div className="space-y-4">
                {CERTIFICATIONS.map((cert, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--accent)]/50 transition-all">
                    <div className="flex justify-between items-start">
                      <h4 className="font-display text-sm font-medium text-[var(--ink)]">{cert.title}</h4>
                      <span className="font-mono text-[0.65rem] text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded">{cert.year}</span>
                    </div>
                    <p className="font-mono text-xs text-[var(--mute)] mt-1">{cert.issuer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* LANGUES */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[var(--line)] pb-3">
                <Languages className="h-5 w-5 text-[var(--accent)]" />
                <h3 className="font-display text-lg font-semibold uppercase text-[var(--ink)]">Langues</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                  <div className="flex justify-between items-center">
                    <span className="font-display text-sm font-medium text-[var(--ink)]">Français</span>
                    <span className="font-mono text-xs text-[var(--accent)] font-semibold">Courant</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                  <div className="flex justify-between items-center">
                    <span className="font-display text-sm font-medium text-[var(--ink)]">Anglais</span>
                    <span className="font-mono text-xs text-[var(--accent)] font-semibold">Courant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-16 md:py-24 border-b border-[var(--line)] bg-[var(--surface)]/30">
        <div className="container mx-auto px-6 sm:px-10 max-w-7xl">
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
      <section className="py-12 md:py-16 border-b border-[var(--line)]">
        <div className="container mx-auto px-6 sm:px-10 max-w-7xl">
          <NeuralExhibit />
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-16 md:py-24">
        <div className="container mx-auto px-6 sm:px-10 max-w-4xl">
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

      {/* ARCADE 3D */}
      <section className="py-16 md:py-24 border-t border-[var(--line)] bg-[var(--surface)]/10">
        <div className="container mx-auto px-6 sm:px-10 max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <span className="font-mono text-xs text-[var(--accent)] uppercase tracking-widest">// DIVERTISSEMENT</span>
            <h2 className="font-display text-3xl font-semibold uppercase text-[var(--ink)] mt-3">
              Mini-jeu Arcade
            </h2>
            <p className="mt-4 font-mono text-sm leading-7 text-[var(--mute)]">
              Un petit jeu WebGL interactif pour finir la page sur une note ludique.
            </p>
          </div>

          <div className="rounded-[2rem] overflow-hidden border border-[var(--line)] bg-[#020617]">
            <HeroBackground3D />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--line)] py-6 font-mono text-[0.65rem] text-[var(--mute)]">
        <div className="container mx-auto px-6 sm:px-10 max-w-7xl flex justify-between items-center">
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