
import { Users, BookOpen, Award } from "lucide-react";
import { DiscoverReader } from "@/services/user/realDiscoverService";
import { FollowButton } from "@/components/profile/FollowButton";
import { EnhancedAvatar } from "@/components/ui/avatar";
import { useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageContext";

interface RealReadersSectionProps {
  readers: DiscoverReader[];
  loading?: boolean;
  variant?: 'horizontal' | 'vertical';
}

export function RealReadersSection({ readers, loading, variant = 'vertical' }: RealReadersSectionProps) {
  const { t } = useTranslation();
  const [visibleCount, setVisibleCount] = useState(6);
  const visibleReaders = variant === 'horizontal' ? readers : readers.slice(0, visibleCount);
  const hasMore = variant === 'vertical' && visibleCount < readers.length;

  if (loading) {
    return (
      <div className={cn("w-full", variant === 'horizontal' ? "flex gap-4 overflow-hidden" : "space-y-4")}>
         {[...Array(3)].map((_, i) => (
           <div key={i} className={cn("bg-muted/30 animate-pulse rounded-xl", variant === 'horizontal' ? "h-40 w-32 flex-shrink-0" : "h-24 w-full")} />
         ))}
      </div>
    );
  }

  if (readers.length === 0) {
    if (variant === 'horizontal') return null; // Don't show empty section horizontally
    return (
        <div className="text-center py-8 border rounded-xl border-dashed border-muted-foreground/20">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {t.discover.search.noResults}
            </p>
        </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
             <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
               {t.discover.suggestionsTitle}
             </h3>
        </div>
        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <div className="flex space-x-4">
            {readers.map((reader) => (
              <MinimalReaderCard key={reader.id} reader={reader} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </section>
    );
  }

  return (
    <section className="space-y-4">
        <h3 className="text-lg font-serif font-medium text-foreground">
          {t.discover.readersTitle}
        </h3>
        <div className="space-y-3">
          {visibleReaders.map((reader) => (
            <DetailedReaderCard key={reader.id} reader={reader} />
          ))}
        </div>
        
        {hasMore && (
          <button
            onClick={() => setVisibleCount(prev => Math.min(prev + 6, readers.length))}
            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-lg transition-colors"
          >
            {t.common.seeAll}
          </button>
        )}
    </section>
  );
}

function MinimalReaderCard({ reader }: { reader: DiscoverReader }) {
  return (
    <div className="w-36 flex-shrink-0 flex flex-col items-center gap-3 p-4 rounded-xl border border-border/40 bg-card/50 hover:bg-muted/20 transition-all snap-center">
      <EnhancedAvatar
        src={reader.avatar_url ?? undefined}
        alt={reader.username}
        fallbackText={reader.username}
        size="lg"
        className="border border-border shadow-sm"
      />
      <div className="text-center w-full space-y-2">
         <div className="truncate font-medium text-sm text-foreground">{reader.username}</div>
         <FollowButton 
           targetUserId={reader.id}
           className="w-full h-7 text-xs"
           variant="outline"
         />
      </div>
    </div>
  )
}

function DetailedReaderCard({ reader }: { reader: DiscoverReader }) {
  return (
    <div className="group flex items-center justify-between gap-3 p-3 rounded-xl border border-transparent hover:bg-muted/30 hover:border-border/30 transition-all">
      <div className="flex items-center gap-3 min-w-0">
        <EnhancedAvatar
          src={reader.avatar_url ?? undefined}
          alt={reader.username}
          fallbackText={reader.username}
          size="md"
        />
        <div className="min-w-0">
          <h4 className="font-medium text-sm text-foreground truncate">
            {reader.username}
          </h4>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
             {reader.in_progress > 0 && (
                <span className="flex items-center gap-0.5">
                    <BookOpen className="h-3 w-3" /> {reader.in_progress}
                </span>
             )}
             {reader.badges > 0 && (
                 <span className="flex items-center gap-0.5">
                    <Award className="h-3 w-3" /> {reader.badges}
                 </span>
             )}
          </div>
        </div>
      </div>
      
      <FollowButton 
        targetUserId={reader.id}
        className="h-8 px-3 text-xs"
        variant="outline"
      />
    </div>
  );
}
