import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/LanguageContext";
import confetti from "canvas-confetti";
import { BookOpen, Check } from "lucide-react";

const PHASES = {
  book: { start: 0, duration: 2500 },
  question: { start: 2500, duration: 2500 },
  answer: { start: 5000, duration: 2000 },
  celebration: { start: 7000, duration: 2000 },
  reset: { start: 9500, duration: 500 }
};

const TOTAL_DURATION = 10000;

// Brand colors from tailwind config (HSL 25-35 warm tones)
const BRAND = {
  primary: 'hsl(25, 40%, 50%)',      // reed-primary
  primaryLight: 'hsl(35, 30%, 82%)', // reed-secondary  
  dark: 'hsl(25, 40%, 20%)',         // brand-800
  darker: 'hsl(25, 40%, 12%)',       // brand-900
  light: 'hsl(35, 30%, 92%)',        // brand-100
  cream: 'hsl(30, 35%, 98%)',        // brand-50
  medium: 'hsl(25, 30%, 70%)',       // brand-400
};

export function CertificationDemo() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'book' | 'question' | 'answer' | 'celebration' | 'reset'>('book');
  const [cycleKey, setCycleKey] = useState(0);

  const pageCount = useSpring(0, { stiffness: 50, damping: 15 });
  const displayPages = useTransform(pageCount, (val) => Math.round(val));

  useEffect(() => {
    const runCycle = () => {
      setPhase('book');
      pageCount.set(0);

      setTimeout(() => pageCount.set(30), 300);
      setTimeout(() => setPhase('question'), PHASES.question.start);
      setTimeout(() => setPhase('answer'), PHASES.answer.start);
      setTimeout(() => {
        setPhase('celebration');
        confetti({
          particleCount: 45,
          spread: 65,
          origin: { y: 0.6, x: 0.5 },
          colors: ['hsl(25, 40%, 50%)', 'hsl(35, 30%, 82%)', 'hsl(25, 40%, 65%)', '#22c55e'],
          shapes: ['circle'],
          scalar: 0.85,
          gravity: 1.1,
          ticks: 120,
        });
      }, PHASES.celebration.start);
      setTimeout(() => setPhase('reset'), PHASES.reset.start);
    };

    runCycle();
    const interval = setInterval(() => {
      setCycleKey(k => k + 1);
      runCycle();
    }, TOTAL_DURATION);

    return () => clearInterval(interval);
  }, [cycleKey, pageCount]);

  const question = t.landing.certificationDemo?.question || "Quel objet d'or étrange Dumbledore consulte-t-il avant l'arrivée de Hagrid ?";
  const answer = t.landing.certificationDemo?.answer || "MONTRE";
  const certified = t.landing.certificationDemo?.certified || "LECTURE CERTIFIÉE";

  return (
    <motion.div
      key={cycleKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-lg mx-auto my-14 md:my-20 px-4"
    >
      {/* Main card */}
      <div 
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: `linear-gradient(170deg, ${BRAND.dark} 0%, ${BRAND.darker} 100%)`,
          boxShadow: '0 30px 60px -20px rgba(0,0,0,0.4)',
        }}
      >
        {/* Top accent line */}
        <div 
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(90deg, transparent, ${BRAND.primary}, transparent)` }}
        />

        {/* Content */}
        <div className="relative p-6 md:p-10">
          
          {/* Step indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              {['book', 'question', 'answer', 'celebration'].map((step, i) => (
                <motion.div
                  key={step}
                  className="flex items-center"
                  animate={{
                    opacity: phase === 'reset' ? 0.3 : 
                             ['book', 'question', 'answer', 'celebration'].indexOf(phase) >= i ? 1 : 0.3
                  }}
                >
                  <div 
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{
                      background: ['book', 'question', 'answer', 'celebration'].indexOf(phase) >= i 
                        ? BRAND.primary 
                        : 'rgba(255,255,255,0.2)',
                      boxShadow: ['book', 'question', 'answer', 'celebration'].indexOf(phase) >= i 
                        ? `0 0 8px ${BRAND.primary}` 
                        : 'none'
                    }}
                  />
                  {i < 3 && (
                    <div 
                      className="w-8 h-[2px] mx-1"
                      style={{ 
                        background: ['book', 'question', 'answer', 'celebration'].indexOf(phase) > i 
                          ? BRAND.primary 
                          : 'rgba(255,255,255,0.1)' 
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* === BOOK === */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ 
              opacity: phase === 'reset' ? 0 : 1, 
              y: 0,
            }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col items-center mb-8"
          >
            {/* Book visual */}
            <div className="relative">
              {/* Glow behind book */}
              <div 
                className="absolute -inset-4 rounded-2xl blur-2xl opacity-30"
                style={{ background: BRAND.primary }}
              />
              
              {/* Book */}
              <motion.div 
                className="relative w-24 h-32 md:w-28 md:h-38 rounded-lg overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, hsl(25, 50%, 35%) 0%, hsl(25, 45%, 25%) 100%)`,
                  boxShadow: `
                    6px 6px 20px rgba(0,0,0,0.3),
                    inset 0 1px 0 rgba(255,255,255,0.1)
                  `,
                  border: `2px solid ${BRAND.primary}`,
                }}
                animate={{ 
                  rotateY: phase === 'book' ? [0, -3, 0] : 0,
                }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              >
                {/* Book inner border */}
                <div 
                  className="absolute inset-2 rounded border"
                  style={{ borderColor: 'rgba(255,255,255,0.15)' }}
                />
                
                {/* Book content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
                  <motion.span
                    className="text-xl md:text-2xl mb-1"
                    animate={{ 
                      filter: ['drop-shadow(0 0 4px rgba(255,255,255,0.5))', 'drop-shadow(0 0 8px rgba(255,255,255,0.8))', 'drop-shadow(0 0 4px rgba(255,255,255,0.5))']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ⚡
                  </motion.span>
                  <div 
                    className="text-[9px] md:text-[10px] font-serif font-bold uppercase tracking-wider"
                    style={{ color: BRAND.cream }}
                  >
                    Harry Potter
                  </div>
                </div>

                {/* Pages edge */}
                <div 
                  className="absolute right-0 top-1 bottom-1 w-1"
                  style={{
                    background: `linear-gradient(90deg, ${BRAND.light}, ${BRAND.cream})`,
                    borderRadius: '0 2px 2px 0',
                  }}
                />
              </motion.div>
            </div>

            {/* Page counter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2 mt-5"
            >
              <BookOpen className="w-4 h-4" style={{ color: BRAND.medium }} />
              <span style={{ color: BRAND.medium }} className="text-sm">Page</span>
              <motion.span 
                className="text-2xl font-bold font-serif tabular-nums"
                style={{ color: BRAND.primary }}
              >
                {displayPages}
              </motion.span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }} className="text-sm">/30</span>
            </motion.div>
          </motion.div>

          {/* === QUESTION === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: ['question', 'answer', 'celebration'].includes(phase) ? 1 : 0,
              y: ['question', 'answer', 'celebration'].includes(phase) ? 0 : 20,
            }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="mb-5"
          >
            <div 
              className="rounded-2xl p-5"
              style={{
                background: BRAND.cream,
                boxShadow: '0 8px 30px -10px rgba(0,0,0,0.2)',
              }}
            >
              {/* Label */}
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: BRAND.primary }}
                />
                <span 
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: BRAND.dark }}
                >
                  Question
                </span>
              </div>

              {/* Question text */}
              <div 
                className="text-sm md:text-[15px] leading-relaxed font-medium"
                style={{ color: BRAND.darker }}
              >
                <BlurStaggerText 
                  text={question} 
                  isVisible={['question', 'answer', 'celebration'].includes(phase)} 
                />
              </div>
            </div>
          </motion.div>

          {/* === ANSWER === */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ 
              opacity: ['answer', 'celebration'].includes(phase) ? 1 : 0,
              y: ['answer', 'celebration'].includes(phase) ? 0 : 15
            }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="mb-5"
          >
            <div 
              className="rounded-xl p-4 text-center"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid rgba(255,255,255,0.1)`,
              }}
            >
              <div className="flex items-center justify-center gap-3">
                <span 
                  className="text-xs uppercase tracking-wider"
                  style={{ color: BRAND.medium }}
                >
                  Réponse
                </span>
                <div className="flex items-center">
                  <GoldenLetterReveal 
                    word={answer} 
                    isVisible={['answer', 'celebration'].includes(phase)} 
                  />
                  {phase === 'answer' && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="ml-0.5 w-[2px] h-6 rounded-full"
                      style={{ background: BRAND.primary }}
                    />
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* === CELEBRATION === */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: phase === 'celebration' ? 1 : 0,
              scale: phase === 'celebration' ? 1 : 0.9
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              delay: phase === 'celebration' ? 0.15 : 0
            }}
            className="flex flex-col items-center gap-4"
          >
            {/* Checkmark */}
            <motion.div
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: phase === 'celebration' ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
            >
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  boxShadow: '0 8px 25px -5px rgba(34,197,94,0.5)',
                }}
              >
                <Check className="w-7 h-7 text-white" strokeWidth={3} />
              </div>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ 
                opacity: phase === 'celebration' ? 1 : 0,
                y: phase === 'celebration' ? 0 : 8
              }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <div 
                className="px-6 py-2.5 rounded-full font-bold text-sm tracking-wide"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.primary} 0%, hsl(25, 40%, 45%) 100%)`,
                  color: 'white',
                  boxShadow: `0 6px 20px -5px ${BRAND.primary}`,
                }}
              >
                ✓ {certified}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// === SUB-COMPONENTS ===

function BlurStaggerText({ text, isVisible }: { text: string; isVisible: boolean }) {
  const words = text.split(' ');
  
  return (
    <motion.span
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.3em]"
          variants={{
            hidden: { opacity: 0, filter: "blur(4px)", y: 3 },
            visible: { 
              opacity: 1, 
              filter: "blur(0px)",
              y: 0,
              transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
            }
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

function GoldenLetterReveal({ word, isVisible }: { word: string; isVisible: boolean }) {
  const letters = word.split('');
  
  return (
    <motion.span
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className="flex"
    >
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          className="text-2xl md:text-3xl font-bold font-serif"
          style={{
            color: BRAND.primary,
            textShadow: `0 0 20px ${BRAND.primary}`,
          }}
          variants={{
            hidden: { opacity: 0, y: 12, scale: 0.8 },
            visible: { 
              opacity: 1, y: 0, scale: 1,
              transition: { type: "spring", stiffness: 300, damping: 18 }
            }
          }}
        >
          {letter}
        </motion.span>
      ))}
    </motion.span>
  );
}

export default CertificationDemo;
