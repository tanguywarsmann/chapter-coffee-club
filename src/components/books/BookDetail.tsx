import { useState } from "react";
import { Book } from "@/types/book";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowLeft, Award, Share2, Bookmark, BookmarkCheck, Clock, Calendar, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { QuizModal } from "@/components/books/QuizModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getBookForum, ForumPost } from "@/mock/activities";
import { MessageCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

interface BookDetailProps {
  book: Book;
  onChapterComplete: (bookId: string) => void;
}

export function BookDetail({ book, onChapterComplete }: BookDetailProps) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [bookmarked, setBookmarked] = useState(book.isBookmarked || false);
  const [personalNote, setPersonalNote] = useState("");
  const navigate = useNavigate();
  const forumPosts = getBookForum(book.id);

  const progressPercentage = (book.chaptersRead / book.totalChapters) * 100;
  
  // Calculate reading time remaining (roughly 20 minutes per chapter)
  const chaptersRemaining = book.totalChapters - book.chaptersRead;
  const readingTimeRemaining = chaptersRemaining * 20;
  
  // Validation history (mock data)
  const validationHistory = [
    { date: "15 avril 2025", question: "Qui est le personnage principal du chapitre 1?" },
    { date: "12 avril 2025", question: "Quel événement marque le tournant du chapitre 2?" },
    { date: "10 avril 2025", question: "Comment s'appelle le lieu où se déroule l'histoire?" },
  ];

  const handleStartReading = () => {
    if (book.chaptersRead < book.totalChapters) {
      setShowQuiz(true);
    } else {
      toast.info("Vous avez déjà terminé ce livre!");
    }
  };

  const handleQuizComplete = (passed: boolean) => {
    setShowQuiz(false);
    if (passed) {
      toast.success("Bravo! Vous avez terminé ce chapitre!");
      onChapterComplete(book.id);
      
      if (book.chaptersRead + 1 >= book.totalChapters) {
        toast.success("Félicitations! Vous avez terminé ce livre!", {
          icon: <Award className="h-5 w-5 text-yellow-500" />,
          duration: 5000,
        });
      }
    } else {
      toast.error("Essayez encore! Assurez-vous d'avoir bien lu le chapitre.");
    }
  };

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
    toast.success(bookmarked ? "Livre retiré de vos favoris" : "Livre ajouté à vos favoris");
  };

  const handleShare = () => {
    toast.success("Lien partagé avec succès!");
  };

  const handleSaveNote = () => {
    if (personalNote.trim()) {
      toast.success("Note personnelle enregistrée");
    }
  };

  const ForumDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full mt-4 border-coffee-light text-coffee-dark hover:text-coffee-darker"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          Accéder au forum de discussion
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">Forum - {book.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {forumPosts.map((post) => (
            <Card key={post.id} className="border-coffee-light">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.userAvatar} alt={post.userName} />
                    <AvatarFallback>{post.userName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{post.userName}</p>
                    <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-coffee-darker">{post.content}</p>
                <div className="mt-4 space-y-3 pl-4 border-l-2 border-coffee-light">
                  {post.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={reply.userAvatar} alt={reply.userName} />
                        <AvatarFallback>{reply.userName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{reply.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {reply.timestamp}
                          </span>
                        </div>
                        <p className="text-sm mt-0.5">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-coffee-darker">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="book-cover aspect-[2/3] md:col-span-1 bg-coffee-medium">
          {book.coverImage ? (
            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-chocolate-medium">
              <span className="text-white font-serif italic text-4xl">{book.title.substring(0, 1)}</span>
            </div>
          )}
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-serif font-medium text-coffee-darker">{book.title}</h1>
              <div className="flex space-x-2">
                <Button size="icon" variant="ghost" onClick={toggleBookmark} className="text-coffee-dark hover:text-coffee-darker">
                  {bookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={handleShare} className="text-coffee-dark hover:text-coffee-darker">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">{book.author}</p>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {book.categories.map((category, index) => (
                <Badge key={index} variant="outline" className="border-coffee-light">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
          
          <Card className="border-coffee-light">
            <CardHeader>
              <h3 className="text-lg font-medium text-coffee-darker flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Votre progression
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Progress value={progressPercentage} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  Page {book.chaptersRead * 30} sur {book.totalChapters * 30} ({Math.round(progressPercentage)}%)
                </p>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                <span>Temps de lecture restant estimé: {readingTimeRemaining} minutes</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-coffee-dark hover:bg-coffee-darker" onClick={handleStartReading}>
                <BookOpen className="mr-2 h-5 w-5" />
                {book.chaptersRead === 0 ? "Commencer à lire" : 
                 book.chaptersRead < book.totalChapters ? `Valider les 30 pages suivantes` : "Relire"}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border-coffee-light">
            <CardHeader>
              <h3 className="text-lg font-medium text-coffee-darker flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Historique des validations
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {validationHistory.map((entry, index) => (
                  <div key={index} className="flex gap-3 pb-3 border-b border-coffee-lightest last:border-b-0">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-coffee-lightest text-coffee-dark">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-coffee-darker">{entry.question}</p>
                      <p className="text-xs text-muted-foreground">{entry.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-coffee-light">
            <CardHeader>
              <h3 className="text-lg font-medium text-coffee-darker">Note personnelle</h3>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Notez vos réflexions, idées ou citations favorites..."
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                className="min-h-[100px] border-coffee-light"
              />
            </CardContent>
            <CardFooter className="justify-end">
              <Button 
                variant="outline" 
                className="border-coffee-light text-coffee-dark"
                onClick={handleSaveNote}
              >
                Enregistrer
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {book.isCompleted && <ForumDialog />}
      
      {showQuiz && (
        <QuizModal 
          bookTitle={book.title} 
          chapterNumber={book.chaptersRead + 1}
          onComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
        />
      )}
    </>
  );
}
