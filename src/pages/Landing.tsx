{/* HERO : Choc + Manifesto */}
<section className="min-h-screen flex items-center justify-center px-4">
  <div className="max-w-4xl text-center space-y-12">
    
    <LogoVreadPng size={64} />
    
    {/* Question qui pique */}
    <h1 className="text-5xl md:text-7xl font-serif text-white leading-tight">
      Combien de livres
      <br />
      tu as <span className="line-through opacity-50">achetés</span>
      <br />
      <span className="text-reed-light">vraiment terminés</span> ?
    </h1>
    
    {/* Stat choc */}
    <div>
      <div className="text-8xl font-bold text-reed-light">3/10</div>
      <p className="text-xl text-white/70 mt-4">
        En moyenne. VREAD change ça.
      </p>
    </div>
    
    {/* Manifesto court */}
    <div className="space-y-4 text-xl text-white/90">
      <p>On prouve qu'on lit. Vraiment.</p>
      <p>Question tous les 30 pages. Pas de triche.</p>
      <p className="text-2xl font-bold text-white">
        Si c'est pas sur VREAD, tu l'as pas lu.
      </p>
    </div>
    
    {/* CTA + Social proof */}
    <div className="space-y-6">
      <Button 
        size="lg" 
        className="bg-reed-light px-16 py-8 text-2xl font-bold text-reed-darker hover:bg-white"
      >
        <Link to="/auth">Prouver que je lis</Link>
      </Button>
      
      <div className="flex justify-center gap-8 text-white/70 text-sm">
        <span>370 lecteurs</span>
        <span>•</span>
        <span>Gratuit</span>
        <span>•</span>
        <span>Sans engagement</span>
      </div>
    </div>
    
  </div>
</section>

{/* Section 2 : Comment ça marche (3 étapes visuelles) */}
{/* Section 3 : Témoignage court */}
{/* Footer minimaliste */}
