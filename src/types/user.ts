
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  is_admin: boolean;
  username?: string; // Ajout du champ username
  preferences?: {
    favoriteGenres: string[];
    readingGoal: number;
  };
}
