
export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  likeCount?: number;
  isEdited?: boolean;
  parentId?: string;
}
