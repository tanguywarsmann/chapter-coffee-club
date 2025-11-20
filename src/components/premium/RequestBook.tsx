import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function RequestBook() {
  const { user, isPremium } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    reason: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error(t.requestBook.toast.loginRequired);
      navigate('/auth');
      return;
    }

    if (!isPremium) {
      toast.error(t.requestBook.toast.premiumRequired);
      navigate('/premium');
      return;
    }

    if (!formData.title.trim()) {
      toast.error(t.requestBook.toast.titleRequired);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('book_requests')
        .insert({
          user_id: user.id,
          book_title: formData.title.trim(),
          book_author: formData.author.trim() || null,
          isbn: formData.isbn.trim() || null,
          reason: formData.reason.trim() || null
        });

      if (error) throw error;

      toast.success(t.requestBook.toast.success);

      // Reset form
      setFormData({ title: '', author: '', isbn: '', reason: '' });
    } catch (error) {
      console.error('Error submitting book request:', error);
      toast.error(t.requestBook.toast.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect to Premium if not eligible
  if (!isPremium) {
    return <Navigate to="/premium" replace />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-coffee-darker">{t.requestBook.title}</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              {t.requestBook.form.title}
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t.requestBook.form.titlePlaceholder}
              required
            />
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium mb-2">
              {t.requestBook.form.author}
            </label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder={t.requestBook.form.authorPlaceholder}
            />
          </div>

          <div>
            <label htmlFor="isbn" className="block text-sm font-medium mb-2">
              {t.requestBook.form.isbn}
            </label>
            <Input
              id="isbn"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              placeholder={t.requestBook.form.isbnPlaceholder}
            />
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium mb-2">
              {t.requestBook.form.reason}
            </label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder={t.requestBook.form.reasonPlaceholder}
              rows={4}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
            {isSubmitting ? t.requestBook.form.submitting : t.requestBook.form.submit}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            {t.requestBook.form.info}<br />
            {t.requestBook.form.infoEmail}
          </p>
        </form>
      </Card>
    </div>
  );
}
