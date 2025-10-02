
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  is_admin: boolean;
  is_premium?: boolean;
  premium_since?: string;
  username?: string;
  preferences?: {
    favoriteGenres: string[];
    readingGoal: number;
  };
}
