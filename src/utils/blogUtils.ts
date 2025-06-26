
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
  
  Object.entries(blogModules).forEach(([path, module]) => {
    const { attributes, html } = module as { 
      attributes: Record<string, any>; 
      html: string; 
    };
    
    // Parse frontmatter attributes
    const frontmatter: BlogPostFrontmatter = {
      title: attributes.title || 'Sans titre',
      date: attributes.date || new Date().toISOString().split('T')[0],
      published: attributes.published !== false,
      description: attributes.description,
      author: attributes.author,
      tags: attributes.tags,
      slug: attributes.slug
    };
    
    const slug = frontmatter.slug || getSlugFromPath(path);
    
    // Only include published posts
    if (frontmatter.published !== false) {
      posts.push({
        ...frontmatter,
        slug,
        content: html, // Use the parsed HTML directly
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
