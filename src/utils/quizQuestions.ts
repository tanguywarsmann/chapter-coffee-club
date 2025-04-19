
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
    1: { question: "Sur quelle planète vit le Petit Prince ?", answer: ["b612", "asteroide b612", "astéroïde b612"] },
    2: { question: "Quel animal le Petit Prince demande-t-il au narrateur de dessiner au début ?", answer: ["mouton", "un mouton"] },
    3: { question: "Quelle fleur le Petit Prince aime-t-il particulièrement ?", answer: ["rose", "une rose", "sa rose"] },
    4: { question: "Quel animal rencontre le Petit Prince dans le désert ?", answer: ["renard", "un renard", "le renard"] },
    5: { question: "Comment le Petit Prince quitte-t-il la Terre ?", answer: ["serpent", "morsure", "morsure de serpent", "piqûre de serpent", "piqure de serpent"] }
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
