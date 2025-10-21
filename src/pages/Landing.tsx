import * as React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, Trophy, Users } from "lucide-react";
import LogoVreadPng from "@/components/brand/LogoVreadPng";
import AppFooter from "@/components/layout/AppFooter";

// -----------------------------
// Helpers
// -----------------------------
function k(n: number | undefined) {
  if (typeof n !== "number") return "0";
  if (n < 1000) return String(n);
  if (n < 10000) return (n / 1000).toFixed(1) + "k";
  return Math.round(n / 1000) + "k";
}

// -----------------------------
// Internal components (inline)
// -----------------------------
function ViralHero() {
  return (
    <section className="relative px-4 py-20">
      <div className="mx-auto flex max-w-screen-xl flex-col items-center gap-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-3xl border-4 border-[#EEDCC8] p-6 shadow-2xl">
            <LogoVreadPng size={96} className="h-20 w-20 sm:h-24 sm:w-24" />
          </div>
        </div>

        <h1 className="font-serif text-white sm:text-5xl md:text-6xl lg:text-7xl">
          Si ce n’est pas sur VREAD, tu ne l’as pas lu.
        </h1>

        <p className="max-w-2xl text-white/95 md:text-xl">
          Ta lecture devient une preuve. Segments. Question. Validation.
        </p>

        <div
          className="mt-2 flex flex-col gap-4 sm:flex-row sm:justify-center"
          role="group"
          aria-label="Actions principales"
        >
          <Button
            size="lg"
            className="bg-reed-light px-10 py-6 text-lg font-bold text-reed-darker shadow-xl transition-transform duration-150 hover:scale-105 hover:bg-reed-secondary hover:text-white focus:ring-4 focus:ring-reed-light/50 focus:ring-offset-2 focus:ring-offset-reed-primary"
            asChild
          >
            <Link to="/auth" aria-label="Commencer sur VREAD">Commencer</Link>
          </Button>

          {/* Bouton blog PLEIN (non transparent) */}
          <Button
            size="lg"
            className="bg-white px-10 py-6 text-lg font-bold text-reed-primary shadow-xl transition-transform duration-150 hover:scale-105 hover:bg-reed-light hover:text-reed-darker focus:ring-4 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-reed-primary"
            asChild
          >
            <Link to="/blog" aria-label="Découvrir le blog VREAD">Découvrir le blog</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function StatsStrip() {
  // Remplacer par des données réelles si disponibles
  const segments = 12840;
  const minutesWeek = 45230;
  const active = 3610;

  const items = [
    { icon: BookOpen, label: "Segments validés", value: k(segments) },
    { icon: Trophy, label: "Minutes lues cette semaine", value: k(minutesWeek) },
    { icon: Users, label: "Lecteurs actifs", value: k(active) },
  ];

  return (
    <section className="px-4 pb-6">
      <div className="mx-auto grid max-w-screen-xl gap-4 md:grid-cols-3">
        {items.map(({ icon: Icon, label, value }, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white/15 p-5 text-center text-white backdrop-blur-sm ring-1 ring-white/20 shadow-sm"
          >
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-reed-light/20">
              <Icon className="h-6 w-6 text-reed-light" aria-hidden="true" />
            </div>
            <p className="text-2xl font-semibold">{value}</p>
            <p className="text-sm text-white/90">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LiveTicker() {
  const demo = React.useMemo(
    () => [
      "Léa vient de valider Les Misérables, segment 3",
      "Ilyes a repris La Chatte, segment 2",
      "Zoé a tenu 22 min sur Candide",
      "Noah a rejoint le défi 7 jours",
      "Maya a validé Gatsby, segment 1",
      "Yanis a débloqué le badge Série 5",
    ],
    []
  );
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % demo.length), 2200);
    return () => clearInterval(id);
  }, [demo.length]);

  return (
    <section aria-label="Activité en direct" className="px-4 py-6">
      <div className="mx-auto max-w-screen-xl overflow-hidden rounded-2xl bg-white/12 backdrop-blur-sm ring-1 ring-white/20">
        <p
          className="h-12 px-6 flex items-center justify-center text-white/95 text-sm md:text-base transition-opacity duration-150"
          aria-live="polite"
          role="status"
        >
          {demo[index]}
        </p>
      </div>
    </section>
  );
}

function ProofDemo() {
  const [answer, setAnswer] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "ok" | "ko">("idle");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(answer.trim().toLowerCase() === "rose" ? "ok" : "ko");
  }

  return (
    <section className="px-4 py-14">
      <div className="mx-auto max-w-screen-md">
        <Card className="rounded-2xl bg-white/10 ring-1 ring-white/25 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-center font-serif text-2xl text-white">
              Essaie en 10 secondes
            </CardTitle>
            <CardDescription className="text-center text-white/90">
              Réponds avec un seul mot pour valider.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-center italic text-white">
              « La fleur était d’un <strong>rose</strong> éclatant. »
            </p>
            <form
              onSubmit={onSubmit}
              className="mx-auto flex max-w-sm flex-col items-center gap-4"
            >
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value.replace(/\s+/g, ""))}
                onKeyDown={(e) => {
                  if (e.key === " ") e.preventDefault();
                }}
                placeholder="Ta réponse (un mot)"
                className="bg-white"
                aria-label="Réponse en un mot"
              />
              <Button
                type="submit"
                className="bg-reed-light font-bold text-reed-darker hover:bg-reed-secondary hover:text-white"
              >
                Valider
              </Button>
              {status === "ok" && (
                <p role="status" className="text-green-200">
                  Validé. Tu vois la preuve.
                </p>
              )}
              {status === "ko" && (
                <p role="status" className="text-red-200">
                  Ce n’est pas ça. Réessaie.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function ChallengeCTA() {
  return (
    <section className="px-4 pb-12">
      <div className="mx-auto max-w-screen-md">
        <Card className="rounded-2xl bg-white/12 ring-1 ring-white/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl text-white">
              Défi 7 jours Focus
            </CardTitle>
            <CardDescription className="text-white/90">
              Un segment par jour. Une preuve par jour.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pb-8">
            <Button
              size="lg"
              className="bg-reed-light px-8 text-reed-darker font-bold hover:bg-reed-secondary hover:text-white"
              asChild
            >
              <Link to="/auth?challenge=7d">Rejoindre le défi</Link>
            </Button>
            <Link
              to="#proof-demo"
              className="text-sm text-white/90 underline decoration-white/50 underline-offset-4"
            >
              Voir comment ça marche
            </Link>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function WallOfLove() {
  const quotes = [
    { text: "J’ai relu. J’ai tenu. VREAD m’a aidé.", author: "Camille" },
    { text: "Enfin une preuve concrète.", author: "Marc" },
    { text: "Moins d’écrans. Plus de pages.", author: "Salomé" },
  ];

  async function share() {
    const shareData = {
      title: "VREAD",
      text: "Je me lance. Ma lecture devient une preuve.",
      url: typeof window !== "undefined" ? window.location.href : "https://www.vread.fr",
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            shareData.url
          )}`,
          "_blank",
          "noopener,noreferrer"
        );
      }
    } catch {
      // noop
    }
  }

  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-screen-xl">
        <h2 className="mb-8 text-center font-serif text-3xl font-bold text-white md:text-4xl">
          Ce que disent nos lecteurs
        </h2>
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
          {quotes.map((q, i) => (
            <Card
              key={i}
              className="rounded-2xl bg-white/12 p-4 text-white ring-1 ring-white/20 backdrop-blur-sm"
            >
              <CardContent className="p-4">
                <p className="mb-3 text-white/95">“{q.text}”</p>
                <p className="text-sm text-white/80">— {q.author}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Button
            onClick={share}
            className="bg-white px-6 py-5 font-semibold text-reed-primary hover:bg-reed-light hover:text-reed-darker"
            aria-label="Partager mon objectif"
          >
            Partager mon objectif
          </Button>
        </div>
      </div>
    </section>
  );
}

// -----------------------------
// Page
// -----------------------------
export default function Landing() {
  return (
    <>
      <Helmet>
        <title>VREAD | Lis mieux, chaque jour</title>
        <meta
          name="description"
          content="Ta lecture devient une preuve. Segments. Question. Validation. Reprends le contrôle."
        />
        <meta property="og:title" content="VREAD | Lis mieux, chaque jour" />
        <meta
          property="og:description"
          content="Ta lecture devient une preuve. Segments. Question. Validation."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.vread.fr/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="VREAD | Lis mieux, chaque jour" />
        <meta
          name="twitter:description"
          content="Ta lecture devient une preuve. Segments. Question. Validation."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-reed-primary via-reed-primary to-reed-secondary">
        <ViralHero />
        <StatsStrip />
        <LiveTicker />
        <div id="proof-demo">
          <ProofDemo />
        </div>
        <ChallengeCTA />
        <WallOfLove />
      </div>

      <AppFooter />
    </>
  );
}
