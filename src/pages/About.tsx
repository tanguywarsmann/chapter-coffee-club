import { Link } from "react-router-dom";
import { SEOHead } from "@/components/seo/SEOHead";

export default function About() {
  return (
    <>
      <SEOHead
        title="VREAD · À propos — L'application qui transforme votre lecture"
        description="Découvrez VREAD, l'application révolutionnaire qui gamifie votre lecture grâce à des questions IA, un système de progression motivant et une communauté de lecteurs passionnés. Transformez chaque page en succès !"
        canonical="https://www.vread.fr/a-propos"
        tags={["lecture", "application", "motivation", "communauté", "livres", "gamification"]}
      />

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="prose prose-neutral max-w-none">
          <h1 className="text-4xl font-bold mb-6">VREAD : Révolutionnez votre façon de lire</h1>

          <p className="text-xl leading-relaxed mb-8 text-logo-accent font-medium">
            VREAD accompagne votre lecture, page après page. Notre plateforme révolutionnaire mêle passion
            du livre, motivation personnelle et communauté bienveillante pour transformer chaque progression en victoire.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6">🚀 Qu'est-ce que VREAD ?</h2>
          
          <p className="mb-6">
            VREAD est l'application qui <strong>gamifie intelligemment votre expérience de lecture</strong>. 
            Finies les lectures abandonnées à mi-parcours ! Grâce à notre système unique de validation par questions IA, 
            chaque segment de lecture devient un défi stimulant et chaque page tournée, un succès tangible.
          </p>

          <div className="bg-gradient-to-r from-logo-accent/10 to-logo-background/10 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold mb-4">💡 Comment ça marche ?</h3>
            <ul className="space-y-3">
              <li><strong>1. Choisissez votre livre</strong> parmi notre vaste bibliothèque</li>
              <li><strong>2. Lisez par segments</strong> d'environ 30 pages</li>
              <li><strong>3. Validez votre compréhension</strong> avec une question IA personnalisée</li>
              <li><strong>4. Progressez et débloquez</strong> des badges et récompenses</li>
              <li><strong>5. Partagez vos succès</strong> avec la communauté VREAD</li>
            </ul>
          </div>

          <h2 className="text-2xl font-semibold mt-12 mb-6">🎯 Notre mission</h2>
          <p className="mb-6">
            <strong>Démocratiser la lecture régulière</strong> en la rendant accessible, motivante et sociale. 
            Nous croyons que chaque personne peut développer une habitude de lecture durable avec les bons outils 
            et la bonne communauté. VREAD transforme la lecture solitaire en aventure collective.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6">✨ Nos valeurs fondamentales</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="p-4 border-l-4 border-logo-accent">
              <h3 className="font-semibold mb-2">📚 Accessibilité</h3>
              <p>La lecture pour tous, sans discrimination de niveau ou de rythme. Chacun avance à sa vitesse.</p>
            </div>
            <div className="p-4 border-l-4 border-logo-accent">
              <h3 className="font-semibold mb-2">🤝 Communauté</h3>
              <p>Avancer ensemble, s'entraider et célébrer les victoires de chacun dans un esprit bienveillant.</p>
            </div>
            <div className="p-4 border-l-4 border-logo-accent">
              <h3 className="font-semibold mb-2">📈 Progression</h3>
              <p>Suivre ses objectifs, visualiser ses progrès et maintenir la motivation sur le long terme.</p>
            </div>
            <div className="p-4 border-l-4 border-logo-accent">
              <h3 className="font-semibold mb-2">🌟 Découverte</h3>
              <p>Ouvrir de nouveaux horizons littéraires et encourager l'exploration de genres variés.</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mt-12 mb-6">🏆 Pourquoi choisir VREAD ?</h2>
          <ul className="space-y-4 mb-8">
            <li><strong>📱 Interface intuitive</strong> : Design moderne et ergonomique pour une expérience fluide</li>
            <li><strong>🤖 IA personnalisée</strong> : Questions adaptées à votre niveau et style de lecture</li>
            <li><strong>🎮 Gamification motivante</strong> : Badges, classements et défis pour maintenir l'engagement</li>
            <li><strong>📊 Suivi détaillé</strong> : Statistiques complètes de vos habitudes de lecture</li>
            <li><strong>🌐 Communauté active</strong> : Échangez avec des milliers de lecteurs passionnés</li>
            <li><strong>📚 Bibliothèque riche</strong> : Des milliers de livres dans tous les genres</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-6">👥 L'équipe VREAD</h2>
          <p className="mb-6">
            VREAD est né de la passion d'une équipe de développeurs et de passionnés de littérature. 
            Nous sommes convaincus que la technologie peut servir la culture et rendre la lecture plus accessible 
            à l'ère numérique. Chaque fonctionnalité est pensée avec soin pour respecter l'expérience de lecture 
            tout en l'enrichissant.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6">📞 Contact et support</h2>
          <p className="mb-6">
            Des questions ? Des suggestions ? Notre équipe est à votre écoute pour améliorer continuellement 
            votre expérience VREAD. Rejoignez notre communauté Discord ou écrivez-nous directement !
          </p>

          <div className="bg-logo-background text-white p-8 rounded-lg text-center mt-12">
            <h3 className="text-2xl font-bold mb-4">Prêt à transformer votre lecture ?</h3>
            <p className="mb-6 text-lg">
              Rejoignez des milliers de lecteurs qui ont déjà révolutionné leurs habitudes de lecture avec VREAD.
            </p>
            <Link
              to="/auth"
              className="inline-block bg-white text-logo-background hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg"
            >
              Créer mon compte gratuitement
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}