
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { GlobalLoadingWatchdog } from '@/components/GlobalLoadingWatchdog';
import { AppSuspenseFallback } from '@/components/navigation/AppSuspenseFallback';
import Home from '@/pages/Home';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';
import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

// Helper to hide splash screen when the app is ready (hydrated & first route loaded)
const SplashHider = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const raf = window.requestAnimationFrame(async () => {
      try {
        await SplashScreen.hide({ fadeOutDuration: 200 });
        console.log("[SPLASH] Hidden successfully");
      } catch (e) {
        console.error("[SPLASH] Failed to hide:", e);
      }
    });

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, []);
  return null;
};

// Lazy load pages
const Landing = lazy(() => import('@/pages/Landing'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const Auth = lazy(() => import('@/pages/Auth'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Profile = lazy(() => import('@/pages/Profile'));
const BookPage = lazy(() => import('@/pages/BookPage'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogPost = lazy(() => import('@/pages/BlogPost'));
const ReadingList = lazy(() => import('@/pages/ReadingList'));
const Discover = lazy(() => import('@/pages/Discover'));
const Explore = lazy(() => import('@/pages/Explore'));
const Achievements = lazy(() => import('@/pages/Achievements'));
const Followers = lazy(() => import('@/pages/Followers'));
const Admin = lazy(() => import('@/pages/Admin'));
const AdminAutoCovers = lazy(() => import('@/pages/AdminAutoCovers'));
const AdminAudit = lazy(() => import('@/pages/AdminAudit'));
const AdminBookRequests = lazy(() => import('@/pages/AdminBookRequests'));
const FinishedChatPage = lazy(() => import('@/pages/FinishedChatPage'));
const About = lazy(() => import('@/pages/About'));
const Press = lazy(() => import('@/pages/Press'));
const Duolingo = lazy(() => import('@/pages/Duolingo'));
const Strava = lazy(() => import('@/pages/Strava'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Search = lazy(() => import('@/pages/Search'));

// Legal pages
const PrivacyPolicy = lazy(() => import('@/pages/legal/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const Terms = lazy(() => import('@/pages/legal/Terms').then(module => ({ default: module.Terms })));

// Settings pages
const DeleteAccount = lazy(() => import('@/pages/settings/DeleteAccount'));
const Premium = lazy(() => import('@/pages/Premium'));
const RequestBook = lazy(() => import('@/pages/RequestBook'));
const SitemapXML = lazy(() => import('@/pages/SitemapXML'));
const Feedback = lazy(() => import('@/pages/Feedback'));

const AppRouter = () => {
  console.log("[ROUTER] AppRouter component mounted");

  return (
    <Suspense fallback={<AppSuspenseFallback />}>
      <SplashHider />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={
          <AuthGuard>
            <Onboarding />
          </AuthGuard>
        } />
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
        <Route path="/duolingo" element={<Duolingo />} />
        <Route path="/strava" element={<Strava />} />
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
    </Suspense>
  );
};

/* merge fix: drop conflicting sitemap block */
const SitemapRoute = () => {
  if (typeof window !== "undefined") window.location.href = "/sitemap.xml";
  return null;
};
export default AppRouter;
