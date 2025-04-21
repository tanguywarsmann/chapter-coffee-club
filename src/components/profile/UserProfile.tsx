import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound, Pencil } from "lucide-react";

export function UserProfile() {
  const [user] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [showWelcome, setShowWelcome] = useState(false);

  return (
    <>
      <WelcomeModal
        open={showWelcome}
        onClose={() => setShowWelcome(false)}
      />
      <div>
        <Card className="border-coffee-light">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-serif text-coffee-darker flex items-center gap-2">
              <UserRound className="h-5 w-5 text-coffee-dark" />
              Mon profil
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-coffee-dark hover:text-coffee-darker">
              <Pencil className="h-4 w-4 mr-1" />
              Modifier mes informations
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16 border-2 border-coffee-light">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-xl bg-coffee-light text-coffee-darker">
                  {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-coffee-darker">{user?.name || 'Utilisateur'}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowWelcome(true)}
            className="text-xs text-coffee-medium underline underline-offset-2 hover:text-coffee-darker transition-colors"
            type="button"
          >
            Revoir le guide de démarrage
          </button>
        </div>
      </div>
    </>
  );
}
