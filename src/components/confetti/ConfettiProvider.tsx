import React, { createContext, useCallback, useContext, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

type ConfettiCtx = { showConfetti: (opts?: { burst?: "small" | "big" }) => void };
const Ctx = createContext<ConfettiCtx>({ showConfetti: () => {} });

export const ConfettiProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiRef = useRef<ReturnType<typeof confetti.create> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!canvasRef.current) return;
    confettiRef.current = confetti.create(canvasRef.current, { resize: true, useWorker: true });
  }, []);

  const showConfetti = useCallback((opts?: { burst?: "small" | "big" }) => {
    const c = confettiRef.current;
    if (!c) return;

    const burst = opts?.burst ?? "big";

    // Deux cônes latéraux + splash central
    c({ particleCount: burst === "big" ? 120 : 60, angle: 60, spread: 55, origin: { x: 0, y: 0.6 } });
    c({ particleCount: burst === "big" ? 120 : 60, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } });
    c({ particleCount: burst === "big" ? 80 : 40, spread: 70, startVelocity: 35, origin: { y: 0.6 } });
  }, []);

  return (
    <Ctx.Provider value={{ showConfetti }}>
      {/* Canvas full-screen au plus haut z-index pour passer AU-DESSUS des Dialog Radix */}
      <div className="pointer-events-none fixed inset-0 z-[9999]">
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
      {children}
    </Ctx.Provider>
  );
};

export const useConfetti = () => useContext(Ctx);