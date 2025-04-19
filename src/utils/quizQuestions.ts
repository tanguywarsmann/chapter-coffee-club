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
  
  // Si on n'a pas de question pour ce chapitre spécifique,
  // on cycle parmi les questions disponibles
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
