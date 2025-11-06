
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from '@/pages/Landing';
import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import BookPage from '@/pages/BookPage';
import Discover from '@/pages/Discover';
import Explore from '@/pages/Explore';
import Achievements from '@/pages/Achievements';
import Duolingo from '@/pages/Duolingo';
import Strava from '@/pages/Strava';
import Search from '@/pages/Search';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AdminGuard } from '@/components/admin/AdminGuard';

// Legal pages
import { PrivacyPolicy } from '@/pages/legal/PrivacyPolicy';

// Settings pages
import Premium from '@/pages/Premium';
import RequestBook from '@/pages/RequestBook';
import SitemapXML from '@/pages/SitemapXML';

const AppRouter = () => {
  console.log("[ROUTER] AppRouter component mounted");
  
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/profile/:userId" element={<Profile />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/u/:userId" element={<Profile />} />
      <Route path="/book/:id" element={<BookPage />} />
      <Route path="/books/:id" element={<BookPage />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/search" element={<Search />} />
      <Route path="/achievements" element={<Achievements />} />
      
      {/* Public Pages */}
        <Route path="/duolingo" element={<Duolingo />} />
        <Route path="/strava" element={<Strava />} />
      <Route path="/sitemap.xml" element={<SitemapXML />} />
      
      {/* Legal Pages */}
      <Route path="/legal/privacy" element={<PrivacyPolicy />} />

      {/* Premium */}
      <Route path="/premium" element={<Premium />} />
      <Route path="/request-book" element={
        <AuthGuard>
          <RequestBook />
        </AuthGuard>
      } />
      
      {/* Admin Panel */}

      {/* Catch-all 404 - Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/* merge fix: drop conflicting sitemap block */
const SitemapRoute = () => {
  if (typeof window !== "undefined") window.location.href = "/sitemap.xml";
  return null;
};
export default AppRouter;
