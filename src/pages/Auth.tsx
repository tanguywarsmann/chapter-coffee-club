import LogoVreadPng from "@/components/brand/LogoVreadPng";
import { Apple } from "@/components/icons/Apple";
import { Google } from "@/components/icons/Google";
import AppFooter from "@/components/layout/AppFooter";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/LanguageContext";
import { isIOSNative } from "@/utils/platform";
import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function AuthPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialMode = params.get("mode") === "login" ? "login" : "signup";
  const [mode, setMode] = React.useState<"signup" | "login">(initialMode as "signup" | "login");

  const { signUp, signIn, setError, requestPasswordReset, user } = useAuth();
  const { t } = useTranslation();

  // Password visibility
  const [showPassword, setShowPassword] = React.useState(false);

  // Refs for keyboard navigation
  const sEmailRef = React.useRef<HTMLInputElement>(null);
  const sPwdRef = React.useRef<HTMLInputElement>(null);
  const sPwd2Ref = React.useRef<HTMLInputElement>(null);

  const lEmailRef = React.useRef<HTMLInputElement>(null);
  const lPwdRef = React.useRef<HTMLInputElement>(null);

  // signup
  const [sEmail, setSEmail] = React.useState("");
  const [sPwd, setSPwd] = React.useState("");
  const [sPwd2, setSPwd2] = React.useState("");
  const [sLoading, setSLoading] = React.useState(false);

  // login
  const [lEmail, setLEmail] = React.useState("");
  const [lPwd, setLPwd] = React.useState("");
  const [lLoading, setLLoading] = React.useState(false);

  // Gesture handling
  const touchStartX = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    // Swipe threshold
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swiped left
        if (mode === "signup") setMode("login");
      } else {
        // Swiped right
        if (mode === "login") setMode("signup");
      }
    }

    touchStartX.current = null;
  };

  const handleSuccessRedirect = () => {
    // Check for return URL in location state
    const state = location.state as { from?: { pathname: string } } | null;
    const from = state?.from?.pathname;

    if ((isIOSNative() || import.meta.env.DEV) && !user?.user_metadata?.ios_onboarding_done) {
      navigate("/onboarding", { replace: true });
      return;
    }

    navigate(from || "/home", { replace: true });
  };

  const handleSocialLogin = () => {
    toast.info("Not yet implemented, coming soon");
  };

  async function handleSignup(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);

    if (sPwd !== sPwd2) {
      toast.error(t.auth.passwordsDontMatch);
      return;
    }

    setSLoading(true);
    try {
      await signUp(sEmail, sPwd);
      toast.success("Compte créé avec succès !");
      handleSuccessRedirect();
    } catch (err) {
      const message = err instanceof Error ? err.message : t.auth.signupFailed;
      toast.error(message);
    } finally {
      setSLoading(false);
    }
  }

  async function handleLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setLLoading(true);
    try {
      await signIn(lEmail, lPwd);
      toast.success("Connexion réussie !");
      handleSuccessRedirect();
    } catch (err) {
      const message = err instanceof Error ? err.message : t.auth.loginFailed;
      toast.error(message);
    } finally {
      setLLoading(false);
    }
  }

  const handleKeyDown = (
    e: React.KeyboardEvent,
    nextRef: React.RefObject<HTMLInputElement> | null,
    action?: () => void
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      } else if (action) {
        action();
      }
    }
  };


  return (
    <>
      <Helmet>
        <title>{t.auth.pageTitle}</title>
        <meta name="description" content={t.auth.pageDescription} />
      </Helmet>

      <div
        className="min-h-screen bg-gradient-to-br from-reed-primary via-reed-primary to-reed-secondary"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Language toggle in top right */}
        <div className="absolute top-[calc(1rem+env(safe-area-inset-top))] right-4 z-50">
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
                            <Input
                              ref={sEmailRef}
                              id="s-email"
                              name="email"
                              type="email"
                              value={sEmail}
                              onChange={(e) => setSEmail(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, sPwdRef)}
                              className="bg-white"
                              required
                              autoComplete="username"
                              inputMode="email"
                              enterKeyHint="next"
                              autoCapitalize="none"
                              autoCorrect="off"
                              spellCheck={false}
                            />
                          </div>
                          <div className="text-left">
                            <Label htmlFor="s-pwd" className="text-white/90">{t.auth.password}</Label>
                            <div className="relative">
                              <Input
                                ref={sPwdRef}
                                id="s-pwd"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={sPwd}
                                onChange={(e) => setSPwd(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, sPwd2Ref)}
                                className="bg-white pr-10"
                                required
                                minLength={6}
                                autoComplete="new-password"
                                enterKeyHint="next"
                                spellCheck={false}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </div>
                          <div className="text-left">
                            <Label htmlFor="s-pwd2" className="text-white/90">{t.auth.confirmPassword}</Label>
                            <div className="relative">
                              <Input
                                ref={sPwd2Ref}
                                id="s-pwd2"
                                name="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                value={sPwd2}
                                onChange={(e) => setSPwd2(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, null, () => handleSignup())}
                                className="bg-white pr-10"
                                required
                                minLength={6}
                                autoComplete="new-password"
                                enterKeyHint="done"
                                spellCheck={false}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </div>

                          <div className="mt-6 flex flex-col gap-4">
                            <Button type="submit" disabled={sLoading} className="w-full bg-white py-3 font-bold text-reed-primary hover:bg-reed-light hover:text-reed-darker disabled:opacity-60 shadow-lg">
                              {sLoading ? t.auth.signingUp : t.auth.createAccount}
                            </Button>

                            <div className="grid grid-cols-2 gap-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleSocialLogin}
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                              >
                                <Google className="mr-2 h-4 w-4" />
                                Google
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleSocialLogin}
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                              >
                                <Apple className="mr-2 h-4 w-4 fill-current" />
                                Apple
                              </Button>
                            </div>

                            <button type="button" onClick={() => setMode("login")} className="text-sm text-white/90 hover:text-white underline decoration-white/60 underline-offset-4 transition-colors">
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
                            <Input
                              ref={lEmailRef}
                              id="l-email"
                              name="email"
                              type="email"
                              value={lEmail}
                              onChange={(e) => setLEmail(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, lPwdRef)}
                              className="bg-white"
                              required
                              autoComplete="username"
                              inputMode="email"
                              enterKeyHint="next"
                              autoCapitalize="none"
                              autoCorrect="off"
                              spellCheck={false}
                            />
                          </div>
                          <div className="text-left">
                            <Label htmlFor="l-pwd" className="text-white/90">{t.auth.password}</Label>
                            <div className="relative">
                              <Input
                                ref={lPwdRef}
                                id="l-pwd"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={lPwd}
                                onChange={(e) => setLPwd(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, null, () => handleLogin())}
                                className="bg-white pr-10"
                                required
                                autoComplete="current-password"
                                enterKeyHint="done"
                                spellCheck={false}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </div>

                          <div className="mt-6 flex flex-col gap-4">
                            <Button type="submit" disabled={lLoading} className="w-full bg-white py-3 font-bold text-reed-primary hover:bg-reed-light hover:text-reed-darker disabled:opacity-60 shadow-lg">
                              {lLoading ? t.auth.loggingIn : t.auth.signIn}
                            </Button>

                            <div className="grid grid-cols-2 gap-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleSocialLogin}
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                              >
                                <Google className="mr-2 h-4 w-4" />
                                Google
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleSocialLogin}
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                              >
                                <Apple className="mr-2 h-4 w-4 fill-current" />
                                Apple
                              </Button>
                            </div>

                            <button
                              type="button"
                              onClick={async () => {
                                const email = lEmail.trim();
                                if (!email) {
                                  toast.error("Renseigne ton email pour recevoir un lien de réinitialisation");
                                  return;
                                }
                                try {
                                  await requestPasswordReset(email);
                                  toast.success("Email de réinitialisation envoyé. Vérifie ta boîte mail.");
                                } catch (err) {
                                  const message =
                                    err instanceof Error
                                      ? err.message
                                      : "Impossible d'envoyer l'email de réinitialisation";
                                  toast.error(message);
                                }
                              }}
                              className="text-xs text-white/90 hover:text-white underline decoration-white/60 underline-offset-4 transition-colors"
                            >
                              Mot de passe oublié ?
                            </button>
                            <button type="button" onClick={() => setMode("signup")} className="text-sm text-white/90 hover:text-white underline decoration-white/60 underline-offset-4 transition-colors">
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
