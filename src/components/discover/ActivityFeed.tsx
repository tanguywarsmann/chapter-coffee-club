
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityFeedItem } from "./ActivityFeedItem";
import { Sparkles } from "lucide-react";
import { getDiscoverActivities } from "@/services/user/discoverService";

export function ActivityFeed() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      const discoverActivities = await getDiscoverActivities();
      setActivities(discoverActivities);
      setLoading(false);
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <Card className="border-coffee-light bg-white/70 backdrop-blur-md">
        <CardHeader className="bg-gradient-to-r from-coffee-light/20 to-coffee-medium/10 border-b border-coffee-light/30">
          <CardTitle className="font-serif text-coffee-darker flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-coffee-medium/20 to-coffee-light/20 rounded-xl">
              <Sparkles className="h-5 w-5 text-coffee-dark" />
            </div>
            <span>Fil d'actualité</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-coffee-light/20 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-coffee-light bg-white/70 backdrop-blur-md">
      <CardHeader className="bg-gradient-to-r from-coffee-light/20 to-coffee-medium/10 border-b border-coffee-light/30">
        <CardTitle className="font-serif text-coffee-darker flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-coffee-medium/20 to-coffee-light/20 rounded-xl">
            <Sparkles className="h-5 w-5 text-coffee-dark" />
          </div>
          <span>Fil d'actualité</span>
        </CardTitle>
        <p className="text-coffee-dark font-light text-sm">
          Découvrez les dernières activités de la communauté
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((item, index) => (
            <ActivityFeedItem
              key={`${item.user.id}-${index}`}
              user={item.user}
              activity={item.activity}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
