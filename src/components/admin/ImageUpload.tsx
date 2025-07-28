
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { blogService } from '@/services/blogService';
import Image from '@/components/ui/image';

interface ImageUploadProps {
  currentImageUrl?: string;
  currentImageAlt?: string;
  onImageChange: (imageUrl: string, imageAlt: string) => void;
  onImageRemove: () => void;
}

export function ImageUpload({ 
  currentImageUrl, 
  currentImageAlt, 
  onImageChange, 
  onImageRemove 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [imageAlt, setImageAlt] = useState(currentImageAlt || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image');
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image doit faire moins de 5MB');
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await blogService.uploadImage(file);
      onImageChange(imageUrl, imageAlt);
      toast.success('Image uploadée avec succès');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (currentImageUrl) {
      try {
        await blogService.deleteImage(currentImageUrl);
        onImageRemove();
        setImageAlt('');
        toast.success('Image supprimée');
      } catch (error) {
        console.error('Error deleting image:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleAltChange = (alt: string) => {
    setImageAlt(alt);
    if (currentImageUrl) {
      onImageChange(currentImageUrl, alt);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Image principale</Label>
        <div className="mt-2">
          {currentImageUrl ? (
            <div className="space-y-3">
              <div className="relative inline-block">
                <Image 
                  src={currentImageUrl} 
                  alt={imageAlt || 'Image de l\'article'}
                  className="w-32 h-20 object-cover rounded border"
                  sizes="128px"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={handleRemoveImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Upload en cours...' : 'Choisir une image'}
                </Button>
              </div>
              <p className="text-body-sm text-gray-500 mt-2">
                PNG, JPG, GIF jusqu'à 5MB
              </p>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {currentImageUrl && (
        <div>
          <Label htmlFor="image-alt">Texte alternatif de l'image</Label>
          <Input
            id="image-alt"
            value={imageAlt}
            onChange={(e) => handleAltChange(e.target.value)}
            placeholder="Description de l'image pour l'accessibilité"
          />
          <p className="text-body-sm text-muted-foreground mt-1">
            Décrivez l'image pour l'accessibilité et le SEO
          </p>
        </div>
      )}
    </div>
  );
}
