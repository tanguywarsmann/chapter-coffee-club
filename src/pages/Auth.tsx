import * as React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppFooter from "@/components/layout/AppFooter";
import LogoVreadPng from "@/components/brand/LogoVreadPng";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/LanguageContext";
import { LanguageToggle } from "@/components/layout/LanguageToggle";

export default function AuthPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = params.get("mode") === "login" ? "login" : "signup";
  const [mode, setMode] = React.useState<"signup" | "login">(initialMode as "signup" | "login");

  const { signUp, signIn, setError } = useAuth();
  const { t } = useTranslation();

  // signup
  const [sEmail, setSEmail] = React.useState("");
  const [sPwd, setSPwd] = React.useState("");
  const [sPwd2, setSPwd2] = React.useState("");
  const [sLoading, setSLoading] = React.useState(false);
  const [sError, setSErr] = React.useState<string | null>(null);

  // login
  const [lEmail, setLEmail] = React.useState("");
  const [lPwd, setLPwd] = React.useState("");
  const [lLoading, setLLoading] = React.useState(false);
  const [lError, setLErr] = React.useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setSErr(null);
    setError(null);
    if (sPwd !== sPwd2) {
      setSErr(t.auth.passwordsDontMatch);
      return;
    }
    setSLoading(true);
    try {
      await signUp(sEmail, sPwd);
      // Redirection immédiate après inscription réussie
      navigate("/home");
    } catch (err: any) {
      setSErr(err?.message ?? t.auth.signupFailed);
    } finally {
      setSLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLErr(null);
    setError(null);
    setLLoading(true);
    try {
      await signIn(lEmail, lPwd);
      navigate("/home");
    } catch (err: any) {
      setLErr(err?.message ?? t.auth.loginFailed);
    } finally {
      setLLoading(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>{t.auth.pageTitle}</title>
        <meta name="description" content={t.auth.pageDescription} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-reed-primary via-reed-primary to-reed-secondary">
        {/* Language toggle in top right */}
        <div className="absolute top-4 right-4 z-50">
          <LanguageToggle />
        </div>
        
        <section className="px-4 py-16">
          <div className="mx-auto flex max-w-md flex-col items-center text-center">
            <div className="rounded-3xl border-4 border-[#EEDCC8] p-4 shadow-xl bg-white/5 backdrop-blur-sm">
              <LogoVreadPng size={72} className="h-16 w-16" />
            </div>

            <h1 className="mt-6 font-serif text-3xl text-white">{t.auth.welcome}</h1>
            <p className="mt-1 text-white/90">{t.auth.firstTimeHere} <strong>{t.auth.createAccountIn30s}</strong></p>

            <Card className="mt-8 w-full rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
              <CardContent className="pt-6">
                <Tabs value={mode} onValueChange={(v) => setMode(v as "signup" | "login")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 rounded-xl bg-white/10 p-1">
                    <TabsTrigger
                      value="signup"
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-reed-primary data-[state=inactive]:text-white/90"
                    >
                      {t.auth.createAccount}
                    </TabsTrigger>
                    <TabsTrigger
                      value="login"
                      className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-reed-primary data-[state=inactive]:text-white/90"
                    >
                      {t.auth.signIn}
                    </TabsTrigger>
                  </TabsList>

                  {/* SIGNUP */}
                  <TabsContent value="signup" className="mt-6">
                    <Card className="border-0 bg-transparent shadow-none">
                      <CardHeader className="px-0">
                        <CardTitle className="text-left text-white">{t.auth.createAccount}</CardTitle>
                        <CardDescription className="text-left text-white/90">Accède à VREAD en quelques secondes.</CardDescription>
                      </CardHeader>
                      <CardContent className="px-0">
                        <form id="signup-form" onSubmit={handleSignup} className="space-y-4">
                            <div className="text-left">
                              <Label htmlFor="s-email" className="text-white/90">{t.auth.email}</Label>
                              <Input id="s-email" type="email" value={sEmail} onChange={(e) => setSEmail(e.target.value)} className="bg-white" required autoComplete="email" />
                            </div>
                            <div className="text-left">
                              <Label htmlFor="s-pwd" className="text-white/90">{t.auth.password}</Label>
                              <Input id="s-pwd" type="password" value={sPwd} onChange={(e) => setSPwd(e.target.value)} className="bg-white" required minLength={6} autoComplete="new-password" />
                            </div>
                            <div className="text-left">
                              <Label htmlFor="s-pwd2" className="text-white/90">{t.auth.confirmPassword}</Label>
                              <Input id="s-pwd2" type="password" value={sPwd2} onChange={(e) => setSPwd2(e.target.value)} className="bg-white" required minLength={6} autoComplete="new-password" />
                            </div>
                            {sError && <p className="text-left text-sm text-red-200">{sError}</p>}
                            <div className="mt-4 flex items-center justify-between">
                              <Button type="submit" disabled={sLoading} className="bg-white px-6 py-5 font-bold text-reed-primary hover:bg-reed-light hover:text-reed-darker disabled:opacity-60">
                                {sLoading ? t.auth.signingUp : t.auth.createAccount}
                              </Button>
                              <button type="button" onClick={() => setMode("login")} className="text-sm text-white/90 underline decoration-white/60 underline-offset-4">
                                {t.auth.alreadyRegistered}
                              </button>
                            </div>
                          </form>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* LOGIN */}
                  <TabsContent value="login" className="mt-6">
                    <Card className="border-0 bg-transparent shadow-none">
                      <CardHeader className="px-0">
                        <CardTitle className="text-left text-white">{t.auth.signIn}</CardTitle>
                        <CardDescription className="text-left text-white/90">Reprends ta lecture.</CardDescription>
                      </CardHeader>
                      <CardContent className="px-0">
                        <form id="login-form" onSubmit={handleLogin} className="space-y-4">
                          <div className="text-left">
                            <Label htmlFor="l-email" className="text-white/90">{t.auth.email}</Label>
                            <Input id="l-email" type="email" value={lEmail} onChange={(e) => setLEmail(e.target.value)} className="bg-white" required autoComplete="email" />
                          </div>
                          <div className="text-left">
                            <Label htmlFor="l-pwd" className="text-white/90">{t.auth.password}</Label>
                            <Input id="l-pwd" type="password" value={lPwd} onChange={(e) => setLPwd(e.target.value)} className="bg-white" required autoComplete="current-password" />
                          </div>
                          {lError && <p className="text-left text-sm text-red-200">{lError}</p>}
                          <div className="mt-4 flex items-center justify-between">
                            <Button type="submit" disabled={lLoading} className="bg-white px-6 py-5 font-bold text-reed-primary hover:bg-reed-light hover:text-reed-darker disabled:opacity-60">
                              {lLoading ? t.auth.loggingIn : t.auth.signIn}
                            </Button>
                            <button type="button" onClick={() => setMode("signup")} className="text-sm text-white/90 underline decoration-white/60 underline-offset-4">
                              {t.auth.firstTimeHere} {t.auth.createAccount}
                            </button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <p className="mt-4 text-xs text-white/80">En créant un compte, tu acceptes nos conditions d'utilisation.</p>
          </div>
        </section>
      </div>

      <AppFooter />
    </>
  );
}

