import { Skeleton } from '@/components/ui/skeleton';

interface SectionWrapperProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
}

export function SectionWrapper({ title, children, isLoading }: SectionWrapperProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold border-b border-border pb-2" style={{ color: '#2C3E50' }}>
        {title}
      </h2>
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : children}
    </section>
  );
}
