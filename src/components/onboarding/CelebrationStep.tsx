import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, ArrowRight } from 'lucide-react';
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

interface SuggestedBook {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  slug: string;
}

export const CelebrationStep = ({ objective, genres }: CelebrationStepProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [suggestedBook, setSuggestedBook] = useState<SuggestedBook | null>(null);
  const [completing, setCompleting] = useState(false);

  // Fetch suggested book based on genres
  useEffect(() => {
    const fetchSuggestedBook = async () => {
      const { data } = await supabase
        .from('books')
        .select('id, title, author, cover_url, slug')
        .eq('is_published', true)
        .limit(1)
        .single();
      
      if (data) {
        setSuggestedBook(data);
      }
    };

    fetchSuggestedBook();
  }, [genres]);

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

  const handleStartBook = async () => {
    await completeOnboarding();
    if (suggestedBook) {
      navigate(`/book/${suggestedBook.slug}`);
    } else {
      navigate('/explore');
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

      {/* Suggested book card */}
      {suggestedBook && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm mb-8"
        >
          <p className="text-sm text-[#A67B5B] text-center mb-4">
            Voici un livre parfait pour commencer
          </p>
          
          <div className="relative bg-[#2A1810]/80 rounded-2xl p-4 border border-[#A67B5B]/30
                          shadow-xl shadow-[#1A0F0A]/50">
            <div className="flex items-center gap-4">
              {/* Book cover */}
              <motion.div 
                className="relative w-20 h-28 rounded-lg overflow-hidden shadow-lg flex-shrink-0"
                whileHover={{ scale: 1.05, rotateY: 10 }}
                style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
              >
                {suggestedBook.cover_url ? (
                  <img 
                    src={suggestedBook.cover_url} 
                    alt={suggestedBook.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#A67B5B] to-[#8B6544] 
                                  flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-[#F5E6D3]/50" />
                  </div>
                )}
                
                {/* 3D edge effect */}
                <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-black/30 to-transparent" />
              </motion.div>
              
              {/* Book info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-bold text-[#F5E6D3] text-lg leading-tight line-clamp-2">
                  {suggestedBook.title}
                </h3>
                <p className="text-[#A67B5B] text-sm mt-1">
                  {suggestedBook.author}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm space-y-3"
      >
        <Button
          onClick={handleStartBook}
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
              Commencer ce livre
              <ArrowRight className="w-5 h-5" />
            </span>
          )}
        </Button>
        
        <Button
          onClick={handleExplore}
          disabled={completing}
          variant="ghost"
          className="w-full h-12 rounded-xl text-[#A67B5B] hover:text-[#D4A574] hover:bg-[#A67B5B]/10
                     font-medium transition-all duration-200"
        >
          Explorer d'autres livres
        </Button>
      </motion.div>
    </motion.div>
  );
};
