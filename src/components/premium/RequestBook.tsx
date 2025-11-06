import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { BookPlus, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Capacitor } from '@capacitor/core';

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

  // Paywall if not Premium
  if (!isPremium) {
    const isIOS = Capacitor.getPlatform() === 'ios';
    
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-8 text-center">
          <Crown className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t.requestBook.paywall.title}</h2>
          <p className="text-muted-foreground mb-6">
            {t.requestBook.paywall.description}
          </p>
          <Button onClick={() => navigate('/premium')} size="lg">
            {isIOS ? t.requestBook.paywall.ctaIOS : t.requestBook.paywall.cta}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <BookPlus className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">{t.requestBook.title}</h2>
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
