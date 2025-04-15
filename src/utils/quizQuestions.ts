type QuestionData = {
  question: string;
  answer: string[];
};

type BookQuestions = {
  [chapter: number]: QuestionData;
};

type Questions = {
  [bookTitle: string]: BookQuestions;
};

export const questions: Questions = {
  "Les Misérables": {
    1: { question: "Comment s'appelle l'évêque qui accueille Jean Valjean ?", answer: ["myriel", "monseigneur myriel", "l'évêque myriel", "eveque myriel", "évêque myriel"] },
    2: { question: "Quel objet Jean Valjean vole-t-il qui le conduit en prison ?", answer: ["pain", "miche de pain", "une miche de pain", "du pain"] },
    3: { question: "Quel est le nom de la fille de Fantine ?", answer: ["cosette"] },
    4: { question: "Comment s'appelle l'inspecteur qui poursuit Jean Valjean ?", answer: ["javert"] },
    5: { question: "Dans quelle ville Jean Valjean devient-il maire ?", answer: ["montreuil", "montreuil-sur-mer"] },
    6: { question: "Quel est le nom du garçon qui meurt sur la barricade ?", answer: ["gavroche"] },
    7: { question: "Quelle est la profession de Monsieur Thénardier ?", answer: ["aubergiste", "auberge", "tenancier", "tenancier d'auberge"] },
    8: { question: "Dans quel quartier de Paris se déroule l'insurrection ?", answer: ["saint-antoine", "saint antoine", "faubourg saint-antoine", "faubourg saint antoine"] },
    9: { question: "Dans quel endroit Javert poursuit-il Jean Valjean et Cosette ?", answer: ["égouts", "egouts", "les égouts", "les egouts", "égouts de paris"] },
    10: { question: "Quel est le nom de l'ami d'enfance de Marius ?", answer: ["courfeyrac"] },
    11: { question: "Qui sauve Jean Valjean de la barricade ?", answer: ["javert"] },
    12: { question: "Quel objet Cosette trouve-t-elle dans son matelas ?", answer: ["lettre", "une lettre", "billet", "un billet"] }
  },
  "Le Comte de Monte-Cristo": {
    1: { question: "Sur quelle île Edmond Dantès est-il emprisonné ?", answer: ["if", "château d'if", "chateau d'if", "l'île d'if", "ile d'if", "île d'if"] },
    2: { question: "Quel trésor Edmond découvre-t-il grâce à l'abbé Faria ?", answer: ["spada", "trésor de spada", "tresor de spada", "le trésor de spada", "le tresor de spada"] },
    3: { question: "Quel est le nom du navire sur lequel travaillait Edmond ?", answer: ["pharaon", "le pharaon"] },
    4: { question: "Quel nom prend Edmond après son évasion ?", answer: ["monte-cristo", "comte de monte-cristo", "le comte de monte-cristo"] },
    5: { question: "Qui a dénoncé Edmond par jalousie ?", answer: ["danglars", "fernand", "mondego"] },
    6: { question: "Quel poison lent utilise le comte pour se venger ?", answer: ["brucine"] },
    7: { question: "Quel est le nom de la fiancée d'Edmond Dantès ?", answer: ["mercédès", "mercedes"] },
    8: { question: "Quelle est la profession de Noirtier de Villefort ?", answer: ["bonapartiste", "révolutionnaire", "revolutionnaire"] },
    9: { question: "Quel noble titre Fernand Mondego obtient-il ?", answer: ["comte", "comte de morcerf"] },
    10: { question: "Dans quelle ville italienne le comte établit-il une résidence ?", answer: ["rome"] },
    11: { question: "Quel est le nom du bandit que le comte sauve de la justice ?", answer: ["vampa", "luigi vampa"] },
    12: { question: "Qu'est-ce que le comte donne à Maximilien à la fin ?", answer: ["haydée", "haydee"] },
    13: { question: "Quelle substance le comte utilise-t-il pour simuler la mort ?", answer: ["drogue", "potion", "poison"] },
    14: { question: "Qui est le fils du procureur de Villefort ?", answer: ["edouard", "édouard"] },
    15: { question: "Dans quelle ville commence l'histoire ?", answer: ["marseille"] }
  },
  "Notre-Dame de Paris": {
    1: { question: "Quel est le métier de Quasimodo ?", answer: ["sonneur", "sonneur de cloches", "carillonneur"] },
    2: { question: "Comment s'appelle la bohémienne dont Quasimodo tombe amoureux ?", answer: ["esmeralda", "la esmeralda"] },
    3: { question: "Quel est le nom du prêtre qui a recueilli Quasimodo ?", answer: ["frollo", "claude frollo", "l'archidiacre frollo", "archidiacre frollo"] },
    4: { question: "Quel animal accompagne souvent Esmeralda ?", answer: ["chèvre", "chevre", "une chèvre", "une chevre", "djali"] },
    5: { question: "En quelle année se déroule l'histoire ?", answer: ["1482"] },
    6: { question: "Qu'est-ce que Quasimodo gagne pendant la Fête des Fous ?", answer: ["couronne", "titre", "roi", "roi des fous"] },
    7: { question: "Quel mot Esmeralda apprend-elle à sa chèvre ?", answer: ["phoebus"] },
    8: { question: "Où Esmeralda est-elle condamnée à être exécutée ?", answer: ["place de grève", "grève"] },
    9: { question: "Quel est le nom du capitaine des archers dont Esmeralda tombe amoureuse ?", answer: ["phoebus", "phoebus de châteaupers"] },
    10: { question: "Dans quel endroit de la cathédrale Quasimodo offre-t-il asile à Esmeralda ?", answer: ["clocher", "tour", "tours", "beffroi"] }
  },
  "Harry Potter à l'école des sorciers": {
    1: { question: "Où dort Harry Potter chez les Dursley ?", answer: ["placard", "sous l'escalier", "sous l escalier", "dans le placard", "placard sous l'escalier", "placard sous l escalier"] },
    2: { question: "Quel est le numéro du coffre de Harry à Gringotts ?", answer: ["687"] },
    3: { question: "Quel animal Harry achète-t-il comme compagnon ?", answer: ["chouette", "une chouette", "hibou", "un hibou", "hedwige"] },
    4: { question: "Dans quelle maison Harry est-il placé à Poudlard ?", answer: ["gryffondor"] },
    5: { question: "Quel objet magique Harry reçoit-il à Noël ?", answer: ["cape", "cape d'invisibilité", "cape d invisibilité", "une cape d'invisibilité"] },
    6: { question: "Quel sport pratique-t-on sur des balais volants ?", answer: ["quidditch"] },
    7: { question: "Quel poste Harry occupe-t-il dans l'équipe de Quidditch ?", answer: ["attrapeur"] },
    8: { question: "Quel animal garde la trappe au troisième étage ?", answer: ["chien", "chien à trois têtes", "cerbère", "touffu"] },
    9: { question: "Quel professeur ensorcelle le balai de Harry pendant le match ?", answer: ["quirrell"] },
    10: { question: "Qu'est-ce que le miroir du Riséd montre à Harry ?", answer: ["famille", "parents", "sa famille", "ses parents"] },
    11: { question: "Quelle créature se nourrit de sang de licorne dans la forêt interdite ?", answer: ["voldemort"] },
    12: { question: "Quel objet Harry cherche-t-il à protéger de Voldemort ?", answer: ["pierre", "pierre philosophale"] }
  },
  "Le Petit Prince": {
    1: { question: "Sur quelle planète vit le Petit Prince ?", answer: ["b612", "asteroide b612", "astéroïde b612"] },
    2: { question: "Quel animal le Petit Prince demande-t-il au narrateur de dessiner au début ?", answer: ["mouton", "un mouton"] },
    3: { question: "Quelle fleur le Petit Prince aime-t-il particulièrement ?", answer: ["rose", "une rose", "sa rose"] },
    4: { question: "Quel animal rencontre le Petit Prince dans le désert ?", answer: ["renard", "un renard", "le renard"] },
    5: { question: "Comment le Petit Prince quitte-t-il la Terre ?", answer: ["serpent", "morsure", "morsure de serpent", "piqûre de serpent", "piqure de serpent"] }
  },
  "Les Trois Mousquetaires": {
    1: { question: "Comment s'appelle le jeune héros qui rejoint les mousquetaires ?", answer: ["d'artagnan", "dartagnan"] },
    2: { question: "Quel est le nom de la femme espionne aux ordres du cardinal ?", answer: ["milady", "milady de winter"] },
    3: { question: "Nommez l'un des trois mousquetaires.", answer: ["athos", "porthos", "aramis"] },
    4: { question: "Quelle devise célèbre unit les mousquetaires ?", answer: ["un pour tous", "tous pour un", "un pour tous, tous pour un"] },
    5: { question: "Que recherche la reine Anne d'Autriche à Londres ?", answer: ["ferrets", "les ferrets", "ferrets de diamants", "les ferrets de diamants"] },
    6: { question: "Quel cadeau d'Artagnan reçoit-il de la reine ?", answer: ["bague", "une bague", "anneau"] },
    7: { question: "De quelle province française vient d'Artagnan ?", answer: ["gascogne"] },
    8: { question: "Quel est le vrai nom de Milady ?", answer: ["winter", "de winter", "charlotte backson"] },
    9: { question: "Qui est le mari d'Athos ?", answer: ["milady", "milady de winter"] },
    10: { question: "Comment s'appelle le cheval de d'Artagnan ?", answer: ["buttercup", "rossinante"] }
  },
  "L'Étranger": {
    1: { question: "Comment s'appelle le personnage principal ?", answer: ["meursault"] },
    2: { question: "Quel événement ouvre le roman ?", answer: ["mort", "la mort", "mort de sa mère", "la mort de sa mère", "décès de sa mère"] },
    3: { question: "Dans quelle ville se déroule l'histoire ?", answer: ["alger"] },
    4: { question: "Quel crime commet Meursault ?", answer: ["meurtre", "un meurtre", "tue un arabe", "il tue un arabe"] },
    5: { question: "Quelle est la dernière chose que Meursault souhaite avant son exécution ?", answer: ["cris", "des cris", "huées", "des huées", "haine", "la haine"] },
    6: { question: "Quel est le prénom de l'amie de Meursault ?", answer: ["marie", "marie cardona"] },
    7: { question: "Où travaille Meursault ?", answer: ["bureau", "bureau maritime"] },
    8: { question: "Quelle boisson Meursault partage-t-il avec le gardien lors de la veillée funèbre ?", answer: ["café", "du café"] }
  },
  "La Peste": {
    1: { question: "Dans quelle ville algérienne se déroule l'histoire ?", answer: ["oran"] },
    2: { question: "Quel est le métier du docteur Rieux ?", answer: ["médecin", "medecin", "docteur"] },
    3: { question: "Quelle est la première manifestation de l'épidémie ?", answer: ["rats", "des rats", "rats morts", "des rats morts"] },
    4: { question: "Quel personnage tente de s'échapper de la ville ?", answer: ["rambert"] },
    5: { question: "Qui est le narrateur du roman ?", answer: ["rieux", "docteur rieux", "le docteur rieux"] },
    6: { question: "Quel personnage voit dans la peste un châtiment divin ?", answer: ["paneloux", "père paneloux", "le père paneloux"] },
    7: { question: "Quel enfant meurt d'une agonie particulièrement douloureuse ?", answer: ["othon", "fils d'othon", "le fils d'othon", "le petit othon"] },
    8: { question: "Quel personnage tient un journal détaillé de l'épidémie ?", answer: ["tarrou", "jean tarrou"] },
    9: { question: "Quelle est la profession de Grand ?", answer: ["employé", "employé municipal", "employe municipal", "fonctionnaire"] },
    10: { question: "À quoi le docteur Rieux compare-t-il la peste à la fin du roman ?", answer: ["sommeil", "le sommeil"] }
  },
  "Germinal": {
    1: { question: "Quel est le nom de la mine où travaillent les personnages ?", answer: ["le voreux", "voreux"] },
    2: { question: "Comment s'appelle le personnage principal ?", answer: ["étienne", "etienne", "étienne lantier", "etienne lantier"] },
    3: { question: "Quelle est la cause principale de la grève des mineurs ?", answer: ["salaire", "salaires", "baisse", "réduction", "diminution"] },
    4: { question: "Quel personnage féminin devient la compagne d'Étienne ?", answer: ["catherine", "catherine maheu"] },
    5: { question: "Quelle catastrophe survient à la mine à la fin du roman ?", answer: ["éboulement", "eboulement", "effondrement", "inondation"] },
    6: { question: "Quel est le nom de la famille de mineurs au centre du roman ?", answer: ["maheu", "les maheu"] },
    7: { question: "Quel est le nom du cheval qui travaille dans la mine ?", answer: ["bataille"] },
    8: { question: "Qui est tué par la foule pendant l'émeute ?", answer: ["maigrat"] }
  },
  "Madame Bovary": {
    1: { question: "Quel est le prénom de Madame Bovary ?", answer: ["emma"] },
    2: { question: "Quelle est la profession de Charles Bovary ?", answer: ["médecin", "medecin", "officier de santé"] },
    3: { question: "Comment s'appelle le premier amant d'Emma ?", answer: ["rodolphe", "rodolphe boulanger"] },
    4: { question: "Dans quelle ville Charles et Emma s'installent-ils ?", answer: ["yonville"] },
    5: { question: "Quelle substance Emma utilise-t-elle pour se suicider ?", answer: ["arsenic"] },
    6: { question: "Comment s'appelle la fille d'Emma et Charles ?", answer: ["berthe"] },
    7: { question: "Qui est le pharmacien bavard, ami de Charles ?", answer: ["homais", "monsieur homais"] },
    8: { question: "Comment s'appelle le second amant d'Emma ?", answer: ["léon", "leon", "leon dupuis", "leon dupuis"] },
    9: { question: "Quel marchand fournit des tissus et des objets à crédit à Emma ?", answer: ["lheureux"] },
    10: { question: "Quelle grande fête marque le début de la relation entre Emma et Rodolphe ?", answer: ["comices", "comices agricoles", "les comices agricoles"] }
  },
  "Les Fleurs du Mal": {
    1: { question: "Quel poème ouvre le recueil ?", answer: ["au lecteur", "bénédiction", "benediction"] },
    2: { question: "Quel poème est dédié à Jeanne Duval ?", answer: ["parfum exotique", "le serpent qui danse"] },
    3: { question: "Comment s'appelle la section censurée du recueil ?", answer: ["pièces condamnées", "pieces condamnees", "les pièces condamnées"] },
    4: { question: "Quel animal symbolise le poète dans un célèbre poème ?", answer: ["albatros", "l'albatros"] },
    5: { question: "Quel terme désigne l'ennui profond dans plusieurs poèmes ?", answer: ["spleen"] },
    6: { question: "Quelle ville est souvent évoquée dans le recueil ?", answer: ["paris"] },
    7: { question: "Quel poème traite de la charogne au bord du chemin ?", answer: ["une charogne", "la charogne"] }
  },
  "Candide": {
    1: { question: "Dans quel pays se trouve le château où vit initialement Candide ?", answer: ["westphalie", "allemagne"] },
    2: { question: "Qui enseigne à Candide que tout est pour le mieux dans le meilleur des mondes ?", answer: ["pangloss", "docteur pangloss", "le docteur pangloss"] },
    3: { question: "Comment s'appelle l'amour de Candide ?", answer: ["cunégonde", "cunegonde"] },
    4: { question: "Quel pays fabuleux Candide visite-t-il en Amérique du Sud ?", answer: ["eldorado", "l'eldorado"] },
    5: { question: "Quelle est la conclusion philosophique du roman ?", answer: ["jardin", "cultiver", "cultiver son jardin", "il faut cultiver notre jardin", "il faut cultiver son jardin"] },
    6: { question: "Quel désastre naturel Candide vit-il au Portugal ?", answer: ["tremblement", "tremblement de terre", "séisme", "seisme"] },
    7: { question: "Qui est le frère de Cunégonde ?", answer: ["baron", "le baron"] },
    8: { question: "Qui est la vieille dame qui accompagne Candide et Cunégonde ?", answer: ["vieille", "la vieille"] }
  },
  "La Chatte": {
    1: { question: "Dans quel quartier parisien se trouve l'appartement d'Alain et Camille ?", answer: ["auteuil", "quartier d'auteuil"] },
    2: { question: "Quel est le nom de la chatte siamoise d'Alain ?", answer: ["saha"] },
    3: { question: "Quelle pièce Alain aménage-t-il spécialement pour Saha ?", answer: ["terrasse", "la terrasse"] },
    4: { question: "Quel objet Camille casse-t-elle par jalousie ?", answer: ["vase", "le vase", "un vase"] },
    5: { question: "Sur quel meuble Saha dort-elle habituellement ?", answer: ["coussin", "le coussin", "coussin bleu", "le coussin bleu"] },
    6: { question: "Quel accident Camille tente-t-elle de provoquer ?", answer: ["chute", "faire tomber saha", "pousser saha", "la chute de saha"] },
    7: { question: "Dans quelle ville Alain décide-t-il de partir avec Saha ?", answer: ["nice"] },
    8: { question: "Que fait Camille à la fin du roman ?", answer: ["part", "s'en va", "quitte alain", "elle part"] }
  },
  "Un amour de Swann": {
    1: { question: "Dans quel salon Swann rencontre-t-il Odette pour la première fois ?", answer: ["verdurin", "les verdurin", "salon verdurin", "le salon verdurin"] },
    2: { question: "Quelle phrase musicale devient le symbole de l'amour entre Swann et Odette ?", answer: ["sonate de vinteuil", "la sonate de vinteuil", "vinteuil"] },
    3: { question: "Quel surnom Odette donne-t-elle à Swann ?", answer: ["chéri", "cheri"] },
    4: { question: "Dans quel quartier se trouve le petit hôtel où vit Odette ?", answer: ["monceau", "parc monceau", "quartier monceau"] },
    5: { question: "Quel mot dans la lettre d'Odette déclenche la jalousie de Swann ?", answer: ["cattleya", "faire cattleya", "des cattleyas"] },
    6: { question: "Quelle phrase Swann prononce-t-il à la fin sur son amour pour Odette ?", answer: ["pas mon genre", "n'était pas mon genre", "n'était même pas mon genre"] }
  },
  "Gatsby le Magnifique": {
    1: { question: "Dans quelle ville Nick Carraway emménage-t-il au début du roman ?", answer: ["west egg", "ouest egg"] },
    2: { question: "Quelle couleur est la lumière qui brille au bout du ponton de Daisy ?", answer: ["verte", "vert", "une lumière verte", "la lumière verte"] },
    3: { question: "Quel est le vrai nom de Gatsby avant qu'il ne le change ?", answer: ["james gatz", "gatz"] },
    4: { question: "Dans quel hôtel Gatsby et Tom ont-ils leur confrontation ?", answer: ["plaza", "plaza hotel", "hôtel plaza", "hotel plaza"] },
    5: { question: "Quelle est la profession de Wilson ?", answer: ["garagiste", "mécanicien", "mecanicien"] },
    6: { question: "Quelle voiture Gatsby prête-t-il à Daisy lors de l'accident ?", answer: ["rolls", "rolls-royce", "rolls royce", "la rolls"] },
    7: { question: "Qui conduit la voiture lors de l'accident qui tue Myrtle ?", answer: ["daisy"] },
    8: { question: "Dans quelle piscine Gatsby est-il assassiné ?", answer: ["sa piscine", "piscine", "la piscine"] },
    9: { question: "Qui est la seule personne à assister à l'enterrement de Gatsby ?", answer: ["nick", "nick carraway"] }
  }
};

export const getQuestion = (bookTitle: string, chapterNumber: number): QuestionData => {
  const bookQuestions = questions[bookTitle];
  
  if (!bookQuestions) {
    throw new Error(`No questions found for book: ${bookTitle}`);
  }
  
  const chapterQuestions = bookQuestions[chapterNumber];
  if (chapterQuestions) {
    return chapterQuestions;
  }
  
  const availableChapters = Object.keys(bookQuestions).map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
  const cycleIndex = (chapterNumber - 1) % availableChapters.length;
  const fallbackChapter = availableChapters[cycleIndex];
  return bookQuestions[fallbackChapter];
};

export const checkAnswer = (userAnswer: string, acceptedAnswers: string[]): boolean => {
  if (!userAnswer.trim()) return false;
  
  const normalizedUserAnswer = userAnswer.trim().toLowerCase();
  return acceptedAnswers.some(acceptedAnswer => 
    normalizedUserAnswer.includes(acceptedAnswer.toLowerCase())
  );
};
