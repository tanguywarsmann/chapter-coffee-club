
import { Suspense, lazy, ComponentType, SVGProps } from 'react';
import { LucideProps } from 'lucide-react';

// Lightweight fallback for icons
const IconFallback = () => (
  <div className="w-4 h-4 rounded-full animate-pulse bg-muted" />
);

type IconProps = LucideProps & {
  name: string;
};

const LazyIcon = ({ name, ...props }: IconProps) => {
  // Dynamic import for the icon
  const IconComponent = lazy(() => 
    import('lucide-react').then((module) => {
      const IconComp = module[name as keyof typeof module] as ComponentType<SVGProps<SVGSVGElement>>;
      return { default: IconComp };
    })
  );

  return (
    <Suspense fallback={<IconFallback />}>
      <IconComponent {...props} />
    </Suspense>
  );
};

export { LazyIcon };
