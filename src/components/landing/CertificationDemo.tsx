import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/LanguageContext";
import confetti from "canvas-confetti";

// Configuration de l'animation
const PHASES = {
  book: { start: 0, duration: 2500 },
  question: { start: 2500, duration: 2500 },
  answer: { start: 5000, duration: 2000 },
  celebration: { start: 7000, duration: 2000 },
  reset: { start: 9500, duration: 500 }
};

const TOTAL_DURATION = 10000;

export function CertificationDemo() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'book' | 'question' | 'answer' | 'celebration' | 'reset'>('book');
  const [cycleKey, setCycleKey] = useState(0);

  // Spring animation for page counter
  const pageCount = useSpring(0, { stiffness: 50, damping: 15 });
  const displayPages = useTransform(pageCount, (val) => Math.round(val));

  // Animation loop
  useEffect(() => {
    const runCycle = () => {
      // Reset
      setPhase('book');
      pageCount.set(0);

      // Book phase - animate pages
      setTimeout(() => {
        pageCount.set(30);
      }, 300);

      // Question phase
      setTimeout(() => {
        setPhase('question');
      }, PHASES.question.start);

      // Answer phase
      setTimeout(() => {
        setPhase('answer');
      }, PHASES.answer.start);

      // Celebration phase
      setTimeout(() => {
        setPhase('celebration');
        // Trigger golden confetti
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.6, x: 0.5 },
          colors: ['#FFD700', '#FFA500', '#DAA520', '#B8860B'],
          shapes: ['star', 'circle'],
          scalar: 1.2,
          drift: 0.1,
        });
      }, PHASES.celebration.start);

      // Reset phase
      setTimeout(() => {
        setPhase('reset');
      }, PHASES.reset.start);
    };

    runCycle();

    // Loop the animation
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
      className="w-full max-w-2xl mx-auto my-12 md:my-16"
    >
      {/* Container with glassmorphism */}
      <div 
        className="relative rounded-3xl p-6 md:p-10 overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}
      >
        {/* Animated glow background */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(255,215,0,0.15), transparent 70%)'
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-6">
          
          {/* === PHASE 1: BOOK 3D === */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
            animate={{ 
              opacity: phase === 'reset' ? 0 : 1, 
              scale: 1, 
              rotateY: 0 
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
            style={{ perspective: 1000 }}
          >
            {/* Book 3D */}
            <div 
              className="relative w-32 h-44 md:w-40 md:h-56"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Book spine */}
              <div 
                className="absolute left-0 top-0 w-4 h-full rounded-l-sm"
                style={{
                  background: 'linear-gradient(135deg, #5C1A1A 0%, #8B2323 50%, #5C1A1A 100%)',
                  transform: 'rotateY(-90deg) translateX(-8px)',
                  transformOrigin: 'right center',
                  boxShadow: 'inset 2px 0 4px rgba(0,0,0,0.3)'
                }}
              />
              
              {/* Book cover */}
              <div 
                className="absolute inset-0 rounded-r-md rounded-l-sm overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, #722F37 0%, #8B2323 30%, #5C1A1A 100%)',
                  boxShadow: '4px 4px 15px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,215,0,0.1)',
                  border: '2px solid #DAA520'
                }}
              >
                {/* Harry Potter styled design */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                  {/* Golden border pattern */}
                  <div 
                    className="absolute inset-2 border-2 rounded-sm"
                    style={{ borderColor: 'rgba(218,165,32,0.5)' }}
                  />
                  
                  {/* Lightning bolt icon */}
                  <motion.div
                    animate={{ 
                      textShadow: ['0 0 10px #FFD700', '0 0 20px #FFD700', '0 0 10px #FFD700']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-3xl md:text-4xl mb-2"
                  >
                    ⚡
                  </motion.div>
                  
                  <div 
                    className="text-xs md:text-sm font-serif font-bold tracking-wide"
                    style={{ color: '#FFD700', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    HARRY
                  </div>
                  <div 
                    className="text-xs md:text-sm font-serif font-bold tracking-wide"
                    style={{ color: '#FFD700', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    POTTER
                  </div>
                  
                  {/* Subtle book texture */}
                  <div 
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' /%3E%3C/svg%3E")'
                    }}
                  />
                </div>
              </div>
              
              {/* Book pages edge */}
              <div 
                className="absolute right-0 top-1 bottom-1 w-2"
                style={{
                  background: 'repeating-linear-gradient(to bottom, #F5F5DC 0px, #F5F5DC 1px, #E8E8D0 1px, #E8E8D0 2px)',
                  borderRadius: '0 2px 2px 0'
                }}
              />
            </div>

            {/* Page counter */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2"
            >
              <span className="text-white/60 text-sm font-medium">📖</span>
              <motion.span 
                className="text-2xl font-bold tabular-nums"
                style={{ 
                  color: '#FFD700',
                  textShadow: '0 0 10px rgba(255,215,0,0.5)'
                }}
              >
                {displayPages}
              </motion.span>
              <span className="text-white/60 text-sm">/ 30</span>
            </motion.div>
          </motion.div>

          {/* === PHASE 2: AI QUESTION === */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: ['question', 'answer', 'celebration'].includes(phase) ? 1 : 0,
              y: ['question', 'answer', 'celebration'].includes(phase) ? 0 : 20,
              scale: ['question', 'answer', 'celebration'].includes(phase) ? 1 : 0.95
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-lg mt-8"
          >
            <div 
              className="relative rounded-2xl p-4 md:p-5"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,245,220,0.95) 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15), 0 0 30px rgba(0,191,255,0.1)',
                border: '1px solid rgba(0,191,255,0.2)'
              }}
            >
              {/* AI icon with glow */}
              <motion.div 
                className="absolute -top-3 -left-3 w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{
                  background: 'linear-gradient(135deg, #00CED1, #00BFFF)',
                  boxShadow: '0 0 20px rgba(0,191,255,0.5)'
                }}
                animate={{ 
                  boxShadow: ['0 0 15px rgba(0,191,255,0.4)', '0 0 25px rgba(0,191,255,0.6)', '0 0 15px rgba(0,191,255,0.4)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🤖
              </motion.div>

              {/* Question text with blur stagger effect */}
              <div className="pl-6 text-sm md:text-base text-gray-800 font-medium leading-relaxed">
                <BlurStaggerText 
                  text={question} 
                  isVisible={['question', 'answer', 'celebration'].includes(phase)} 
                />
              </div>
            </div>
          </motion.div>

          {/* === PHASE 3: ANSWER === */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ 
              opacity: ['answer', 'celebration'].includes(phase) ? 1 : 0,
              y: ['answer', 'celebration'].includes(phase) ? 0 : 15
            }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div 
              className="relative rounded-xl p-3 md:p-4"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,215,0,0.3)',
                boxShadow: '0 0 20px rgba(255,215,0,0.15)'
              }}
            >
              {/* Input field simulation */}
              <div className="flex items-center gap-3">
                <span className="text-white/50 text-sm">Réponse :</span>
                <div className="flex-1 flex items-center">
                  <GoldenLetterReveal 
                    word={answer} 
                    isVisible={['answer', 'celebration'].includes(phase)} 
                  />
                  {/* Blinking cursor */}
                  {phase === 'answer' && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="ml-1 w-0.5 h-6 bg-amber-400"
                    />
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* === PHASE 4: CELEBRATION === */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: phase === 'celebration' ? 1 : 0,
              scale: phase === 'celebration' ? 1 : 0.5
            }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: phase === 'celebration' ? 0.3 : 0
            }}
            className="flex flex-col items-center gap-3 mt-2"
          >
            {/* Animated checkmark */}
            <motion.svg 
              width="48" 
              height="48" 
              viewBox="0 0 48 48"
              initial={{ scale: 0 }}
              animate={{ scale: phase === 'celebration' ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <circle 
                cx="24" 
                cy="24" 
                r="22" 
                fill="none" 
                stroke="#22c55e" 
                strokeWidth="3"
                opacity="0.3"
              />
              <motion.path
                d="M14 24 L21 31 L34 18"
                fill="none"
                stroke="#22c55e"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: phase === 'celebration' ? 1 : 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </motion.svg>

            {/* Certified badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: phase === 'celebration' ? 1 : 0,
                y: phase === 'celebration' ? 0 : 10
              }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              {/* Pulsing ring */}
              <motion.div
                className="absolute -inset-2 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,215,0,0.3), rgba(34,197,94,0.3))',
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              
              <div 
                className="relative px-5 py-2.5 rounded-full font-bold text-sm md:text-base tracking-wide"
                style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(34,197,94,0.4), 0 0 30px rgba(34,197,94,0.2)'
                }}
              >
                ✅ {certified}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// === SUB-COMPONENTS ===

// Blur Stagger Text Effect
function BlurStaggerText({ text, isVisible }: { text: string; isVisible: boolean }) {
  const words = text.split(' ');
  
  return (
    <motion.span
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.08
          }
        }
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-1"
          variants={{
            hidden: { 
              opacity: 0, 
              filter: "blur(8px)",
              y: 5
            },
            visible: { 
              opacity: 1, 
              filter: "blur(0px)",
              y: 0,
              transition: {
                duration: 0.4,
                ease: "easeOut"
              }
            }
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

// Golden Letter Reveal Effect
function GoldenLetterReveal({ word, isVisible }: { word: string; isVisible: boolean }) {
  const letters = word.split('');
  
  return (
    <motion.span
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.12
          }
        }
      }}
      className="flex"
    >
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          className="text-2xl md:text-3xl font-bold font-serif"
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #DAA520 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 20px rgba(255,215,0,0.3)',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          }}
          variants={{
            hidden: { 
              opacity: 0, 
              y: 20,
              rotate: -10,
              scale: 0.5
            },
            visible: { 
              opacity: 1, 
              y: 0,
              rotate: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 200,
                damping: 12
              }
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
