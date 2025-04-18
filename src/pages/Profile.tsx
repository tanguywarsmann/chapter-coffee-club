
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { UserProfile } from "@/components/profile/UserProfile";
import { UserStats } from "@/components/profile/UserStats";
import { UserGoals } from "@/components/profile/UserGoals";
import { UserSettings } from "@/components/profile/UserSettings";

export default function Profile() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-6 space-y-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-3/4 space-y-6">
            <h1 className="text-3xl font-serif font-medium text-coffee-darker">Mon profil</h1>
            <UserProfile />
            <UserStats />
            <UserGoals />
          </div>
          <div className="w-full md:w-1/4">
            <UserSettings />
          </div>
        </div>
      </main>
    </div>
  );
}
