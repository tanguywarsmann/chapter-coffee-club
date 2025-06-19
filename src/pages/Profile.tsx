
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    
    async function fetchProfileData() {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [
          profile,
          counts,
          userBadges,
          readingProgress,
          booksRead,
          totalPages,
          segmentsValidated,
          readingTime
        ] = await Promise.all([
          getUserProfile(profileUserId),
          getFollowerCounts(profileUserId),
          getUserBadges(profileUserId),
          getUserReadingProgress(profileUserId),
          isOwnProfile ? getBooksReadCount(profileUserId) : Promise.resolve(0),
          isOwnProfile ? getTotalPagesRead(profileUserId) : Promise.resolve(0),
          isOwnProfile ? getValidatedSegmentsCount(profileUserId) : Promise.resolve(0),
          isOwnProfile ? getEstimatedReadingTime(profileUserId) : Promise.resolve(0)
        ]);

        setProfileData(profile);
        setFollowerCounts(counts);
        setBadges(userBadges.slice(0, 6)); // Show only first 6 badges
        
        if (readingProgress) {
          const current = readingProgress.filter(p => p.status === "in_progress");
          const completed = readingProgress.filter(p => 
            p.status === "completed" || 
            p.chaptersRead >= (p.totalChapters || p.expectedSegments || 1)
          ).slice(0, 8); // Show only first 8 completed books
          
          setCurrentBooks(current);
          setCompletedBooks(completed);
        }
        
        if (isOwnProfile) {
          setStats({
            booksRead,
            totalPages,
            segmentsValidated,
            readingTime
          });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
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
          <main className="container py-8">
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
        
        <main className="container py-8 space-y-8">
          {/* Profile Header */}
          <Card className="border-coffee-light/50 bg-white/80 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Avatar and Basic Info */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                  <Avatar className="h-32 w-32 border-4 border-coffee-light shadow-lg mb-4">
                    <AvatarImage src={profileData?.avatar} alt={displayName} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-coffee-light to-coffee-medium text-coffee-darker">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {isOwnProfile && !isEditingProfile && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mb-4 border-coffee-light hover:bg-coffee-light/20"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {profileData?.username ? "Modifier mon nom" : "Ajouter un nom"}
                    </Button>
                  )}
                </div>

                {/* Profile Details */}
                <div className="flex-1 space-y-6">
                  {isEditingProfile && isOwnProfile ? (
                    <div className="space-y-4">
                      <ProfileNameForm 
                        currentUsername={profileData?.username} 
                        onSave={refreshProfile} 
                      />
                      <Button 
                        variant="ghost" 
                        onClick={() => setIsEditingProfile(false)}
                      >
                        Annuler
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h1 className="text-4xl font-serif font-bold text-coffee-darker mb-2">
                          {displayName}
                        </h1>
                        <p className="text-coffee-medium text-lg">
                          {profileData?.email || user?.email}
                        </p>
                      </div>

                      {/* Follow Stats and Button */}
                      <div className="flex flex-wrap items-center gap-6">
                        <Link 
                          to={`/followers/followers/${profileUserId}`}
                          className="flex items-center gap-2 group"
                        >
                          <Users className="h-5 w-5 text-coffee-dark" />
                          <span className="font-semibold text-coffee-darker text-lg">{followerCounts.followers}</span>
                          <span className="text-coffee-medium group-hover:underline">Abonnés</span>
                        </Link>
                        <Link 
                          to={`/followers/following/${profileUserId}`}
                          className="flex items-center gap-2 group"
                        >
                          <Users className="h-5 w-5 text-coffee-dark" />
                          <span className="font-semibold text-coffee-darker text-lg">{followerCounts.following}</span>
                          <span className="text-coffee-medium group-hover:underline">Abonnements</span>
                        </Link>
                        
                        {!isOwnProfile && profileUserId && (
                          <FollowButton targetUserId={profileUserId} />
                        )}
                      </div>

                      {/* Quick Stats */}
                      {isOwnProfile && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-coffee-light/20 rounded-lg">
                            <BookOpen className="h-6 w-6 text-coffee-dark mx-auto mb-1" />
                            <div className="text-2xl font-bold text-coffee-darker">{stats.booksRead}</div>
                            <div className="text-sm text-coffee-medium">Livres terminés</div>
                          </div>
                          <div className="text-center p-3 bg-coffee-light/20 rounded-lg">
                            <Target className="h-6 w-6 text-coffee-dark mx-auto mb-1" />
                            <div className="text-2xl font-bold text-coffee-darker">{stats.segmentsValidated}</div>
                            <div className="text-sm text-coffee-medium">Validations</div>
                          </div>
                          <div className="text-center p-3 bg-coffee-light/20 rounded-lg">
                            <Clock className="h-6 w-6 text-coffee-dark mx-auto mb-1" />
                            <div className="text-2xl font-bold text-coffee-darker">{Math.floor(stats.readingTime / 60)}h</div>
                            <div className="text-sm text-coffee-medium">Temps de lecture</div>
                          </div>
                          <div className="text-center p-3 bg-coffee-light/20 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-coffee-dark mx-auto mb-1" />
                            <div className="text-2xl font-bold text-coffee-darker">{stats.totalPages}</div>
                            <div className="text-sm text-coffee-medium">Pages lues</div>
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
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white/80 backdrop-blur-sm border border-coffee-light/50 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-coffee-light data-[state=active]:text-coffee-darker">
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger value="books" className="data-[state=active]:bg-coffee-light data-[state=active]:text-coffee-darker">
                Livres
              </TabsTrigger>
              <TabsTrigger value="badges" className="data-[state=active]:bg-coffee-light data-[state=active]:text-coffee-darker">
                Badges
              </TabsTrigger>
              {isOwnProfile && (
                <TabsTrigger value="settings" className="data-[state=active]:bg-coffee-light data-[state=active]:text-coffee-darker">
                  Paramètres
                </TabsTrigger>
              )}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Current Reading */}
              {currentBooks.length > 0 && (
                <Card className="border-coffee-light/50 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-serif text-coffee-darker flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Lecture en cours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentBooks.slice(0, 2).map((book) => (
                        <div key={book.id} className="flex gap-4 p-4 bg-coffee-light/10 rounded-lg">
                          <div className="w-16 h-20 bg-coffee-light rounded flex-shrink-0"></div>
                          <div className="flex-1 space-y-2">
                            <h4 className="font-medium text-coffee-darker">{book.book_title}</h4>
                            <p className="text-sm text-coffee-medium">{book.book_author}</p>
                            <Progress value={book.progressPercent || 0} className="h-2" />
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
                <Card className="border-coffee-light/50 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-serif text-coffee-darker flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Badges récents
                    </CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/achievements">Voir tout</Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                      {badges.map((badge) => (
                        <div key={badge.id} className="text-center group">
                          <div className="w-16 h-16 bg-gradient-to-br from-coffee-light to-coffee-medium rounded-full mx-auto mb-2 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            {badge.icon || "🏆"}
                          </div>
                          <p className="text-xs text-coffee-darker font-medium line-clamp-2">
                            {badge.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Books Tab */}
            <TabsContent value="books" className="space-y-6">
              <Card className="border-coffee-light/50 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-serif text-coffee-darker">
                    Livres terminés ({completedBooks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {completedBooks.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                      {completedBooks.map((book) => (
                        <Link 
                          key={book.id} 
                          to={`/books/${book.book_id}`}
                          className="group"
                        >
                          <div className="w-full aspect-[3/4] bg-coffee-light rounded-lg group-hover:scale-105 transition-transform"></div>
                          <p className="text-xs text-coffee-darker font-medium mt-2 line-clamp-2">
                            {book.book_title}
                          </p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-coffee-medium">
                      Aucun livre terminé pour le moment
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Badges Tab */}
            <TabsContent value="badges">
              <Card className="border-coffee-light/50 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-serif text-coffee-darker">
                    Tous les badges ({badges.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {badges.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                      {badges.map((badge) => (
                        <div key={badge.id} className="text-center p-4 bg-coffee-light/10 rounded-lg">
                          <div className="w-20 h-20 bg-gradient-to-br from-coffee-light to-coffee-medium rounded-full mx-auto mb-3 flex items-center justify-center text-3xl">
                            {badge.icon || "🏆"}
                          </div>
                          <h4 className="font-medium text-coffee-darker mb-1">{badge.name}</h4>
                          <p className="text-sm text-coffee-medium line-clamp-2">{badge.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-coffee-medium">
                      Aucun badge obtenu pour le moment
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab (Own Profile Only) */}
            {isOwnProfile && (
              <TabsContent value="settings">
                <UserSettings />
              </TabsContent>
            )}
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  );
}
