
import { BlogPost, BlogPostFrontmatter } from '@/types/blog';

// Import all markdown files from content/blog using vite-plugin-markdown
const blogModules = import.meta.glob('/content/blog/*.md', { 
  eager: true
});

function getSlugFromPath(path: string): string {
  const filename = path.split('/').pop() || '';
  return filename.replace('.md', '');
}

export function getBlogPosts(): BlogPost[] {
  const posts: BlogPost[] = [];
  
  Object.entries(blogModules).forEach(([path, moduleData]) => {
    // Avec vite-plugin-markdown mode ['html', 'meta'], le module contient { html, metadata }
    const module = moduleData as { 
      html: string;
      metadata: Record<string, any>; 
    };
    
    if (!module || !module.metadata) {
      return;
    }
    
    // Parse frontmatter depuis metadata
    const frontmatter: BlogPostFrontmatter = {
      title: module.metadata.title || 'Sans titre',
      date: module.metadata.date || new Date().toISOString().split('T')[0],
      published: module.metadata.published !== false,
      description: module.metadata.description,
      author: module.metadata.author,
      tags: module.metadata.tags,
      slug: module.metadata.slug
    };
    
    const slug = frontmatter.slug || getSlugFromPath(path);
    
    // Only include published posts
    if (frontmatter.published !== false) {
      posts.push({
        ...frontmatter,
        slug,
        content: module.html || '', // Use the parsed HTML directly
      });
    }
  });

  // Sort by date (newest first)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPost(slug: string): BlogPost | undefined {
  const posts = getBlogPosts();
  return posts.find(post => post.slug === slug);
}
