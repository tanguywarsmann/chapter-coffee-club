
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import AdminAutoCovers from '@/pages/AdminAutoCovers';
import AdminAudit from '@/pages/AdminAudit';
import AdminBookRequests from '@/pages/AdminBookRequests';
import FinishedChatPage from '@/pages/FinishedChatPage';
import About from '@/pages/About';
import Press from '@/pages/Press';
import NotFound from '@/pages/NotFound';
import Search from '@/pages/Search';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AdminGuard } from '@/components/admin/AdminGuard';

// Legal pages
import { PrivacyPolicy } from '@/pages/legal/PrivacyPolicy';
import { Terms } from '@/pages/legal/Terms';

// Settings pages
import DeleteAccount from '@/pages/settings/DeleteAccount';
import Premium from '@/pages/Premium';
import RequestBook from '@/pages/RequestBook';
import SitemapXML from '@/pages/SitemapXML';
import Feedback from '@/pages/Feedback';

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
      <Route path="/blog/page/1" element={<Navigate to="/blog" replace />} />
      <Route path="/blog/page/:page" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/reading-list" element={<ReadingList />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/search" element={<Search />} />
      <Route path="/achievements" element={<Achievements />} />
      <Route path="/followers/:type/:userId" element={<Followers />} />
      <Route path="/finished-chat/:slug" element={<FinishedChatPage />} />
      <Route path="/feedback" element={<Feedback />} />
      
      {/* Public Pages */}
      <Route path="/a-propos" element={<About />} />
      <Route path="/presse" element={<Press />} />
      <Route path="/sitemap.xml" element={<SitemapXML />} />

      {/* Aliases with redirects */}
      <Route path="/apropos" element={<Navigate to="/a-propos" replace />} />
      <Route path="/about" element={<Navigate to="/a-propos" replace />} />
      <Route path="/press" element={<Navigate to="/presse" replace />} />
      <Route path="/a-propos/index.html" element={<Navigate to="/a-propos" replace />} />
      <Route path="/presse/index.html" element={<Navigate to="/presse" replace />} />
      
      {/* Legal Pages */}
      <Route path="/legal/privacy" element={<PrivacyPolicy />} />
      <Route path="/legal/terms" element={<Terms />} />
      
      {/* Premium */}
      <Route path="/premium" element={<Premium />} />
      <Route path="/request-book" element={
        <AuthGuard>
          <RequestBook />
        </AuthGuard>
      } />
      
      {/* Settings Pages */}
      <Route path="/settings/delete-account" element={
        <AuthGuard>
          <DeleteAccount />
        </AuthGuard>
      } />
      
      {/* Admin Panel */}
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/auto-covers" element={
        <AdminGuard>
          <AdminAutoCovers />
        </AdminGuard>
      } />
          <Route path="/admin/audit" element={
            <AdminGuard>
              <AdminAudit />
            </AdminGuard>
          } />
          <Route path="/admin/book-requests" element={
            <AdminGuard>
              <AdminBookRequests />
            </AdminGuard>
          } />
      
      {/* Catch-all 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

/* merge fix: drop conflicting sitemap block */
const SitemapRoute = () => {
  if (typeof window !== "undefined") window.location.href = "/sitemap.xml";
  return null;
};
export default AppRouter;
