import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/services/books/utils";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Book } from "@/types/book";

const addBookSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  author: z.string().min(1, "L'auteur est requis"),
  total_pages: z.coerce.number().min(1, "Le nombre de pages est requis"),
  description: z.string().optional(),
  cover_url: z.string().optional(),
  is_published: z.boolean().default(true),
});

type AddBookFormValues = z.infer<typeof addBookSchema>;

interface AddBookFormProps {
  onBookAdded: () => void;
}

export function AddBookForm({ onBookAdded }: AddBookFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  const form = useForm<AddBookFormValues>({
    resolver: zodResolver(addBookSchema),
    defaultValues: {
      title: "",
      author: "",
      total_pages: undefined,
      description: "",
      cover_url: "",
      is_published: true,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setCoverFile(file);
      const fileUrl = URL.createObjectURL(file);
      setCoverPreviewUrl(fileUrl);
      form.setValue("cover_url", ""); // Clear the URL input when file is selected
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    if (url) {
      setCoverFile(null);
      setCoverPreviewUrl(url);
    } else {
      setCoverPreviewUrl(null);
    }
  };

  const uploadCoverImage = async (file: File, slug: string): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${slug}.${fileExt}`;
    const filePath = `books/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("covers")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Erreur lors de l'upload de la couverture: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("covers")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  // Function to generate empty segments for the book
  const generateEmptySegments = async (bookSlug: string, totalPages: number): Promise<void> => {
    const expectedSegments = Math.ceil(totalPages / 30);
    
    if (expectedSegments <= 0) return;
    
    try {
      const segmentEntries = [];
      
      for (let i = 0; i < expectedSegments; i++) {
        segmentEntries.push({
          book_slug: bookSlug,
          segment: i,
          question: "",
          answer: ""
        });
      }
      
      const { error } = await supabase
        .from("reading_questions")
        .upsert(segmentEntries, { onConflict: 'book_slug,segment' });
        
      if (error) throw error;
      
      console.log(`${expectedSegments} segments vides générés pour le livre ${bookSlug}`);
    } catch (error) {
      console.error("Erreur lors de la génération des segments vides:", error);
      // We don't want the whole book creation process to fail if segment generation fails
      toast({
        title: "Attention : Le livre a été créé, mais la génération automatique des segments a échoué.",
        variant: "default",
      });
    }
  };

  const onSubmit = async (data: AddBookFormValues) => {
    setIsLoading(true);
    try {
      // Generate a slug from title and author
      const slug = slugify(data.title + "-" + data.author);
      
      // Upload cover image if provided
      let coverUrl = data.cover_url;
      if (coverFile) {
        coverUrl = await uploadCoverImage(coverFile, slug);
      }
      
      // Generate a UUID for the book
      const id = crypto.randomUUID();
      
      // Create book record
      const bookData = {
        id,
        title: data.title,
        author: data.author,
        total_pages: data.total_pages,
        description: data.description || null,
        cover_url: coverUrl || null,
        slug,
        tags: [], // Default empty tags array
        is_published: data.is_published,
      };
      
      const { error } = await supabase
        .from("books")
        .insert(bookData);
      
      if (error) throw error;
      
      // Generate empty segments for the book
      await generateEmptySegments(slug, data.total_pages);
      
      toast({
        title: `Livre ajouté avec succès : "${data.title}" a été ajouté à la base de données.`,
      });
      
      form.reset();
      setCoverFile(null);
      setCoverPreviewUrl(null);
      setIsDialogOpen(false);
      onBookAdded(); // Refresh book list
    } catch (error: any) {
      console.error("Erreur lors de l'ajout du livre:", error);
      toast({
        title: `Erreur : Impossible d'ajouter le livre: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un livre
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau livre</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre du livre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auteur</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de l'auteur" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="total_pages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de pages</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" placeholder="Nombre de pages" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Résumé (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description du livre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel>Couverture</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="cover_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-body-sm text-muted-foreground">URL de l'image</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/cover.jpg" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(e);
                              handleUrlChange(e);
                            }}
                            disabled={!!coverFile}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4">
                    <label htmlFor="cover-upload" className="flex flex-col items-center justify-center cursor-pointer">
                      <Upload className="h-6 w-6 text-gray-400 mb-2" />
                      <span className="text-body-sm text-muted-foreground">Uploader une image</span>
                      <input
                        id="cover-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isLoading}
                      />
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-center">
                  {coverPreviewUrl ? (
                    <div className="relative w-40 h-56 overflow-hidden rounded-md border border-gray-200">
                      <img 
                        src={coverPreviewUrl} 
                        alt="Aperçu" 
                        className="w-full h-full object-cover" 
                        onError={() => setCoverPreviewUrl(null)}
                      />
                    </div>
                  ) : (
                    <div className="w-40 h-56 bg-gray-100 flex items-center justify-center rounded-md border border-gray-200">
                      <span className="text-gray-400">Aperçu</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Publier ce livre</FormLabel>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Checkbox 
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer le livre"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
