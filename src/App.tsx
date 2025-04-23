
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
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
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
