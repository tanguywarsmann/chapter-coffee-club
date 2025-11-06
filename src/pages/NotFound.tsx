
import { Helmet } from "react-helmet-async";

export default function NotFound() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-16 text-center">
      <Helmet>
        <title>404 – Page introuvable | VREAD</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div data-testid="not-found">
        <div className="text-6xl font-extrabold mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Page introuvable</h1>
        <p className="text-base">La page que tu cherches n'existe pas.</p>
      </div>
    </main>
  );
}
