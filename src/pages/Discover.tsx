
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/LanguageContext";
import { useDiscover } from "@/hooks/useDiscover";
import { RealActivityFeed } from "@/components/discover/RealActivityFeed";
import { RealCommunityStats } from "@/components/discover/RealCommunityStats";
import { RealReadersSection } from "@/components/discover/RealReadersSection";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { searchUsers } from "@/services/user/profileService";
import { EnhancedAvatar } from "@/components/ui/avatar";
import { FollowButton } from "@/components/profile/FollowButton";
import { Database } from "@/integrations/supabase/types";

type ProfileRecord = Database["public"]["Tables"]["profiles"]["Row"];

export default function Discover() {
  const { user, isInitialized } = useAuth();
  const { t } = useTranslation();
  const { data, isLoading, error } = useDiscover(user?.id, isInitialized);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProfileRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const results = await searchUsers(searchQuery);
          setSearchResults(results);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <AppHeader />
        
        <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-14">
            <header className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-serif font-medium text-foreground tracking-tight mb-3 text-pretty">
                {t.discover.title}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed text-pretty">
                {t.discover.subtitle}
              </p>
            </header>

            <div className="w-full md:w-72 relative z-50">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                      placeholder={t.discover.search.placeholder}
                      className="pl-9 bg-muted/30 border-transparent focus:bg-background focus:border-border transition-all rounded-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
              </div>

              {searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-popover/95 backdrop-blur-sm border rounded-xl shadow-xl animate-in fade-in zoom-in-95 origin-top">
                    {isSearching ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          {t.discover.search.searching}
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="max-h-[300px] overflow-y-auto pr-1 space-y-1">
                            {searchResults.map(profile => (
                                <div key={profile.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <EnhancedAvatar 
                                          src={profile.avatar_url ?? undefined} 
                                          fallbackText={profile.username ?? "?"} 
                                          size="sm"
                                        />
                                        <span className="font-medium text-sm truncate">{profile.username}</span>
                                    </div>
                                    <FollowButton 
                                      targetUserId={profile.id} 
                                      variant="ghost" 
                                      className="h-8 w-auto px-3 text-xs" 
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          {t.discover.search.noResults}
                        </div>
                    )}
                </div>
              )}
            </div>
          </div>
          
          {error && (
            <div className="mb-8 p-4 bg-destructive/5 border border-destructive/20 rounded-xl text-destructive text-sm font-medium">
              {t.discover.error}
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* Main Feed Area */}
            <div className="lg:col-span-8 space-y-12">
              {/* Mobile: Readers Horizontal Scroll */}
              <div className="lg:hidden">
                <RealReadersSection 
                  readers={data?.readers || []} 
                  loading={isLoading} 
                  variant="horizontal"
                />
              </div>

              <section>
                <h2 className="text-2xl font-serif font-medium mb-6 flex items-center gap-2">
                  {t.discover.feedTitle}
                </h2>
                <RealActivityFeed 
                  activities={data?.feed || []} 
                  loading={isLoading} 
                />
              </section>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block lg:col-span-4 space-y-10 sticky top-24">
              <RealCommunityStats 
                stats={data?.stats || { readers: 0, followers: 0, following: 0 }} 
                loading={isLoading} 
              />
              
              <RealReadersSection 
                readers={data?.readers || []} 
                loading={isLoading} 
                variant="vertical"
              />
            </aside>
            
            {/* Mobile: Stats */}
            <div className="lg:hidden space-y-10">
               <RealCommunityStats 
                stats={data?.stats || { readers: 0, followers: 0, following: 0 }} 
                loading={isLoading} 
              />
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
