
export interface BlogPostFrontmatter {
  title: string;
  date: string;
  description?: string;
  author?: string;
  tags?: string[];
  published?: boolean;
  slug?: string;
}

export interface BlogPost extends BlogPostFrontmatter {
  slug: string;
  content: string;
}
