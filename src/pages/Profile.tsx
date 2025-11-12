
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  BookOpen, 
  Award, 
  Clock, 
  Calendar,
  Target,
  TrendingUp,
  Users,
  Settings,
  Edit3
} from "lucide-react";
import { getUserProfile, getDisplayName } from "@/services/user/userProfileService";
import { getFollowerCounts } from "@/services/user/profileService";
import { getUserBadges } from "@/services/badgeService";
import { getUserReadingProgress } from "@/services/reading/progressService";
import { useTranslation } from "@/i18n/LanguageContext";
import { 
  getTotalPagesRead,
  getBooksReadCount, 
  getValidatedSegmentsCount, 
  getEstimatedReadingTime 
} from "@/services/reading/statsService";
import { FollowButton } from "@/components/profile/FollowButton";
import { ProfileNameForm } from "@/components/profile/ProfileNameForm";
import { UserSettings } from "@/components/profile/UserSettings";
import { Link } from "react-router-dom";

export default function Profile() {
  const params = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState<any>(null);
  const [followerCounts, setFollowerCounts] = useState({ followers: 0, following: 0 });
  const [badges, setBadges] = useState<any[]>([]);
  const [currentBooks, setCurrentBooks] = useState<any[]>([]);
  const [completedBooks, setCompletedBooks] = useState<any[]>([]);
  const [stats, setStats] = useState({
    booksRead: 0,
    totalPages: 0,
    segmentsValidated: 0,
    readingTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const profileUserId = params.userId || user?.id;
  const isOwnProfile = !params.userId || (user && user.id === params.userId);

  useEffect(() => {
    if (!profileUserId) return;

    // AbortController to cancel requests on unmount
    const abortController = new AbortController();
    let mounted = true;

    async function fetchProfileData() {
      try {
        setLoading(true);

        // CRITICAL FIX: Reduce parallel queries to avoid connection pool exhaustion
        // Phase 1: Fetch essential data (max 3 parallel queries)
        const [profile, counts, readingProgress] = await Promise.all([
          getUserProfile(profileUserId),
          getFollowerCounts(profileUserId),
          getUserReadingProgress(profileUserId)
        ]);

        if (!mounted || abortController.signal.aborted) return;

        setProfileData(profile);
        setFollowerCounts(counts);

        if (readingProgress) {
          const current = readingProgress.filter(p => p.status === "in_progress");
          const completed = readingProgress.filter(p =>
            p.status === "completed" ||
            p.chaptersRead >= (p.totalChapters || p.expectedSegments || 1)
          ).slice(0, 8); // Show only first 8 completed books

          setCurrentBooks(current);
          setCompletedBooks(completed);
        }

        // Phase 2: Fetch secondary data (badges and stats) AFTER essential data
        // This avoids saturating the connection pool
        const [userBadges] = await Promise.all([
          getUserBadges(profileUserId)
        ]);

        if (!mounted || abortController.signal.aborted) return;

        setBadges(userBadges.slice(0, 6)); // Show only first 6 badges

        // Phase 3: Fetch stats (only for own profile, sequentially to reduce load)
        if (isOwnProfile) {
          const [booksRead, totalPages, segmentsValidated, readingTime] = await Promise.all([
            getBooksReadCount(profileUserId),
            getTotalPagesRead(profileUserId),
            getValidatedSegmentsCount(profileUserId),
            getEstimatedReadingTime(profileUserId)
          ]);

          if (!mounted || abortController.signal.aborted) return;

          setStats({
            booksRead,
            totalPages,
            segmentsValidated,
            readingTime
          });
        }
      } catch (error) {
        // Only log error if request wasn't aborted
        if (!abortController.signal.aborted) {
          console.error("Error fetching profile data:", error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchProfileData();

    // CRITICAL FIX: Cleanup function to cancel requests when navigating away
    return () => {
      mounted = false;
      abortController.abort();
      console.log("[PROFILE CLEANUP] Aborting pending requests to prevent connection pool exhaustion");
    };
  }, [profileUserId, isOwnProfile]);

  const displayName = getDisplayName(
    profileData?.username, 
    profileData?.email || user?.email, 
    profileUserId || 'U'
  );

  const refreshProfile = async () => {
    if (!profileUserId) return;
    try {
      const profile = await getUserProfile(profileUserId);
      setProfileData(profile);
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <AppHeader />
          <main className="mx-auto w-full px-4 max-w-none py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-dark mx-auto"></div>
                <p className="text-coffee-dark font-medium">Chargement du profil...</p>
              </div>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-coffee-light/20 via-background to-coffee-light/10">
        <AppHeader />
        
        <main className="mx-auto w-full px-4 max-w-none py-4 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          {/* Profile Header */}
          <Card className="border-coffee-light/50 bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Avatar and Basic Info */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left flex-shrink-0">
                  <EnhancedAvatar 
                    src={profileData?.avatar}
                    alt={displayName}
                    fallbackText={displayName}
                    size="xl"
                    className="border-4 border-coffee-light shadow-lg mb-4"
                  />
                  
                  {isOwnProfile && !isEditingProfile && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mb-4 border-coffee-light hover:bg-coffee-light/20 text-xs sm:text-sm"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <Edit3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">
                        {profileData?.username ? "Modifier mon nom" : "Ajouter un nom"}
                      </span>
                      <span className="sm:hidden">
                        {profileData?.username ? "Modifier" : "Ajouter"}
                      </span>
                    </Button>
                  )}
                </div>

                {/* Profile Details */}
                <div className="flex-1 min-w-0 space-y-4 sm:space-y-6">
                  {isEditingProfile && isOwnProfile ? (
                    <div className="space-y-4">
                      <ProfileNameForm 
                        currentUsername={profileData?.username} 
                        onSave={refreshProfile} 
                      />
                      <Button 
                        variant="ghost" 
                        onClick={() => setIsEditingProfile(false)}
                        className="text-sm"
                      >
                        Annuler
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-coffee-darker mb-2 break-words">
                          {displayName}
                        </h1>
                        <p className="text-coffee-medium text-sm sm:text-base lg:text-lg break-all">
                          {profileData?.email || user?.email}
                        </p>
                      </div>

                      {/* Follow Stats and Button */}
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        <Link 
                          to={`/followers/followers/${profileUserId}`}
                          className="flex items-center gap-2 group min-w-0"
                        >
                          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-coffee-dark flex-shrink-0" />
                          <span className="font-semibold text-coffee-darker text-sm sm:text-base lg:text-lg">{followerCounts.followers}</span>
                          <span className="text-coffee-medium group-hover:underline text-sm sm:text-base hidden sm:inline">Abonnés</span>
                          <span className="text-coffee-medium group-hover:underline text-xs sm:hidden">Abonnés</span>
                        </Link>
                        <Link 
                          to={`/followers/following/${profileUserId}`}
                          className="flex items-center gap-2 group min-w-0"
                        >
                          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-coffee-dark flex-shrink-0" />
                          <span className="font-semibold text-coffee-darker text-sm sm:text-base lg:text-lg">{followerCounts.following}</span>
                          <span className="text-coffee-medium group-hover:underline text-sm sm:text-base hidden sm:inline">Abonnements</span>
                          <span className="text-coffee-medium group-hover:underline text-xs sm:hidden">Suivis</span>
                        </Link>
                        
                        {!isOwnProfile && profileUserId && (
                          <div className="flex-shrink-0">
                            <FollowButton targetUserId={profileUserId} />
                          </div>
                        )}
                        
                        {/* Account management link for own profile */}
                        {isOwnProfile && (
                          <div className="flex-shrink-0">
                            <Link 
                              to="/settings/delete-account" 
                              className="text-xs text-muted-foreground hover:text-destructive transition-colors underline-offset-4 hover:underline"
                            >
                              Supprimer mon compte
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Quick Stats */}
                      {isOwnProfile && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                          <div className="text-center p-2 sm:p-3 bg-coffee-light/20 rounded-lg min-w-0">
                            <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-coffee-dark mx-auto mb-1" />
                            <div className="text-lg sm:text-2xl font-bold text-coffee-darker">{stats.booksRead}</div>
                            <div className="text-xs sm:text-sm text-coffee-medium break-words">Livres terminés</div>
                          </div>
                          <div className="text-center p-2 sm:p-3 bg-coffee-light/20 rounded-lg min-w-0">
                            <Target className="h-4 w-4 sm:h-6 sm:w-6 text-coffee-dark mx-auto mb-1" />
                            <div className="text-lg sm:text-2xl font-bold text-coffee-darker">{stats.segmentsValidated}</div>
                            <div className="text-xs sm:text-sm text-coffee-medium">Validations</div>
                          </div>
                          <div className="text-center p-2 sm:p-3 bg-coffee-light/20 rounded-lg min-w-0">
                            <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-coffee-dark mx-auto mb-1" />
                            <div className="text-lg sm:text-2xl font-bold text-coffee-darker">{Math.floor(stats.readingTime / 60)}h</div>
                            <div className="text-xs sm:text-sm text-coffee-medium break-words">Temps de lecture</div>
                          </div>
                          <div className="text-center p-2 sm:p-3 bg-coffee-light/20 rounded-lg min-w-0">
                            <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-coffee-dark mx-auto mb-1" />
                            <div className="text-lg sm:text-2xl font-bold text-coffee-darker">{stats.totalPages}</div>
                            <div className="text-xs sm:text-sm text-coffee-medium">Pages lues</div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6 w-full">
            {/* Scrollable Tabs Container */}
            <div className="w-full overflow-x-auto scrollbar-hide">
              <TabsList className="bg-white/80 backdrop-blur-sm border border-coffee-light/50 p-1 inline-flex min-w-full sm:min-w-0 justify-start sm:justify-center">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-coffee-light data-[state=active]:text-coffee-darker text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Vue d'ensemble</span>
                  <span className="sm:hidden">Aperçu</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="books" 
                  className="data-[state=active]:bg-coffee-light data-[state=active]:text-coffee-darker text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap"
                >
                  Livres
                </TabsTrigger>
                <TabsTrigger 
                  value="badges" 
                  className="data-[state=active]:bg-coffee-light data-[state=active]:text-coffee-darker text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap"
                >
                  Badges
                </TabsTrigger>
                {isOwnProfile && (
                  <TabsTrigger 
                    value="settings" 
                    className="data-[state=active]:bg-coffee-light data-[state=active]:text-coffee-darker text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">Paramètres</span>
                    <span className="sm:hidden">Config</span>
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-0">
              {/* Current Reading */}
              {currentBooks.length > 0 && (
                <Card className="border-coffee-light/50 bg-white/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-lg sm:text-xl font-serif text-coffee-darker flex items-center gap-2">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <span className="break-words">Lecture en cours</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 sm:space-y-4">
                      {currentBooks.slice(0, 2).map((book) => (
                        <div key={book.id} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-coffee-light/10 rounded-lg overflow-hidden">
                          <div className="w-12 h-16 sm:w-16 sm:h-20 bg-coffee-light rounded flex-shrink-0"></div>
                          <div className="flex-1 space-y-2 min-w-0">
                            <h4 className="font-medium text-coffee-darker text-sm sm:text-base break-words line-clamp-2">{book.book_title}</h4>
                            <p className="text-xs sm:text-sm text-coffee-medium break-words line-clamp-1">{book.book_author}</p>
                            <Progress value={book.progressPercent || 0} className="h-1.5 sm:h-2" />
                            <p className="text-xs text-coffee-medium">
                              {book.progressPercent || 0}% terminé
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Badges */}
              {badges.length > 0 && (
                <Card className="border-coffee-light/50 bg-white/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
                    <CardTitle className="text-lg sm:text-xl font-serif text-coffee-darker flex items-center gap-2 min-w-0">
                      <Award className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <span className="break-words">{t.common.recentBadges}</span>
                    </CardTitle>
                    <Button variant="outline" size="sm" asChild className="flex-shrink-0 text-xs sm:text-sm">
                      <Link to="/achievements">
                        <span className="hidden sm:inline">{t.common.seeAll}</span>
                        <span className="sm:hidden">{t.common.seeAll}</span>
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
                      {badges.map((badge) => (
                        <div key={badge.id} className="text-center group">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-coffee-light to-coffee-medium rounded-full mx-auto mb-2 flex items-center justify-center text-lg sm:text-2xl group-hover:scale-110 transition-transform">
                            {badge.icon || "🏆"}
                          </div>
                          <p className="text-xs text-coffee-darker font-medium line-clamp-2 break-words">
                            {badge.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Books Tab */}
            <TabsContent value="books" className="space-y-4 sm:space-y-6 mt-0">
              <Card className="border-coffee-light/50 bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl font-serif text-coffee-darker break-words">
                    Livres terminés ({completedBooks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {completedBooks.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
                      {completedBooks.map((book) => (
                        <Link 
                          key={book.id} 
                          to={`/books/${book.book_id}`}
                          className="group"
                        >
                          <div className="w-full aspect-[3/4] bg-coffee-light rounded-lg group-hover:scale-105 transition-transform"></div>
                          <p className="text-xs text-coffee-darker font-medium mt-2 line-clamp-2 break-words">
                            {book.book_title}
                          </p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12 text-coffee-medium">
                      <p className="text-sm sm:text-base">Aucun livre terminé pour le moment</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Badges Tab */}
            <TabsContent value="badges" className="mt-0">
              <Card className="border-coffee-light/50 bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl font-serif text-coffee-darker break-words">
                    Tous les badges ({badges.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {badges.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                      {badges.map((badge) => (
                        <div key={badge.id} className="text-center p-3 sm:p-4 bg-coffee-light/10 rounded-lg">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-coffee-light to-coffee-medium rounded-full mx-auto mb-3 flex items-center justify-center text-2xl sm:text-3xl">
                            {badge.icon || "🏆"}
                          </div>
                          <h4 className="font-medium text-coffee-darker mb-1 text-sm sm:text-base break-words">{badge.label}</h4>
                          <p className="text-xs sm:text-sm text-coffee-medium line-clamp-2 break-words">{badge.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12 text-coffee-medium">
                      <p className="text-sm sm:text-base">Aucun badge obtenu pour le moment</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab (Own Profile Only) */}
            {isOwnProfile && (
              <TabsContent value="settings" className="mt-0">
                <div className="overflow-hidden">
                  <UserSettings />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  );
}
