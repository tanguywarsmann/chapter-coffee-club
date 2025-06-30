
import { supabase } from "@/integrations/supabase/client";

export interface DiscoverUser {
  id: string;
  username: string;
  email?: string;
  stats: {
    booksReading: number;
    badges: number;
    streak: number;
  };
  isFollowing: boolean;
}

/**
 * Récupère les utilisateurs pour la page Discover
 */
export async function getDiscoverUsers(): Promise<DiscoverUser[]> {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, username, email')
      .not('username', 'is', null)
      .limit(26);

    if (error) throw error;

    // Transformer les profils en utilisateurs avec des stats simulées
    const users: DiscoverUser[] = profiles.map(profile => ({
      id: profile.id,
      username: profile.username!,
      email: profile.email,
      stats: {
        booksReading: Math.floor(Math.random() * 4) + 1, // 1-4 livres
        badges: Math.floor(Math.random() * 20) + 5, // 5-24 badges
        streak: Math.floor(Math.random() * 20) + 1, // 1-20 jours
      },
      isFollowing: Math.random() > 0.7 // 30% de chance d'être suivi
    }));

    return users;
  } catch (error) {
    console.error("Error fetching discover users:", error);
    return [];
  }
}

/**
 * Récupère des activités simulées basées sur les vrais utilisateurs
 */
export async function getDiscoverActivities() {
  try {
    const users = await getDiscoverUsers();
    
    const activityTypes = [
      'book_completed',
      'badge_earned', 
      'reading_session',
      'streak_milestone'
    ] as const;

    const bookTitles = [
      "Candide de Voltaire",
      "Les Fleurs du Mal de Baudelaire", 
      "Un amour de Swann de Proust",
      "L'Étranger de Camus",
      "Madame Bovary de Flaubert",
      "Le Rouge et le Noir de Stendhal"
    ];

    const badges = [
      { name: "Lecteur assidu", icon: "📚", rarity: 'epic' as const },
      { name: "Premier livre terminé", icon: "🎉", rarity: 'common' as const },
      { name: "Série de 7 jours", icon: "🔥", rarity: 'rare' as const },
      { name: "Marathon de lecture", icon: "🏃", rarity: 'legendary' as const }
    ];

    // Créer des activités simulées
    const activities = users.slice(0, 8).map((user, index) => {
      const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const timeAgo = new Date(Date.now() - (index + 1) * 30 * 60 * 1000); // Espacées de 30 min

      let content = "";
      let details = "";
      let badge = undefined;

      switch (activityType) {
        case 'book_completed':
          const book = bookTitles[Math.floor(Math.random() * bookTitles.length)];
          content = `a terminé la lecture de ${book}`;
          details = "Une lecture enrichissante et captivante !";
          break;
        case 'badge_earned':
          badge = badges[Math.floor(Math.random() * badges.length)];
          content = "a débloqué un nouveau badge";
          break;
        case 'reading_session':
          content = `a lu pendant ${Math.floor(Math.random() * 60) + 15} minutes`;
          details = "Une belle session de lecture concentrée";
          break;
        case 'streak_milestone':
          content = `atteint une série de ${Math.floor(Math.random() * 15) + 5} jours de lecture !`;
          details = "Félicitations pour cette constance dans la lecture quotidienne";
          break;
      }

      return {
        user: {
          id: user.id,
          name: user.username,
          avatar: "/placeholder.svg"
        },
        activity: {
          type: activityType,
          content,
          details: details || undefined,
          timestamp: timeAgo.toISOString(),
          badge
        }
      };
    });

    return activities;
  } catch (error) {
    console.error("Error generating discover activities:", error);
    return [];
  }
}
