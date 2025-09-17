import { useRef } from "react";

export function useDoubleTap(onDoubleTap: () => void, delay = 300) {
  const lastTap = useRef<number>(0);
  return {
    onPointerDown: () => {
      const now = Date.now();
      if (now - lastTap.current < delay) onDoubleTap();
      lastTap.current = now;
    }
  };
}