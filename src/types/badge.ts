

export interface Badge {
  id: string;
  label: string; // Changed from 'name' to match database schema
  slug: string;
  description: string;
  icon: string;
  color: string;
  rarity: "legendary" | "epic" | "rare" | "common";
  category?: string;
  dateEarned?: string;
  icon_url?: string;
  // Legacy support - will be removed
  name?: string;
}

