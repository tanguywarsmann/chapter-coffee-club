import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, Trophy, Compass } from 'lucide-react';
import { OnboardingCard } from './OnboardingCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ObjectiveStepProps {
  onComplete: (objective: string) => void;
}

const OBJECTIVES = [
  { 
    id: 'finish_more', 
    icon: BookOpen, 
    label: 'Finir plus de livres',
    feedback: 'On va t\'aider !'
  },
  { 
    id: 'track_reading', 
    icon: Target, 
    label: 'Tracker ma lecture',
    feedback: 'Parfait pour toi'
  },
  { 
    id: 'prove_reading', 
    icon: Trophy, 
    label: 'Prouver que je lis',
    feedback: 'VREAD certifie tes lectures'
  },
  { 
    id: 'discover', 
    icon: Compass, 
    label: 'Découvrir des classiques',
    feedback: 'Belle curiosité !'
  },
];

export const ObjectiveStep = ({ onComplete }: ObjectiveStepProps) => {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSelect = async (objectiveId: string) => {
    if (saving) return;
    
    setSelected(objectiveId);
    setSaving(true);
    
    // Save to profiles
    if (user) {
      await supabase
        .from('profiles')
        .update({ onboarding_objective: objectiveId })
        .eq('id', user.id);
    }
    
    // Auto-advance after delay
    setTimeout(() => {
      onComplete(objectiveId);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col items-center px-6 py-8"
    >
      {/* Question */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-2xl md:text-3xl font-serif font-bold text-[#F5E6D3] text-center mb-2"
      >
        Qu'est-ce qui t'amène sur VREAD ?
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-[#A67B5B] text-center mb-8"
      >
        Choisis ce qui te correspond le mieux
      </motion.p>

      {/* Options */}
      <div className="w-full max-w-md space-y-3">
        {OBJECTIVES.map((objective, index) => (
          <motion.div
            key={objective.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.08 }}
          >
            <OnboardingCard
              icon={objective.icon}
              label={objective.label}
              selected={selected === objective.id}
              onClick={() => handleSelect(objective.id)}
              feedback={selected === objective.id ? objective.feedback : undefined}
              disabled={saving && selected !== objective.id}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
