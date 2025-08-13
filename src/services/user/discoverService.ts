
import { supabase } from "@/integrations/supabase/client";

export interface DiscoverUser {
  id: string;
  username: string;
  email?: string;
  avatar?: string | null;
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
      .select('id, username')
      .not('username', 'is', null)
      .limit(55);

    if (error) throw error;

    // Transformer les profils en utilisateurs avec des stats simulées
    const users: DiscoverUser[] = profiles.map(profile => {
      // Remplacer "Tanguy Warsmann" par "Astrid Lefebvre"
      let username = profile.username!;
      if (username === 'Tanguy Warsmann') {
        username = 'Astrid Lefebvre';
      }

      return {
        id: profile.id,
        username: username,
        avatar: null, // Pas d'avatar par défaut, géré par EnhancedAvatar
        stats: {
          booksReading: Math.floor(Math.random() * 4) + 1,
          badges: Math.floor(Math.random() * 20) + 5,
          streak: Math.floor(Math.random() * 20) + 1,
        },
        isFollowing: Math.random() > 0.7
      };
    });

    // S'assurer qu'on a exactement 55 utilisateurs pour la cohérence
    while (users.length < 55) {
      const additionalUser: DiscoverUser = {
        id: `fictional-${users.length + 1}`,
        username: `Lecteur${users.length + 1}`,
        avatar: null,
        stats: {
          booksReading: Math.floor(Math.random() * 4) + 1,
          badges: Math.floor(Math.random() * 20) + 5,
          streak: Math.floor(Math.random() * 20) + 1,
        },
        isFollowing: Math.random() > 0.7
      };
      users.push(additionalUser);
    }

    return users.slice(0, 55);
  } catch (error) {
    console.error("Error fetching discover users:", error);
    return [];
  }
}

/**
 * Récupère des activités simulées avec des métriques plus naturelles
 */
export async function getDiscoverActivities() {
  try {
    const users = await getDiscoverUsers();
    
    const bookTitles = [
      "Gatsby le Magnifique",
      "Un amour de Swann", 
      "La Chatte",
      "L'Étranger",
      "Madame Bovary",
      "Le Rouge et le Noir",
      "Les Fleurs du Mal",
      "Candide",
      "À la recherche du temps perdu"
    ];

    const badges = [
      { name: "Focus 7 jours", icon: "🔥", rarity: 'rare' as const },
      { name: "Premier livre terminé", icon: "🎉", rarity: 'common' as const },
      { name: "Lecteur assidu", icon: "📚", rarity: 'epic' as const },
      { name: "Marathon de lecture", icon: "🏃", rarity: 'legendary' as const },
      { name: "Retour en force", icon: "💪", rarity: 'rare' as const }
    ];

    // Activités plus naturelles
    const activityTemplates = [
      { type: 'book_completed', template: 'a terminé la lecture de {book}' },
      { type: 'segment_validated', template: 'a validé un segment de {book}' },
      { type: 'reading_resumed', template: 'a repris {book} après {days} jours sans lecture' },
      { type: 'badge_earned', template: 'a débloqué le badge "{badge}"' },
      { type: 'reading_streak', template: 'maintient une série de {streak} jours de lecture' },
      { type: 'book_started', template: 'a commencé la lecture de {book}' }
    ];

    // Créer des activités avec timestamps réalistes
    const activities = users.slice(0, 10).map((user, index) => {
      const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
      const book = bookTitles[Math.floor(Math.random() * bookTitles.length)];
      const badge = badges[Math.floor(Math.random() * badges.length)];
      
      // Répartition temporelle : moitié aujourd'hui, moitié hier
      const isToday = index % 2 === 0;
      const baseTime = isToday ? new Date() : new Date(Date.now() - 24 * 60 * 60 * 1000);
      const hoursAgo = Math.floor(Math.random() * 12) + 1;
      const timeAgo = new Date(baseTime.getTime() - hoursAgo * 60 * 60 * 1000);

      let content = template.template;
      let activityBadge = undefined;
      let details = "";

      // Remplacer "Tanguy Warsmann" par "Astrid Lefebvre" dans les activités
      let username = user.username;
      if (username === 'Tanguy Warsmann') {
        username = 'Astrid Lefebvre';
      }

      // Remplacer les placeholders
      content = content.replace('{book}', book);
      content = content.replace('{days}', String(Math.floor(Math.random() * 5) + 2));
      content = content.replace('{streak}', String(Math.floor(Math.random() * 15) + 5));
      content = content.replace('{badge}', badge.name);

      if (template.type === 'badge_earned') {
        activityBadge = badge;
      }

      if (template.type === 'book_completed') {
        details = "Une lecture enrichissante et captivante !";
      } else if (template.type === 'reading_resumed') {
        details = "Retour avec motivation après une pause";
      } else if (template.type === 'segment_validated') {
        details = "Progression constante dans sa lecture";
      }

      return {
        user: {
          id: user.id,
          name: username,
          avatar: user.avatar
        },
        activity: {
          type: template.type,
          content,
          details: details || undefined,
          timestamp: timeAgo.toISOString(),
          badge: activityBadge
        }
      };
    });

    return activities;
  } catch (error) {
    console.error("Error generating discover activities:", error);
    return [];
  }
}
