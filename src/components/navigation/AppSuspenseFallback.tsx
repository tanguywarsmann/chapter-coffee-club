import LogoVreadPng from "@/components/brand/LogoVreadPng";
import { Loader2 } from "lucide-react";

export const AppSuspenseFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-reed-primary via-reed-primary to-reed-secondary flex flex-col items-center justify-center text-white transition-colors duration-300">
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-3xl border-4 border-white/40 p-4 shadow-xl bg-white/5 backdrop-blur-sm">
        <LogoVreadPng size={72} className="h-16 w-16" />
      </div>
      <p className="text-lg font-serif tracking-wide">Chargement de VREAD…</p>
      <Loader2 className="h-7 w-7 animate-spin" aria-hidden="true" />
    </div>
  </div>
);
