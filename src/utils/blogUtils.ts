
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
  
  console.log('Blog modules loaded:', Object.keys(blogModules));
  
  Object.entries(blogModules).forEach(([path, moduleData]) => {
    console.log('Processing file:', path);
    console.log('Module data:', moduleData);
    
    // Avec vite-plugin-markdown mode ['html', 'meta'], le module contient { html, metadata }
    const module = moduleData as { 
      html: string;
      metadata: Record<string, any>; 
    };
    
    if (!module || !module.metadata) {
      console.warn(`No metadata found for ${path}`);
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
    
    console.log('Parsed frontmatter:', frontmatter);
    
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

  console.log('Final posts:', posts);

  // Sort by date (newest first)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPost(slug: string): BlogPost | undefined {
  const posts = getBlogPosts();
  return posts.find(post => post.slug === slug);
}
