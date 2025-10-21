import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import LogoVreadPng from "@/components/brand/LogoVreadPng";
import { ArrowRight, Check, Zap } from "lucide-react";

export default function Landing() {
  return (
    <>
      <Helmet>
        <title>VREAD — Si c'est pas sur VREAD, tu l'as pas lu</title>
        <meta name="description" content="Tu finis 2 livres sur 10. VREAD change ça. Prouve que tu lis vraiment." />
        <meta property="og:title" content="VREAD — Si c'est pas sur VREAD, tu l'as pas lu" />
        <meta property="og:description" content="Tu finis 2 livres sur 10. VREAD change ça." />
      </Helmet>

      <div className="relative bg-black">
        
        {/* ========== HERO SECTION ========== */}
        <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
          
          {/* Background gradient subtil */}
          <div className="absolute inset-0 bg-gradient-radial from-reed-primary/20 via-black to-black" />
          
          {/* Noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
          </div>
          
          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto text-center space-y-16">
            
            {/* Logo avec halo */}
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-reed-light/30 blur-3xl rounded-full scale-150" />
              <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-3xl p-6 shadow-2xl">
                <LogoVreadPng size={72} className="relative z-10" />
              </div>
            </div>
            
            {/* Titre avec contraste max */}
            <div className="space-y-6">
              <h1 className="text-7xl md:text-9xl lg:text-[13rem] font-serif font-black text-white leading-[0.85] tracking-tight">
                Tu l'as
                <br />
                <span className="relative inline-block">
                  <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-reed-light to-red-500 opacity-40" />
                  <span className="relative bg-gradient-to-r from-reed-light via-amber-200 to-red-400 bg-clip-text text-transparent">
                    vraiment
                  </span>
                </span>
                <br />
                lu ?
              </h1>
              
              {/* Sous-titre contrasté */}
              <p className="text-2xl md:text-3xl text-white/60 font-light max-w-3xl mx-auto">
                Spoiler : probablement pas.
              </p>
            </div>
            
            {/* CTA avec depth */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button 
                size="lg"
                className="group relative bg-white hover:bg-white text-black px-12 py-8 text-2xl font-bold rounded-2xl shadow-[0_0_50px_rgba(238,220,200,0.3)] hover:shadow-[0_0_80px_rgba(238,220,200,0.5)] transition-all duration-300 overflow-hidden"
                asChild
              >
                <Link to="/auth" className="relative z-10">
                  <span className="flex items-center gap-3">
                    Prouver que je lis
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </Button>
            </div>
            
            {/* Social proof discret */}
            <div className="flex items-center justify-center gap-6 text-white/40 text-sm pt-8">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                370 lecteurs
              </span>
              <span>•</span>
              <span>Gratuit</span>
              <span>•</span>
              <span>Sans engagement</span>
            </div>
            
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/20 rounded-full p-1">
              <div className="w-1.5 h-3 bg-white/40 rounded-full mx-auto animate-pulse" />
            </div>
          </div>
          
        </section>

        {/* ========== SECTION STAT CHOC ========== */}
        <section className="relative py-32 px-4 bg-gradient-to-b from-black via-reed-primary/10 to-black">
          
          {/* Grille subtile en background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
          
          <div className="relative z-10 max-w-6xl mx-auto">
            
            {/* Question setup */}
            <div className="text-center mb-20 space-y-6">
              <h2 className="text-4xl md:text-6xl font-serif text-white/90 font-bold">
                Combien de livres tu as
                <br />
                <span className="line-through text-white/30">achetés</span>
                {" "}vraiment terminés ?
              </h2>
            </div>
            
            {/* Stat géante avec effet 3D */}
            <div className="relative group">
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-amber-500/20 blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
              
              {/* Card principale */}
              <div className="relative bg-gradient-to-br from-zinc-900 to-black border-2 border-white/10 rounded-3xl p-16 md:p-24 text-center shadow-2xl">
                
                {/* Stat */}
                <div className="space-y-8">
                  <div className="relative inline-block">
                    {/* Shadow layers pour depth */}
                    <div className="absolute inset-0 text-[18rem] md:text-[25rem] lg:text-[30rem] font-black text-red-500/10 blur-xl scale-105">
                      2/10
                    </div>
                    <div className="absolute inset-0 text-[18rem] md:text-[25rem] lg:text-[30rem] font-black text-orange-500/10 blur-2xl scale-110">
                      2/10
                    </div>
                    
                    {/* Texte principal avec gradient */}
                    <div className="relative text-[18rem] md:text-[25rem] lg:text-[30rem] font-black leading-none">
                      <span className="bg-gradient-to-br from-red-400 via-orange-400 to-amb
