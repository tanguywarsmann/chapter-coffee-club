
export interface Quest {
  slug: string;
  title: string;
  description: string;
  icon: string;
  category?: string; // marathons, vitesse, variete, regularite, horaires
  xp_reward?: number; // XP awarded when quest is completed (75-300 for challenges)
}

export interface UserQuest {
  id: string;
  user_id: string;
  quest_slug: string;
  unlocked_at: string;
  quest?: Quest; // La quête complète avec les métadonnées (optionnel)
}

// Définition des types de quêtes disponibles (CHALLENGES)
export type QuestSlug =
  // MARATHONS - Défis intenses
  | 'marathon_reader'     // 10 validations en 1 journée
  | 'binge_reading'       // 3 livres terminés en 1 semaine
  | 'night_marathon'      // 5 validations entre 22h-6h

  // VITESSE & PERFORMANCE - Défis de rapidité
  | 'lightning_reader'    // Livre 300+ pages en <3 jours
  | 'speed_demon'         // Livre en <24h (1 jour)
  | 'sprinter'            // 50 pages en 1 session

  // VARIÉTÉ & EXPLORATION - Défis de diversité
  | 'explorer'            // 3 genres différents en 1 mois
  | 'completionist'       // Série complète (3+ livres du même auteur)

  // RÉGULARITÉ EXTRÊME - Défis de constance
  | 'unstoppable'         // 30 jours consécutifs sans interruption
  | 'punctual'            // Même heure (±1h) pendant 7 jours
  | 'perfect_month'       // Au moins 1 validation chaque jour pendant 30 jours

  // HORAIRES SPÉCIAUX - Défis de timing
  | 'early_bird'          // Lire avant 7h du matin
  | 'night_owl'           // Lire après 23h
  | 'weekend_warrior';    // Lire samedi ET dimanche du même weekend
