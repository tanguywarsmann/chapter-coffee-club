import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";

export const getAllBooks = async (): Promise<Book[]> => {
  const { data, error } = await supabase
    .from('books')
    .select('*');

  if (error) {
    console.error('Error fetching books:', error);
    return [];
  }

  return data.map(book => ({
    id: book.id,
    title: book.title,
    author: book.author,
    coverImage: book.cover_url,
    description: book.description || "",
    totalChapters: Math.ceil(book.total_pages / 30),
    chaptersRead: 0,
    isCompleted: false,
    language: "français",
    categories: book.tags || [],
    pages: book.total_pages,
    publicationYear: new Date(book.created_at || Date.now()).getFullYear()
  }));
};

export const getBookById = async (id: string): Promise<Book | null> => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching book by ID:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    author: data.author,
    coverImage: data.cover_url,
    description: data.description || "",
    totalChapters: Math.ceil(data.total_pages / 30),
    chaptersRead: 0,
    isCompleted: false,
    language: "français",
    categories: data.tags || [],
    pages: data.total_pages,
    publicationYear: new Date(data.created_at || Date.now()).getFullYear()
  };
};

export const getBooksByCategory = async (category: string): Promise<Book[]> => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .contains('tags', `{${category}}`);

  if (error) {
    console.error('Error fetching books by category:', error);
    return [];
  }

  return data.map(book => ({
    id: book.id,
    title: book.title,
    author: book.author,
    coverImage: book.cover_url,
    description: book.description || "",
    totalChapters: Math.ceil(book.total_pages / 30),
    chaptersRead: 0,
    isCompleted: false,
    language: "français",
    categories: book.tags || [],
    pages: book.total_pages,
    publicationYear: new Date(book.created_at || Date.now()).getFullYear()
  }));
};

export const getAvailableCategories = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('books')
    .select('tags');

  if (error) {
    console.error('Error fetching book categories:', error);
    return [];
  }

  const allTags = data.flatMap(book => book.tags || []);
  return [...new Set(allTags)];
};

/**
 * Insère en base une liste de livres, en évitant les doublons via le champ slug (id UUID généré automatiquement)
 * @param booksToInsert Tableau de livres au format Book, sans id
 * @returns Promise<void>
 */
export const insertBooks = async (booksToInsert: Omit<Book, "id">[]) => {
  for (const book of booksToInsert) {
    // Create an object with the correct shape for Supabase insert
    const bookRecord = {
      id: 'placeholder', // Add placeholder ID to satisfy TypeScript, will be overwritten by Supabase
      title: book.title,
      author: book.author,
      cover_url: book.coverImage || null,
      description: book.description,
      total_pages: book.pages,
      slug: slugify(book.title + "-" + book.author),
      tags: book.categories
    };
    
    // First check if the book already exists by slug
    const { data: existingBook } = await supabase
      .from('books')
      .select('id')
      .eq('slug', bookRecord.slug)
      .maybeSingle();
    
    // If the book doesn't exist, insert it
    if (!existingBook) {
      const { error } = await supabase
        .from('books')
        .insert(bookRecord);
      
      if (error) {
        console.warn("Erreur lors de l'insertion du livre :", book.title, error);
      }
    }
  }
};

/**
 * Créée un slug unique pour le livre
 */
function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Insère une liste prédéfinie de livres classiques français
 */
export const insertClassicBooks = async () => {
  const booksToInsert: Omit<Book, "id">[] = [
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
      title: "Les Fleurs du Mal",
      author: "Baudelaire",
      description: "Un recueil de poèmes exprimant les états d'âme du poète, entre spleen et idéal.",
      pages: 150,
      categories: ["poésie", "symbolisme"],
      coverImage: null,
      totalChapters: 5,
      chaptersRead: 0,
      isCompleted: false,
      language: "français",
      publicationYear: 1857
    },
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
      title: "Le Petit Prince",
      author: "Antoine de Saint-Exupéry",
      description: "Un conte poétique sur l'amitié, l'amour et le sens de la vie.",
      pages: 96,
      categories: ["poésie", "conte"],
      coverImage: null,
      totalChapters: 3,
      chaptersRead: 0,
      isCompleted: false,
      language: "français",
      publicationYear: 1943
    },
    {
      title: "L'Étranger",
      author: "Albert Camus",
      description: "L'histoire de Meursault, un homme indifférent face aux conventions sociales.",
      pages: 160,
      categories: ["existentialisme"],
      coverImage: null,
      totalChapters: 5,
      chaptersRead: 0,
      isCompleted: false,
      language: "français",
      publicationYear: 1942
    },
    {
      title: "Le pouvoir du moment présent",
      author: "Eckhart Tolle",
      description: "Un guide spirituel pour vivre dans le moment présent et transcender les pensées.",
      pages: 230,
      categories: ["développement personnel"],
      coverImage: null,
      totalChapters: 8,
      chaptersRead: 0,
      isCompleted: false,
      language: "français",
      publicationYear: 1997
    },
    {
      title: "Les Quatre Accords Toltèques",
      author: "Don Miguel Ruiz",
      description: "Une sagesse ancestrale pour atteindre la liberté personnelle.",
      pages: 160,
      categories: ["sagesse", "psychologie"],
      coverImage: null,
      totalChapters: 5,
      chaptersRead: 0,
      isCompleted: false,
      language: "français",
      publicationYear: 1997
    },
    {
      title: "L'Âme du monde",
      author: "Frédéric Lenoir",
      description: "Un dialogue entre différentes traditions spirituelles sur la sagesse universelle.",
      pages: 180,
      categories: ["spiritualité", "dialogue"],
      coverImage: null,
      totalChapters: 6,
      chaptersRead: 0,
      isCompleted: false,
      language: "français",
      publicationYear: 2012
    },
    {
      title: "Thinking, Fast and Slow",
      author: "Daniel Kahneman",
      description: "Une exploration des deux systèmes de pensée qui dirigent nos décisions.",
      pages: 480,
      categories: ["cognition", "prise de décision"],
      coverImage: null,
      totalChapters: 16,
      chaptersRead: 0,
      isCompleted: false,
      language: "français",
      publicationYear: 2011
    },
    {
      title: "Sapiens",
      author: "Yuval Noah Harari",
      description: "Une brève histoire de l'humanité, de l'âge de pierre à l'ère numérique.",
      pages: 512,
      categories: ["histoire", "humanité"],
      coverImage: null,
      totalChapters: 17,
      chaptersRead: 0,
      isCompleted: false,
      language: "français",
      publicationYear: 2014
    },
    {
      title: "Les choses",
      author: "Georges Perec",
      description: "Une critique de la société de consommation à travers le portrait d'un jeune couple.",
      pages: 180,
      categories: ["société", "critique"],
      coverImage: null,
      totalChapters: 6,
      chaptersRead: 0,
      isCompleted: false,
      language: "français",
      publicationYear: 1965
    },
    {
      title: "La vie devant soi",
      author: "Romain Gary",
      description: "L'histoire touchante de Momo, un jeune garçon élevé par une ancienne prostituée.",
      pages: 280,
      categories: ["roman", "humanité"],
      coverImage: null,
      totalChapters: 9,
      chaptersRead: 0,
      isCompleted: false,
      language: "français",
      publicationYear: 1975
    },
    {
      title: "Le parfum",
      author: "Patrick Süskind",
      description: "L'histoire d'un meurtrier obsédé par la quête du parfum parfait.",
      pages: 280,
      categories: ["roman", "obsession"],
      coverImage: null,
      totalChapters: 9,
      chaptersRead: 0,
      isCompleted: false,
      language: "français",
      publicationYear: 1985
    },
    {
      title: "L'homme qui plantait des arbres",
      author: "Jean Giono",
      description: "Une fable écologique sur un berger qui transforme une région aride en forêt.",
      pages: 50,
      categories: ["écologie", "fable"],
      coverImage: null,
      totalChapters: 2,
      chaptersRead: 0,
      isCompleted: false,
      language: "français",
      publicationYear: 1953
    },
    {
      title: "Éloge de la lenteur",
      author: "Carl Honoré",
      description: "Une réflexion sur notre rapport au temps et l'importance de ralentir.",
      pages: 260,
      categories: ["mode de vie", "critique sociale"],
      coverImage: null,
      totalChapters: 9,
      chaptersRead: 0,
      isCompleted: false,
      language: "français",
      publicationYear: 2004
    }
  ];

  for (const book of booksToInsert) {
    // Create an object with the correct shape for Supabase insert
    const bookRecord = {
      id: 'placeholder', // Add placeholder ID to satisfy TypeScript, will be overwritten by Supabase
      title: book.title,
      author: book.author,
      cover_url: null,
      description: book.description,
      total_pages: book.pages,
      slug: slugify(book.title + "-" + book.author),
      tags: book.categories
    };
    
    // First check if the book already exists by slug
    const { data: existingBook } = await supabase
      .from('books')
      .select('id')
      .eq('slug', bookRecord.slug)
      .maybeSingle();
    
    // If the book doesn't exist, insert it
    if (!existingBook) {
      const { error } = await supabase
        .from('books')
        .insert(bookRecord);
      
      if (error) {
        console.warn("Erreur lors de l'insertion du livre :", book.title, error);
      }
    }
  }
};

// Expose the function to the browser window
if (typeof window !== 'undefined') {
  window.bookService = window.bookService || {};
  window.bookService.insertClassicBooks = insertClassicBooks;
}
