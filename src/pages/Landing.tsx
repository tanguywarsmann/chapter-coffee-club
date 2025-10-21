import * as React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import LogoVreadPng from "@/components/brand/LogoVreadPng";
import AppFooter from "@/components/layout/AppFooter";

// === Logo animé (flottement + halo) avec respect prefers-reduced-motion ===
function AnimatedLogo() {
  return (
    <div className="relative">
      <style>{`
        @keyframes vread-float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        @keyframes vread-glow {
          0% { box-shadow: 0 20px 40px rgba(0,0,0,0.25), 0 0 0 0 rgba(238,220,200,0.35); }
          50% { box-shadow: 0 28px 50px rgba(0,0,0,0.28), 0 0 0 10px rgba(238,220,200,0.12); }
          100% { box-shadow: 0 20px 40px rgba(0,0,0,0.25), 0 0 0 0 rgba(238,220,200,0.35); }
        }
        @keyframes pop {
          0% { transform: translateY(6px) scale(0.9); opacity: 0; }
          60% { transform: translateY(-2px) scale(1.04); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .vread-anim { animation: none !important; }
          .vread-pop { animation: none !important; }
        }
      `}</style>

      <div
        className="vread-anim mx-auto rounded-3xl border-4 border-[#EEDCC8] bg-white/5 p-7 backdrop-blur-sm"
        style={{ animation: "vread-float 5s ease-in-out infinite, vread-glow 5s ease-in-out infinite" }}
        aria-hidden="true"
      >
        <LogoVreadPng size={112} className="h-24 w-24 sm:h-28 sm:w-28" />
      </div>
    </div>
  );
}

// === Démo interactive : "10 livres → 2 finis" ===
function BooksCompletionDemo() {
  const [played, setPlayed] = React.useState(false);

  const handlePlay = () => setPlayed(true);
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPlayed(false);
  };

  // Indices des livres "finis" (0-based)
  const finishedIndices = [1, 7]; // visuellement équilibré

  return (
    <section className="mt-10 w-full">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <p className="font-serif text-white/95 text-xl sm:text-2xl">
          Sur 10 livres achetés, seulement 2 sont finis
        </p>

        {/* Pile cliquable */}
        <div
          onClick={handlePlay}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handlePlay()}
          aria-label="Cliquer pour voir combien de livres sont terminés"
          className="group mt-6 select-none outline-none"
        >
          {/* Rangée de base (10 livres grisés) */}
          <ol
            className="mx-auto grid w-[320px] grid-cols-10 items-end gap-2 sm:w-[360px] md:w-[420px]"
            aria-hidden="true"
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <li key={`base-${i}`} className="flex justify-center">
                <div className="h-16 w-6 rounded-md bg-white/15 ring-1 ring-white/25 shadow-sm sm:h-20 sm:w-7 md:h-24 md:w-8" />
              </li>
            ))}
          </ol>

          {/* Couche "finis" qui apparaît à l'animation */}
          <ol
            className="pointer-events-none -mt-[88px] mx-auto grid w-[320px] grid-cols-10 items-end gap-2 sm:w-[360px] sm:-mt-[110px] md:w-[420px] md:-mt-[132px]"
            aria-hidden="true"
          >
            {Array.from({ length: 10 }).map((_, i) => {
              const isFinished = finishedIndices.includes(i);
              return (
                <li key={`top-${i}`} className="flex justify-center">
                  <div
                    className={[
                      "h-16 w-6 rounded-md ring-1 shadow-md sm:h-20 sm:w-7 md:h-24 md:w-8",
                      isFinished
                        ? "bg-white ring-[#EEDCC8] vread-pop"
                        : "bg-transparent ring-transparent",
                    ].join(" ")}
                    style={{
                      animation: isFinished && played ? `pop ${280 + i * 30}ms ease-out both` : "none",
                      opacity: isFinished ? (played ? 1 : 0) : 0,
                    }}
                  />
                </li>
              );
            })}
          </ol>
        </div>

        {/* Légende compacte alignée */}
        <div className="mt-3 flex items-center gap-3 text-white/90">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-5 rounded-sm bg-white/15 ring-1 ring-white/25" />
            <span className="text-sm">achetés</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-5 rounded-sm bg-white ring-1 ring-[#EEDCC8]" />
            <span className="text-sm">finis</span>
          </div>
        </div>

        {/* Actions fines */}
        <div className="mt-4 flex items-center gap-4">
          {!played ? (
            <span className="text-sm text-white/80">Clique sur la pile</span>
          ) : (
            <button
              onClick={handleReset}
              className="text-sm text-white/90 underline decoration-white/60 underline-offset-4 hover:text-white"
            >
              Rejouer
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <>
      <Helmet>
        <title>VREAD | Finis tes livres</title>
        <meta
          name="description"
          content="Sur 10 livres achetés, seulement 2 sont finis. VREAD transforme ta lecture en preuves concrètes."
        />
        <meta property="og:title" content="VREAD | Finis tes livres" />
        <meta
          property="og:description"
          content="Segments. Question. Validation. Si ce n’est pas sur VREAD, tu ne l’as pas lu."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.vread.fr/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="VREAD | Finis tes livres" />
        <meta
          name="twitter:description"
          content="Segments. Question. Validation. Si ce n’est pas sur VREAD, tu ne l’as pas lu."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-reed-primary via-reed-primary to-reed-secondary">
        <section className="relative px-4 py-24" role="banner">
          <div className="mx-auto flex max-w-screen-xl flex-col items-center text-center">
            <AnimatedLogo />
            <BooksCompletionDemo />

            {/* CTA massif blanc */}
            <div className="mt-8">
              <Button
                size="lg"
                className="bg-white px-12 py-6 text-xl font-bold text-reed-primary shadow-2xl transition-transform duration-150 hover:scale-105 hover:bg-reed-light hover:text-reed-darker focus:ring-4 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-reed-primary"
                asChild
              >
                <Link to="/auth" aria-label="Commencer avec VREAD pour finir mes livres">
                  Finir mes livres
                </Link>
              </Button>
            </div>

            {/* Slogan */}
            <p className="mt-6 text-white/90">
              Si ce n’est pas sur VREAD, tu ne l’as pas lu.
            </p>
          </div>
        </section>
      </div>

      <AppFooter />
    </>
  );
}
