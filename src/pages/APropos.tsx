import { Helmet } from "react-helmet-async";

export default function APropos() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <Helmet>
        <title>À propos – VREAD</title>
        <link rel="canonical" href="https://www.vread.fr/a-propos" />
      </Helmet>

      <h1 className="text-3xl font-bold mb-6">À propos</h1>
      <p className="text-base leading-relaxed">
        VREAD accompagne la lecture, page après page. Découvre la méthode, la progression, et la vision derrière l'app.
      </p>
    </main>
  );
}