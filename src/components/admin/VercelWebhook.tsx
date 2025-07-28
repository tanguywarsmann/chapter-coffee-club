
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Zap } from 'lucide-react';

export function VercelWebhook() {
  const [webhookUrl, setWebhookUrl] = useState(
    localStorage.getItem('vercel-webhook-url') || ''
  );
  const [isTriggering, setIsTriggering] = useState(false);

  const saveWebhookUrl = () => {
    localStorage.setItem('vercel-webhook-url', webhookUrl);
    toast.success('URL du webhook Vercel sauvegardée');
  };

  const triggerDeploy = async () => {
    if (!webhookUrl) {
      toast.error('Veuillez d\'abord configurer l\'URL du webhook Vercel');
      return;
    }

    setIsTriggering(true);
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trigger: 'blog-update' })
      });

      if (response.ok) {
        toast.success('Redéploiement Vercel déclenché avec succès');
      } else {
        throw new Error('Erreur lors du déclenchement');
      }
    } catch (error) {
      console.error('Error triggering Vercel deploy:', error);
      toast.error('Erreur lors du déclenchement du redéploiement');
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Configuration Vercel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="webhook-url">URL du webhook de déploiement Vercel</Label>
          <Input
            id="webhook-url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://api.vercel.com/v1/integrations/deploy/..."
          />
          <p className="text-body-sm text-muted-foreground mt-1">
            Créez un webhook dans votre projet Vercel pour déclencher les redéploiements automatiques
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={saveWebhookUrl} variant="outline">
            Sauvegarder
          </Button>
          <Button 
            onClick={triggerDeploy} 
            disabled={isTriggering || !webhookUrl}
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            {isTriggering ? 'Déclenchement...' : 'Déclencher le redéploiement'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
