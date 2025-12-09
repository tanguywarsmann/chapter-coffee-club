import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';

interface GenresStepProps {
  onComplete: (genres: string[]) => void;
}

const GENRES = [
  { id: 'fantasy', label: 'Fantasy', emoji: '🐉' },
  { id: 'thriller', label: 'Thriller', emoji: '🔪' },
  { id: 'classics', label: 'Classiques', emoji: '📜' },
  { id: 'romance', label: 'Romance', emoji: '💕' },
  { id: 'scifi', label: 'Science-Fiction', emoji: '🚀' },
  { id: 'devperso', label: 'Dev perso', emoji: '🧠' },
  { id: 'manga', label: 'BD / Manga', emoji: '🎌' },
  { id: 'essays', label: 'Essais', emoji: '📚' },
];

export const GenresStep = ({ onComplete }: GenresStepProps) => {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleGenre = (genreId: string) => {
    setSelected(prev => 
      prev.includes(genreId) 
        ? prev.filter(g => g !== genreId)
        : [...prev, genreId]
    );
  };

  const handleContinue = async () => {
    if (selected.length === 0 || saving) return;
    
    setSaving(true);
    
    // Save to profiles
    if (user) {
      await supabase
        .from('profiles')
        .update({ favorite_genres: selected })
        .eq('id', user.id);
    }
    
    onComplete(selected);
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
        Quels genres te parlent ?
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-[#A67B5B] text-center mb-8"
      >
        Choisis au moins 1 genre
      </motion.p>

      {/* Genre grid */}
      <div className="w-full max-w-md grid grid-cols-2 gap-3 mb-8">
        {GENRES.map((genre, index) => {
          const isSelected = selected.includes(genre.id);
          
          return (
            <motion.button
              key={genre.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              onClick={() => toggleGenre(genre.id)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200
                flex items-center gap-3
                ${isSelected 
                  ? 'bg-[#A67B5B]/20 border-[#D4A574] shadow-lg shadow-[#A67B5B]/20' 
                  : 'bg-[#2A1810]/60 border-[#A67B5B]/20 hover:border-[#A67B5B]/40'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-xl">{genre.emoji}</span>
              <span className={`text-sm font-medium ${isSelected ? 'text-[#F5E6D3]' : 'text-[#F5E6D3]/70'}`}>
                {genre.label}
              </span>
              
              {/* Selection check */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#D4A574] flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-[#1A0F0A]" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Continue button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: selected.length > 0 ? 1 : 0.5, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md"
      >
        <Button
          onClick={handleContinue}
          disabled={selected.length === 0 || saving}
          className="w-full h-14 rounded-xl bg-[#D4A574] hover:bg-[#C49A6C] text-[#1A0F0A] font-semibold text-lg
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                     shadow-lg shadow-[#A67B5B]/30"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <motion.div 
                className="w-5 h-5 border-2 border-[#1A0F0A]/30 border-t-[#1A0F0A] rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Enregistrement...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Continuer
              <ArrowRight className="w-5 h-5" />
            </span>
          )}
        </Button>
      </motion.div>
      
      {/* Selection count */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 text-sm text-[#A67B5B]"
      >
        {selected.length} genre{selected.length !== 1 ? 's' : ''} sélectionné{selected.length !== 1 ? 's' : ''}
      </motion.p>
    </motion.div>
  );
};
