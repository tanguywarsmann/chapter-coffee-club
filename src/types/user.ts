
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  is_admin: boolean; // Ensure this field exists
  preferences?: {
    favoriteGenres: string[];
    readingGoal: number;
  };
}
