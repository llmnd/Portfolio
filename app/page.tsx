'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Braces, Database, Download, Github, Layers,
  Linkedin, Mail, ServerCog, Smartphone, Wrench,
} from 'lucide-react';
import NeuralExhibit from './NeuralExhibit';

const stats = [
  { value: '3+', label: 'Années d’expérience' },
  { value: '7', label: 'Projets livrés' },
  { value: '10+', label: 'Technos maîtrisées' },
];

const stack = ['React', 'Next.js', 'Django', 'PostgreSQL', 'Docker', 'Tailwind CSS', 'Flutter', 'Git', 'Linux', 'Vercel'];

const skills = [
  { category: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Flutter'] },
  { category: 'Backend', items: ['Python', 'Django', 'Java', 'Spring Boot', 'API REST'] },
  { category: 'Données', items: ['PostgreSQL', 'MySQL', 'Prisma'] },
  { category: 'Outils', items: ['Git', 'Docker', 'Linux', 'Vercel'] },
];

const projects = [
  {
    index: '01',
    title: 'Mbaymi',
    description: 'Application mobile d’agriculture et d’élevage construite avec Flutter, gestion des cultures et des troupeaux.',
    tech: ['Flutter', 'Dart', 'Firebase'],
    demo: 'https://mbaymi.vercel.app',
    icon: Smartphone,
  },
  {
    index: '02',
    title: 'Plateforme Bitik',
    description: 'Marketplace d’achat/vente avec catalogue dynamique et expérience fluide, en production.',
    tech: ['Next.js', 'Tailwind CSS'],
    demo: 'https://bitik.vercel.app',
    icon: Smartphone,
  },
  {
    index: '03',
    title: 'Site Fisafi Groupe',
    description: 'Site d’entreprise épuré, responsive, axé image de marque et référencement.',
    tech: ['Next.js', 'SEO'],
    demo: 'https://fisafigroupe.com',
    icon: Braces,
  },
];

const services = [
  { title: 'Sites vitrines premium', description: 'Design minimaliste et ergonomie raffinée pour marques et startups.', icon: Layers },
  { title: 'Applications mobiles', description: 'Applications Flutter fluides, pensées pour une expérience haut de gamme.', icon: Smartphone },
  { title: 'E-commerce sur mesure', description: 'Parcours d’achat optimisé et administration simple à prendre en main.', icon: ServerCog },
  { title: 'Architecture backend', description: 'API sécurisées et scalables, pensées pour la maintenance long terme.', icon: Wrench },
];

const certifications = [
  { title: 'Cisco Networking Academy – Networking basics', year: '2023' },
  { title: 'Introduction to Cybersecurity', year: '2025' },
  { title: 'English for IT 2', year: '2025' },
];

const timeline = [
  { year: '2025', title: 'Mbaymi', details: 'Application mobile d’agriculture et d’élevage créée avec Flutter, pilotage des cultures et des troupeaux.' },
  { year: '2025', title: 'Bitik.vercel.app', details: 'Marketplace responsive, parcours utilisateur optimisé et gestion produits.' },
  { year: '2026', title: 'Fisafigroupe.com', details: 'Refonte du site vitrine pour une présence web élégante et responsive.' },
];

export default function Home() {
  return (
    <main className="bg-[var(--bg)]">
      {/* HEADER */}
      <div className="container">
        <header className="flex h-24 items-center justify-between border-b border-[var(--line)]">
          <span className="font-display text-base font-medium tracking-tight text-[var(--ink)]">
            Lamine<span className="text-[var(--accent)]">.</span>
          </span>
          <nav className="cap hidden items-center gap-10 md:flex">
            <a href="#about" className="hover-line">À propos</a>
            <a href="#work" className="hover-line">Projets</a>
            <a href="#services" className="hover-line">Services</a>
            <a href="#contact" className="hover-line">Contact</a>
          </nav>
          <a href="#contact" className="btn">
            Réserver un appel
          </a>
        </header>
      </div>

      {/* HERO */}
      <section className="pb-24 pt-20">
        <div className="container">
          <div className="grid gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <p className="eyebrow">Software &amp; AI solutions</p>
              <h1 className="font-display mt-6 text-[3rem] font-medium leading-[1.05] text-[var(--ink)] sm:text-[4rem]">
                Développeur
                <br />
                <span className="font-serif text-[var(--accent)]">Full-Stack.</span>
              </h1>
              <p className="mt-7 max-w-md text-[1.02rem] leading-8 text-[var(--mute)]">
                Un bon code doit se faire oublier. Basé à Dakar, je conçois des
                produits web et mobiles rapides, fiables et faciles à faire évoluer.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a href="#work" className="btn-solid">
                  Voir les projets <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </a>
                <a href="/cv.pdf" className="btn">
                  <Download className="h-4 w-4" strokeWidth={1.5} /> Mon CV
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
              className="mx-auto w-full max-w-xs"
            >
              <div className="frame relative flex aspect-[4/5] items-center justify-center">
                <Braces className="h-16 w-16 text-[var(--accent)]" strokeWidth={1} />
              </div>
              <div className="cap mt-3 flex items-center justify-between">
                <span>Fig. 01</span>
                <span>Dakar, SN</span>
              </div>
            </motion.div>
          </div>

          <div className="mt-20 grid grid-cols-3 divide-x divide-[var(--line)] border-t border-[var(--line)] pt-8">
            {stats.map((stat) => (
              <div key={stat.label} className="px-4 first:pl-0 sm:px-8">
                <p className="font-display text-3xl font-medium text-[var(--ink)] sm:text-4xl">{stat.value}</p>
                <p className="cap mt-2">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t border-[var(--line)] pt-8">
            {stack.map((tool, i) => (
              <span key={tool} className="font-mono flex items-center gap-3 text-xs text-[var(--mute)]">
                {tool}
                {i < stack.length - 1 && <span className="hidden h-3 w-px bg-[var(--line)] sm:block" />}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* WORK */}
      <section id="work" className="border-t border-[var(--line)] pb-28 pt-24">
        <div className="container">
          <div className="grid gap-8 border-b border-[var(--line)] pb-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="eyebrow">Dans les coulisses</p>
              <h2 className="font-display mt-4 text-4xl font-medium leading-tight text-[var(--ink)] sm:text-5xl">
                Concevoir des expériences qui simplifient la vie.
              </h2>
            </div>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-sm text-sm leading-6 text-[var(--mute)]">
                Je conçois des interfaces claires et intuitives, pensées pour résoudre de vrais problèmes utilisateurs.
              </p>
              <div className="flex items-center gap-3 border border-[var(--line)] py-2 pl-3 pr-4">
                <span className="avail-dot" />
                <span className="cap">Disponible pour projets</span>
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <motion.a
                key={project.title}
                href={project.demo}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="card group flex flex-col p-8"
              >
                <div className="flex items-start justify-between">
                  <span className="cap">{project.index}</span>
                  <ArrowUpRight
                    className="h-4 w-4 -translate-y-1 translate-x-1 text-[var(--accent)] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
                    strokeWidth={1.5}
                  />
                </div>
                <project.icon className="mt-10 h-8 w-8 text-[var(--ink)]" strokeWidth={1} />
                <h3 className="font-display mt-8 text-xl font-medium text-[var(--ink)]">{project.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--mute)]">{project.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* NEURAL EXHIBIT */}
      <section className="border-t border-[var(--line)] bg-[var(--surface)]">
        <div className="container">
          <NeuralExhibit />
        </div>
      </section>

      {/* ABOUT + SKILLS */}
      <section id="about" className="border-t border-[var(--line)] py-24">
        <div className="container grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow">À propos</p>
            <h2 className="font-display mt-4 text-3xl font-medium text-[var(--ink)] sm:text-4xl">Parcours</h2>
            <div className="mt-8 space-y-6 border-t border-[var(--line)] pt-6">
              {timeline.map((item) => (
                <div key={item.year} className="grid grid-cols-[3.5rem_1fr] gap-4">
                  <span className="font-mono text-sm text-[var(--mute)]">{item.year}</span>
                  <div>
                    <p className="font-display text-base font-medium text-[var(--ink)]">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--mute)]">{item.details}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-6">
              <p className="eyebrow eyebrow-light">Certifications</p>
              <div className="mt-6 space-y-3">
                {certifications.map((cert) => (
                  <div key={cert.title} className="grid gap-1">
                    <p className="font-display text-base font-medium text-[var(--ink)]">{cert.title}</p>
                    <p className="text-sm text-[var(--mute)]">{cert.year}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="eyebrow">Compétences</p>
            <h2 className="font-display mt-4 text-3xl font-medium text-[var(--ink)] sm:text-4xl">Stack technique</h2>
            <div className="mt-8 grid gap-px bg-[var(--line)] sm:grid-cols-2">
              {skills.map((group) => (
                <div key={group.category} className="card p-6">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.5} />
                    <h3 className="font-display text-base font-medium text-[var(--ink)]">{group.category}</h3>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span key={item} className="tag">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="border-t border-[var(--line)] py-24">
        <div className="container">
          <p className="eyebrow">Services</p>
          <h2 className="font-display mt-4 text-3xl font-medium text-[var(--ink)] sm:text-4xl">Comment je peux aider</h2>
          <div className="mt-12 grid gap-px bg-[var(--line)] sm:grid-cols-2 xl:grid-cols-4">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.07 }}
                viewport={{ once: true }}
                className="card p-7"
              >
                <div className="flex h-10 w-10 items-center justify-center border border-[var(--line-strong)]">
                  <service.icon className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.5} />
                </div>
                <h3 className="font-display mt-6 text-lg font-medium text-[var(--ink)]">{service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--mute)]">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="border-y border-[var(--line)] py-28">
        <div className="container grid gap-16 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="eyebrow">Contact</p>
            <h2 className="font-display mt-4 text-4xl font-medium leading-tight text-[var(--ink)] sm:text-5xl">
              Discutons de votre <span className="font-serif text-[var(--accent)]">prochain projet.</span>
            </h2>
            <p className="mt-6 max-w-md text-[1.02rem] leading-8 text-[var(--mute)]">
              Disponible pour des missions freelances ou des collaborations en
              startup. Réponse sous 24h avec une proposition claire.
            </p>
            <div className="mt-10 flex flex-col divide-y divide-[var(--line)] border-t border-[var(--line)]">
              <a href="mailto:papendiaye511@gmail.com" className="group flex items-center justify-between py-4">
                <span className="flex items-center gap-3 text-sm text-[var(--ink)]">
                  <Mail className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.5} /> papendiaye511@gmail.com
                </span>
                <ArrowUpRight className="h-4 w-4 text-[var(--mute)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" strokeWidth={1.5} />
              </a>
              <a href="https://github.com/llmnd" className="group flex items-center justify-between py-4">
                <span className="flex items-center gap-3 text-sm text-[var(--ink)]">
                  <Github className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.5} /> GitHub
                </span>
                <ArrowUpRight className="h-4 w-4 text-[var(--mute)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" strokeWidth={1.5} />
              </a>
              <a href="https://linkedin.com/in/votreprofil" className="group flex items-center justify-between py-4">
                <span className="flex items-center gap-3 text-sm text-[var(--ink)]">
                  <Linkedin className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.5} /> LinkedIn
                </span>
                <ArrowUpRight className="h-4 w-4 text-[var(--mute)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="frame space-y-7 p-8"
          >
            <div>
              <label htmlFor="name" className="cap">Nom</label>
              <input id="name" name="name" type="text" required className="field mt-2" />
            </div>
            <div>
              <label htmlFor="email" className="cap">Email</label>
              <input id="email" name="email" type="email" required className="field mt-2" />
            </div>
            <div>
              <label htmlFor="message" className="cap">Message</label>
              <textarea id="message" name="message" rows={4} required className="field mt-2 resize-none" />
            </div>
            <button type="submit" className="btn-solid w-full justify-center">
              Envoyer <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </motion.form>
        </div>
      </section>

      <footer className="py-8">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="cap">© 2026 — Dakar, SN</p>
          <div className="cap flex items-center gap-6">
            <a href="#about" className="hover-line">À propos</a>
            <a href="#work" className="hover-line">Projets</a>
            <a href="#contact" className="hover-line">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}