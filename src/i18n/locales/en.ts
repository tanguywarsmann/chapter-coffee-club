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
    startLiteraryJourney: "Start your literary journey",
    discoverCollection: "Discover our collection of classics and start reading today",
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
    currentReading: "Your current reading",
    progression: "Progress",
    segmentsValidated: "segments validated",
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
    createAccount: "Create an account",
    welcome: "Welcome",
    firstTimeHere: "First time here?",
    createAccountIn30s: "Create an account in 30 seconds.",
    confirmPassword: "Confirm password",
    alreadyRegistered: "Already registered? Sign in",
    passwordsDontMatch: "Passwords don't match.",
    signupFailed: "Signup failed.",
    loginFailed: "Login failed.",
    signingUp: "Signing up...",
    loggingIn: "Logging in...",
    pageTitle: "VREAD | Create an account or sign in",
    pageDescription: "Create an account in 30 seconds or sign in to VREAD.",
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
    seeAll: "See all",
    discover: "Discover",
    bookNotAvailable: "Book not available",
    bookNotAvailableDescription: "The requested book is not available at the moment.",
    discoverOtherBooks: "Discover other books",
    recentBadges: "Recent badges",
  },

  // Language
  language: {
    switch: "Change language",
    french: "Français",
    english: "English",
  },

  // Premium
  premium: {
    title: "Lifetime Premium",
    earlyBirdBadge: "Launch Offer - Limited",
    earlyBirdTitle: "🚀 Exclusive Launch Offer",
    earlyBirdDesc: "Unlimited access to book requests + all premium features with no time limit. Lifetime launch offer - One-time payment, permanent benefits.",
    loginRequired: "ℹ️ Sign in to purchase Premium",
    loginRequiredDesc: "Browse the offers below. You'll be prompted to sign in when purchasing.",
    iosPurchaseNote: "💡 On iOS, purchases are managed by the App Store",
    androidPurchaseNote: "💡 On Android, purchases are managed by Google Play Store",
    cards: {
      free: {
        title: "Free",
        price: "0€",
        period: "forever",
        features: {
          catalog: "Access to classic books catalog",
          checkpoints: "Validation at checkpoints every ~30 pages",
          tracking: "Progress tracking and statistics",
          badges: "Badges and rewards system",
          community: "Readers community",
        },
      },
      lifetime: {
        title: "Lifetime - Early Bird",
        titleAlt: "Lifetime Premium",
        originalPrice: "99€",
        price: "29€",
        priceWithValue: "Buy - {price} Lifetime",
        period: "Lifetime access",
        periodOnce: "Lifetime access - One-time payment",
        validUntil: "Valid until November 30",
        iosNote: "🍎 Purchase via App Store",
        features: {
          requestBooks: "Request any book to be added",
          processing: "Processing within 48-72h",
          advancedStats: "Advanced reading statistics",
          exclusiveBadges: "Exclusive Premium badges",
          prioritySupport: "Priority support",
          earlyAccess: "Early access to new features",
        },
      },
      annual: {
        title: "Annual Premium",
        price: "50€",
        period: "/year",
        pricePerMonth: "That's 4.17€/month",
        priceWithValue: "Buy - {price}/year",
      },
    },
    loading: {
      purchase: "Loading purchase...",
      storeApple: "Loading Apple store...",
      storeAndroid: "Loading Android store...",
      connecting: "Connecting to App Store",
      restoring: "Restoring...",
    },
    buttons: {
      buy: "Buy",
      restore: "Restore purchases",
    },
    trust: {
      securePayment: "✓ 100% secure payment by Stripe",
      cancelAnytime: "✓ Cancel anytime",
      immediateAccess: "✓ Immediate access after payment",
      appleManaged: "💡 Purchases are managed by Google Play Store",
      appleNote: "Payment processed by App Store. No subscription, one-time payment.",
    },
    active: {
      title: "Premium Active ✓",
      message: "Thank you for your support! You now have access to all Premium features.",
    },
    toast: {
      activated: "🎉 VREAD Premium activated!",
      activatedDesc: "You now have access to all Premium features",
      notConfirmed: "Purchase not confirmed",
      notConfirmedDesc: "Check your Play Store account",
      cancelled: "Purchase cancelled",
      error: "Purchase error",
      errorDesc: "Try again later",
      restored: "✅ Purchases restored!",
      restoredDesc: "Your Premium access has been restored",
      noRestore: "No purchases to restore",
      noRestoreDesc: "No Premium purchase found on this Google Play account",
      restoreError: "Restore error",
    },
    faq: {
      title: "Frequently Asked Questions",
      howItWorks: {
        question: "How does book request work?",
        answer: "Once Premium, you can request any book via the dedicated form. We create comprehension questions and add the book ASAP.",
      },
      howMany: {
        question: "How many books can I request?",
        answer: "Two books at a time! You must validate one of the two requested books to get another.",
      },
      cancel: {
        question: "Can I cancel my subscription?",
        answer: "Yes, you can cancel anytime. You'll keep Premium access until the end of your paid period.",
      },
    },
  },

  // Request Book
  requestBook: {
    title: "Request a Book",
    paywall: {
      title: "Premium Feature",
      description: "Upgrade to Premium to request any book to be added to VREAD. We create comprehension questions and add the book within 48-72h.",
      cta: "Discover Premium - 50€/year",
      ctaIOS: "Discover Premium (In-App Purchase)",
    },
    form: {
      title: "Book title *",
      titlePlaceholder: "E.g.: The Stranger",
      author: "Author",
      authorPlaceholder: "E.g.: Albert Camus",
      isbn: "ISBN (optional)",
      isbnPlaceholder: "E.g.: 978-2070360024",
      reason: "Why this book? (optional)",
      reasonPlaceholder: "E.g.: French literature classic I want to read for my studies",
      submit: "Submit request",
      submitting: "Submitting...",
      info: "📚 We process requests within 48-72h.",
      infoEmail: "You'll be notified by email when the book is available.",
    },
    toast: {
      loginRequired: "Sign in to continue",
      premiumRequired: "This feature is reserved for Premium members",
      titleRequired: "Book title is required",
      success: "We'll process your request within 48-72h. You'll be notified by email.",
      error: "Unable to submit request. Try again later.",
    },
  },

  // Achievements
  achievements: {
    title: "Your Achievements",
    subtitle: "Celebrate your literary journey",
    stats: {
      booksRead: "Books read",
      pagesRead: "Pages read",
      currentStreak: "Current streak",
      bestStreak: "Best",
      badges: "Badges",
      record: "Best: {count}",
    },
    badges: {
      title: "Unlocked Badges",
      subtitle: "Your achievements by rarity",
      empty: "No badges unlocked",
      emptyDesc: "Keep reading to unlock your first badges!",
      earnedOn: "Earned on {date}",
      rarity: {
        legendary: "Leg.",
        epic: "Epic",
        rare: "Rare",
        common: "Com.",
      },
    },
    quests: {
      title: "Completed Quests",
      subtitle: "Special achievements unlocked by your actions",
      empty: "No quests available",
      emptyDesc: "Quests will be available soon",
      categories: {
        marathons: {
          icon: "📚",
          label: "Marathons",
          desc: "Intense challenges",
        },
        vitesse: {
          icon: "⚡",
          label: "Speed & Performance",
          desc: "Speed challenges",
        },
        variete: {
          icon: "🎯",
          label: "Variety & Exploration",
          desc: "Diversity challenges",
        },
        regularite: {
          icon: "🔥",
          label: "Extreme Regularity",
          desc: "Consistency challenges",
        },
        horaires: {
          icon: "🌙",
          label: "Special Hours",
          desc: "Time-based challenges",
        },
      },
      questsCount: "{count} quest",
      questsCountPlural: "{count} quests",
    },
  },

  // Discover
  discover: {
    title: "Discover the Community",
    subtitle: "Explore readers' activity, follow their progress and join a passionate community",
    error: "An error occurred while loading data.",
  },

  // Feedback
  feedback: {
    title: "🌱 Grow VREAD with us",
    subtitle: "Every feedback is a seed that improves the experience for the whole community",
    buttons: {
      give: "🚀 Give feedback",
      view: "👀 View suggestions",
    },
    realTime: "🔥 Real-time • Hundreds of feedbacks shared",
  },
};
