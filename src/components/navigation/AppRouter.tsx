
import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from '@/pages/Landing';
import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import ResetPassword from '@/pages/ResetPassword';
import Profile from '@/pages/Profile';
import BookPage from '@/pages/BookPage';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import ReadingList from '@/pages/ReadingList';
import Discover from '@/pages/Discover';
import Explore from '@/pages/Explore';
import Achievements from '@/pages/Achievements';
import Followers from '@/pages/Followers';
import Admin from '@/pages/Admin';
import { AuthGuard } from '@/components/auth/AuthGuard';

const AppRouter = () => {
  console.log("[ROUTER] AppRouter component mounted");
  
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/profile/:userId" element={<Profile />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/u/:userId" element={<Profile />} />
      <Route path="/book/:id" element={<BookPage />} />
      <Route path="/books/:id" element={<BookPage />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/reading-list" element={<ReadingList />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/explore" element={<AuthGuard><Explore /></AuthGuard>} />
      <Route path="/achievements" element={<Achievements />} />
      <Route path="/followers/:type/:userId" element={<Followers />} />
      
      {/* Admin Panel */}
      <Route path="/admin" element={<Admin />} />
      
      {/* Route pour le sitemap dynamique */}
      <Route 
        path="/sitemap.xml" 
        element={<SitemapRoute />} 
      />
    </Routes>
  );
};

// Composant pour servir le sitemap
const SitemapRoute = () => {
  const [sitemap, setSitemap] = useState<string>('');

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        const { generateCompleteSitemap } = await import('@/utils/sitemapServer');
        const sitemapContent = await generateCompleteSitemap();
        setSitemap(sitemapContent);
        
        // Définir les headers appropriés
        document.querySelector('meta[name="content-type"]')?.setAttribute('content', 'application/xml');
      } catch (error) {
        console.error('Erreur génération sitemap:', error);
        setSitemap(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vread.fr/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
      }
    };

    generateSitemap();
  }, []);

  // Retourner le XML directement
  if (sitemap) {
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: sitemap }}
        style={{ 
          fontFamily: 'monospace', 
          whiteSpace: 'pre-wrap',
          fontSize: '12px'
        }}
      />
    );
  }

  return <div>Génération du sitemap...</div>;
};

export default AppRouter;
