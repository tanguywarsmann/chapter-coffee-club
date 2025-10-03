import { RequestBook as RequestBookComponent } from '@/components/premium/RequestBook';
import { AppHeader } from '@/components/layout/AppHeader';

export default function RequestBook() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto py-8">
        <RequestBookComponent />
      </main>
    </div>
  );
}
