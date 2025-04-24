
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { getMockFollowers, getMockFollowing } from "@/mock/activities";

export function StatsCards() {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <Card className="flex-1 p-4 flex items-center justify-between border-coffee-light min-w-[140px]">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-coffee-dark" />
          <div>
            <p className="text-sm text-muted-foreground">Abonnés</p>
            <p className="text-2xl font-medium text-coffee-darker">{getMockFollowers().length}</p>
          </div>
        </div>
      </Card>
      <Card className="flex-1 p-4 flex items-center justify-between border-coffee-light min-w-[140px]">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-coffee-dark" />
          <div>
            <p className="text-sm text-muted-foreground">Abonnements</p>
            <p className="text-2xl font-medium text-coffee-darker">{getMockFollowing().length}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
