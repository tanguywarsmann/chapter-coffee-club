import { Helmet } from "react-helmet-async";

export default function Presse() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <Helmet>
        <title>Presse – VREAD</title>
        <link rel="canonical" href="https://www.vread.fr/presse" />
      </Helmet>

      <h1 className="text-3xl font-bold mb-6">Presse</h1>
      <p className="text-base leading-relaxed">
        Dossier de présentation, chiffres clés, visuels officiels, et contact.
      </p>
    </main>
  );
}