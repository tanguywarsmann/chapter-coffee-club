
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import BookPage from "./pages/BookPage";
import Profile from "./pages/Profile";
import ReadingList from "./pages/ReadingList";
import Explore from "./pages/Explore";
import Achievements from "./pages/Achievements";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Get current user session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        const { data: userData } = await supabase.auth.getUser();
        
        if (session?.user) {
          console.log("User is authenticated:", session.user.id);
          
          // Only store in localStorage if absolutely necessary for backward compatibility
          localStorage.setItem("user", JSON.stringify({ 
            id: session.user.id,
            email: session.user.email
          }));
        } else if (userData?.user) {
          console.log("User found but no session:", userData.user.id);
          localStorage.setItem("user", JSON.stringify({ 
            id: userData.user.id,
            email: userData.user.email
          }));
        } else {
          console.log("No authenticated user found");
          toast.warning("Aucun utilisateur connecté. Certaines fonctionnalités seront limitées.");
          
          // For development, ensure we have a test user in localStorage
          // This is just for testing without proper auth
          if (!localStorage.getItem("user")) {
            // Generate a UUID for testing
            const testUuid = "00000000-0000-0000-0000-000000000000";
            localStorage.setItem("user", JSON.stringify({ 
              id: testUuid,
              email: "test@example.com" 
            }));
            console.log("Created test user ID:", testUuid);
          }
        }
      } catch (error) {
        console.error("Error initializing app:", error);
        toast.error("Erreur lors de l'initialisation de l'application");
      } finally {
        setInitialized(true);
      }
    };
    
    initializeApp();
  }, []);

  if (!initialized) {
    return <div>Loading application...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/home" element={<Home />} />
            <Route path="/books/:id" element={<BookPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/reading-list" element={<ReadingList />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
