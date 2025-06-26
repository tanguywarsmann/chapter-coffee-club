
import { BlogPost, BlogPostFrontmatter } from '@/types/blog';

// Import all markdown files from content/blog using vite-plugin-markdown
const blogModules = import.meta.glob('/content/blog/*.md', { 
  eager: true,
  import: 'default'
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
    
    // Avec vite-plugin-markdown, le module contient { attributes, html }
    const module = moduleData as { 
      attributes: Record<string, any>; 
      html: string; 
    };
    
    if (!module || !module.attributes) {
      console.warn(`No attributes found for ${path}`);
      return;
    }
    
    // Parse frontmatter attributes
    const frontmatter: BlogPostFrontmatter = {
      title: module.attributes.title || 'Sans titre',
      date: module.attributes.date || new Date().toISOString().split('T')[0],
      published: module.attributes.published !== false,
      description: module.attributes.description,
      author: module.attributes.author,
      tags: module.attributes.tags,
      slug: module.attributes.slug
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
