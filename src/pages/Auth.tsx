import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppFooter from "@/components/layout/AppFooter";
import LogoVreadPng from "@/components/brand/LogoVreadPng";

// Remplace ces imports si tes chemins diffèrent
import SignupForm from "@/components/auth/SignupForm";
import LoginForm from "@/components/auth/LoginForm";

export default function AuthPage() {
  const [params] = useSearchParams();
  const initialMode = params.get("mode") === "login" ? "login" : "signup";
  const [mode, setMode] = React.useState<"signup" | "login">(initialMode as "signup" | "login");

  return (
    <>
      <Helmet>
        <title>VREAD | Créer un compte ou se connecter</title>
        <meta name="description" content="Crée un compte en 30 secondes ou connecte-toi à VREAD." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-reed-primary via-reed-primary to-reed-secondary">
        <section className="px-4 py-16">
          <div className="mx-auto flex max-w-md flex-col items-center text-center">
            {/* Logo compact */}
            <div className="rounded-3xl border-4 border-[#EEDCC8] p-4 shadow-xl bg-white/5 backdrop-blur-sm">
              <LogoVreadPng size={72} className="h-16 w-16" />
            </div>

            <h1 className="mt-6 font-serif text-3xl text-white">Bienvenue</h1>
            <p className="mt-1 text-white/90">
              Première fois ici ? <strong>Crée un compte</strong> en 30 s.
            </p>

            <Card className="mt-8 w-full rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
              <CardContent className="pt-6">
                <Tabs value={mode} onValueChange={(v) => setMode(v as "signup" | "login")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 rounded-xl bg-white/10 p-1">
                    <TabsTrigger
                      value="signup"
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-reed-primary data-[state=inactive]:text-white/90"
                    >
                      Créer un compte
                    </TabsTrigger>
                    <TabsTrigger
                      value="login"
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-reed-primary data-[state=inactive]:text-white/90"
                    >
                      Se connecter
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="signup" className="mt-6">
                    <Card className="border-0 bg-transparent shadow-none">
                      <CardHeader className="px-0">
                        <CardTitle className="text-left text-white">Créer un compte</CardTitle>
                        <CardDescription className="text-left text-white/90">
                          Accède à VREAD en quelques secondes.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-0">
                        {/* Ton formulaire d'inscription existant */}
                        <SignupForm />

                        {/* CTA massif + lien discret vers login */}
                        <div className="mt-4 flex items-center justify-between">
                          <Button
                            type="submit"
                            form="signup-form"     // Assure-toi que ton <form id="signup-form"> existe dans SignupForm
                            className="bg-white px-6 py-5 font-bold text-reed-primary hover:bg-reed-light hover:text-reed-darker"
                          >
                            Créer mon compte
                          </Button>
                          <button
                            type="button"
                            onClick={() => setMode("login")}
                            className="text-sm text-white/90 underline decoration-white/60 underline-offset-4"
                          >
                            Déjà inscrit ? Se connecter
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="login" className="mt-6">
                    <Card className="border-0 bg-transparent shadow-none">
                      <CardHeader className="px-0">
                        <CardTitle className="text-left text-white">Se connecter</CardTitle>
                        <CardDescription className="text-left text-white/90">
                          Reprends ta lecture.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-0">
                        {/* Ton formulaire de connexion existant */}
                        <LoginForm />

                        {/* Lien clair pour basculer vers la création */}
                        <div className="mt-4 text-right">
                          <button
                            type="button"
                            onClick={() => setMode("signup")}
                            className="text-sm text-white/90 underline decoration-white/60 underline-offset-4"
                          >
                            Première fois ? Créer un compte
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Optionnel: aide microcopy en bas */}
            <p className="mt-4 text-xs text-white/80">
              En créant un compte, tu acceptes nos conditions d’utilisation.
            </p>
          </div>
        </section>
      </div>

      <AppFooter />
    </>
  );
}
