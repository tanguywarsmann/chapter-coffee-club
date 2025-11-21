import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import { isIOSNative } from "@/utils/platform";
import confetti from 'canvas-confetti';
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function IOSOnboarding() {
    const { t } = useTranslation();
    const { user, supabase } = useAuth();
    const navigate = useNavigate();
    const [selectedReason, setSelectedReason] = useState<keyof typeof t.onboardingIOS.options | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Guard: redirect if not iOS native or already completed
    useEffect(() => {
        if (!isIOSNative() && !import.meta.env.DEV) {
            navigate("/home", { replace: true });
            return;
        }

        if (user?.user_metadata?.ios_onboarding_done) {
            navigate("/home", { replace: true });
        }
    }, [user, navigate]);

    const markOnboardingDone = async () => {
        if (!user?.id) {
            toast.error("Vous devez être connecté pour terminer l'onboarding");
            return false;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                data: { ios_onboarding_done: true }
            });

            if (error) {
                throw error;
            }

            return true;
        } catch (e: any) {
            console.error("Failed to save onboarding status", e);
            toast.error("Impossible d'enregistrer votre progression. Veuillez réessayer.");
            return false;
        }
    };

    const handleFinish = async () => {
        setIsLoading(true);

        try {
            // Celebration!
            try {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.8 },
                    colors: ['#10b981', '#3b82f6', '#f59e0b']
                });
            } catch (e) {
                console.error("Confetti failed", e);
            }

            const saved = await markOnboardingDone();
            if (!saved) {
                return;
            }

            navigate("/explore", { replace: true });
        } catch (e) {
            console.error("Error finishing onboarding", e);
            toast.error("Une erreur est survenue. Merci de réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-reed-primary to-reed-secondary flex flex-col items-center justify-center p-6 overflow-hidden relative">
            {/* Background Texture */}
            <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')] bg-repeat" />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-sm flex flex-col h-[85vh]"
            >
                <h2 className="text-xl font-serif font-bold text-white text-center mb-8 mt-4">
                    {t.onboardingIOS.question}
                </h2>

                <div className="flex-1 flex flex-col gap-4">
                    {(['abandonBooks', 'scrollMoreThanRead', 'nightstandBook'] as const).map((key) => (
                        <motion.button
                            key={key}
                            onClick={() => setSelectedReason(key)}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                "text-left p-5 rounded-2xl transition-all duration-300 border-2 relative overflow-hidden",
                                selectedReason === key
                                    ? "bg-white border-white shadow-xl scale-[1.02]"
                                    : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                            )}
                        >
                            <span className={cn(
                                "font-medium relative z-10 block text-body",
                                selectedReason === key ? "text-reed-primary" : "text-white/90"
                            )}>
                                {t.onboardingIOS.options[key]}
                            </span>

                            {/* Feedback text appearing below */}
                            {selectedReason === key && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                                    className="text-reed-primary/80 text-sm font-medium italic relative z-10"
                                >
                                    {t.onboardingIOS.feedback[key]}
                                </motion.p>
                            )}
                        </motion.button>
                    ))}
                </div>

                <div className="mt-auto pt-8 space-y-6">
                    <Button
                        onClick={handleFinish}
                        disabled={!selectedReason || isLoading}
                        className="w-full bg-[#A67B5B] hover:bg-[#8B6F47] text-white font-bold py-6 text-lg shadow-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {t.onboardingIOS.finalCta}
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </>
                        )}
                    </Button>

                    <p className="text-center text-white/50 text-[10px] uppercase tracking-widest font-medium px-4 leading-relaxed opacity-80">
                        {t.landing.title}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
