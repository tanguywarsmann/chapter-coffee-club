
import { InsertableBook } from "../types";

export const classicFrenchLiterature: InsertableBook[] = [
  {
    title: "La Chatte",
    author: "Colette",
    description: "Un roman sur la jalousie et l'amour, où une femme se trouve en rivalité avec la chatte de son mari.",
    pages: 190,
    categories: ["classique", "psychologie"],
    coverImage: null,
    totalChapters: 6,
    chaptersRead: 0,
    isCompleted: false,
    language: "français",
    publicationYear: 1933
  },
  {
    title: "Un amour de Swann",
    author: "Marcel Proust",
    description: "L'histoire de l'amour obsessionnel de Charles Swann pour Odette de Crécy, extrait de 'À la recherche du temps perdu'.",
    pages: 384,
    categories: ["classique", "amour", "mémoire"],
    coverImage: null,
    totalChapters: 13,
    chaptersRead: 0,
    isCompleted: false,
    language: "français",
    publicationYear: 1913
  },
  {
    title: "Les Misérables",
    author: "Victor Hugo",
    description: "L'histoire de Jean Valjean et de la rédemption, sur fond de justice sociale dans la France du XIXe siècle.",
    pages: 300,
    categories: ["classique", "justice sociale"],
    coverImage: null,
    totalChapters: 10,
    chaptersRead: 0,
    isCompleted: false,
    language: "français",
    publicationYear: 1862
  },
  {
    title: "Les Fleurs du Mal",
    author: "Charles Baudelaire",
    description: "Un recueil de poèmes exprimant les états d'âme du poète, entre spleen et idéal.",
    pages: 150,
    categories: ["poésie", "symbolisme"],
    coverImage: null,
    totalChapters: 5,
    chaptersRead: 0,
    isCompleted: false,
    language: "français",
    publicationYear: 1857
  }
];
