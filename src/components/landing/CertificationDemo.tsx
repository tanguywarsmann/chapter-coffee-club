import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/LanguageContext";
import confetti from "canvas-confetti";
import { Sparkles } from "lucide-react";

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
      setPhase('book');
      pageCount.set(0);

      setTimeout(() => {
        pageCount.set(30);
      }, 300);

      setTimeout(() => {
        setPhase('question');
      }, PHASES.question.start);

      setTimeout(() => {
        setPhase('answer');
      }, PHASES.answer.start);

      setTimeout(() => {
        setPhase('celebration');
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.65, x: 0.5 },
          colors: ['#FFD700', '#FFA500', '#DAA520', '#22c55e'],
          shapes: ['circle'],
          scalar: 0.9,
          gravity: 1.2,
          ticks: 150,
        });
      }, PHASES.celebration.start);

      setTimeout(() => {
        setPhase('reset');
      }, PHASES.reset.start);
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
      className="w-full max-w-xl mx-auto my-16 md:my-20"
    >
      {/* Outer container with premium border */}
      <div className="relative">
        {/* Subtle animated border glow */}
        <motion.div
          className="absolute -inset-[1px] rounded-[28px] opacity-60"
          style={{
            background: 'linear-gradient(135deg, rgba(255,215,0,0.4), rgba(255,255,255,0.1), rgba(255,215,0,0.3))',
          }}
          animate={{
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Main container */}
        <div 
          className="relative rounded-[28px] p-8 md:p-12 overflow-hidden"
          style={{
            background: 'linear-gradient(165deg, rgba(30,20,15,0.95) 0%, rgba(20,15,10,0.98) 100%)',
            boxShadow: '0 25px 80px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Background texture */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Subtle golden gradient overlay */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(255,215,0,0.08), transparent 60%)',
            }}
          />

          <div className="relative z-10 flex flex-col items-center">
            
            {/* === BOOK 3D === */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ 
                opacity: phase === 'reset' ? 0 : 1, 
                scale: 1, 
                y: 0
              }}
              transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              className="relative mb-10"
              style={{ perspective: 1200 }}
            >
              {/* Book shadow */}
              <div 
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-28 h-4 md:w-36 md:h-5 rounded-full blur-xl"
                style={{ background: 'rgba(0,0,0,0.4)' }}
              />

              {/* Book 3D container */}
              <motion.div 
                className="relative w-28 h-40 md:w-36 md:h-52"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ 
                  rotateY: phase === 'book' ? [0, -5, 0] : 0,
                }}
                transition={{ duration: 2, ease: "easeInOut" }}
              >
                {/* Book spine */}
                <div 
                  className="absolute left-0 top-0 w-3 md:w-4 h-full"
                  style={{
                    background: 'linear-gradient(90deg, #3D1A1A 0%, #5C2020 50%, #4A1818 100%)',
                    transform: 'rotateY(-90deg) translateX(-6px)',
                    transformOrigin: 'right center',
                    boxShadow: 'inset -2px 0 8px rgba(0,0,0,0.4)',
                    borderRadius: '2px 0 0 2px',
                  }}
                />
                
                {/* Book cover */}
                <div 
                  className="absolute inset-0 rounded-r-lg rounded-l-sm overflow-hidden"
                  style={{
                    background: 'linear-gradient(155deg, #6B2D2D 0%, #5C2323 40%, #4A1A1A 100%)',
                    boxShadow: `
                      8px 8px 25px rgba(0,0,0,0.35),
                      inset 0 1px 0 rgba(255,255,255,0.08),
                      inset 0 -1px 0 rgba(0,0,0,0.2)
                    `,
                  }}
                >
                  {/* Inner gold border */}
                  <div 
                    className="absolute inset-2 md:inset-3 rounded-sm"
                    style={{ 
                      border: '1.5px solid rgba(218,165,32,0.45)',
                      boxShadow: 'inset 0 0 15px rgba(218,165,32,0.08)',
                    }}
                  />
                  
                  {/* Corner ornaments */}
                  {[0, 1, 2, 3].map((corner) => (
                    <div
                      key={corner}
                      className="absolute w-3 h-3 md:w-4 md:h-4"
                      style={{
                        top: corner < 2 ? '8px' : 'auto',
                        bottom: corner >= 2 ? '8px' : 'auto',
                        left: corner % 2 === 0 ? '8px' : 'auto',
                        right: corner % 2 === 1 ? '8px' : 'auto',
                        borderTop: corner < 2 ? '1px solid rgba(218,165,32,0.4)' : 'none',
                        borderBottom: corner >= 2 ? '1px solid rgba(218,165,32,0.4)' : 'none',
                        borderLeft: corner % 2 === 0 ? '1px solid rgba(218,165,32,0.4)' : 'none',
                        borderRight: corner % 2 === 1 ? '1px solid rgba(218,165,32,0.4)' : 'none',
                      }}
                    />
                  ))}

                  {/* Book content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    {/* Lightning bolt */}
                    <motion.div
                      className="text-2xl md:text-3xl mb-1"
                      animate={{ 
                        filter: ['drop-shadow(0 0 6px #FFD700)', 'drop-shadow(0 0 12px #FFD700)', 'drop-shadow(0 0 6px #FFD700)']
                      }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      ⚡
                    </motion.div>
                    
                    <div 
                      className="text-[10px] md:text-xs font-serif font-bold tracking-[0.15em] uppercase"
                      style={{ 
                        color: '#D4AF37',
                        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                        letterSpacing: '0.12em',
                      }}
                    >
                      Harry Potter
                    </div>
                    <div 
                      className="text-[8px] md:text-[10px] font-serif mt-0.5 opacity-70"
                      style={{ color: '#C9A227' }}
                    >
                      J.K. Rowling
                    </div>
                  </div>

                  {/* Subtle leather texture */}
                  <div 
                    className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' /%3E%3C/svg%3E")`,
                    }}
                  />
                </div>
                
                {/* Book pages */}
                <div 
                  className="absolute right-0 top-[3px] bottom-[3px] w-[6px] md:w-2"
                  style={{
                    background: 'linear-gradient(90deg, #E8E4D9 0%, #F5F2EA 30%, #FBF9F4 70%, #E8E4D9 100%)',
                    borderRadius: '0 3px 3px 0',
                    boxShadow: 'inset 1px 0 2px rgba(0,0,0,0.08)',
                  }}
                >
                  {/* Page lines */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-full h-[1px]"
                      style={{
                        top: `${12 + i * 10}%`,
                        background: 'rgba(0,0,0,0.04)',
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Page counter - refined */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
              >
                <span className="text-white/40 text-xs font-medium tracking-wide">Page</span>
                <motion.span 
                  className="text-xl md:text-2xl font-bold tabular-nums font-serif"
                  style={{ 
                    color: '#D4AF37',
                    textShadow: '0 0 20px rgba(212,175,55,0.4)'
                  }}
                >
                  {displayPages}
                </motion.span>
                <span className="text-white/30 text-xs font-medium">/30</span>
              </motion.div>
            </motion.div>

            {/* === QUESTION === */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ 
                opacity: ['question', 'answer', 'celebration'].includes(phase) ? 1 : 0,
                y: ['question', 'answer', 'celebration'].includes(phase) ? 0 : 25,
              }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="w-full max-w-md mt-6"
            >
              <div 
                className="relative rounded-2xl p-5 md:p-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,252,245,0.97) 0%, rgba(250,248,240,0.97) 100%)',
                  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)',
                }}
              >
                {/* Sparkle indicator */}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #F5F0E5, #EDE8DD)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                </div>

                {/* Question label */}
                <div className="flex items-center gap-2 mb-3">
                  <span 
                    className="text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded"
                    style={{ 
                      background: 'rgba(212,175,55,0.15)',
                      color: '#8B7355',
                    }}
                  >
                    Question IA
                  </span>
                </div>

                {/* Question text */}
                <div className="text-sm md:text-[15px] text-stone-700 font-medium leading-relaxed">
                  <BlurStaggerText 
                    text={question} 
                    isVisible={['question', 'answer', 'celebration'].includes(phase)} 
                  />
                </div>
              </div>
            </motion.div>

            {/* === ANSWER === */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: ['answer', 'celebration'].includes(phase) ? 1 : 0,
                y: ['answer', 'celebration'].includes(phase) ? 0 : 20
              }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="w-full max-w-sm mt-5"
            >
              <div 
                className="relative rounded-xl p-4 md:p-5 text-center"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(212,175,55,0.25)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
                }}
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-white/40 text-xs font-medium tracking-wide uppercase">Ta réponse</span>
                  <div className="flex items-center">
                    <GoldenLetterReveal 
                      word={answer} 
                      isVisible={['answer', 'celebration'].includes(phase)} 
                    />
                    {phase === 'answer' && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.7, repeat: Infinity }}
                        className="ml-0.5 w-[2px] h-7 rounded-full"
                        style={{ background: '#D4AF37' }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* === CELEBRATION === */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: phase === 'celebration' ? 1 : 0,
                scale: phase === 'celebration' ? 1 : 0.8
              }}
              transition={{ 
                type: "spring", 
                stiffness: 250, 
                damping: 20,
                delay: phase === 'celebration' ? 0.2 : 0
              }}
              className="flex flex-col items-center gap-4 mt-6"
            >
              {/* Success checkmark */}
              <motion.div
                className="relative"
                initial={{ scale: 0 }}
                animate={{ scale: phase === 'celebration' ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              >
                {/* Glow ring */}
                <motion.div
                  className="absolute -inset-3 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.25), transparent 70%)' }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                
                <svg width="52" height="52" viewBox="0 0 52 52">
                  <circle 
                    cx="26" cy="26" r="24" 
                    fill="none" 
                    stroke="rgba(34,197,94,0.2)" 
                    strokeWidth="2"
                  />
                  <circle 
                    cx="26" cy="26" r="24" 
                    fill="rgba(34,197,94,0.1)" 
                  />
                  <motion.path
                    d="M15 26 L22 33 L37 18"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: phase === 'celebration' ? 1 : 0 }}
                    transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                  />
                </svg>
              </motion.div>

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ 
                  opacity: phase === 'celebration' ? 1 : 0,
                  y: phase === 'celebration' ? 0 : 8
                }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="relative"
              >
                <div 
                  className="px-6 py-2.5 rounded-full font-bold text-sm tracking-wide"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                    boxShadow: '0 8px 25px -5px rgba(34,197,94,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset',
                    letterSpacing: '0.05em',
                  }}
                >
                  {certified}
                </div>
              </motion.div>
            </motion.div>
          </div>
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
      variants={{
        visible: { transition: { staggerChildren: 0.06 } }
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.3em]"
          variants={{
            hidden: { opacity: 0, filter: "blur(6px)", y: 4 },
            visible: { 
              opacity: 1, 
              filter: "blur(0px)",
              y: 0,
              transition: { duration: 0.35, ease: [0.23, 1, 0.32, 1] }
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
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="flex"
    >
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          className="text-2xl md:text-3xl font-bold font-serif"
          style={{
            color: '#D4AF37',
            textShadow: '0 0 25px rgba(212,175,55,0.5)',
          }}
          variants={{
            hidden: { opacity: 0, y: 15, scale: 0.7 },
            visible: { 
              opacity: 1, y: 0, scale: 1,
              transition: { type: "spring", stiffness: 250, damping: 15 }
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
