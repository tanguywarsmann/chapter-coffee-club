
import { blogService } from '../services/blogService';

const createClassicsArticle = async () => {
  try {
    const articleData = {
      title: "10 classiques à lire pour renouer doucement avec la lecture",
      slug: "classiques-pour-recommencer",
      content: `<h2>Pourquoi recommencer par les classiques ?</h2>

<p>Reprendre la lecture après une longue pause peut sembler intimidant. Trop de distractions, trop de pages, pas assez de temps. Pourtant, certains livres ont ce pouvoir rare : celui de <em>nous prendre par la main</em>. Des histoires intemporelles, des voix claires, des récits qui résonnent encore aujourd'hui.</p>

<p>Voici une sélection de dix classiques — courts pour la plupart, denses en émotions, riches en sens — pour renouer avec le rythme lent de la lecture et retrouver un espace à soi.</p>

<hr>

<h2>Les 10 classiques pour se (re)lancer</h2>

<h3>1. <strong>Le Petit Prince – Antoine de Saint-Exupéry</strong></h3>
<p>Un conte poétique, universel, qui se lit en quelques heures et laisse une trace durable. Idéal pour renouer avec la simplicité et la profondeur.</p>

<h3>2. <strong>L'Étranger – Albert Camus</strong></h3>
<p>Une langue limpide, une narration directe, une question d'absurde et de lucidité. Parfait pour reprendre goût à un style épuré.</p>

<h3>3. <strong>Bel-Ami – Guy de Maupassant</strong></h3>
<p>Un roman d'ascension sociale captivant, à l'ironie mordante. Très fluide à lire, toujours d'actualité.</p>

<h3>4. <strong>Le Grand Meaulnes – Alain-Fournier</strong></h3>
<p>Un récit d'adolescence, de quête, d'idéal perdu. Pour se laisser porter par une atmosphère douce-amère.</p>

<h3>5. <strong>La Mare au Diable – George Sand</strong></h3>
<p>Court, sensible, rural. Un classique souvent oublié qui donne envie de ralentir.</p>

<h3>6. <strong>Gatsby le Magnifique – F. Scott Fitzgerald</strong></h3>
<p>Un style brillant, une époque enivrée, une histoire d'amour et d'illusion. Une lecture rythmée et accessible.</p>

<h3>7. <strong>Candide – Voltaire</strong></h3>
<p>Drôle, caustique, étonnamment moderne. Ce petit livre permet de renouer avec l'esprit critique tout en s'amusant.</p>

<h3>8. <strong>La Chatte – Colette</strong></h3>
<p>Une plume sensorielle, un huis clos amoureux, une jalousie feutrée. Parfait pour revenir à des textes subtils.</p>

<h3>9. <strong>Une Vie – Guy de Maupassant</strong></h3>
<p>Un destin de femme, une vie entière racontée avec tendresse et cruauté. Très fluide, très émouvant.</p>

<h3>10. <strong>Un amour de Swann – Marcel Proust</strong></h3>
<p>Un peu plus exigeant, mais fascinant dès qu'on accepte de ralentir. Pour ceux qui veulent s'ancrer vraiment dans une lecture.</p>

<hr>

<h2>Et maintenant ?</h2>

<p>Ces dix livres ne sont pas là pour vous impressionner, mais pour <em>vous accueillir</em>. Ce sont des portes ouvertes. Commencez par celui qui vous attire, sans pression. Lisez cinq pages. Puis dix. Puis laissez venir le reste.</p>

<p>Sur READ, chaque livre est découpé en segments simples, avec une petite question pour valider votre lecture. Pas de performance, juste un accompagnement.</p>

<p>📚 <em>Et si c'était le moment de relire lentement, mais vraiment ?</em></p>`,
      excerpt: "Vous souhaitez reprendre la lecture sans savoir par où commencer ? Voici dix romans classiques, accessibles, profonds et inoubliables, pour redécouvrir le plaisir de lire.",
      author: "Tanguy Warsmann",
      tags: ["lecture", "classiques", "débuter", "slow reading", "habitudes"],
      published: true
    };

    const createdPost = await blogService.createPost(articleData);
    console.log('Article créé avec succès:', createdPost);
    return createdPost;
  } catch (error) {
    console.error('Erreur lors de la création de l\'article:', error);
    throw error;
  }
};

// Exporter pour utilisation
export { createClassicsArticle };
