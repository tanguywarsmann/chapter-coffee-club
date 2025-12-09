import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface OnboardingCardProps {
  icon: LucideIcon;
  label: string;
  selected?: boolean;
  onClick: () => void;
  feedback?: string;
  disabled?: boolean;
}

export const OnboardingCard = ({ 
  icon: Icon, 
  label, 
  selected, 
  onClick, 
  feedback,
  disabled 
}: OnboardingCardProps) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-full p-4 rounded-2xl border-2 transition-all duration-300
        flex items-center gap-4 text-left
        ${selected 
          ? 'bg-[#A67B5B]/20 border-[#D4A574] shadow-lg shadow-[#A67B5B]/20' 
          : 'bg-[#2A1810]/60 border-[#A67B5B]/20 hover:border-[#A67B5B]/40 hover:bg-[#2A1810]/80'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
    >
      {/* Icon container */}
      <div className={`
        flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
        transition-colors duration-300
        ${selected ? 'bg-[#D4A574]/30' : 'bg-[#A67B5B]/10'}
      `}>
        <Icon 
          className={`w-6 h-6 transition-colors duration-300 ${
            selected ? 'text-[#D4A574]' : 'text-[#A67B5B]'
          }`} 
        />
      </div>
      
      {/* Label */}
      <span className={`
        font-medium text-base transition-colors duration-300
        ${selected ? 'text-[#F5E6D3]' : 'text-[#F5E6D3]/80'}
      `}>
        {label}
      </span>
      
      {/* Selection indicator */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute right-4 w-6 h-6 rounded-full bg-[#D4A574] flex items-center justify-center"
        >
          <svg className="w-4 h-4 text-[#1A0F0A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
      
      {/* Feedback toast */}
      {selected && feedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full
                     px-3 py-1.5 rounded-full bg-[#D4A574] text-[#1A0F0A] text-sm font-medium
                     shadow-lg whitespace-nowrap z-10"
        >
          {feedback}
        </motion.div>
      )}
    </motion.button>
  );
};
