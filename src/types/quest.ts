
export interface Quest {
  slug: string;
  title: string;
  description: string;
  icon?: string;
}

export interface UserQuest {
  id: string;
  user_id: string;
  quest_slug: string;
  unlocked_at: string;
  quest?: Quest; // La quête complète avec les métadonnées (optionnel)
}

// Définition des types de quêtes disponibles
export type QuestSlug = 'early_reader' | 'triple_valide' | 'multi_booker' | 'back_on_track';
