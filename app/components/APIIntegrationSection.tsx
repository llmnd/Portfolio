import {
  ArrowDown,
  ArrowRight,
  Braces,
  Check,
  Code2,
  CreditCard,
  Database,
  FileJson2,
  KeyRound,
  Layers3,
  Server,
  Workflow,
} from 'lucide-react';

const skills = [
  'REST API Integration',
  'JSON & HTTP/HTTPS',
  'OAuth 2.0',
  'Bearer Tokens & API Keys',
  'Python / FastAPI',
  'Node.js',
  'PHP',
  'PostgreSQL / SQL',
  'Third-party API Integration',
  'Payment Gateway Integration',
];

const integrationSteps = [
  {
    number: '01',
    title: 'API Documentation & Requirements',
    detail: 'Clarifier les besoins, les données attendues et les contraintes de chaque système.',
    icon: FileJson2,
  },
  {
    number: '02',
    title: 'Authentication & Authorization',
    detail: 'Choisir le mécanisme adapté au projet : OAuth 2.0, Bearer Token ou API Key.',
    icon: KeyRound,
  },
  {
    number: '03',
    title: 'API Requests & JSON Data Exchange',
    detail: 'Structurer les requêtes HTTP et les échanges de données JSON entre applications.',
    icon: Braces,
  },
  {
    number: '04',
    title: 'Testing, Error Handling & Validation',
    detail: 'Vérifier les réponses, valider les données et traiter les erreurs d’intégration.',
    icon: Check,
  },
  {
    number: '05',
    title: 'Deployment & Integration Monitoring',
    detail: 'Déployer l’intégration et suivre son comportement dans son environnement.',
    icon: Workflow,
  },
];

interface FlowProps {
  steps: { label: string; icon: typeof Server }[];
  label: string;
}

function ArchitectureFlow({ steps, label }: FlowProps) {
  return (
    <ol className="api-flow" aria-label={label}>
      {steps.map(({ label: stepLabel, icon: Icon }, index) => (
        <li className="api-flow-node" key={stepLabel}>
          <span className="api-flow-icon"><Icon aria-hidden="true" /></span>
          <span className="api-flow-label">{stepLabel}</span>
          {index < steps.length - 1 && (
            <span className="api-flow-connector" aria-hidden="true">
              <ArrowRight className="api-flow-arrow" />
              <ArrowDown className="api-flow-down" />
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

export default function APIIntegrationSection() {
  return (
    <section id="api-integration" className="api-section">
      <div className="api-orb api-orb-one" aria-hidden="true" />
      <div className="api-orb api-orb-two" aria-hidden="true" />

      <div className="container api-container">
        <header className="api-heading">
          <span className="api-eyebrow"><span /> API INTEGRATION &amp; PAYMENT SYSTEMS</span>
          <h2>API Integration &amp;<br className="hidden sm:block" /> Payment Systems</h2>
          <div className="api-intro">
            <h3>Connecting Systems.<br />Powering Business.</h3>
            <p>
              Building reliable integrations between business applications, e-commerce platforms
              and third-party services through REST APIs.
            </p>
          </div>
        </header>

        <div className="api-capabilities">
          <div className="api-subheading">
            <span className="api-kicker">CORE CAPABILITIES</span>
            <p>Les outils et protocoles mobilisés selon les besoins de chaque projet.</p>
          </div>
          <ul className="api-skill-list" aria-label="Compétences API et paiement">
            {skills.map((skill) => (
              <li key={skill} className="api-skill">
                <span className="api-skill-dot" aria-hidden="true" />
                {skill === 'OAuth 2.0' ? 'OAuth 2.0 · selon les projets' : skill}
              </li>
            ))}
          </ul>
        </div>

        <div className="api-projects">
          <div className="api-project-heading">
            <div>
              <span className="api-kicker">SELECTED INTEGRATIONS</span>
              <h3>Des systèmes qui communiquent.</h3>
            </div>
            <p>Deux cas concrets d’interconnexion entre outils métier et services en ligne.</p>
          </div>

          <div className="api-project-grid">
            <article className="api-project-card">
              <div className="api-project-topline">
                <span className="api-project-index">01 / E-COMMERCE</span>
                <span className="api-project-mark"><Layers3 aria-hidden="true" /></span>
              </div>
              <h4>FISAFI Groupe</h4>
              <p className="api-project-title">Odoo API &amp; E-commerce</p>
              <p className="api-project-copy">
                Connexion de l’API Odoo au site e-commerce de FISAFI Groupe pour récupérer les
                produits du système de gestion et alimenter le catalogue en ligne.
              </p>
              <ul className="api-deliverables">
                <li><Check aria-hidden="true" /> Connexion du site e-commerce à l’API Odoo</li>
                <li><Check aria-hidden="true" /> Récupération des données produits en JSON</li>
                <li><Check aria-hidden="true" /> Échanges entre le système de gestion et le frontend</li>
                <li><Check aria-hidden="true" /> Exploitation des données pour le catalogue en ligne</li>
              </ul>
              <div className="api-diagram">
                <span className="api-kicker">ARCHITECTURE D’INTÉGRATION</span>
                <ArchitectureFlow
                  label="Odoo ERP vers le site e-commerce"
                  steps={[
                    { label: 'Odoo ERP', icon: Database },
                    { label: 'REST API', icon: Workflow },
                    { label: 'Backend / Integration Layer', icon: Server },
                    { label: 'E-commerce Website', icon: Code2 },
                  ]}
                />
              </div>
              <div className="api-tech-list" aria-label="Technologies utilisées">
                {['Odoo API', 'REST API', 'JSON', 'Backend', 'E-commerce'].map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
            </article>

            <article className="api-project-card">
              <div className="api-project-topline">
                <span className="api-project-index">02 / ONLINE PAYMENT</span>
                <span className="api-project-mark"><CreditCard aria-hidden="true" /></span>
              </div>
              <h4>PayTech</h4>
              <p className="api-project-title">Online Payment Integration</p>
              <p className="api-project-copy">
                Intégration de PayTech, prestataire externe, dans une application afin de permettre
                le paiement en ligne et de relier le parcours de paiement au service distant.
              </p>
              <ul className="api-deliverables">
                <li><Check aria-hidden="true" /> Intégration d’une API de paiement tierce</li>
                <li><Check aria-hidden="true" /> Communication entre l’application et PayTech</li>
                <li><Check aria-hidden="true" /> Intégration dans le parcours de paiement</li>
                <li><Check aria-hidden="true" /> Gestion des échanges avec le prestataire</li>
              </ul>
              <div className="api-diagram">
                <span className="api-kicker">PAYMENT FLOW</span>
                <ArchitectureFlow
                  label="Application vers le résultat du paiement via PayTech"
                  steps={[
                    { label: 'Application', icon: Code2 },
                    { label: 'Payment API', icon: Workflow },
                    { label: 'PayTech', icon: CreditCard },
                    { label: 'Payment Result', icon: Check },
                  ]}
                />
              </div>
              <div className="api-tech-list" aria-label="Technologies utilisées">
                {['PayTech', 'Payment API', 'Online Payment', 'Third-party Integration'].map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
            </article>
          </div>
        </div>

        <div className="api-process">
          <div className="api-process-heading">
            <span className="api-kicker">HOW I INTEGRATE APIS</span>
            <h3>Un processus clair, de la documentation au suivi.</h3>
          </div>
          <ol className="api-steps">
            {integrationSteps.map(({ number, title, detail, icon: Icon }) => (
              <li className="api-step" key={number}>
                <span className="api-step-icon"><Icon aria-hidden="true" /></span>
                <span className="api-step-number">{number}</span>
                <h4>{title}</h4>
                <p>{detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
