import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";

export function BookyOverlay({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ filter: "blur(24px)", background: "#AE6841" }}
              initial={{ opacity: 0.15, scale: 0.7 }}
              animate={{ opacity: 0.18, scale: 1.15 }}
              exit={{ opacity: 0 }}
            />
            <Heart className="h-28 w-28" color="#DFC5A6" strokeWidth={1.5} fill="#DFC5A6" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}