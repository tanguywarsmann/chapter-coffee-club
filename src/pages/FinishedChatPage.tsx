import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getBookReadingProgress } from "@/services/reading/progressGetters";
import { getBookById } from "@/services/books/bookQueries";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Loader2, ArrowLeft, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ChatMessage {
  id: string;
  book_slug: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username?: string;
    avatar_url?: string;
  };
}

interface BookData {
  id: string;
  title: string;
  author: string;
  slug?: string;
}

export default function FinishedChatPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<BookData | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!slug || !user?.id) return;

    const checkAccess = async () => {
      try {
        setLoading(true);
        
        // Récupérer les infos du livre
        const bookData = await getBookById(slug);
        console.log("📚 Livre récupéré:", bookData);
        
        if (!bookData) {
          console.log("❌ Livre introuvable");
          navigate("/explore");
          return;
        }
        
        setBook(bookData);
        
        // Vérifier si l'utilisateur a terminé le livre
        const progress = await getBookReadingProgress(user.id, slug);
        console.log("📊 Progression récupérée:", progress);
        
        const completed = progress?.progressPercent >= 100 || progress?.status === 'completed';
        console.log("✅ Livre terminé?", completed, "Progress:", progress?.progressPercent, "Status:", progress?.status);
        
        if (!completed) {
          console.log("🚫 Accès refusé - livre non terminé");
          // Pas de toast error - redirection directe avec state
          navigate(`/${slug}`, { 
            state: { 
              accessDenied: true,
              message: "Vous devez terminer ce livre pour accéder au salon de discussion" 
            }
          });
          return;
        }
        
        console.log("🎉 Accès autorisé au salon");
        setIsCompleted(true);
        
        // Charger les messages
        await loadMessages();
        
      } catch (error) {
        console.error("Erreur lors de la vérification d'accès:", error);
        navigate("/explore");
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [slug, user?.id, navigate]);

  const loadMessages = async () => {
    if (!slug) return;

    try {
        const { data, error } = await supabase
        .from('book_chats')
        .select(`
          id,
          book_slug,
          user_id,
          content,
          created_at,
          profiles!inner (
            username,
            avatar_url
          )
        `)
        .eq('book_slug', slug)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages((data || []) as ChatMessage[]);
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
      toast.error("Erreur lors du chargement des messages");
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.id || !slug || sending) return;

    try {
      setSending(true);
      
      const { error } = await supabase
        .from('book_chats')
        .insert({
          book_slug: slug,
          user_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;
      
      setNewMessage("");
      toast.success("Message envoyé !");
      
      // Recharger les messages après envoi
      await loadMessages();
      
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Écouter les nouveaux messages en temps réel
  useEffect(() => {
    if (!slug) return;

    const channel = supabase
      .channel('book-chat-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'book_chats',
          filter: `book_slug=eq.${slug}`
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [slug]);

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <AppHeader />
          <main className="container mx-auto px-4 py-6">
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-coffee-dark mx-auto mb-4" />
                <p className="text-muted-foreground">Vérification de l'accès...</p>
              </div>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  console.log("🔍 État du rendu:", { isCompleted, book: !!book, loading });

  // Plus de return null qui bloque l'affichage - on affiche toujours quelque chose
  if (!isCompleted && !loading) {
    console.log("⚠️ Redirection en cours...");
    // La redirection est gérée dans useEffect, on affiche un message temporaire
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background">
          <AppHeader />
          <main className="container mx-auto px-4 py-6">
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-coffee-dark mx-auto mb-4" />
                <p className="text-muted-foreground">Redirection en cours...</p>
              </div>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <Link 
              to={`/${slug}`}
              className="inline-flex items-center text-coffee-dark hover:text-coffee-darker mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au livre
            </Link>
            
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="h-6 w-6 text-coffee-dark" />
              <h1 className="text-2xl font-bold text-coffee-darker">
                Salon — {book?.title || 'Livre'}
              </h1>
            </div>
            <p className="text-muted-foreground">
              Discutez avec d'autres lecteurs qui ont terminé ce livre
            </p>
          </div>

          {/* Chat Container */}
          <Card className="border-coffee-light">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-coffee-dark">
                Messages de la communauté {book?.title ? `— ${book.title}` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages List */}
              <div className="h-96 overflow-y-auto space-y-4 p-4 bg-coffee-lightest/30 rounded-lg">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun message pour le moment.</p>
                    <p className="text-sm">Soyez le premier à partager vos impressions !</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={message.profiles?.avatar_url || undefined} />
                        <AvatarFallback className="bg-coffee-light text-coffee-darker text-sm">
                          {message.profiles?.username?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-medium text-coffee-darker text-sm">
                            {message.profiles?.username || 'Utilisateur'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(message.created_at), { 
                              addSuffix: true, 
                              locale: fr 
                            })}
                          </span>
                        </div>
                        <p className="text-foreground text-sm leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Partagez vos impressions sur ce livre..."
                  className="flex-1"
                  maxLength={500}
                  disabled={sending}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="bg-coffee-dark hover:bg-coffee-darker text-white"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Envoyer"
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Appuyez sur Entrée pour envoyer • Maximum 500 caractères
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
}