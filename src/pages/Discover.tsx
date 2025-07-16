
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useDiscoverData } from "@/hooks/useDiscoverData";
import { Section } from "@/components/discover/Section";
import { HorizontalCards } from "@/components/discover/HorizontalCards";
import { DiscoverBookGrid } from "@/components/discover/DiscoverBookGrid";

export default function Discover() {
  const { user } = useAuth();
  const [progressQuery, newestQuery, favoritesQuery] = useDiscoverData(user?.id || null);

  const progressBooks = progressQuery.data?.data || [];
  const newestBooks = newestQuery.data?.data || [];
  const favoriteBooks = favoritesQuery.data?.data || [];

  return (
    <AuthGuard>
      <div 
        className="min-h-screen"
        style={{ 
          background: `linear-gradient(135deg, hsl(var(--discover-brown)) 0%, hsl(var(--discover-cream)) 100%)` 
        }}
      >
        <AppHeader />
        
        <main className="mx-auto max-w-5xl px-4 py-8 space-y-12">
          {/* Hero Section */}
          <header className="text-center space-y-2">
            <h1 className="font-serif text-4xl md:text-5xl" style={{ color: 'hsl(var(--discover-cream))' }}>
              Découvre, lis, progresse 📚
            </h1>
            <p className="text-lg opacity-90" style={{ color: 'hsl(var(--discover-cream))' }}>
              Reprends ta lecture ou trouve ton prochain livre préféré.
            </p>
          </header>

          {/* Section 1: Continue ta lecture */}
          {progressBooks.length > 0 && (
            <Section title="Continue ta lecture">
              <HorizontalCards books={progressBooks} />
            </Section>
          )}

          {/* Section 2: Découvre un nouveau livre */}
          <Section title="Découvre un nouveau livre">
            <DiscoverBookGrid books={newestBooks} />
          </Section>

          {/* Section 3: Tes favoris */}
          {favoriteBooks.length > 0 && (
            <Section title="Tes favoris">
              <div className="text-center p-8 border border-dashed border-white/20 rounded-lg">
                <p className="text-white/80">
                  {favoriteBooks.length} livre{favoriteBooks.length > 1 ? 's' : ''} favori{favoriteBooks.length > 1 ? 's' : ''}
                </p>
                <div className="mt-4 space-y-2">
                  {favoriteBooks.map((fav, index) => (
                    <p key={index} className="text-sm text-white/70">
                      {index + 1}. {fav.book_title}
                    </p>
                  ))}
                </div>
              </div>
            </Section>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
