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
  "Le Petit Prince": {
    1: { 
      question: "Quel animal le narrateur dessine-t-il en premier ?",
      answer: ["boa", "le boa", "un boa"]
    },
    2: { 
      question: "Quel objet le Petit Prince demande-t-il au narrateur de dessiner ?",
      answer: ["mouton", "un mouton", "le mouton"] 
    },
    3: { 
      question: "De quelle planète vient le Petit Prince ?",
      answer: ["b612", "asteroide b612", "astéroïde b612", "l'astéroïde b612", "l'asteroide b612"]
    },
    4: { 
      question: "Quel personnage allume et éteint une lampe sans cesse ?",
      answer: ["allumeur", "l'allumeur", "un allumeur"]
    },
    5: { 
      question: "Quel animal le Petit Prince apprivoise-t-il ?",
      answer: ["renard", "le renard", "un renard"]
    },
    6: { 
      question: "Quel secret le renard révèle-t-il ? (réponse : un mot)",
      answer: ["coeur", "cœur", "le coeur", "le cœur"]
    },
    7: { 
      question: "Avec quoi le Petit Prince repart-il à la fin ?",
      answer: ["morsure", "la morsure", "une morsure", "morsure de serpent", "la morsure du serpent"]
    }
  },
  "Les Misérables": {
    1: { question: "Comment s'appelle l'évêque qui accueille Jean Valjean ?", answer: ["myriel", "monseigneur myriel", "l'évêque myriel"] },
    2: { question: "Quel objet Jean Valjean vole-t-il qui le conduit en prison ?", answer: ["pain", "miche de pain", "une miche de pain", "du pain"] }
  },
  "harry-potter-1": {
    1: { 
      question: "Où vivent Harry et les Dursley ?",
      answer: ["privet", "privet drive", "4 privet drive"]
    },
    2: { 
      question: "Quel objet magique Harry reçoit-il par hibou ?",
      answer: ["lettre", "la lettre", "une lettre"]
    },
    3: { 
      question: "Dans quelle boutique Harry achète-t-il sa baguette ?",
      answer: ["ollivander", "ollivanders", "chez ollivander"]
    },
    4: { 
      question: "Quel est le nom du train magique ?",
      answer: ["poudlardexpress", "poudlard express", "le poudlard express"]
    },
    5: { 
      question: "Dans quelle maison est envoyé Harry ?",
      answer: ["gryffondor", "griffondor"]
    },
    6: { 
      question: "Quel professeur surveille Severus Rogue ?",
      answer: ["quirrell", "quirrel", "professeur quirrell"]
    },
    7: { 
      question: "Quel jeu joue Harry sur un balai ?",
      answer: ["quidditch", "le quidditch"]
    },
    8: { 
      question: "Quel objet devient invisible ?",
      answer: ["cape", "la cape", "cape d'invisibilité", "la cape d'invisibilité"]
    },
    9: { 
      question: "Qui est Nicolas Flamel ?",
      answer: ["alchimiste", "un alchimiste", "l'alchimiste"]
    },
    10: { 
      question: "Qui garde la trappe piégée ?",
      answer: ["touffu", "le chien touffu"]
    },
    11: { 
      question: "Qui essayait de voler la pierre ?",
      answer: ["voldemort", "lord voldemort"]
    }
  },
  "candide": {
    1: { 
      question: "Quel est le nom du philosophe optimiste ?",
      answer: ["pangloss", "le docteur pangloss"]
    },
    2: { 
      question: "Quelle ville est détruite par un séisme ?",
      answer: ["lisbonne"]
    },
    3: { 
      question: "Quel tribunal religieux apparaît dans le récit ?",
      answer: ["inquisition", "l'inquisition"]
    },
    4: { 
      question: "Comment s'appelle le serviteur fidèle de Candide ?",
      answer: ["cacambo"]
    },
    5: { 
      question: "Quel pays utopique visite Candide ?",
      answer: ["eldorado", "l'eldorado"]
    },
    6: { 
      question: "Quel métal est considéré comme banal à Eldorado ?",
      answer: ["or", "l'or"]
    },
    7: { 
      question: "Quelle femme Candide aime-t-il ?",
      answer: ["cunégonde", "cunegonde"]
    },
    8: { 
      question: "Quel animal est mangé par les singes ?",
      answer: ["femme", "une femme", "la femme"]
    },
    9: { 
      question: "Quelle activité Candide choisit-il à la fin ?",
      answer: ["jardin", "jardiner", "cultiver son jardin", "le jardinage"]
    }
  }
};

const mapBookTitleToQuizKey = (bookTitle: string): string => {
  const normalizedTitle = bookTitle.toLowerCase().trim();
  
  if (normalizedTitle === "candide" || normalizedTitle === "8" || 
      normalizedTitle === "candide ou l'optimisme" || normalizedTitle.includes("candide")) {
    return "candide";
  }
  
  if (normalizedTitle === "harry potter à l'école des sorciers" || 
      normalizedTitle === "harry potter" || normalizedTitle === "9") {
    return "harry-potter-1";
  }
  
  if (questions[normalizedTitle]) {
    return normalizedTitle;
  }
  
  const firstWord = normalizedTitle.split(' ')[0];
  for (const key of Object.keys(questions)) {
    if (key.toLowerCase().includes(firstWord)) {
      return key;
    }
  }
  
  return normalizedTitle;
};

export const getQuestion = (bookTitle: string, chapterNumber: number): QuestionData => {
  const quizKey = mapBookTitleToQuizKey(bookTitle);
  const bookQuestions = questions[quizKey];
  
  if (!bookQuestions) {
    console.warn(`Aucune question trouvée pour le livre: ${bookTitle} (clé: ${quizKey})`);
    throw new Error(`Aucune question trouvée pour le livre: ${bookTitle}`);
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
