import { motion } from 'framer-motion';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const OnboardingProgress = ({ currentStep, totalSteps }: OnboardingProgressProps) => {
  return (
    <div className="flex items-center justify-center gap-3">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        
        return (
          <div key={index} className="flex items-center">
            {/* Dot */}
            <motion.div
              className={`relative w-3 h-3 rounded-full transition-colors duration-300 ${
                isCompleted 
                  ? 'bg-[#D4A574]' 
                  : isCurrent 
                    ? 'bg-[#A67B5B]' 
                    : 'bg-[#A67B5B]/30'
              }`}
              animate={{
                scale: isCurrent ? [1, 1.2, 1] : 1,
              }}
              transition={{
                duration: 1.5,
                repeat: isCurrent ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              {/* Inner glow for current */}
              {isCurrent && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-[#D4A574]/50"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.div>
            
            {/* Connector line */}
            {index < totalSteps - 1 && (
              <div className="w-8 h-0.5 mx-1 relative overflow-hidden bg-[#A67B5B]/20 rounded-full">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-[#D4A574] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
