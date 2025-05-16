
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import BookPage from "./pages/BookPage";
import Profile from "./pages/Profile";
import PublicProfilePage from "./pages/PublicProfilePage";
import Discover from "./pages/Discover";
import ReadingList from "./pages/ReadingList";
import Explore from "./pages/Explore";
import Achievements from "./pages/Achievements";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Followers from "./pages/Followers";
import { UserOnboarding } from "./components/onboarding/UserOnboarding";

const queryClient = new QueryClient();

const App = () => {
  console.log("Rendering App component");
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <UserOnboarding />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/home" element={<Home />} />
            <Route path="/books/:id" element={<BookPage />} />
            <Route path="/profile/:userId?" element={<Profile />} />
            <Route path="/u/:userId" element={<PublicProfilePage />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/reading-list" element={<ReadingList />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/followers/:type/:userId?" element={<Followers />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
