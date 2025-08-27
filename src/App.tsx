import React, { useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import About from './pages/About';
import Press from './pages/Press';

function NotFound() {
  return (
    <main className="max-w-3xl mx-auto p-6 text-center">
      <Helmet>
        <title>404 | VREAD</title>
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="https://www.vread.fr/404" />
      </Helmet>
      <h1 className="text-4xl font-semibold mb-4">404</h1>
      <p className="mb-8">La page demandée est introuvable.</p>
      <div data-testid="not-found" />
      <Link to="/" className="underline">Retour à l’accueil</Link>
    </main>
  );
}

function Home() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <Helmet>
        <title>VREAD — Lire mieux, plus souvent</title>
        <meta name="description" content="VREAD aide à lire mieux et plus souvent grâce à des checkpoints et des questions de validation." />
        <link rel="canonical" href="https://www.vread.fr/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="VREAD — Lire mieux, plus souvent" />
        <meta property="og:url" content="https://www.vread.fr/" />
      </Helmet>
      <h1 className="text-4xl font-semibold mb-6">VREAD</h1>
      <p className="text-lg mb-8">L’appli qui t’accompagne dans ta lecture, page après page.</p>
    </main>
  );
}

function IndexHtmlRedirect() {
  const loc = useLocation();
  const nav = useNavigate();
  useEffect(() => {
    if (loc.pathname.endsWith('/index.html')) {
      const target = loc.pathname.replace(/\/index\.html$/, '') || '/';
      nav(target || '/', { replace: true });
    }
  }, [loc.pathname, nav]);
  return null;
}

export default function App() {
  return (
    <>
      <IndexHtmlRedirect />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/a-propos" element={<About />} />
        <Route path="/presse" element={<Press />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <footer className="max-w-3xl mx-auto p-6 border-t mt-12">
        <nav className="flex gap-6">
          <Link to="/a-propos">À propos</Link>
          <Link to="/presse">Presse</Link>
        </nav>
      </footer>
    </>
  );
}
