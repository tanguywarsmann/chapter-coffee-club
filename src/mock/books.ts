import { Book } from "@/types/book";

export const mockBooks: Book[] = [
  {
    id: "1",
    title: "Les Misérables",
    author: "Victor Hugo",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1287&auto=format&fit=crop",
    description: "Un roman historique qui suit la vie et les luttes de l'ex-bagnard Jean Valjean dans la France du 19e siècle. Le livre aborde des thèmes de justice, de rédemption et d'amour, tout en décrivant les conditions sociales et politiques de l'époque.",
    totalChapters: 12,
    chaptersRead: 4,
    isCompleted: false,
    language: "français",
    categories: ["Classique", "Historique", "Drame"],
    pages: 1232,
    publicationYear: 1862
  },
  {
    id: "2",
    title: "Le Comte de Monte-Cristo",
    author: "Alexandre Dumas",
    coverImage: "https://images.unsplash.com/photo-1509021397816-10c18db3598e?q=80&w=1374&auto=format&fit=crop",
    description: "L'histoire d'Edmond Dantès, un jeune marin qui, injustement emprisonné, s'évade pour se venger de ceux qui l'ont trahi. Un récit captivant de vengeance, de fortune et de justice.",
    totalChapters: 15,
    chaptersRead: 15,
    isCompleted: true,
    language: "français",
    categories: ["Aventure", "Classique", "Vengeance"],
    pages: 1276,
    publicationYear: 1844
  },
  {
    id: "3",
    title: "Notre-Dame de Paris",
    author: "Victor Hugo",
    coverImage: "https://images.unsplash.com/photo-1614332625575-6bef347e3770?q=80&w=1470&auto=format&fit=crop",
    description: "Un roman gothique se déroulant dans le Paris du XVe siècle, centré sur la cathédrale Notre-Dame. Il raconte l'histoire de la belle bohémienne Esmeralda et de l'amour non partagé que lui porte le bossu sonneur de cloches Quasimodo.",
    totalChapters: 10,
    chaptersRead: 10,
    isCompleted: true,
    language: "français",
    categories: ["Classique", "Gothique", "Drame"],
    pages: 940,
    publicationYear: 1831
  },
  {
    id: "4",
    title: "Germinal",
    author: "Émile Zola",
    coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1741&auto=format&fit=crop",
    description: "Un roman sur la vie des mineurs du nord de la France au XIXe siècle, décrivant leurs conditions de travail difficiles et leur lutte pour la dignité et la justice sociale.",
    totalChapters: 8,
    chaptersRead: 2,
    isCompleted: false,
    language: "français",
    categories: ["Classique", "Social", "Industriel"],
    pages: 608,
    publicationYear: 1885
  },
  {
    id: "5",
    title: "Le Petit Prince",
    author: "Antoine de Saint-Exupéry",
    coverImage: "https://images.unsplash.com/photo-1589829085413-44a28fa347bc?q=80&w=1374&auto=format&fit=crop",
    description: "Un conte poétique et philosophique sous l'apparence d'un conte pour enfants. Il s'agit de l'histoire d'un aviateur qui, suite à une panne dans le désert du Sahara, rencontre un jeune garçon venu d'une autre planète.",
    totalChapters: 5,
    chaptersRead: 0,
    isCompleted: false,
    language: "français",
    categories: ["Jeunesse", "Philosophie", "Fable"],
    pages: 93,
    publicationYear: 1943
  },
  {
    id: "6",
    title: "Madame Bovary",
    author: "Gustave Flaubert",
    coverImage: "https://images.unsplash.com/photo-1463320726281-696a485928c7?q=80&w=1470&auto=format&fit=crop",
    description: "L'histoire d'Emma Bovary, épouse d'un médecin de province, qui tente d'échapper à l'ennui de sa vie conjugale par des lectures romanesques, le luxe et des aventures amoureuses.",
    totalChapters: 7,
    chaptersRead: 7,
    isCompleted: true,
    language: "français",
    categories: ["Classique", "Réalisme", "Drame"],
    pages: 356,
    publicationYear: 1857
  },
  {
    id: "7",
    title: "Les Fleurs du Mal",
    author: "Charles Baudelaire",
    coverImage: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1470&auto=format&fit=crop",
    description: "Un recueil de poèmes exprimant l'angoisse de vivre entre la spiritualité et la sensualité, entre l'idéal et le spleen, dans un Paris moderne et sordide.",
    totalChapters: 6,
    chaptersRead: 3,
    isCompleted: false,
    language: "français",
    categories: ["Poésie", "Symbolisme", "Décadence"],
    pages: 260,
    publicationYear: 1857
  },
  {
    id: "8",
    title: "Candide",
    author: "Voltaire",
    coverImage: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=1529&auto=format&fit=crop",
    description: "Un conte philosophique qui raconte les aventures de Candide, un jeune homme naïf qui voyage à travers le monde, confronté à de nombreuses catastrophes qui remettent en question son optimisme initial.",
    totalChapters: 4,
    chaptersRead: 0,
    isCompleted: false,
    language: "français",
    categories: ["Philosophie", "Satire", "Conte"],
    pages: 178,
    publicationYear: 1759
  },
  {
    id: "9",
    title: "Harry Potter à l'école des sorciers",
    author: "J.K. Rowling",
    coverImage: "https://images.unsplash.com/photo-1618666012174-83b441c0bc76?q=80&w=1374&auto=format&fit=crop",
    description: "Le premier tome des aventures du jeune sorcier Harry Potter qui découvre ses pouvoirs et intègre l'école de sorcellerie Poudlard.",
    totalChapters: 10,
    chaptersRead: 2,
    isCompleted: false,
    language: "français",
    categories: ["Fantastique", "Jeunesse", "Aventure"],
    pages: 308,
    publicationYear: 1997
  },
  {
    id: "10",
    title: "L'Étranger",
    author: "Albert Camus",
    coverImage: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1376&auto=format&fit=crop",
    description: "Un roman qui explore l'absurdité de la vie à travers le personnage de Meursault, qui reste détaché émotionnellement après la mort de sa mère et commet un meurtre.",
    totalChapters: 6,
    chaptersRead: 0,
    isCompleted: false,
    language: "français",
    categories: ["Philosophie", "Existentialisme", "Classique"],
    pages: 159,
    publicationYear: 1942
  },
  {
    id: "11",
    title: "Le Rouge et le Noir",
    author: "Stendhal",
    coverImage: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?q=80&w=1374&auto=format&fit=crop",
    description: "L'histoire de l'ascension sociale de Julien Sorel, un jeune homme ambitieux dans la France de la Restauration, qui se retrouve déchiré entre ses aspirations et les réalités sociales.",
    totalChapters: 8,
    chaptersRead: 0,
    isCompleted: false,
    language: "français",
    categories: ["Classique", "Réalisme", "Roman psychologique"],
    pages: 576,
    publicationYear: 1830
  },
  {
    id: "12",
    title: "La Peste",
    author: "Albert Camus",
    coverImage: "https://images.unsplash.com/photo-1469827160215-9d29e96e72f4?q=80&w=1470&auto=format&fit=crop",
    description: "Un roman allégorique qui raconte l'histoire d'une épidémie de peste bubonique qui frappe la ville d'Oran en Algérie, et les différentes réactions des habitants face à cette catastrophe.",
    totalChapters: 7,
    chaptersRead: 1,
    isCompleted: false,
    language: "français",
    categories: ["Philosophie", "Existentialisme", "Classique"],
    pages: 288,
    publicationYear: 1947
  },
  {
    id: "13",
    title: "La Chatte",
    author: "Colette",
    coverImage: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?q=80&w=1374&auto=format&fit=crop",
    description: "Une histoire d'amour triangulaire entre Alain, sa femme Camille, et sa chatte Saha. Le roman explore les thèmes de la jalousie, de l'attachement et des relations complexes entre les êtres.",
    totalChapters: 8,
    chaptersRead: 0,
    isCompleted: false,
    language: "français",
    categories: ["Roman", "Psychologique", "Animalier"],
    pages: 156,
    publicationYear: 1933
  },
  {
    id: "14",
    title: "Un amour de Swann",
    author: "Marcel Proust",
    coverImage: "https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=1374&auto=format&fit=crop",
    description: "Extrait de 'À la recherche du temps perdu', ce roman raconte l'histoire de l'amour obsessionnel de Charles Swann pour Odette de Crécy, une demi-mondaine, dans le Paris mondain de la fin du XIXe siècle.",
    totalChapters: 6,
    chaptersRead: 0,
    isCompleted: false,
    language: "français",
    categories: ["Classique", "Roman psychologique", "Belle Époque"],
    pages: 274,
    publicationYear: 1913
  },
  {
    id: "15",
    title: "Gatsby le Magnifique",
    author: "F. Scott Fitzgerald",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1374&auto=format&fit=crop",
    description: "L'histoire de Jay Gatsby, mystérieux millionnaire épris de Daisy Buchanan, se déroulant pendant les Années folles à New York. Une critique de l'American Dream et une peinture de la société des années 1920.",
    totalChapters: 9,
    chaptersRead: 0,
    isCompleted: false,
    language: "français",
    categories: ["Classique", "Roman américain", "Années 20"],
    pages: 218,
    publicationYear: 1925
  }
];

export const getPopularBooks = (): Book[] => {
  return mockBooks.sort(() => 0.5 - Math.random()).slice(0, 4);
};

export const getRecentlyAddedBooks = (): Book[] => {
  return mockBooks.sort(() => 0.5 - Math.random()).slice(0, 4);
};

export const getRecommendedBooks = (): Book[] => {
  return mockBooks.sort(() => 0.5 - Math.random()).slice(0, 4);
};

export const getBooksInProgress = (): Book[] => {
  return mockBooks.filter(book => book.chaptersRead > 0 && !book.isCompleted);
};

export const getCompletedBooks = (): Book[] => {
  return mockBooks.filter(book => book.isCompleted);
};

export const getBookById = (id: string): Book | undefined => {
  return mockBooks.find(book => book.id === id);
};
