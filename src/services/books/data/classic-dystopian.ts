
import { InsertableBook } from "../types";

export const classicDystopian: InsertableBook[] = [
  {
    title: "Le Meilleur des mondes",
    author: "Aldous Huxley",
    description: "Une dystopie décrivant une société future où la technologie et le conditionnement social contrôlent l'humanité.",
    pages: 288,
    categories: ["dystopie", "SF"],
    coverImage: null,
    totalChapters: 10,
    chaptersRead: 0,
    isCompleted: false,
    language: "français",
    publicationYear: 1932
  },
  {
    title: "1984",
    author: "George Orwell",
    description: "Une dystopie décrivant un monde totalitaire où la surveillance est omniprésente.",
    pages: 328,
    categories: ["dystopie", "politique"],
    coverImage: null,
    totalChapters: 11,
    chaptersRead: 0,
    isCompleted: false,
    language: "français",
    publicationYear: 1949
  }
];
