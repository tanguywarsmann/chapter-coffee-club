import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { ObjectiveStep } from '@/components/onboarding/ObjectiveStep';
import { GenresStep } from '@/components/onboarding/GenresStep';
import { CelebrationStep } from '@/components/onboarding/CelebrationStep';

const TOTAL_STEPS = 3;

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, isInitialized } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [objective, setObjective] = useState<string>('');
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if onboarding already done or resume from previous step
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!isInitialized) return;
      
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if onboarding already completed
      const onboardingDone = Boolean(
        user.user_metadata?.onboarding_done ?? user.user_metadata?.ios_onboarding_done
      );
      
      if (onboardingDone) {
        navigate('/explore');
        return;
      }

      // Check existing progress in profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_objective, favorite_genres')
        .eq('id', user.id)
        .single();

      if (profile) {
        // Resume from where user left off
        if (profile.favorite_genres && profile.favorite_genres.length > 0) {
          setObjective(profile.onboarding_objective || '');
          setGenres(profile.favorite_genres);
          setCurrentStep(2); // Go to celebration
        } else if (profile.onboarding_objective) {
          setObjective(profile.onboarding_objective);
          setCurrentStep(1); // Go to genres
        }
      }

      setLoading(false);
    };

    checkOnboardingStatus();
  }, [user, isInitialized, navigate]);

  const handleObjectiveComplete = (selectedObjective: string) => {
    setObjective(selectedObjective);
    setCurrentStep(1);
  };

  const handleGenresComplete = (selectedGenres: string[]) => {
    setGenres(selectedGenres);
    setCurrentStep(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1A0F0A] via-[#2A1810] to-[#1A0F0A] flex items-center justify-center">
        <motion.div 
          className="w-8 h-8 border-3 border-[#A67B5B]/30 border-t-[#D4A574] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A0F0A] via-[#2A1810] to-[#1A0F0A] flex flex-col">
      {/* Progress bar - hidden on celebration step */}
      {currentStep < 2 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8 pb-4"
        >
          <OnboardingProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </motion.div>
      )}

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <ObjectiveStep 
              key="objective"
              onComplete={handleObjectiveComplete} 
            />
          )}
          {currentStep === 1 && (
            <GenresStep 
              key="genres"
              onComplete={handleGenresComplete} 
            />
          )}
          {currentStep === 2 && (
            <CelebrationStep 
              key="celebration"
              objective={objective}
              genres={genres}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Skip button - only on first two steps */}
      {currentStep < 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="pb-8 flex justify-center"
        >
          <button
            onClick={() => {
              if (currentStep === 0) {
                setCurrentStep(1);
              } else {
                setCurrentStep(2);
              }
            }}
            className="text-sm text-[#A67B5B]/60 hover:text-[#A67B5B] transition-colors"
          >
            Passer cette étape
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Onboarding;
