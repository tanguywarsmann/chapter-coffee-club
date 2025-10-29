import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { createFeedback, CreateFeedbackData } from "@/services/feedback/feedbackService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const feedbackTypes = [
  { type: 'bug', emoji: '🐛', label: 'Bug', points: 10, color: 'bg-red-100 hover:bg-red-200 border-red-300' },
  { type: 'feature', emoji: '✨', label: 'Feature', points: 15, color: 'bg-blue-100 hover:bg-blue-200 border-blue-300' },
  { type: 'idea', emoji: '💡', label: 'Idée', points: 20, color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' },
  { type: 'love', emoji: '❤️', label: 'J\'adore!', points: 10, color: 'bg-pink-100 hover:bg-pink-200 border-pink-300' },
  { type: 'suggestion', emoji: '📝', label: 'Suggestion', points: 15, color: 'bg-purple-100 hover:bg-purple-200 border-purple-300' },
  { type: 'question', emoji: '❓', label: 'Question', points: 5, color: 'bg-gray-100 hover:bg-gray-200 border-gray-300' }
] as const;

const categories = [
  { value: 'reading', label: 'Lecture' },
  { value: 'interface', label: 'Interface' },
  { value: 'performance', label: 'Performance' },
  { value: 'other', label: 'Autre' }
];

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function FeedbackForm({ onSuccess, onCancel }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateFeedbackData>>({
    is_anonymous: false
  });

  async function handleSubmit() {
    if (!user) {
      toast.error("Connecte-toi pour donner ton feedback !", {
        description: "Connexion requise"
      });
      return;
    }

    if (!formData.type || !formData.title || !formData.description) {
      toast.error("Remplis tous les champs obligatoires", {
        description: "Champs manquants"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await createFeedback(formData as CreateFeedbackData);
      setStep(3);
      
      toast.success(`Tu viens de gagner +${result.points_awarded} points !`, {
        description: "🎉 Merci champion !"
      });

      setTimeout(() => {
        onSuccess?.();
      }, 3000);
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast.error(error.message || "Impossible d'envoyer ton feedback", {
        description: "Erreur"
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (step === 1) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2">🎯 De quoi veux-tu parler ?</h2>
        <p className="text-muted-foreground mb-6">
          Choisis le type de feedback que tu veux partager
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {feedbackTypes.map(({ type, emoji, label, points, color }) => (
            <Button
              key={type}
              variant="outline"
              className={`h-auto py-6 flex flex-col gap-2 ${color} ${
                formData.type === type ? 'border-2' : ''
              }`}
              onClick={() => {
                setFormData({ ...formData, type: type as any });
                setStep(2);
              }}
            >
              <span className="text-4xl">{emoji}</span>
              <span className="font-semibold">{label}</span>
              <span className="text-xs text-muted-foreground">+{points} pts</span>
            </Button>
          ))}
        </div>
      </Card>
    );
  }

  if (step === 2) {
    const selectedType = feedbackTypes.find(t => t.type === formData.type);
    
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2">
          {selectedType?.emoji} {selectedType?.label}
        </h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              placeholder={
                formData.type === 'bug' ? "Ex: Bug lors du clic sur X" :
                formData.type === 'feature' ? "Ex: Pouvoir faire X" :
                "Ex: Mon idée géniale..."
              }
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder={
                formData.type === 'bug' 
                  ? "Quand je fais X, il se passe Y au lieu de Z"
                  : formData.type === 'feature'
                  ? "J'aimerais pouvoir X parce que Y"
                  : "Raconte-nous en détail..."
              }
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right mt-1">
              {formData.description?.length || 0}/500
            </p>
          </div>

          <div>
            <Label htmlFor="category">Catégorie</Label>
            <select
              id="category"
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Sélectionne une catégorie</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.is_anonymous}
              onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="anonymous" className="cursor-pointer">
              Rester anonyme (ton nom ne sera pas affiché)
            </Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              ← Retour
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !formData.title || !formData.description}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                'Envoyer →'
              )}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const selectedType = feedbackTypes.find(t => t.type === formData.type);
  
  return (
    <Card className="p-6 text-center">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-4">🎉 Merci champion ! 🎉</h2>
        <p className="text-xl text-green-600 font-semibold">
          Tu viens de gagner +{selectedType?.points} points !
        </p>
      </div>

      <div className="bg-muted p-6 rounded-lg mb-6">
        <p className="text-sm text-muted-foreground mb-2">🌱 Ton feedback fait grandir VREAD</p>
        <p className="text-lg font-semibold">Continue comme ça ! 💚</p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          🏠 Retour
        </Button>
        <Button
          onClick={() => {
            setFormData({ is_anonymous: false });
            setStep(1);
          }}
          className="flex-1"
        >
          🌱 Donner un autre feedback
        </Button>
      </div>
    </Card>
  );
}
