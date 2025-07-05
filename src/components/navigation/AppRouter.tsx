import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import HomePage from '@/pages/HomePage';
import AuthPage from '@/pages/AuthPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import ProfilePage from '@/pages/ProfilePage';
import BookPage from '@/pages/BookPage';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import ReadingList from '@/pages/ReadingList';
import Discover from '@/pages/Discover';
import Explore from '@/pages/Explore';
import Achievements from '@/pages/Achievements';
import FollowersPage from '@/pages/FollowersPage';
import AdminPanel from '@/pages/AdminPanel';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/u/:userId" element={<ProfilePage />} />
        <Route path="/book/:id" element={<BookPage />} />
        <Route path="/books/:id" element={<BookPage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/reading-list" element={<ReadingList />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/followers/:type/:userId" element={<FollowersPage />} />
        
        {/* Admin Panel */}
        <Route path="/admin" element={<AdminPanel />} />
        
        {/* Route pour le sitemap dynamique */}
        <Route 
          path="/sitemap.xml" 
          element={<SitemapRoute />} 
        />
      </Routes>
    </BrowserRouter>
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
