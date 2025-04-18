
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil } from "lucide-react";

export function UserProfile() {
  const [user] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  return (
    <Card className="border-coffee-light">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-serif text-coffee-darker">Informations personnelles</CardTitle>
        <Button variant="ghost" size="sm" className="text-coffee-dark hover:text-coffee-darker">
          <Pencil className="h-4 w-4 mr-1" />
          Modifier
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
  );
}
