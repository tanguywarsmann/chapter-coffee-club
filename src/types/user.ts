
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  is_admin: boolean;
  username?: string;
  preferences?: {
    favoriteGenres: string[];
    readingGoal: number;
  };
}
