import { RequestBook as RequestBookComponent } from '@/components/premium/RequestBook';
import { AppHeader } from '@/components/layout/AppHeader';

export default function RequestBook() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-8">
        <RequestBookComponent />
      </main>
    </div>
  );
}
