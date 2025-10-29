import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
      toast.error('Connecte-toi pour continuer');
      navigate('/auth');
      return;
    }

    if (!isPremium) {
      toast.error('Cette fonctionnalité est réservée aux membres Premium');
      navigate('/premium');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Le titre du livre est obligatoire');
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

      toast.success('Nous traiterons ta demande sous 48-72h. Tu seras notifié par email.');
      
      // Reset form
      setFormData({ title: '', author: '', isbn: '', reason: '' });
    } catch (error) {
      console.error('Error submitting book request:', error);
      toast.error('Impossible d\'envoyer la demande. Réessaye plus tard.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Paywall si pas Premium
  if (!isPremium) {
    const isIOS = Capacitor.getPlatform() === 'ios';
    
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-8 text-center">
          <Crown className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Fonctionnalité Premium</h2>
          <p className="text-muted-foreground mb-6">
            Passe Premium pour demander l'ajout de n'importe quel livre dans VREAD.
            Nous créons les questions de compréhension et ajoutons le livre sous 48-72h.
          </p>
          <Button onClick={() => navigate('/premium')} size="lg">
            {isIOS ? 'Découvrir Premium (In-App Purchase)' : 'Découvrir Premium - 50€/an'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <BookPlus className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Demander un livre</h2>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Titre du livre *
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: L'Étranger"
              required
            />
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium mb-2">
              Auteur
            </label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="Ex: Albert Camus"
            />
          </div>

          <div>
            <label htmlFor="isbn" className="block text-sm font-medium mb-2">
              ISBN (optionnel)
            </label>
            <Input
              id="isbn"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              placeholder="Ex: 978-2070360024"
            />
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium mb-2">
              Pourquoi ce livre ? (optionnel)
            </label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Ex: Classique de la littérature française que je veux lire pour mes études"
              rows={4}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            📚 Nous traitons les demandes sous 48-72h.<br />
            Tu seras notifié par email quand le livre sera disponible.
          </p>
        </form>
      </Card>
    </div>
  );
}
