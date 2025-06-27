
import { PublicHeader } from "./PublicHeader";
import { AppFooter } from "./AppFooter";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
