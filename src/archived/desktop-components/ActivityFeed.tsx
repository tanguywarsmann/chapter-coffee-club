

console.log("Import de ActivityFeed.tsx OK");

import { useState } from "react";
import { User } from "@/types/user";
import { Comment } from "@/types/comment";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageSquare, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

interface Activity {
  id: string;
  user: User;
  type: "finished" | "started" | "badge" | "streak";
  content: string;
  timestamp: string;
  bookTitle?: string;
  bookId?: string;
  badgeIcon?: string;
  likes: number;
  comments: number;
  hasLiked: boolean;
  commentsList?: Comment[];
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const [localActivities, setLocalActivities] = useState(activities);
  const [expandedComments, setExpandedComments] = useState<string[]>([]);

  const handleLike = (id: string) => {
    setLocalActivities(activities.map(activity => {
      if (activity.id === id) {
        const liked = !activity.hasLiked;
        const newLikes = liked ? activity.likes + 1 : activity.likes - 1;
        return { ...activity, hasLiked: liked, likes: newLikes };
      }
      return activity;
    }));
    
    toast.success("J'aime ajouté!");
  };

  const toggleComments = (activityId: string) => {
    setExpandedComments(prev => 
      prev.includes(activityId) 
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "finished":
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case "started":
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case "badge":
        return <BookOpen className="h-4 w-4 text-yellow-500" />;
      case "streak":
        return <BookOpen className="h-4 w-4 text-purple-500" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  if (!localActivities.length) {
    return (
      <Card className="border-coffee-light">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-coffee-darker">Activité récente</CardTitle>
          <CardDescription>Suivez l'activité de vos amis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 border border-dashed border-coffee-light rounded-lg">
            <p className="text-muted-foreground">Aucune activité récente</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-coffee-light">
      <CardHeader>
        <CardTitle className="text-xl font-serif text-coffee-darker">Activité récente</CardTitle>
        <CardDescription>Suivez vos activités et celles de vos amis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {localActivities.map((activity) => (
            <div key={activity.id} className="p-2 sm:p-4 rounded-lg border border-coffee-light">
              <div className="flex items-start gap-2 sm:gap-3">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border border-coffee-light">
                  <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                  <AvatarFallback className="bg-coffee-medium text-primary-foreground text-xs sm:text-sm">
                    {activity.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                    <span className="font-medium text-sm sm:text-base">{activity.user.name}</span>
                    {getActivityIcon(activity.type)}
                    <span className="text-muted-foreground text-sm">{activity.content}</span>
                  </div>
                  
                  {activity.bookTitle && (
                    <p className="mt-1 text-coffee-darker font-medium text-sm sm:text-base line-clamp-2">
                      "{activity.bookTitle}"
                    </p>
                  )}
                  
                  {activity.badgeIcon && (
                    <div className="mt-2 inline-block px-2 sm:px-3 py-1 bg-coffee-light/50 rounded-md">
                      <span className="mr-2">{activity.badgeIcon}</span>
                      <span className="text-xs sm:text-sm">{activity.content}</span>
                    </div>
                  )}
                  
                  <div className="mt-2 sm:mt-3 flex items-center text-xs text-muted-foreground gap-3 sm:gap-4">
                    <span className="text-xs">{activity.timestamp}</span>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-auto p-0 ${activity.hasLiked ? 'text-coffee-dark' : 'text-muted-foreground'}`}
                        onClick={() => handleLike(activity.id)}
                      >
                        <ThumbsUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                        <span>{activity.likes}</span>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-auto p-0 ${expandedComments.includes(activity.id) ? 'text-coffee-dark' : 'text-muted-foreground'}`}
                        onClick={() => toggleComments(activity.id)}
                      >
                        <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                        <span>{activity.comments}</span>
                      </Button>
                    </div>
                  </div>

                  {expandedComments.includes(activity.id) && activity.commentsList && (
                    <div className="mt-3 space-y-3 pl-3 sm:pl-4 border-l-2 border-coffee-light">
                      {activity.commentsList.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-2">
                          <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                            <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                            <AvatarFallback className="text-xs">
                              {comment.userName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <span className="text-xs sm:text-sm font-medium">{comment.userName}</span>
                              <span className="text-[10px] sm:text-xs text-muted-foreground">{comment.timestamp}</span>
                            </div>
                            <p className="text-xs sm:text-sm mt-0.5">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

