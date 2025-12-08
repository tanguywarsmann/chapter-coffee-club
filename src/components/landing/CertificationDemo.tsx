import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/LanguageContext";
import confetti from "canvas-confetti";
import { Check } from "lucide-react";

const PHASES = {
  book: { start: 0, duration: 2500 },
  question: { start: 2500, duration: 2500 },
  answer: { start: 5000, duration: 2000 },
  celebration: { start: 7000, duration: 2000 },
  reset: { start: 9500, duration: 500 }
};

const TOTAL_DURATION = 10000;

// Brand colors - warm amber/brown palette
const BRAND = {
  primary: 'hsl(25, 40%, 50%)',
  primaryDark: 'hsl(25, 40%, 40%)',
  primaryLight: 'hsl(25, 40%, 60%)',
  secondary: 'hsl(35, 30%, 82%)',
  dark: 'hsl(25, 40%, 18%)',
  darker: 'hsl(25, 40%, 12%)',
  light: 'hsl(35, 30%, 92%)',
  cream: 'hsl(30, 35%, 97%)',
  muted: 'hsl(25, 20%, 55%)',
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
          particleCount: 40,
          spread: 55,
          origin: { y: 0.55, x: 0.5 },
          colors: [BRAND.primary, BRAND.secondary, BRAND.primaryLight, BRAND.light],
          shapes: ['circle'],
          scalar: 0.8,
          gravity: 1,
          ticks: 100,
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

  const isQuestionVisible = ['question', 'answer', 'celebration'].includes(phase);
  const isAnswerVisible = ['answer', 'celebration'].includes(phase);

  return (
    <motion.div
      key={cycleKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto my-16 md:my-20 px-4"
    >
      {/* Card container */}
      <div className="relative">
        {/* Outer glow */}
        <div 
          className="absolute -inset-1 rounded-[26px] opacity-50 blur-xl"
          style={{ background: `linear-gradient(135deg, ${BRAND.primary}, transparent, ${BRAND.primaryDark})` }}
        />
        
        {/* Main card */}
        <div 
          className="relative rounded-[24px] overflow-hidden"
          style={{
            background: `linear-gradient(175deg, ${BRAND.dark} 0%, ${BRAND.darker} 100%)`,
            boxShadow: `
              0 1px 0 0 rgba(255,255,255,0.06) inset,
              0 -1px 0 0 rgba(0,0,0,0.2) inset,
              0 40px 70px -20px rgba(0,0,0,0.5)
            `,
          }}
        >
          {/* Subtle top highlight */}
          <div 
            className="absolute top-0 left-[10%] right-[10%] h-[1px]"
            style={{ background: `linear-gradient(90deg, transparent, ${BRAND.primary}50, transparent)` }}
          />

          <div className="relative px-6 py-8 md:px-10 md:py-10">
            
            {/* Progress dots */}
            <div className="flex justify-center gap-3 mb-8">
              {[0, 1, 2, 3].map((i) => {
                const phaseIndex = ['book', 'question', 'answer', 'celebration'].indexOf(phase);
                const isActive = phaseIndex >= i && phase !== 'reset';
                const isCurrent = phaseIndex === i && phase !== 'reset';
                
                return (
                  <motion.div
                    key={i}
                    className="relative"
                    animate={{ scale: isCurrent ? 1 : 1 }}
                  >
                    {isCurrent && (
                      <motion.div
                        className="absolute -inset-1 rounded-full"
                        style={{ background: BRAND.primary }}
                        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                    <div 
                      className="relative w-2 h-2 rounded-full transition-all duration-500"
                      style={{
                        background: isActive ? BRAND.primary : 'rgba(255,255,255,0.15)',
                      }}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* === BOOK === */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: phase === 'reset' ? 0 : 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center mb-6"
            >
              {/* Book */}
              <div className="relative mb-4">
                {/* Soft shadow */}
                <div 
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-3 rounded-full blur-lg"
                  style={{ background: 'rgba(0,0,0,0.4)' }}
                />
                
                <motion.div 
                  className="relative"
                  animate={{ rotateY: phase === 'book' ? [0, -2, 0] : 0 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  style={{ perspective: 800 }}
                >
                  {/* Book body */}
                  <div 
                    className="relative w-20 h-28 md:w-24 md:h-32 rounded-r-lg rounded-l-sm"
                    style={{
                      background: `linear-gradient(145deg, ${BRAND.primaryDark} 0%, hsl(25, 40%, 32%) 50%, hsl(25, 40%, 28%) 100%)`,
                      boxShadow: `
                        4px 4px 16px rgba(0,0,0,0.3),
                        inset 0 1px 0 rgba(255,255,255,0.1),
                        inset -1px 0 0 rgba(255,255,255,0.05)
                      `,
                    }}
                  >
                    {/* Spine */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-2"
                      style={{
                        background: `linear-gradient(90deg, hsl(25, 40%, 25%), hsl(25, 40%, 30%))`,
                        borderRadius: '2px 0 0 2px',
                      }}
                    />

                    {/* Inner frame */}
                    <div 
                      className="absolute inset-3 rounded-sm"
                      style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                    />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span
                        className="text-lg md:text-xl"
                        animate={{ 
                          opacity: [0.8, 1, 0.8],
                          filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)']
                        }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      >
                        ⚡
                      </motion.span>
                      <span 
                        className="text-[8px] md:text-[9px] font-serif font-semibold uppercase tracking-widest mt-0.5"
                        style={{ color: BRAND.light }}
                      >
                        Harry Potter
                      </span>
                    </div>

                    {/* Pages */}
                    <div 
                      className="absolute right-0 top-1 bottom-1 w-[3px]"
                      style={{
                        background: `linear-gradient(90deg, ${BRAND.secondary}, ${BRAND.cream})`,
                        borderRadius: '0 2px 2px 0',
                      }}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Counter */}
              <div className="flex items-baseline gap-1.5">
                <motion.span 
                  className="text-3xl md:text-4xl font-serif font-bold tabular-nums"
                  style={{ color: BRAND.primary }}
                >
                  {displayPages}
                </motion.span>
                <span 
                  className="text-sm font-medium"
                  style={{ color: BRAND.muted }}
                >
                  / 30 pages
                </span>
              </div>
            </motion.div>

            {/* === QUESTION === */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ 
                opacity: isQuestionVisible ? 1 : 0,
                y: isQuestionVisible ? 0 : 16,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mb-4"
            >
              <div 
                className="relative rounded-xl p-4 md:p-5"
                style={{
                  background: BRAND.cream,
                  boxShadow: `
                    0 4px 20px -6px rgba(0,0,0,0.15),
                    0 1px 0 0 rgba(255,255,255,0.8) inset
                  `,
                }}
              >
                {/* Accent bar */}
                <div 
                  className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                  style={{ background: BRAND.primary }}
                />

                <div className="pl-3">
                  {/* Label */}
                  <span 
                    className="inline-block text-[9px] font-bold uppercase tracking-[0.12em] mb-2"
                    style={{ color: BRAND.muted }}
                  >
                    Question
                  </span>

                  {/* Text */}
                  <p 
                    className="text-[13px] md:text-sm leading-relaxed font-medium"
                    style={{ color: BRAND.dark }}
                  >
                    <BlurStaggerText text={question} isVisible={isQuestionVisible} />
                  </p>
                </div>
              </div>
            </motion.div>

            {/* === ANSWER === */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ 
                opacity: isAnswerVisible ? 1 : 0,
                y: isAnswerVisible ? 0 : 12
              }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mb-4"
            >
              <div 
                className="rounded-xl py-3 px-4"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span 
                    className="text-[10px] uppercase tracking-widest font-medium"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  >
                    Réponse
                  </span>
                  <div className="flex items-center">
                    <LetterReveal word={answer} isVisible={isAnswerVisible} />
                    {phase === 'answer' && (
                      <motion.div
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="w-[2px] h-5 ml-0.5 rounded-full"
                        style={{ background: BRAND.primary }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* === SUCCESS === */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: phase === 'celebration' ? 1 : 0,
                scale: phase === 'celebration' ? 1 : 0.95
              }}
              transition={{ 
                duration: 0.4,
                ease: [0.23, 1, 0.32, 1],
                delay: phase === 'celebration' ? 0.1 : 0
              }}
              className="flex flex-col items-center pt-2"
            >
              {/* Check icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: phase === 'celebration' ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.15 }}
                className="mb-3"
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
                    boxShadow: `0 8px 24px -6px ${BRAND.primary}`,
                  }}
                >
                  <Check className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </motion.div>

              {/* Text */}
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ 
                  opacity: phase === 'celebration' ? 1 : 0,
                  y: phase === 'celebration' ? 0 : 6
                }}
                transition={{ delay: 0.35 }}
                className="text-sm font-bold tracking-wide"
                style={{ color: BRAND.primary }}
              >
                {certified}
              </motion.span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Blur stagger effect for question text
function BlurStaggerText({ text, isVisible }: { text: string; isVisible: boolean }) {
  const words = text.split(' ');
  
  return (
    <motion.span
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.25em]"
          variants={{
            hidden: { opacity: 0, filter: "blur(3px)" },
            visible: { 
              opacity: 1, 
              filter: "blur(0px)",
              transition: { duration: 0.25, ease: "easeOut" }
            }
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

// Letter reveal for answer
function LetterReveal({ word, isVisible }: { word: string; isVisible: boolean }) {
  return (
    <motion.span
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
      className="flex"
    >
      {word.split('').map((letter, i) => (
        <motion.span
          key={i}
          className="text-xl md:text-2xl font-bold font-serif"
          style={{ color: BRAND.primary }}
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { type: "spring", stiffness: 350, damping: 20 }
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
