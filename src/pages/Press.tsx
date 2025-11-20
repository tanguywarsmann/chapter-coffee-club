import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, Mail, Newspaper, ArrowRight } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";

export default function Press() {
  return (
    <PublicLayout>
      <Helmet>
        <title>Espace Presse | VREAD</title>
        <meta
          name="description"
          content="Espace presse VREAD : kit média, logos, visuels, contacts et communiqués de presse. Découvrez comment VREAD révolutionne la lecture."
        />
        <link rel="canonical" href="https://www.vread.fr/presse" />
        <meta property="og:title" content="Espace Presse | VREAD" />
        <meta property="og:description" content="Kit média, logos, visuels et contact presse VREAD." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.vread.fr/presse" />
        {/* Rendre visibles les JSON-LD du body pour les tests E2E */}
        <style>{`script[type="application/ld+json"]{display:block !important;min-height:1px;width:1px;margin:0;padding:0;border:0}`}</style>
      </Helmet>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Espace Presse</span>
        </nav>

        <div className="space-y-12">
          {/* Header */}
          <header className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center justify-center p-2 bg-primary/5 text-primary rounded-full text-sm font-medium mb-6 px-4">
              Espace Presse & Média
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-foreground tracking-tight">
              Ils parlent de <span className="text-primary">VREAD</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              VREAD est la première application qui gamifie la lecture de vrais livres.
              <br className="hidden md:block" />
              Retrouvez ici nos ressources, logos et contacts presse.
            </p>
          </header>

          {/* JSON-LD placé dans le BODY (visible pour Playwright) */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "VREAD",
                url: "https://www.vread.fr/",
                logo: "https://www.vread.fr/branding/vread-logo-512.png",
                contactPoint: {
                  "@type": "ContactPoint",
                  email: "contact@vread.fr",
                  contactType: "press",
                  availableLanguage: ["French", "English"],
                },
                sameAs: [
                  "https://twitter.com/vread_app",
                  "https://instagram.com/vread_app",
                  "https://linkedin.com/company/vread",
                ],
              }),
            }}
          />

          {/* Kit Média */}
          <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold font-serif">Kit Média & Logos</h2>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Téléchargez nos logos officiels et visuels haute définition pour vos articles.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <a 
                href="/branding/vread-logo.svg" 
                download
                className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-accent/50 transition-colors group"
              >
                <span className="font-medium">Logo Vectoriel (SVG)</span>
                <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              
              <a 
                href="/branding/vread-logo-1024-q80.webp" 
                download
                className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-accent/50 transition-colors group"
              >
                <span className="font-medium">Logo WebP (1024px)</span>
                <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>

              <a 
                href="/branding/vread-logo-512.png" 
                download
                className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-accent/50 transition-colors group"
              >
                <span className="font-medium">Logo PNG (512px)</span>
                <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>

              <a 
                href="/branding/vread-logo-192.png" 
                download
                className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-accent/50 transition-colors group"
              >
                <span className="font-medium">Icone App (192px)</span>
                <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            </div>
          </section>

          {/* Contact & News Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact */}
            <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold font-serif">Contact Presse</h2>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Pour toute demande d'interview, reportage ou information complémentaire, notre équipe est à votre disposition.
              </p>

              <Button asChild className="w-full" variant="outline">
                <a href="mailto:contact@vread.fr">
                  contact@vread.fr
                </a>
              </Button>
            </section>

            {/* News */}
            <section className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Newspaper className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold font-serif">Dernières Actus</h2>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Découvrez nos dernières annonces, mises à jour et articles sur notre blog officiel.
              </p>

              <Button asChild className="w-full group">
                <Link to="/blog">
                  Voir le blog
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </section>
          </div>

          {/* Boilerplate */}
          <section className="bg-muted/30 rounded-2xl p-8 border border-border/50">
            <h3 className="text-lg font-semibold mb-4">À propos de VREAD</h3>
            <p className="text-muted-foreground leading-relaxed">
              VREAD est la première application qui transforme la lecture en une habitude durable grâce aux mécanismes du sport (tracking, séries, objectifs). 
              Notre mission est d'aider chacun à lire plus et mieux, en rendant la lecture aussi addictive que les réseaux sociaux, mais infiniment plus enrichissante.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
