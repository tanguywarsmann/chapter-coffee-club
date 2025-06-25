
import { BlogPost, BlogPostFrontmatter } from '@/types/blog';

// Import all markdown files from content/blog
const blogModules = import.meta.glob('/content/blog/*.md', { 
  eager: true, 
  as: 'raw' 
});

function parseFrontmatter(content: string): { frontmatter: BlogPostFrontmatter; body: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return {
      frontmatter: {
        title: 'Sans titre',
        date: new Date().toISOString().split('T')[0],
        published: true
      },
      body: content
    };
  }

  const [, frontmatterStr, body] = match;
  const frontmatter: BlogPostFrontmatter = {};
  
  // Parse YAML-like frontmatter
  frontmatterStr.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      const cleanKey = key.trim() as keyof BlogPostFrontmatter;
      
      if (cleanKey === 'tags' && value.startsWith('[') && value.endsWith(']')) {
        // Parse array format: ["tag1", "tag2"]
        frontmatter[cleanKey] = value
          .slice(1, -1)
          .split(',')
          .map(tag => tag.trim().replace(/"/g, ''));
      } else if (cleanKey === 'published') {
        frontmatter[cleanKey] = value === 'true';
      } else if (value.startsWith('"') && value.endsWith('"')) {
        (frontmatter as any)[cleanKey] = value.slice(1, -1);
      } else {
        (frontmatter as any)[cleanKey] = value;
      }
    }
  });

  return { frontmatter, body };
}

function getSlugFromPath(path: string): string {
  const filename = path.split('/').pop() || '';
  return filename.replace('.md', '');
}

export function getBlogPosts(): BlogPost[] {
  const posts: BlogPost[] = [];
  
  Object.entries(blogModules).forEach(([path, content]) => {
    const { frontmatter, body } = parseFrontmatter(content as string);
    const slug = frontmatter.slug || getSlugFromPath(path);
    
    // Only include published posts
    if (frontmatter.published !== false) {
      posts.push({
        ...frontmatter,
        slug,
        content: body,
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
