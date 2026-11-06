'use client';

import { useState, ReactNode } from 'react';
import {
  ArrowUpRight, Download, Github, Layers, Linkedin, Menu, X,
  ServerCog, Smartphone, CheckCircle, GraduationCap, Award, Languages, LucideIcon
} from 'lucide-react';
import APIIntegrationSection from './components/APIIntegrationSection';

// ============================================
// DATA
// ============================================

const STACK = ['React', 'Next.js', 'Angular', 'Django', 'PostgreSQL', 'Docker', 'Tailwind CSS', 'Flutter', 'Git'];

const NAV = [
  { href: '#work', label: 'Projets' },
  { href: '#api-integration', label: 'API & Paiement' },
  { href: '#skills', label: 'Savoir-faire' },
  { href: '#contact', label: 'Contact' },
];

const PROJECTS: { index: string; title: string; description: string; tech: string[]; demo: string; tint: string; note?: string }[] = [
  { index: '01', title: 'Fisafi Groupe', description: 'Vitrine institutionnelle réactive, optimisée SEO avec un score Lighthouse 95+.', tech: ['Next.js', 'SEO', 'Tailwind'], demo: 'https://fisafigroupe.com', tint: 'from-orange-100' },
  { index: '02', title: 'SEAT Opus Global', description: 'Site de SEAT Opus Global (solaire, Tchad) : produits, réalisations et navigation mobile soignée.', tech: ['PHP', 'CSS', 'Responsive'], demo: 'https://seatopusglobal.com/index.html', tint: 'from-yellow-100', note: 'Mission consultant · FISAFI Groupe' },
  { index: '03', title: 'Mamari', description: 'Plateforme MAMARI dédiée à l’agriculture, à l’élevage et à leurs services.', tech: ['Next.js', 'FastAPI'], demo: 'https://mamari.fisafigroupe.com', tint: 'from-emerald-100', note: 'Mission consultant · FISAFI Groupe' },
  { index: '04', title: 'Mbaymi', description: 'Plateforme agritech mobile pour le suivi en temps réel des cultures et cheptels.', tech: ['Flutter', 'Dart', 'Firebase'], demo: 'https://mbaymi.vercel.app', tint: 'from-teal-100' },
  { index: '05', title: 'Bitik Platform', description: 'Marketplace e-commerce distribuée avec catalogue synchrone haute vitesse.', tech: ['Next.js', 'Tailwind', 'REST API'], demo: 'https://bitik.vercel.app', tint: 'from-amber-100' },
];

const CLIENT = PROJECTS.slice(0, 3);
const OWN = PROJECTS.slice(3);

const SERVICES: { title: string; description: string; icon: LucideIcon; features: string[] }[] = [
  { title: 'Interfaces', description: 'Design épuré, fluidité maximale sur tous les écrans.', icon: Layers, features: ['UI/UX responsive', 'Lighthouse 95+'] },
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

const Label = ({ children }: { children: string }) => <span className="eyebrow">{children}</span>;

const SectionHead = ({ n, label, children }: { n: string; label: string; children: ReactNode }) => (
  <div className="mb-12 md:mb-16">
    <Label>{`${n} — ${label}`}</Label>
    <h2 className="font-display mt-5 text-5xl md:text-7xl">{children}</h2>
  </div>
);

type Proj = (typeof PROJECTS)[number];

function ProjectCard({ p }: { p: Proj }) {
  return (
    <a href={p.demo} target="_blank" rel="noreferrer" className="soft flex min-h-[300px] flex-col p-8 hover:shadow-xl">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-[var(--accent)]">{p.index}</span>
        <ArrowUpRight className="h-5 w-5 text-[var(--mute)]" />
      </div>
      <h3 className="font-display mt-10 text-4xl">{p.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[var(--mute)]">{p.description}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-8">
        {p.note && <span className="chip !bg-[var(--accent)]/10 !text-[var(--accent)]">Consultant · FISAFI</span>}
        {p.tech.map((t) => <span key={t} className="chip">{t}</span>)}
      </div>
    </a>
  );
}

// ============================================
// PAGE
// ============================================

export default function Home() {
  const [menu, setMenu] = useState(false);

  return (
    <main className="bg-[#f6f5f2] text-[#121212]">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#f6f5f2]/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <a href="#top" className="font-display text-2xl">Lamine<span className="serif-i">.</span></a>
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => <a key={n.href} href={n.href} className="nav-link">{n.label}</a>)}
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
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setMenu(false)} className="font-display block py-3 text-5xl">{n.label}</a>
            ))}
          </nav>
          <div className="flex gap-6 text-sm text-[var(--mute)]">
            <a href="https://github.com/llmnd" className="flex items-center gap-1.5"><Github className="h-4 w-4" /> GitHub</a>
            <a href="https://linkedin.com" className="flex items-center gap-1.5"><Linkedin className="h-4 w-4" /> LinkedIn</a>
          </div>
        </div>
      )}

      {/* Hero */}
      <section id="top" className="py-16 md:py-28">
        <div className="container grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="chip"><span className="dot-live" /> Disponible · Dakar, SN</span>
            <h1 className="font-display mt-8 text-[clamp(3rem,7.5vw,6.8rem)]">
              Des produits digitaux <em>élégants</em> et connectés.
            </h1>
            <p className="mt-8 max-w-lg text-lg text-[var(--mute)]">
              Développeur full-stack : interfaces épurées, applications mobiles et systèmes qui communiquent entre eux.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#work" className="btn-solid">Voir mes projets</a>
              <a href="#contact" className="btn">Me contacter <ArrowUpRight className="h-4 w-4" /></a>
            </div>
            <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 text-sm">
              {[['Web', 'Next.js · React'], ['Mobile', 'Flutter'], ['Backend', 'FastAPI · Django']].map(([k, v]) => (
                <div key={k}><dt className="eyebrow !tracking-widest before:hidden">{k}</dt><dd className="mt-1.5 font-medium">{v}</dd></div>
              ))}
            </dl>
          </div>
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[var(--soft)] shadow-[var(--shadow)]">
              <img src="https://res.cloudinary.com/dcs9vkwe0/image/upload/v1786026387/f3codb9okszfnxskuzvl.jpg" alt="Lamine Ndiaye" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-6 pt-16 text-white">
                <p className="font-display text-3xl">Lamine Ndiaye</p>
                <p className="text-sm text-white/80">Développeur full-stack · Dakar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projets */}
      <section id="work" className="py-20 md:py-32">
        <div className="container">
          <SectionHead n="01" label="Projets">Ce que j’ai <em>construit</em></SectionHead>

          <p className="mb-5 text-sm text-[var(--mute)]">Réalisations pour clients</p>
          <div className="grid gap-5 md:grid-cols-3">{CLIENT.map((p) => <ProjectCard key={p.title} p={p} />)}</div>

          <p className="mb-5 mt-14 text-sm text-[var(--mute)]">Produits personnels</p>
          <div className="grid gap-5 md:grid-cols-2">{OWN.map((p) => <ProjectCard key={p.title} p={p} />)}</div>
        </div>
      </section>

      {/* API & Paiement */}
      <APIIntegrationSection />

      {/* Savoir-faire */}
      <section id="skills" className="py-20 md:py-32">
        <div className="container">
          <SectionHead n="03" label="Savoir-faire">Ce que je <em>maîtrise</em></SectionHead>

          <div className="grid gap-5 md:grid-cols-3">
            {SERVICES.map((s) => { const Icon = s.icon; return (
              <div key={s.title} className="soft p-8">
                <Icon className="h-5 w-5 text-[var(--accent)]" />
                <h3 className="font-display mt-6 text-3xl">{s.title}</h3>
                <p className="mt-2 text-sm text-[var(--mute)]">{s.description}</p>
                <ul className="mt-5 space-y-2 text-sm">{s.features.map((f) => <li key={f} className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-[var(--accent)]" />{f}</li>)}</ul>
              </div>
            ); })}
          </div>

          <div className="soft mt-5 flex flex-col gap-5 p-8 md:flex-row md:items-center md:justify-between">
            <Label>Stack</Label>
            <div className="flex flex-wrap gap-2 md:justify-end">{STACK.map((t) => <span key={t} className="chip">{t}</span>)}</div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <div className="soft-flat p-8">
              <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-[var(--accent)]" /><Label>Formation</Label></div>
              <div className="mt-6 space-y-5">
                {EDUCATION.map((e) => (
                  <div key={e.title}>
                    <span className="font-mono text-xs text-[var(--accent)]">{e.period}</span>
                    <p className="mt-0.5 font-medium leading-snug">{e.title}</p>
                    <p className="text-sm text-[var(--mute)]">{e.institution}{e.details ? ` · ${e.details}` : ''}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="soft-flat p-8">
              <div className="flex items-center gap-2"><Award className="h-4 w-4 text-[var(--accent)]" /><Label>Certifications</Label></div>
              <div className="mt-6 space-y-5">
                {CERTIFICATIONS.map((c) => (
                  <div key={c.title}>
                    <span className="font-mono text-xs text-[var(--accent)]">{c.year}</span>
                    <p className="mt-0.5 font-medium leading-snug">{c.title}</p>
                    <p className="text-sm text-[var(--mute)]">{c.issuer}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="soft-flat p-8">
              <div className="flex items-center gap-2"><Languages className="h-4 w-4 text-[var(--accent)]" /><Label>Langues</Label></div>
              <div className="mt-6 space-y-5">
                {['Français', 'Anglais'].map((l) => (
                  <div key={l}>
                    <span className="font-mono text-xs text-[var(--accent)]">Courant</span>
                    <p className="mt-0.5 font-medium">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 md:py-32">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-2 md:gap-20">
            <div>
              <Label>04 — Contact</Label>
              <h2 className="font-display mt-5 text-[clamp(3.5rem,9vw,7.5rem)]">Parlons<em>.</em></h2>
              <p className="mt-6 max-w-sm text-[var(--mute)]">Un projet, une mission, une idée ? Écrivez-moi directement.</p>
              <a href="mailto:papendiaye511@gmail.com" className="hover-line font-display mt-8 inline-block break-all text-2xl md:text-3xl">papendiaye511@gmail.com</a>
              <div className="mt-8 flex gap-3">
                <a href="https://github.com/llmnd" target="_blank" rel="noreferrer" className="btn"><Github className="h-4 w-4" /> GitHub</a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="btn"><Linkedin className="h-4 w-4" /> LinkedIn</a>
              </div>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="soft space-y-7 self-start p-8 md:p-10">
              <input type="text" required placeholder="Nom" className="field" />
              <input type="email" required placeholder="Email" className="field" />
              <textarea rows={3} required placeholder="Parlez-moi de votre projet…" className="field resize-none" />
              <button type="submit" className="btn-solid w-full">Envoyer <ArrowUpRight className="h-4 w-4" /></button>
            </form>
          </div>
        </div>
      </section>

      <footer className="pb-10 pt-6 text-sm text-[var(--mute)]">
        <div className="container flex items-center justify-between">
          <p>© 2026 Lamine Ndiaye</p>
          <a href="https://github.com/llmnd" target="_blank" rel="noreferrer" className="nav-link">GitHub</a>
        </div>
      </footer>
    </main>
  );
}