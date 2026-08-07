export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-[var(--mute)] mb-8">Page non trouvée</p>
        <a href="/" className="btn">Retour à l'accueil</a>
      </div>
    </div>
  );
}
