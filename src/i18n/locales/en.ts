import type { Translations } from './fr';

export const en: Translations = {
  // Navigation
  nav: {
    home: "Home",
    explore: "Explore",
    discover: "Readers",
    readingList: "My List",
    achievements: "Achievements",
    admin: "Administration",
    profile: "Profile",
    settings: "Settings",
    menu: "Menu",
    blog: "Blog",
    about: "About",
    press: "Press",
    contact: "Contact",
    premium: "Premium",
    requestBook: "Request a Book",
    feedback: "Feedback",
  },

  // Landing Page
  landing: {
    title: "If it's not on VREAD, you haven't read it",
    description: "On average, out of 10 books purchased, we only finish 2 books.",
    heroTitle1: "On average,",
    heroTitle2: "out of ten books purchased,",
    heroTitle3: "we only finish",
    finalTitle1: "With Vread,",
    finalTitle2: "you finish them all.",
    cta: "Start for free",
    clickToReveal: "Click to reveal",
    touchToReveal: "Touch to reveal",
    restart: "Restart",
    twoBooks: "TWO BOOKS",
    sloganPart1: "If it's not on",
    sloganPart2: "Vread",
    sloganPart3: ",",
    sloganPart4: "you haven't read it.",
  },

  // Public Home Page
  publicHome: {
    tagline: "The app that supports you in your reading, page by page",
    subtitle: "The Strava of reading",
    heroIntro: "The app that supports you",
    heroHighlight: "in your reading",
    heroEnd: "page by page",
    description: "Take on challenges, track your progress, read at your own pace.",
    ctaStart: "Start for free",
    ctaBlog: "Discover the blog",
    sectionTitle: "A new way to read",
    readyTitle: "Ready to start reading again?",
    readyDescription: "Join thousands of readers who have rediscovered the joy of reading.",
    ctaCreate: "Create my free account",
    freeNoCommitment: "Free • No commitment • No credit card",
    features: {
      progressive: {
        title: "Progressive Reading",
        description: "Rediscover the joy of reading with short segments and regular validations.",
      },
      community: {
        title: "Community",
        description: "Join a community of passionate readers and share your discoveries.",
      },
      achievements: {
        title: "Achievements",
        description: "Unlock badges and track your reading progress over time.",
      },
      statistics: {
        title: "Statistics",
        description: "Analyze your reading habits and visualize your progress.",
      },
    },
  },

  // Home (Authenticated)
  home: {
    currentReadings: "Current Readings",
    continueReading: "Continue Reading",
    startReading: "Start Reading",
    noCurrentReading: "No current reading",
    startYourNextAdventure: "Start your next reading adventure",
    exploreBooks: "Explore books",
    myLibrary: "My Library",
    noBooksInLibrary: "No books in progress",
    exploreCatalog: "Explore our catalog to start your reading",
    discoverBooks: "Discover books",
    seeAll: "See all",
    viewAllBooks: "View all {{count}} books",
    completed: "completed",
    continueWhereYouLeftOff: "Continue where you left off",
    viewYourReadingStats: "View my statistics",
  },

  // Explore Page
  explore: {
    title: "Explore",
    categories: {
      litterature: "Literature",
      religion: "Religion",
      essai: "Essay",
      bio: "Biography",
    },
    search: {
      placeholder: "Title or author…",
      loading: "Loading books…",
      noResults: "No books in this category.",
    },
    pagination: {
      previous: "Previous",
      next: "Next",
      page: "Page",
    },
    discoverAll: "Discover all books",
  },

  // Reading & Validation
  reading: {
    progression: "Progress",
    chaptersRead: "chapters read",
    segmentsValidated: "segments validated",
    validateSegment: "Validate 30 pages",
    validateMyReading: "Validate my reading",
    segmentValidated: "Segment validated successfully!",
    alreadyValidated: "This segment has already been validated",
    validationFailed: "Validation failed",
  },

  // Auth
  auth: {
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    email: "Email",
    password: "Password",
  },

  // Common
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    warning: "Warning",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    close: "Close",
    confirm: "Confirm",
    search: "Search",
    searchPlaceholder: "Search for a book, author...",
    searching: "Searching...",
    noResultsFound: "No results found",
    tryAnotherSearch: "Try another search",
  },

  // Language
  language: {
    switch: "Change language",
    french: "Français",
    english: "English",
  },
};
