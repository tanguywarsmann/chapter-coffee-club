

console.log("Import de FollowerStats.tsx OK");

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { getFollowerCounts } from "@/services/user/profileService";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isInIframe, isPreview } from "@/utils/environment";

console.log("Chargement de FollowerStats.tsx", {
  isPreview: isPreview(),
  isInIframe: isInIframe(),
});

export function FollowerStats() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ followers: 0, following: 0 });

  useEffect(() => {
    try {
      const fetchCounts = async () => {
        if (!user?.id) return;
        const result = await getFollowerCounts(user.id);
        setCounts(result);
      };
      fetchCounts();
    } catch (e) {
      console.error("Erreur dans useEffect FollowerStats:", e);
    }
  }, [user]);

  return (
    <Card className="border-coffee-light">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-serif text-coffee-darker">Réseau</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-6 text-sm text-coffee-darker">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span><strong>{counts.followers}</strong> abonné{counts.followers !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span><strong>{counts.following}</strong> abonnement{counts.following !== 1 ? "s" : ""}</span>
        </div>
      </CardContent>
    </Card>
  );
}

