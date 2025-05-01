
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  is_admin?: boolean;
  preferences?: {
    favoriteGenres: string[];
    readingGoal: number;
  };
}
