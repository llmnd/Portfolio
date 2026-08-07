'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Database, Download, Github, Layers,
  Linkedin, Mail, Menu, Monitor, Network, Rocket, ServerCog, Smartphone,
  Sparkles, Terminal, Target, Wrench, X, Shield, Activity, Cpu, Code2,
  GitBranch, Globe, Clock, Award, Brain, Binary, Boxes,
  Signal, Cpu as CpuIcon, Cloud, Users,
  CheckCircle, Star, TrendingUp, Coffee, Heart, Zap as ZapIcon,
  LucideIcon
} from 'lucide-react';
import NeuralExhibit from './NeuralExhibit';
import HeroExhibit from './HeroExhibit';
import ThreeExperience from './ThreeExperience';

// ============================================
// TYPES & INTERFACES
// ============================================

type IconComponent = LucideIcon;

interface Skill {
  category: string;
  items: string[];
  icon: IconComponent;
  level: number;
}

interface Project {
  index: string;
  title: string;
  description: string;
  tech: string[];
  demo: string;
  icon: IconComponent;
  gradient: string;
}

interface Service {
  title: string;
  description: string;
  icon: IconComponent;
  gradient: string;
  features?: string[];
}

interface Stat {
  value: string;
  label: string;
  icon: IconComponent;
}

interface TimelineItem {
  year: string;
  title: string;
  details: string;
  icon: IconComponent;
  tech: string[];
}

interface Certification {
  title: string;
  year: string;
  code: string;
  level: string;
}

// ============================================
// DATA CONFIGURATION
// ============================================

const STATS: Stat[] = [
  { value: '03+', label: "Années d'expérience", icon: Clock },
  { value: '07', label: 'Projets déployés', icon: Rocket },
  { value: '10+', label: 'Techs maîtrisées', icon: Code2 },
  { value: '24/7', label: 'Disponibilité', icon: Signal },
];

const STACK = ['React', 'Next.js', 'Django', 'PostgreSQL', 'Docker', 'Tailwind CSS', 'Flutter', 'Git', 'Linux'];

const SKILLS: Skill[] = [
  { 
    category: 'Frontend', 
    items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Flutter'],
    icon: Monitor,
    level: 90
  },
  { 
    category: 'Backend', 
    items: ['Python', 'Django', 'Java', 'Spring Boot', 'Spring Security', 'API REST'],
    icon: ServerCog,
    level: 85
  },
  { 
    category: 'Données', 
    items: ['PostgreSQL', 'MySQL', 'Prisma'],
    icon: Database,
    level: 80
  },
  { 
    category: 'Outils & Infra', 
    items: ['Git', 'Docker', 'Linux', 'Vercel', 'CI/CD'],
    icon: Boxes,
    level: 75
  },
];

const PROJECTS: Project[] = [
  {
    index: 'SYS.01',
    title: 'Mbaymi',
    description: "Plateforme mobile d'agriculture & élevage. Suivi temps réel des cultures et cheptels.",
    tech: ['Flutter', 'Dart', 'Firebase'],
    demo: 'https://mbaymi.vercel.app',
    icon: Smartphone,
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    index: 'SYS.02',
    title: 'Bitik Platform',
    description: "Marketplace d'achat/vente haute performance à architecture distribuée et catalogue dynamique en temps réel.",
    tech: ['Next.js', 'Tailwind CSS', 'REST API', 'Redis'],
    demo: 'https://bitik.vercel.app',
    icon: Layers,
    gradient: 'from-blue-400 to-indigo-500',
  },
  {
    index: 'SYS.03',
    title: 'Fisafi Groupe',
    description: "Interface vitrine d'entreprise épurée, responsive et optimisée pour l'indexation SEO avec scores Lighthouse >95.",
    tech: ['Next.js', 'SEO', 'Tailwind', 'Analytics'],
    demo: 'https://fisafigroupe.com',
    icon: Globe,
    gradient: 'from-amber-400 to-orange-500',
  },
];

const SERVICES: Service[] = [
  { 
    title: 'Sites Vitrines Premium', 
    description: 'Design minimaliste, vitesse de chargement maximale et ergonomie haut de gamme avec scores Lighthouse 95+.',
    icon: Layers,
    gradient: 'from-violet-400 to-purple-500',
    features: ['Responsive', 'SEO Optimisé', 'Performance 95+']
  },
  { 
    title: 'Applications Mobiles', 
    description: 'Solutions multiplateformes avec Flutter pensées pour une exécution native sans friction et UX optimale.',
    icon: Smartphone,
    gradient: 'from-blue-400 to-cyan-500',
    features: ['Cross-platform', 'UI Natif', 'Offline support']
  },
  { 
    title: 'Plateformes E-Commerce', 
    description: "Architecture modulaire, tunnels d'achat sécurisés et tableaux de bord d'administration intuitifs.",
    icon: ServerCog,
    gradient: 'from-emerald-400 to-teal-500',
    features: ['Paiement sécurisé', 'Admin panel', 'Analytics']
  },
  { 
    title: 'Architecture & API Backend', 
    description: 'Services web robustes, bases de données structurées et APIs scalables avec documentation OpenAPI.',
    icon: Wrench,
    gradient: 'from-rose-400 to-pink-500',
    features: ['RESTful API', 'Documentation', 'Scalable']
  },
];

const CERTIFICATIONS: Certification[] = [
  { title: 'Cisco Networking Academy – Networking Basics', year: '2023', code: 'NET-101', level: 'Advanced' },
  { title: 'Introduction to Cybersecurity', year: '2025', code: 'CYB-201', level: 'Intermediate' },
  { title: 'English for IT 2', year: '2025', code: 'ENG-302', level: 'Professional' },
];

const TIMELINE: TimelineItem[] = [
  { 
    year: '2025', 
    title: 'Mbaymi', 
    details: "Création d'une suite mobile complète pour l'agritech avec Flutter et architecture temps réel.",
    icon: Smartphone,
    tech: ['Flutter', 'Firebase']
  },
  { 
    year: '2025', 
    title: 'Bitik Platform', 
    details: 'Ingénierie e-commerce avec expérience fluide et gestion dynamique des stocks en temps réel.',
    icon: Layers,
    tech: ['Next.js', 'Redis', 'REST API']
  },
  { 
    year: '2026', 
    title: 'Fisafi Groupe', 
    details: "Développement d'une présence web institutionnelle épurée et réactive avec SEO avancé.",
    icon: Globe,
    tech: ['Next.js', 'SEO', 'Analytics']
  },
];

// ============================================
// CUSTOM HOOKS
// ============================================

const useIntersectionObserver = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// Hook pour contrôler le scroll
const useScrollLock = (active: boolean) => {
  useEffect(() => {
    if (active) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
    return undefined;
  }, [active]);
};

// ============================================
// COMPONENTS
// ============================================

// ===== TECH STACK COMPONENT =====
const TechStackItem = ({ tech, index }: { tech: string; index: number }) => {
  const getTechColor = (name: string) => {
    const colors: Record<string, string> = {
      'React': 'from-cyan-400 to-blue-500',
      'Next.js': 'from-gray-700 to-gray-900',
      'Django': 'from-emerald-600 to-green-700',
      'PostgreSQL': 'from-blue-600 to-indigo-700',
      'Docker': 'from-sky-500 to-blue-600',
      'Tailwind CSS': 'from-teal-400 to-cyan-500',
      'Flutter': 'from-sky-400 to-blue-500',
      'Git': 'from-orange-500 to-red-600',
      'Linux': 'from-yellow-500 to-amber-600',
      'Vercel': 'from-gray-800 to-black',
    };
    return colors[name] || 'from-purple-500 to-pink-500';
  };

  const getTechIcon = (name: string) => {
    const icons: Record<string, React.ReactNode> = {
      'React': <span className="text-cyan-400">⚛️</span>,
      'Next.js': <span className="text-white font-bold text-xs">▲</span>,
      'Django': <span className="text-emerald-400">🐍</span>,
      'PostgreSQL': <span className="text-blue-400">🐘</span>,
      'Docker': <span className="text-sky-400">🐳</span>,
      'Tailwind CSS': <span className="text-teal-400">🎨</span>,
      'Flutter': <span className="text-sky-400">📱</span>,
      'Git': <span className="text-orange-400">🔀</span>,
      'Linux': <span className="text-yellow-400">🐧</span>,
      'Vercel': <span className="text-white">⚡</span>,
    };
    return icons[name] || <CpuIcon className="h-3 w-3 text-[var(--accent)]" />;
  };

  const getTechVersion = (name: string) => {
    const versions: Record<string, string> = {
      'React': 'v18.0.0',
      'Next.js': 'v14.2.3',
      'Django': 'v4.2.1',
      'PostgreSQL': 'v15.1.2',
      'Docker': 'v24.0.2',
      'Tailwind CSS': 'v3.4.0',
      'Flutter': 'v3.13.0',
      'Git': 'v2.45.0',
      'Linux': 'v6.5.0',
      'Vercel': 'v26.0.0',
    };
    return versions[name] || 'v1.0.0';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ 
        y: -4,
        scale: 1.02,
        transition: { type: "spring", stiffness: 300 }
      }}
      className="group relative"
    >
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${getTechColor(tech)} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
      <div className="relative bg-[var(--surface)] border border-[var(--line)] rounded-xl px-4 py-3 flex items-center gap-3 hover:border-transparent transition-all duration-300">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${getTechColor(tech)} p-1.5`}>
          <div className="flex h-full w-full items-center justify-center rounded-md bg-[var(--surface)]/90 text-xs font-bold">
            {getTechIcon(tech)}
          </div>
        </div>
        <span className="font-mono text-sm font-medium text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
          {tech}
        </span>
        <span className="ml-auto text-[0.55rem] font-mono text-[var(--mute)] opacity-0 group-hover:opacity-100 transition-opacity">
          {getTechVersion(tech)}
        </span>
      </div>
    </motion.div>
  );
};

const TechStackSection = () => {
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [showTechCards, setShowTechCards] = useState(false);
  
  const techDetails: Record<string, { description: string; level: string; usage: string }> = {
    'React': {
      description: 'Library JavaScript pour interfaces utilisateur',
      level: 'Avancé',
      usage: 'Frontend & Mobile'
    },
    'Next.js': {
      description: 'Framework React avec SSR et SSG',
      level: 'Avancé',
      usage: 'Frontend Full-Stack'
    },
    'Django': {
      description: 'Framework Python haute performance',
      level: 'Intermédiaire',
      usage: 'Backend & APIs'
    },
    'PostgreSQL': {
      description: 'Base de données relationnelle avancée',
      level: 'Intermédiaire',
      usage: 'Base de données'
    },
    'Docker': {
      description: 'Conteneurisation et déploiement',
      level: 'Intermédiaire',
      usage: 'DevOps & Déploiement'
    },
    'Tailwind CSS': {
      description: 'Framework CSS utilitaire',
      level: 'Avancé',
      usage: 'UI & Design'
    },
    'Flutter': {
      description: 'Framework multiplateforme mobile',
      level: 'Débutant',
      usage: 'Mobile Development'
    },
    'Git': {
      description: 'Version control system distribué',
      level: 'Avancé',
      usage: 'Collaboration & Versioning'
    },
    'Linux': {
      description: "Système d'exploitation open-source",
      level: 'Intermédiaire',
      usage: 'Système & Serveurs'
    },
    'Vercel': {
      description: 'Plateforme de déploiement cloud',
      level: 'Avancé',
      usage: 'Déploiement & Hosting'
    },
  };

  const handleTechClick = (tech: string) => {
    setSelectedTech(selectedTech === tech ? null : tech);
  };

  return (
    <motion.div 
      className="group mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 p-2">
            <Binary className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div>
            <span className="font-display text-sm font-bold tracking-wider text-[var(--ink)] uppercase">
              TECH_STACK
            </span>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[0.6rem] text-[var(--mute)]">
                {STACK.length} technologies • Système opérationnel
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {['Tous', 'Frontend', 'Backend', 'DevOps'].map((filter) => (
            <button
              key={filter}
              className="rounded-full border border-[var(--line)] px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-wider text-[var(--mute)] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-lg shadow-black/5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-[var(--ink)]">
                Visualisation 3D du Stack
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTechCards((prev) => !prev)}
                className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mute)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10"
              >
                {showTechCards ? 'Masquer la stack' : 'Afficher la stack'}
              </button>
              <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mute)]">
                3D beauty
              </span>
            </div>
          </div>

          <div className="h-[360px] overflow-hidden rounded-3xl border border-[var(--line)] bg-[#020617]">
            <ThreeExperience techs={STACK} />
          </div>
        </div>

        {showTechCards && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {STACK.map((tech, index) => (
              <div key={tech} onClick={() => handleTechClick(tech)}>
                <TechStackItem tech={tech} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTech && techDetails[selectedTech] && (
        <motion.div
          className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--surface)]/50 p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-display text-sm font-semibold text-[var(--ink)]">
                {selectedTech}
              </h4>
              <p className="mt-1 font-mono text-xs text-[var(--mute)]">
                {techDetails[selectedTech].description}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 font-mono text-[0.6rem] text-[var(--accent)]">
                  <Award className="h-3 w-3" />
                  Niveau: {techDetails[selectedTech].level}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface)] px-2 py-0.5 font-mono text-[0.6rem] text-[var(--mute)]">
                  <Target className="h-3 w-3" />
                  Usage: {techDetails[selectedTech].usage}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedTech(null)}
              className="text-[var(--mute)] hover:text-[var(--accent)] transition-colors"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// ===== STATS =====
const StatsDisplay = () => {
  const [showStats, setShowStats] = useState(false);

  return (
    <div className="mt-14">
      <button
        type="button"
        onClick={() => setShowStats((prev) => !prev)}
        className="mb-4 inline-flex items-center rounded-full border border-[var(--line)] bg-[var(--surface)]/80 px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[var(--mute)] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        {showStats ? 'Masquer les stats' : 'Afficher les stats'}
      </button>

      <AnimatePresence initial={false}>
        {showStats ? (
          <motion.div
            initial={{ opacity: 0, height: 0, y: 12 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: 12 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {STATS.map((stat) => (
                <motion.div
                  key={stat.label}
                  className="group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 text-center transition-all hover:border-[var(--accent)]"
                  whileHover={{ y: -4 }}
                >
                  <div className="relative z-10">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] transition-transform group-hover:scale-110">
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <p className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">
                      {stat.value}
                    </p>
                    <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-[var(--mute)]">
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

// ===== PROJECT CARD =====
const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  const Icon = project.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${project.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
      <a
        href={project.demo}
        target="_blank"
        rel="noreferrer"
        className="card group flex flex-col justify-between p-6 relative overflow-hidden"
      >
        <div>
          <div className="flex items-center justify-between font-mono text-xs text-[var(--mute)]">
            <span className="text-[var(--accent)] font-bold">{project.index}</span>
            <ArrowUpRight className="h-4 w-4 text-[var(--accent)] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </div>
          
          <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
            <Icon className="h-6 w-6" strokeWidth={1.5} />
          </div>
          
          <h3 className="font-display mt-4 text-xl font-medium tracking-tight text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
            {project.title}
          </h3>
          <p className="mt-2 font-mono text-xs leading-6 text-[var(--mute)]">{project.description}</p>
        </div>
        
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        </div>
      </a>
    </motion.div>
  );
};

// ===== SERVICE CARD =====
const ServiceCard = ({ service, index }: { service: Service; index: number }) => {
  const Icon = service.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      viewport={{ once: true }}
      className="card p-6 group relative overflow-hidden"
    >
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      <div className="relative z-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--accent)]/10 group-hover:scale-110 transition-transform">
          <Icon className="h-7 w-7 text-[var(--accent)]" strokeWidth={1.5} />
        </div>
        <h3 className="font-display mt-5 text-lg font-medium text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
          {service.title}
        </h3>
        <p className="mt-2 font-mono text-xs leading-6 text-[var(--mute)]">{service.description}</p>
        
        {service.features && (
          <div className="mt-4 flex flex-wrap gap-2">
            {service.features.map((feature) => (
              <span key={feature} className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/5 px-2 py-0.5 font-mono text-[0.55rem] text-[var(--accent)]">
                <CheckCircle className="h-3 w-3" />
                {feature}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-4 flex items-center gap-2 text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs font-mono">En savoir plus</span>
          <ArrowRight className="h-3 w-3" />
        </div>
      </div>
    </motion.div>
  );
};

// ===== SKILL BAR =====
const SkillBar = ({ skill, delay }: { skill: Skill; delay: number }) => {
  const { ref, isVisible } = useIntersectionObserver();
  const Icon = skill.icon;
  
  return (
    <div ref={ref} className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[var(--accent)]" />
          <span className="font-mono text-xs text-[var(--ink)]">{skill.category}</span>
        </div>
        <span className="font-mono text-xs text-[var(--accent)]">{skill.level}%</span>
      </div>
      <div className="h-2 bg-[var(--line)] relative overflow-hidden rounded-full">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/60 rounded-full"
          initial={{ width: 0 }}
          animate={isVisible ? { width: `${skill.level}%` } : { width: 0 }}
          transition={{ duration: 1.2, delay: delay * 0.1, ease: "easeOut" }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={isVisible ? { x: '200%' } : { x: '-100%' }}
          transition={{ duration: 1.5, delay: delay * 0.1 + 0.5 }}
        />
      </div>
    </div>
  );
};

// ===== TIMELINE =====
const TimelineItemComponent = ({ item, index }: { item: TimelineItem; index: number }) => {
  const Icon = item.icon;
  
  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <div className="absolute -left-[31px] top-1.5">
        <div className="h-4 w-4 rounded-full bg-[var(--accent)]">
          <div className="absolute inset-0 rounded-full bg-[var(--accent)] animate-ping opacity-75" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm font-bold text-[var(--accent)]">{item.year}</span>
        <span className="text-xs text-[var(--mute)]">//</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]/10">
          <Icon className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="font-display text-lg font-medium text-[var(--ink)] mt-2">{item.title}</h3>
      <p className="mt-1 font-mono text-xs leading-6 text-[var(--mute)]">{item.details}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {item.tech.map((t) => (
          <span key={t} className="tag text-[0.55rem]">{t}</span>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function Home() {
  const [showHeroDetails, setShowHeroDetails] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.98]);
  const isMobile = useMobileDetection();
  
  // 🔥 Hook pour bloquer le scroll quand le menu est ouvert
  useScrollLock(navOpen);
  
  const handleHeroToggle = useCallback(() => {
    setShowHeroDetails(prev => !prev);
  }, []);

  const toggleNav = useCallback(() => {
    setNavOpen((prev) => !prev);
  }, []);

  // Effet pour gérer le scroll sur mobile
  useEffect(() => {
    // Empêcher le scroll horizontal
    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.scrollable-container')) {
        return;
      }
      // Si on est en mobile et que le menu est ouvert, on bloque tout scroll
      if (navOpen && isMobile) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [navOpen, isMobile]);

  // Memoized sections for performance
  const heroContent = useMemo(() => (
    <div className="relative overflow-hidden pb-20 pt-10">
      <div className="container relative z-10">
        <div className="grid gap-12 md:gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex flex-wrap items-center gap-2 border border-[var(--line)] bg-[var(--surface)]/80 px-4 py-2 font-mono text-xs text-[var(--accent)] mb-8 rounded-full">
              <Activity className="h-3.5 w-3.5 animate-pulse" />
              <span>SYSTEM ONLINE — DAKAR, SN</span>
              <span className="h-1 w-1 bg-[var(--accent)] rounded-full" />
            </div>

            <h1 className="font-display text-4xl font-semibold leading-[1.08] text-[var(--ink)] sm:text-6xl uppercase tracking-tight">
              Développeur <br />
              <span className="text-[var(--accent)] relative inline-block">
                Full-Stack &amp; Systems
                <motion.div 
                  className="absolute -inset-4 -z-10 bg-[var(--accent)] opacity-5 blur-2xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </span>
            </h1>

            <div className="mt-6 max-w-lg font-mono text-sm leading-7 text-[var(--mute)]">
              <button
                type="button"
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-medium transition hover:border-[var(--accent)] hover:text-[var(--accent)] md:hidden"
                onClick={handleHeroToggle}
                aria-expanded={showHeroDetails}
              >
                {showHeroDetails ? 'Masquer les détails' : 'Afficher les détails'}
                <Terminal className="h-3 w-3" />
              </button>

              <AnimatePresence mode="wait">
                {(showHeroDetails || !isMobile) && (
                  <motion.p
                    key="hero-details"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[var(--surface)]/50 p-4 rounded-xl border border-[var(--line)]"
                  >
                    <span className="text-[var(--accent)]">$</span> Ingénierie logicielle axée sur la performance, l&apos;élégance architecturale et la robustesse. 
                    Déploiement d&apos;interfaces modernes et d&apos;infrastructures backend scalables.
                    <span className="block mt-2 text-[var(--accent)]">_ build systems, not just code.</span>
                    <span className="block mt-1 text-[0.6rem] text-[var(--mute)]">// Spécialisé en architecture cloud et applications haute performance</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <motion.a 
                href="#work" 
                className="btn-solid group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Explorer les travaux 
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </motion.a>
              <a href="/cv.pdf" className="btn group">
                <Download className="h-4 w-4 text-[var(--accent)] group-hover:-translate-y-1 transition-transform" /> 
                Télécharger CV
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative mx-auto w-full max-w-sm"
          >
            <div className="frame p-3 bg-[var(--surface)] relative">
              <div className="relative overflow-hidden border border-[var(--line)] rounded-lg">
                <img
                  src="https://res.cloudinary.com/dcs9vkwe0/image/upload/v1786026387/f3codb9okszfnxskuzvl.jpg"
                  alt="Portrait Lamine Ndiaye"
                  className="h-80 w-full object-cover transition-all duration-700 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
              <div className="mt-3 flex flex-col gap-1 font-mono text-[0.68rem] text-[var(--mute)] sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" />
                  DEV_ID // llmnd
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-[var(--accent)]" />
                  <span>Open to work</span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        <StatsDisplay />
        <TechStackSection />
      </div>
    </div>
  ), [showHeroDetails, isMobile, handleHeroToggle]);

  const projectsContent = useMemo(() => (
    <section id="work" className="border-t border-[var(--line)] bg-[var(--surface)]/30 py-24">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[var(--line)] pb-8 mb-12">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <Rocket className="h-3 w-3" /> PROJETS SÉLECTIONNÉS
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold uppercase tracking-tight text-[var(--ink)] sm:text-4xl">
              Réalisations Techniques
            </h2>
            <p className="mt-2 font-mono text-xs text-[var(--mute)]">
              Des solutions conçues avec soin, de la conception au déploiement
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 rounded-full font-mono text-xs text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>DISPONIBLE POUR CONTRAT</span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  ), []);

  const servicesContent = useMemo(() => (
    <section id="services" className="border-t border-[var(--line)] bg-[var(--surface)]/50 py-24">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="eyebrow flex items-center justify-center gap-2">
            <Target className="h-3 w-3" /> SERVICES OFFERTS
          </p>
          <h2 className="font-display mt-2 text-3xl font-semibold uppercase tracking-tight text-[var(--ink)]">
            Spécifications de service
          </h2>
          <p className="mt-2 font-mono text-xs text-[var(--mute)]">
            Des solutions sur mesure pour vos besoins techniques
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, index) => (
            <ServiceCard key={service.title} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  ), []);

  return (
    <main className="bg-[var(--bg)] text-[var(--ink)] min-h-screen font-sans selection:bg-[var(--accent)] selection:text-black overflow-x-hidden">
      {/* HEADER TECH */}
      <div className="border-b border-[var(--line)] bg-[var(--surface)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container">
          <header className="flex h-20 items-center justify-between">
            <a href="#" className="flex items-center gap-3 font-mono text-sm tracking-tight font-medium text-[var(--ink)] group">
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                  <Terminal className="h-5 w-5 text-[var(--accent)] transition-transform group-hover:rotate-12" />
                </div>
                <div className="absolute -inset-1 bg-[var(--accent)] opacity-0 group-hover:opacity-20 blur-md transition-opacity" />
              </div>
              <div>
                <span>LAMINE</span>
                <span className="text-[var(--accent)]">.SYS</span>
                <span className="block text-[0.5rem] text-[var(--mute)] uppercase tracking-wider">v2.0.1</span>
              </div>
            </a>
            
            <nav className="hidden items-center gap-8 md:flex">
              {['About', 'Work', 'Services', 'Contact'].map((item, i) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  className="hover-line font-mono text-xs uppercase tracking-widest text-[var(--mute)] group flex items-center gap-1"
                >
                  <span className="text-[var(--accent)] text-[0.6rem]">0{i+1}.</span>
                  {item}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Ouvrir le menu"
                aria-expanded={navOpen}
                onClick={toggleNav}
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] transition hover:border-[var(--accent)] md:hidden"
              >
                {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div className="hidden md:flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 rounded-full font-mono text-xs text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>OPERATIONAL</span>
              </div>
            </div>
          </header>
        </div>
      </div>

      <AnimatePresence>
        {navOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setNavOpen(false);
              }
            }}
          >
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setNavOpen(false)}
              aria-hidden="true"
            />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              className="absolute right-0 top-0 h-full w-full max-w-[26rem] bg-[var(--surface)] border-l border-[var(--line)] p-6 shadow-[0_0_60px_rgba(0,0,0,0.18)] backdrop-blur-xl overflow-y-auto scrollable-container"
              style={{ maxHeight: '100vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-8 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.32em] text-[var(--accent)]">Menu</p>
                  <h2 className="font-display text-lg font-semibold text-[var(--ink)]">Navigation</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setNavOpen(false)}
                  aria-label="Fermer le menu"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] transition hover:border-[var(--accent)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6 h-1 w-20 rounded-full bg-[var(--accent)]/20" />

              <div className="space-y-3">
                {[
                  { label: 'Accueil', href: '#about' },
                  { label: 'Work', href: '#work' },
                  { label: 'Services', href: '#services' },
                  { label: 'Contact', href: '#contact' },
                  { label: 'Projet', href: '#contact' },
                ].map((item, i) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setNavOpen(false)}
                    className={`flex items-center justify-between rounded-[1.5rem] border px-5 py-4 text-sm font-medium uppercase tracking-[0.2em] transition ${
                      i === 0
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                        : 'border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[var(--accent)] text-[0.65rem]">›</span>
                  </a>
                ))}
              </div>

              <div className="mt-8 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm">
                <div className="mt-5 flex items-center justify-center gap-3 text-[var(--mute)]">
                  <a href="https://github.com/llmnd" target="_blank" rel="noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--bg)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
                    <Github className="h-4 w-4" />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--bg)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a href="mailto:papendiaye511@gmail.com" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--bg)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="bg-[var(--surface)]/95 py-6 overflow-hidden">
        <div className="container overflow-hidden">
          <div className="relative overflow-hidden bg-black/95 rounded-xl">
            <video
              src="https://res.cloudinary.com/dcs9vkwe0/video/upload/v1775477690/vzcc5hhwqnlvhi8exxn4.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="aspect-video w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* HERO SECTION */}
      {heroContent}

      {/* VISUAL & WORKSPACE */}
      <section className="border-t border-[var(--line)] bg-[var(--surface)]/50 py-24 overflow-hidden">
        <div className="container overflow-hidden">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="eyebrow flex items-center gap-2">
                <Monitor className="h-3 w-3" /> WORKSPACE &amp; ENV
              </p>
              <h2 className="font-display mt-3 text-3xl font-semibold uppercase tracking-tight text-[var(--ink)] sm:text-4xl">
                Centre d&apos;opérations.
              </h2>
              <p className="mt-4 font-mono text-xs leading-6 text-[var(--mute)]">
                Aperçu de l&apos;environnement technique de création et de développement quotidien.
                <span className="block mt-2 text-[var(--accent)]">// Architecture &amp; Design Studio</span>
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['React', 'Next.js', 'Docker'].map((tech) => (
                    <div key={tech} className="h-8 w-8 rounded-full bg-[var(--surface)] border-2 border-[var(--bg)] flex items-center justify-center text-xs">
                      {tech[0]}
                    </div>
                  ))}
                </div>
                <span className="font-mono text-[0.6rem] text-[var(--mute)]">+7 technologies actives</span>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <motion.div 
                className="frame p-2 bg-[var(--surface)] rounded-xl overflow-hidden"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="https://i.pinimg.com/736x/7d/16/9b/7d169bf456e84b6ac1edc9af7e5d61ef.jpg"
                  alt="Portrait"
                  className="h-64 w-full object-cover transition-all duration-500 hover:scale-105"
                  loading="lazy"
                />
                <div className="p-3 font-mono text-xs">
                  <p className="text-[var(--ink)] font-bold">PORTRAIT.RAW</p>
                  <p className="text-[var(--mute)] text-[0.65rem]">Ambiance de travail - Dakar</p>
                </div>
              </motion.div>
              <motion.div 
                className="frame p-2 bg-[var(--surface)] rounded-xl overflow-hidden"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <img
                  src="https://res.cloudinary.com/dcs9vkwe0/image/upload/v1786026382/vgmefgmct86zjvcy0yrm.jpg"
                  alt="Workspace"
                  className="h-64 w-full object-cover transition-all duration-500 hover:scale-105"
                  loading="lazy"
                />
                <div className="p-3 font-mono text-xs">
                  <p className="text-[var(--ink)] font-bold">HARDWARE.LOG</p>
                  <p className="text-[var(--mute)] text-[0.65rem]">Poste de commande principal</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* WORK / PROJECTS */}
      {projectsContent}

      {/* NEURAL EXHIBIT */}
      <section className="border-t border-[var(--line)] bg-[var(--surface)] py-12 overflow-hidden">
        <div className="container overflow-hidden">
        </div>
      </section>

      <section className="border-t border-[var(--line)] bg-[var(--surface)] py-12 overflow-hidden">
        <div className="container overflow-hidden">
          <NeuralExhibit />
        </div>
      </section>

      {/* ABOUT & SKILLS */}
      {/* ABOUT & SKILLS */}
<section id="about" className="border-t border-[var(--line]) py-24 bg-gradient-to-b from-[var(--bg]) to-[var(--surface)]/30 overflow-hidden">
  <div className="container overflow-hidden">
    <div className="grid gap-16 lg:grid-cols-2">
      {/* TIMELINE */}
      <div className="min-w-0">
        <p className="eyebrow flex items-center gap-2">
          <GitBranch className="h-3 w-3 flex-shrink-0" /> PARCOURS &amp; EXPÉRIENCE
        </p>
        <h2 className="font-display mt-2 text-3xl font-semibold uppercase tracking-tight text-[var(--ink)]">
          Chronologie des systèmes
        </h2>
        <p className="mt-2 font-mono text-xs text-[var(--mute)]">
          Évolution technique et projets majeurs
        </p>
        
        {/* Timeline avec espacement corrigé */}
        <div className="mt-8 space-y-8 border-l-2 border-[var(--accent)]/30 pl-4 sm:pl-6">
          {TIMELINE.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div 
                key={item.title}
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Point de la timeline - repositionné */}
                <div className="absolute -left-[17px] sm:-left-[25px] top-1.5">
                  <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-[var(--accent)] flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-[var(--accent)] animate-ping opacity-75" />
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="font-mono text-sm font-bold text-[var(--accent)] flex-shrink-0">
                    {item.year}
                  </span>
                  <span className="text-xs text-[var(--mute)] flex-shrink-0">//</span>
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[var(--accent)]/10 flex-shrink-0">
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[var(--accent)]" strokeWidth={1.5} />
                  </div>
                </div>
                
                <h3 className="font-display text-lg font-medium text-[var(--ink)] mt-2 break-words">
                  {item.title}
                </h3>
                
                <p className="mt-1 font-mono text-xs leading-6 text-[var(--mute)] break-words">
                  {item.details}
                </p>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.tech.map((t) => (
                    <span key={t} className="tag text-[0.55rem] whitespace-nowrap">{t}</span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CERTIFICATIONS - avec gestion du texte long */}
        <motion.div 
          className="mt-12 frame p-4 sm:p-6 bg-[var(--surface)] rounded-xl border border-[var(--line)]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[var(--accent)] mb-4">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[var(--accent)]/10 flex-shrink-0">
              <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <span className="text-xs sm:text-sm">CERTIFICATIONS VALIDÉES</span>
            <span className="ml-auto text-[0.55rem] text-[var(--mute)] flex-shrink-0">3 validées</span>
          </div>
          
          <div className="space-y-4 font-mono text-xs">
            {CERTIFICATIONS.map((cert) => (
              <div 
                key={cert.title} 
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[var(--line)] pb-3 last:border-0 hover:bg-[var(--surface)]/50 p-2 rounded-lg transition-colors gap-2 sm:gap-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--ink)] font-medium text-xs sm:text-sm break-words">
                    {cert.title}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[0.5rem] sm:text-[0.55rem] text-[var(--accent)] uppercase whitespace-nowrap">
                    <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {cert.level}
                  </span>
                  <span className="text-[var(--accent)] font-bold text-xs sm:text-sm whitespace-nowrap">
                    {cert.year}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* SKILLS MATRIX */}
      <div className="min-w-0">
        <p className="eyebrow flex items-center gap-2">
          <Brain className="h-3 w-3 flex-shrink-0" /> CAPACITÉS TECHNIQUES
        </p>
        <h2 className="font-display mt-2 text-3xl font-semibold uppercase tracking-tight text-[var(--ink)]">
          Matrice de compétences
        </h2>
        <p className="mt-2 font-mono text-xs text-[var(--mute)]">
          Niveaux de maîtrise par domaine technologique
        </p>
        <div className="mt-8 space-y-6">
          {SKILLS.map((group, index) => (
            <div key={group.category} className="card p-4 sm:p-5 bg-[var(--surface)] rounded-xl border border-[var(--line)] hover:border-[var(--accent)]/30 transition-colors">
              <div className="flex items-center gap-2 font-mono text-xs text-[var(--accent)] mb-4">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[var(--accent)]/10 flex-shrink-0">
                  <group.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <span className="font-bold text-xs sm:text-sm">{group.category}</span>
                <span className="ml-auto text-[var(--mute)] text-[0.55rem] sm:text-[0.6rem] flex-shrink-0">
                  {group.items.length} technologies
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
                {group.items.map((item) => (
                  <span key={item} className="tag text-[0.55rem] sm:text-xs whitespace-nowrap">{item}</span>
                ))}
              </div>
              <SkillBar skill={group} delay={index} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</section>

      {/* SERVICES */}
      {servicesContent}

      {/* CONTACT FORM & DETAILS */}
      <section id="contact" className="border-t border-[var(--line)] py-24 bg-gradient-to-b from-[var(--surface)]/30 to-[var(--bg)] overflow-hidden">
        <div className="container overflow-hidden grid gap-16 lg:grid-cols-2">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <Network className="h-3 w-3" /> NOEUD DE COMMUNICATION
            </p>
            <h2 className="font-display mt-2 text-4xl font-semibold uppercase tracking-tight text-[var(--ink)]">
              Démarrer un projet
            </h2>
            <p className="mt-4 font-mono text-xs leading-6 text-[var(--mute)] max-w-md">
              Disponible pour missions freelance, développement d&apos;applications et opportunités full-stack.
              <span className="block mt-2 text-[var(--accent)]">_ Let&apos;s build something amazing together.</span>
            </p>

            <div className="mt-10 space-y-4 font-mono text-xs">
              <motion.a 
                href="mailto:papendiaye511@gmail.com" 
                className="card flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl border border-[var(--line)] hover:border-[var(--accent)] transition-all group"
                whileHover={{ x: 4 }}
              >
                <span className="flex items-center gap-3 text-[var(--ink)]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                    <Mail className="h-4 w-4 text-[var(--accent)]" />
                  </div>
                  papendiaye511@gmail.com
                </span>
                <ArrowUpRight className="h-4 w-4 text-[var(--accent)] group-hover:translate-x-1 transition-transform" />
              </motion.a>
              <motion.a 
                href="https://github.com/llmnd" 
                target="_blank" 
                rel="noreferrer" 
                className="card flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl border border-[var(--line)] hover:border-[var(--accent)] transition-all group"
                whileHover={{ x: 4 }}
              >
                <span className="flex items-center gap-3 text-[var(--ink)]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                    <Github className="h-4 w-4 text-[var(--accent)]" />
                  </div>
                  GitHub / llmnd
                </span>
                <ArrowUpRight className="h-4 w-4 text-[var(--accent)] group-hover:translate-x-1 transition-transform" />
              </motion.a>
              <motion.a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer" 
                className="card flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl border border-[var(--line)] hover:border-[var(--accent)] transition-all group"
                whileHover={{ x: 4 }}
              >
                <span className="flex items-center gap-3 text-[var(--ink)]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10">
                    <Linkedin className="h-4 w-4 text-[var(--accent)]" />
                  </div>
                  LinkedIn Profile
                </span>
                <ArrowUpRight className="h-4 w-4 text-[var(--accent)] group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="frame p-8 bg-[var(--surface)] rounded-2xl border border-[var(--line)] space-y-6"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="text-center mb-6">
              <h3 className="font-display text-lg font-semibold text-[var(--ink)]">Formulaire de contact</h3>
              <p className="font-mono text-xs text-[var(--mute)]">Remplissez les champs ci-dessous</p>
            </div>
            
            <div>
              <label htmlFor="name" className="cap flex items-center gap-2 text-xs font-mono text-[var(--mute)]">
                <span className="text-[var(--accent)]">*</span> ENTRÉE_NOM
              </label>
              <input 
                id="name" 
                name="name" 
                type="text" 
                required 
                placeholder="Moussa Ly" 
                className="field mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 font-mono text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all" 
              />
            </div>
            <div>
              <label htmlFor="email" className="cap flex items-center gap-2 text-xs font-mono text-[var(--mute)]">
                <span className="text-[var(--accent)]">*</span> ENTRÉE_EMAIL
              </label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required 
                placeholder="moussa@example.com" 
                className="field mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 font-mono text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all" 
              />
            </div>
            <div>
              <label htmlFor="message" className="cap flex items-center gap-2 text-xs font-mono text-[var(--mute)]">
                <span className="text-[var(--accent)]">*</span> DESCRIPTIF_PROJET
              </label>
              <textarea 
                id="message" 
                name="message" 
                rows={4} 
                required 
                placeholder="Détails de la mission..." 
                className="field mt-2 w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 font-mono text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-all" 
              />
            </div>
            <motion.button 
              type="submit" 
              className="btn-solid w-full justify-center group py-4 rounded-xl bg-[var(--accent)] text-white font-mono text-sm font-bold hover:bg-[var(--accent)]/90 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              TRANSMETTRE LE MESSAGE 
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--line)] bg-[var(--surface)]/50 py-8 font-mono text-xs text-[var(--mute)]">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="flex items-center gap-2">
            © 2026 — LAMINE 
            <span className="hidden sm:inline">//</span>
            <span className="text-[var(--accent)] flex items-center gap-1">
              <Signal className="h-3 w-3" /> ALL SYSTEMS OPERATIONAL
            </span>
          </p>
        </div>
      </footer>
    </main>
  );
}