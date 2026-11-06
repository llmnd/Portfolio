'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import {
  ArrowUpRight, Download, Github, Layers, Linkedin, Mail, Menu, X,
  ServerCog, Smartphone, Globe, CheckCircle, GraduationCap, Award, Languages, LucideIcon
} from 'lucide-react';
import APIIntegrationSection from './components/APIIntegrationSection';

// ============================================
// DATA
// ============================================

const STACK = ['React', 'Next.js', 'Angular', 'Django', 'PostgreSQL', 'Docker', 'Tailwind CSS', 'Flutter', 'Git'];

const CHAPTERS = [
  { id: 'top', label: 'Bonjour' },
  { id: 'story', label: 'Histoire' },
  { id: 'work', label: 'Projets' },
  { id: 'api-integration', label: 'API & Paiement' },
  { id: 'skills', label: 'Savoir-faire' },
  { id: 'contact', label: 'Contact' },
];

const PROJECTS: { index: string; title: string; description: string; tech: string[]; demo: string; icon: LucideIcon; tint: string; note?: string }[] = [
  { index: '01', title: 'Fisafi Groupe', description: 'Vitrine institutionnelle réactive, optimisée SEO avec un score Lighthouse 95+.', tech: ['Next.js', 'SEO', 'Tailwind'], demo: 'https://fisafigroupe.com', icon: Globe, tint: 'from-orange-200/60' },
  { index: '02', title: 'SEAT Opus Global', description: 'Site de SEAT Opus Global (solaire, Tchad) : produits, réalisations et navigation mobile soignée.', tech: ['PHP', 'CSS', 'Responsive'], demo: 'https://seatopusglobal.com/index.html', icon: Globe, tint: 'from-yellow-200/60', note: 'Mission consultant · FISAFI Groupe' },
  { index: '03', title: 'Mamari', description: 'Plateforme MAMARI dédiée à l’agriculture, à l’élevage et à leurs services.', tech: ['WordPress', 'PHP', 'CSS'], demo: 'https://mamari.fisafigroupe.com', icon: Layers, tint: 'from-emerald-200/50', note: 'Mission consultant · FISAFI Groupe' },
  { index: '04', title: 'Mbaymi', description: 'Plateforme agritech mobile pour le suivi en temps réel des cultures et cheptels.', tech: ['Flutter', 'Dart', 'Firebase'], demo: 'https://mbaymi.vercel.app', icon: Smartphone, tint: 'from-teal-200/50' },
  { index: '05', title: 'Bitik Platform', description: 'Marketplace e-commerce distribuée avec catalogue synchrone haute vitesse.', tech: ['Next.js', 'Tailwind', 'REST API'], demo: 'https://bitik.vercel.app', icon: Layers, tint: 'from-amber-200/60' },
];

const SERVICES: { title: string; description: string; icon: LucideIcon; features: string[] }[] = [
  { title: 'Interfaces', description: 'Design épuré, fluidité maximale sur tous les écrans.', icon: Layers, features: ['UI/UX responsive', 'Animations fluides', 'Lighthouse 95+'] },
  { title: 'Mobile', description: 'Flutter, des performances proches du natif.', icon: Smartphone, features: ['iOS & Android', 'Mode offline'] },
  { title: 'Backend', description: 'APIs REST scalables et bases de données.', icon: ServerCog, features: ['Django / Node', 'PostgreSQL', 'Docker'] },
];

const CERTIFICATIONS = [
  { title: 'Networking Basics', issuer: 'Cisco Networking Academy', year: '2023' },
  { title: 'Introduction to Cybersecurity', issuer: 'Cisco Networking Academy', year: '2025' },
  { title: 'English for IT 2', issuer: 'Cisco Networking Academy', year: '2025' },
];

const EDUCATION = [
  { title: 'DTS en Informatique', institution: 'ESP, Dakar', period: '2023–2025' },
  { title: 'Licence 1 Physique-Chimie', institution: 'Université', period: '2022–2023', details: 'Réorientation vers l’informatique' },
  { title: 'Baccalauréat S2', institution: 'Cours Sacré-Cœur, Dakar', period: '2022' },
];

// ============================================
// STORY HELPERS
// ============================================

/** Apparition douce au scroll */
function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('in'); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

/** Mot qui change dans le titre */
function RotatingWord({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  const [out, setOut] = useState(false);
  useEffect(() => {
    const t = setInterval(() => {
      setOut(true);
      setTimeout(() => { setI((v) => (v + 1) % words.length); setOut(false); }, 450);
    }, 2600);
    return () => clearInterval(t);
  }, [words.length]);
  return <em className={`swap ${out ? 'out' : ''}`}>{words[i]}.</em>;
}

/** Texte qui s'allume mot par mot pendant le scroll */
function ScrollText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const f = () => {
      const r = ref.current!.getBoundingClientRect(), v = window.innerHeight;
      setP(Math.min(1, Math.max(0, (v * 0.8 - r.top) / (r.height + v * 0.2))));
    };
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  const words = text.split(' ');
  return (
    <p ref={ref} className="font-display text-[clamp(2rem,5.2vw,4.6rem)] leading-[1.1]">
      {words.map((w, i) => (
        <span key={i} className="word" style={{ opacity: Math.min(1, Math.max(0.14, p * words.length * 1.15 - i)) }}>{w} </span>
      ))}
    </p>
  );
}

const Label = ({ children }: { children: ReactNode }) => <span className="eyebrow">{children}</span>;

// ============================================
// PAGE
// ============================================

export default function Home() {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(0);
  const bar = useRef<HTMLDivElement>(null);

  // barre de progression + header
  useEffect(() => {
    const f = () => {
      const h = document.documentElement;
      bar.current && (bar.current.style.transform = `scaleX(${h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)})`);
      setScrolled(h.scrollTop > 24);
    };
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);

  // chapitre actif
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) setActive(CHAPTERS.findIndex((c) => c.id === e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    CHAPTERS.forEach((c) => { const el = document.getElementById(c.id); el && io.observe(el); });
    return () => io.disconnect();
  }, []);

  useEffect(() => { document.body.style.overflow = menu ? 'hidden' : ''; }, [menu]);

  return (
    <main className="overflow-x-hidden bg-[#f6f5f2] text-[#121212]">
      <div ref={bar} className="progress" />

      {/* Chapitre actif (desktop) */}
      <div className="fixed bottom-6 left-6 z-30 hidden items-center gap-3 text-xs text-[var(--mute)] lg:flex">
        <span className="font-mono text-[var(--accent)]">0{active + 1}</span>
        <span className="h-px w-8 bg-[var(--mute)]/40" />
        <span>{CHAPTERS[active]?.label}</span>
      </div>

      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4">
        <div className={`flex w-full max-w-5xl items-center justify-between rounded-full px-5 py-2.5 transition-all duration-500 ${scrolled ? 'bg-white/75 shadow-[0_8px_30px_-12px_rgba(0,0,0,.15)] backdrop-blur-xl' : ''}`}>
          <a href="#top" className="font-display text-2xl">Lamine<span className="serif-i">.</span></a>
          <nav className="hidden items-center gap-7 md:flex">
            {CHAPTERS.slice(2).map((c) => <a key={c.id} href={`#${c.id}`} className="nav-link">{c.label}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <a href="https://res.cloudinary.com/dcs9vkwe0/image/upload/v1793956108/tppuuxcgfdzjqsmtfphy.pdf" download="Lamine_NDIAYE_CV.pdf" className="btn-solid hidden !px-4 !py-2 md:inline-flex">
              <Download className="h-3.5 w-3.5" /> CV
            </a>
            <button onClick={() => setMenu(true)} aria-label="Menu" className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--soft)] md:hidden"><Menu className="h-5 w-5" /></button>
          </div>
        </div>
      </header>

      {menu && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-between bg-[var(--bg)] p-6 md:hidden">
          <button onClick={() => setMenu(false)} aria-label="Fermer" className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--soft)]"><X className="h-5 w-5" /></button>
          <nav>
            {CHAPTERS.slice(1).map((c, i) => (
              <a key={c.id} href={`#${c.id}`} onClick={() => setMenu(false)} className="font-display flex items-baseline gap-4 py-2.5 text-5xl">
                <span className="font-mono text-xs text-[var(--accent)]">0{i + 1}</span>{c.label}
              </a>
            ))}
          </nav>
          <div className="flex gap-6 text-sm text-[var(--mute)]">
            <a href="https://github.com/llmnd" className="flex items-center gap-1.5"><Github className="h-4 w-4" /> GitHub</a>
            <a href="https://linkedin.com" className="flex items-center gap-1.5"><Linkedin className="h-4 w-4" /> LinkedIn</a>
          </div>
        </div>
      )}

      {/* 00 — HERO */}
      <section id="top" className="flex min-h-screen flex-col justify-center">
        <div className="container pt-24">
          <Reveal><span className="chip"><span className="dot-live" /> Disponible · Dakar, SN</span></Reveal>
          <Reveal delay={120}>
            <h1 className="font-display mt-8 text-[clamp(3.4rem,10vw,9.5rem)]">
              Je crée des produits digitaux<br /><RotatingWord words={['élégants', 'rapides', 'connectés', 'utiles']} />
            </h1>
          </Reveal>
          <Reveal delay={260} className="mt-10 flex flex-wrap items-center gap-3">
            <a href="#work" className="btn-solid">Découvrir mon travail</a>
            <a href="#contact" className="btn">Me contacter <ArrowUpRight className="h-4 w-4" /></a>
          </Reveal>
        </div>
        <div className="mx-auto mt-16 flex flex-col items-center gap-3 pb-10 text-xs text-[var(--mute)]">
          <span>Défiler</span><span className="cue" />
        </div>
      </section>

      {/* 01 — HISTOIRE */}
      <section id="story" className="py-32 md:py-48">
        <div className="container max-w-5xl">
          <Reveal className="mb-10"><Label>Chapitre 01 · L’histoire</Label></Reveal>
          <ScrollText text="Basé à Dakar, j’ai troqué la physique-chimie pour l’informatique. Aujourd’hui, je construis des interfaces épurées, des applications mobiles et des systèmes qui se parlent entre eux." />
        </div>
      </section>

      {/* 02 — PROJETS : galerie horizontale */}
      <section id="work" className="py-24 md:py-32">
        <div className="container mb-10 flex items-end justify-between">
          <Reveal>
            <Label>Chapitre 02 · Projets</Label>
            <h2 className="font-display mt-5 text-5xl md:text-7xl">Ce que j’ai <em>construit</em></h2>
          </Reveal>
          <span className="hidden text-sm text-[var(--mute)] md:block">Glisser →</span>
        </div>
        <div className="snap-x">
          {PROJECTS.map((p) => (
            <a key={p.title} href={p.demo} target="_blank" rel="noreferrer" className="soft lift group relative flex min-h-[460px] flex-col justify-between overflow-hidden p-9">
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${p.tint} to-transparent`} />
              <div className="relative flex items-start justify-between">
                <span className="font-display text-7xl text-[var(--accent)]/70">{p.index}</span>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow transition-all duration-500 group-hover:bg-[var(--ink)] group-hover:text-white">
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
                </span>
              </div>
              <div className="relative">
                {p.note && <span className="chip mb-4 !bg-white/80 !text-[var(--accent)]">{p.note}</span>}
                <h3 className="font-display text-5xl">{p.title}</h3>
                <p className="mt-3 max-w-sm text-[var(--mute)]">{p.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">{p.tech.map((t) => <span key={t} className="chip !bg-white/80">{t}</span>)}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 03 — API & PAIEMENT */}
      <APIIntegrationSection />

      {/* 04 — SAVOIR-FAIRE : bento */}
      <section id="skills" className="py-24 md:py-40">
        <div className="container">
          <Reveal className="mb-12">
            <Label>Chapitre 04 · Savoir-faire</Label>
            <h2 className="font-display mt-5 text-5xl md:text-7xl">Tout, <em>en un coup d’œil</em></h2>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-4">
            <Reveal className="soft p-8 md:col-span-2 md:row-span-2">
              <Label>Stack</Label>
              <p className="font-display mt-4 text-4xl md:text-5xl">Les outils que je maîtrise.</p>
              <div className="mt-8 flex flex-wrap gap-2">{STACK.map((t) => <span key={t} className="chip">{t}</span>)}</div>
            </Reveal>

            {SERVICES.map((s, i) => { const Icon = s.icon; return (
              <Reveal key={s.title} delay={80 * (i + 1)} className={`soft p-7 ${i === 2 ? 'md:col-span-2' : ''}`}>
                <Icon className="h-5 w-5 text-[var(--accent)]" />
                <h3 className="font-display mt-5 text-3xl">{s.title}</h3>
                <p className="mt-2 text-sm text-[var(--mute)]">{s.description}</p>
                <ul className="mt-4 space-y-1.5 text-sm">{s.features.map((f) => <li key={f} className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-[var(--accent)]" />{f}</li>)}</ul>
              </Reveal>
            ); })}

            <Reveal className="soft-flat p-7 md:col-span-2">
              <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-[var(--accent)]" /><Label>Formation</Label></div>
              <div className="mt-5 space-y-4">
                {EDUCATION.map((e) => (
                  <div key={e.title} className="flex gap-4">
                    <span className="w-20 shrink-0 font-mono text-xs text-[var(--accent)]">{e.period}</span>
                    <div><p className="font-medium leading-snug">{e.title}</p><p className="text-sm text-[var(--mute)]">{e.institution}{e.details ? ` · ${e.details}` : ''}</p></div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal className="soft-flat p-7 md:col-span-2">
              <div className="flex items-center gap-2"><Award className="h-4 w-4 text-[var(--accent)]" /><Label>Certifications</Label></div>
              <div className="mt-5 space-y-4">
                {CERTIFICATIONS.map((c) => (
                  <div key={c.title} className="flex items-baseline justify-between gap-3">
                    <div><p className="font-medium leading-snug">{c.title}</p><p className="text-sm text-[var(--mute)]">{c.issuer}</p></div>
                    <span className="font-mono text-xs text-[var(--accent)]">{c.year}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal className="soft p-7 md:col-span-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2"><Languages className="h-4 w-4 text-[var(--accent)]" /><Label>Langues</Label></div>
                <div className="flex gap-3"><span className="chip">Français · Courant</span><span className="chip">Anglais · Courant</span></div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 05 — CONTACT */}
      <section id="contact" className="py-24 md:py-44">
        <div className="container max-w-5xl">
          <Reveal><Label>Chapitre 05 · La suite</Label></Reveal>
          <Reveal delay={100}>
            <h2 className="font-display mt-6 text-[clamp(4rem,13vw,11rem)]">Parlons<em>.</em></h2>
          </Reveal>
          <Reveal delay={200}>
            <a href="mailto:papendiaye511@gmail.com" className="hover-line font-display mt-6 inline-block break-all text-3xl md:text-5xl">papendiaye511@gmail.com</a>
          </Reveal>

          <Reveal delay={300}>
            <form onSubmit={(e) => e.preventDefault()} className="mt-20 grid gap-8 md:grid-cols-2">
              <input type="text" required placeholder="Nom" className="field" />
              <input type="email" required placeholder="Email" className="field" />
              <textarea rows={2} required placeholder="Parlez-moi de votre projet…" className="field resize-none md:col-span-2" />
              <button type="submit" className="btn-solid md:col-span-2 md:w-fit">Envoyer <ArrowUpRight className="h-4 w-4" /></button>
            </form>
          </Reveal>
        </div>
      </section>

      <footer className="pb-10 pt-6 text-sm text-[var(--mute)]">
        <div className="container flex items-center justify-between">
          <p>© 2026 Lamine Ndiaye</p>
          <div className="flex gap-5">
            <a href="https://github.com/llmnd" target="_blank" rel="noreferrer" className="nav-link">GitHub</a>
            <a href="#top" className="nav-link">Haut ↑</a>
          </div>
        </div>
      </footer>
    </main>
  );
}