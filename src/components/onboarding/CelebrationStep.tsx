import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, MessageCircleQuestion, CheckCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

// VREAD Brand colors
const BRAND = {
  primary: '#D4A574',
  secondary: '#A67B5B',
  primaryLight: '#E8C9A0',
};

interface CelebrationStepProps {
  objective: string;
  genres: string[];
}

const howItWorksSteps = [
  {
    icon: BookOpen,
    title: 'Lis 30 pages',
    description: 'Avance dans ton livre, à ton rythme',
  },
  {
    icon: MessageCircleQuestion,
    title: 'Réponds à 1 question',
    description: "L'IA te pose une question sur ta lecture",
  },
  {
    icon: CheckCircle,
    title: 'Lecture certifiée',
    description: 'Ta progression est validée et visible',
  },
];

export const CelebrationStep = ({ objective, genres }: CelebrationStepProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [completing, setCompleting] = useState(false);

  // Trigger confetti on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.5, x: 0.5 },
        colors: [BRAND.primary, BRAND.secondary, BRAND.primaryLight],
        shapes: ['circle'],
        scalar: 0.6,
        gravity: 1.1,
        ticks: 80,
        drift: 0,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const completeOnboarding = async () => {
    if (completing) return;
    setCompleting(true);

    // Mark onboarding complete in user_metadata
    await supabase.auth.updateUser({
      data: { onboarding_done: true }
    });

    // Update profiles.onboarding_seen_at
    if (user) {
      await supabase
        .from('profiles')
        .update({ onboarding_seen_at: new Date().toISOString() })
        .eq('id', user.id);
    }
  };

  const handleExplore = async () => {
    await completeOnboarding();
    navigate('/explore');
  };

  const getPersonalizedMessage = () => {
    switch (objective) {
      case 'finish_more':
        return 'Prêt à finir plus de livres que jamais !';
      case 'track_reading':
        return 'Chaque page compte, on track tout !';
      case 'prove_reading':
        return 'Tes lectures seront certifiées !';
      case 'discover':
        return 'De belles découvertes t\'attendent !';
      default:
        return 'Ton aventure littéraire commence !';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col items-center px-6 py-8"
    >
      {/* Celebration icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4A574] to-[#A67B5B] 
                   flex items-center justify-center mb-6 shadow-xl shadow-[#A67B5B]/30"
      >
        <Sparkles className="w-10 h-10 text-[#1A0F0A]" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl md:text-4xl font-serif font-bold text-[#F5E6D3] text-center mb-3"
      >
        C'est parti !
      </motion.h1>

      {/* Personalized message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg text-[#D4A574] text-center mb-8 font-medium"
      >
        {getPersonalizedMessage()}
      </motion.p>

      {/* How it works section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm mb-8"
      >
        <p className="text-sm text-[#A67B5B] text-center mb-4 uppercase tracking-wider">
          Comment ça marche
        </p>
        
        <div className="space-y-3">
          {howItWorksSteps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.15 }}
              className="flex items-center gap-4 bg-[#2A1810]/80 rounded-xl p-4 
                         border border-[#A67B5B]/20"
            >
              {/* Step number with icon */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4A574]/20 to-[#A67B5B]/20 
                                flex items-center justify-center border border-[#A67B5B]/30">
                  <step.icon className="w-5 h-5 text-[#D4A574]" />
                </div>
                {/* Step number badge */}
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#D4A574] 
                                flex items-center justify-center">
                  <span className="text-xs font-bold text-[#1A0F0A]">{index + 1}</span>
                </div>
              </div>
              
              {/* Step content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#F5E6D3] text-base">
                  {step.title}
                </h3>
                <p className="text-[#A67B5B] text-sm">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="w-full max-w-sm"
      >
        <Button
          onClick={handleExplore}
          disabled={completing}
          className="w-full h-14 rounded-xl bg-[#D4A574] hover:bg-[#C49A6C] text-[#1A0F0A] font-semibold text-lg
                     shadow-lg shadow-[#A67B5B]/30 transition-all duration-200"
        >
          {completing ? (
            <motion.div 
              className="w-5 h-5 border-2 border-[#1A0F0A]/30 border-t-[#1A0F0A] rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <span className="flex items-center gap-2">
              Choisir mon premier livre
              <ArrowRight className="w-5 h-5" />
            </span>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};
