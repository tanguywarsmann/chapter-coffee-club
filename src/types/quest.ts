
export interface Quest {
  slug: string;
  title: string;
  description: string;
  icon: string;
  category?: string; // horaire, validations, livres, vitesse, regularite
}

export interface UserQuest {
  id: string;
  user_id: string;
  quest_slug: string;
  unlocked_at: string;
  quest?: Quest; // La quête complète avec les métadonnées (optionnel)
}

// Définition des types de quêtes disponibles
export type QuestSlug =
  | 'early_reader'        // Lecteur matinal (avant 7h)
  | 'night_owl'           // Marathon nocturne (après 22h)
  | 'triple_valide'       // Triple validation (3 en 1 jour)
  | 'multi_booker'        // Multi-lecteur (3 livres en cours)
  | 'back_on_track'       // De retour sur les rails (reprendre après 7j)
  | 'first_book'          // Premier pas (1er livre terminé)
  | 'fire_streak'         // Série de feu (7 jours consécutifs)
  | 'speed_reader'        // Vitesse de croisière (livre en <7j)
  | 'bibliophile'         // Bibliophile (5 livres terminés)
  | 'centurion'           // Centurion (100 validations)
  | 'sunday_reader'       // Lecteur du dimanche
  | 'weekend_warrior';    // Week-end de lecture (sam+dim)
