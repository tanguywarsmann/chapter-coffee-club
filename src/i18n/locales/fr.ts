export const fr = {
  // Navigation
  nav: {
    home: "Accueil",
    explore: "Explorer",
    discover: "Lecteurs",
    readingList: "Ma liste",
    achievements: "Récompenses",
    admin: "Administration",
    profile: "Profil",
    settings: "Paramètres",
    menu: "Menu",
    blog: "Blog",
    about: "À propos",
    press: "Presse",
    contact: "Contact",
    premium: "Premium",
    requestBook: "Demander un livre",
    feedback: "Feedback",
  },

  // Landing Page
  landing: {
    title: "Si ce n'est pas sur VREAD, tu ne l'as pas lu",
    description: "En moyenne, sur 10 livres achetés, on finit seulement 2 livres.",
    heroTitle1: "En moyenne,",
    heroTitle2: "sur dix livres achetés,",
    heroTitle3: "on finit seulement",
    finalTitle1: "Avec Vread,",
    finalTitle2: "tu les finis tous.",
    cta: "Commence gratuitement",
    clickToReveal: "Clique pour révéler",
    touchToReveal: "Touche pour révéler",
    restart: "Recommencer",
    twoBooks: "DEUX LIVRES",
    sloganPart1: "Si ce n'est pas sur",
    sloganPart2: "Vread",
    sloganPart3: ",",
    sloganPart4: "tu ne l'as pas lu.",
  },

  // Public Home Page
  publicHome: {
    tagline: "L'appli qui t'accompagne dans ta lecture, page après page",
    subtitle: "Le Strava de la lecture",
    heroIntro: "L'appli qui t'accompagne",
    heroHighlight: "dans ta lecture",
    heroEnd: "page après page",
    description: "Relevez des défis, suivez vos progrès, lisez à votre rythme.",
    ctaStart: "Commencer gratuitement",
    ctaBlog: "Découvrir le blog",
    sectionTitle: "Une nouvelle façon de lire",
    readyTitle: "Prêt à recommencer à lire ?",
    readyDescription: "Rejoignez des milliers de lecteurs qui ont redécouvert le plaisir de la lecture.",
    ctaCreate: "Créer mon compte gratuit",
    freeNoCommitment: "Gratuit • Sans engagement • Sans carte bancaire",
    features: {
      progressive: {
        title: "Lecture progressive",
        description: "Reprenez goût à la lecture avec des segments courts et des validations régulières.",
      },
      community: {
        title: "Communauté",
        description: "Rejoignez une communauté de lecteurs passionnés et partagez vos découvertes.",
      },
      achievements: {
        title: "Accomplissements",
        description: "Débloquez des badges et suivez vos progrès de lecture au fil du temps.",
      },
      statistics: {
        title: "Statistiques",
        description: "Analysez vos habitudes de lecture et visualisez votre évolution.",
      },
    },
  },

  // Home (Authenticated)
  home: {
    currentReadings: "Lectures en cours",
    continueReading: "Continuer la lecture",
    startReading: "Commencer la lecture",
    noCurrentReading: "Aucune lecture en cours",
    startYourNextAdventure: "Commencez votre prochaine aventure de lecture",
    startLiteraryJourney: "Commencez votre voyage littéraire",
    discoverCollection: "Découvrez notre collection de classiques et commencez à lire dès aujourd'hui",
    exploreBooks: "Explorer les livres",
    myLibrary: "Ma bibliothèque",
    noBooksInLibrary: "Aucun livre en cours",
    exploreCatalog: "Explorez notre catalogue pour commencer votre lecture",
    discoverBooks: "Découvrir des livres",
    seeAll: "Voir tout",
    viewAllBooks: "Voir tous les {{count}} livres",
    completed: "complété",
    continueWhereYouLeftOff: "Reprends ta lecture",
    viewYourReadingStats: "Voir mes statistiques",
    currentReading: "Votre lecture en cours",
    progression: "Progression",
    segmentsValidated: "segments validés",
  },

  // Explore Page
  explore: {
    title: "Explorer",
    categories: {
      litterature: "Littérature",
      religion: "Religion",
      essai: "Essai",
      bio: "Bio",
    },
    search: {
      placeholder: "Titre ou auteur…",
      loading: "Chargement des livres…",
      noResults: "Aucun livre dans cette catégorie.",
    },
    pagination: {
      previous: "Précédent",
      next: "Suivant",
      page: "Page",
    },
    discoverAll: "Découvrir tous les livres",
  },

  // Reading & Validation
  reading: {
    progression: "Progression",
    chaptersRead: "chapitres lus",
    segmentsValidated: "segments validés",
    validateSegment: "Valider 30 pages",
    validateMyReading: "Valider ma lecture",
    segmentValidated: "Segment validé avec succès !",
    alreadyValidated: "Ce segment a déjà été validé",
    validationFailed: "Échec de la validation",
  },

  // Auth
  auth: {
    signIn: "Se connecter",
    signUp: "S'inscrire",
    signOut: "Se déconnecter",
    email: "Email",
    password: "Mot de passe",
  },

  // Common
  common: {
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    warning: "Attention",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    view: "Voir",
    close: "Fermer",
    confirm: "Confirmer",
    search: "Rechercher",
    searchPlaceholder: "Rechercher un livre, un auteur...",
    searching: "Recherche en cours...",
    noResultsFound: "Aucun résultat trouvé",
    tryAnotherSearch: "Essayez une autre recherche",
  },

  // Language
  language: {
    switch: "Changer de langue",
    french: "Français",
    english: "English",
  },
};

export type Translations = typeof fr;
