
import { InsertableBook } from "../types";

export const classicPhilosophy: InsertableBook[] = [
  {
    title: "Candide",
    author: "Voltaire",
    description: "Un conte philosophique qui suit les aventures de Candide, critiquant l'optimisme leibnizien.",
    pages: 250,
    categories: ["philosophie", "satire"],
    coverImage: null,
    totalChapters: 8,
    chaptersRead: 0,
    isCompleted: false,
    language: "français",
    publicationYear: 1759
  },
  {
    title: "L'Art de la guerre",
    author: "Sun Tzu",
    description: "Un traité de stratégie militaire applicable à de nombreux domaines de la vie.",
    pages: 112,
    categories: ["stratégie", "développement personnel"],
    coverImage: null,
    totalChapters: 4,
    chaptersRead: 0,
    isCompleted: false,
    language: "français",
    publicationYear: -500
  }
];
