
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  dateEarned: string;
  rarity?: "legendary" | "epic" | "rare" | "common";
}
