
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { addQuestionSchema, generateUUID, isValidUUIDAny } from "@/utils/validation";

type AddQuestionFormValues = z.infer<typeof addQuestionSchema>;

interface AddQuestionFormProps {
  bookSlug?: string;
  onQuestionAdded: () => void;
}

export function AddQuestionForm({ bookSlug, onQuestionAdded }: AddQuestionFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AddQuestionFormValues>({
    resolver: zodResolver(addQuestionSchema),
    defaultValues: {
      book_slug: bookSlug || "",
      segment: 0,
      question: "",
      answer: "",
    },
  });

  const onSubmit = async (data: AddQuestionFormValues) => {
    setIsLoading(true);
    try {
      // Générer un UUID valide pour la question
      const questionId = generateUUID();
      
      // Validation supplémentaire côté client
      if (!isValidUUIDAny(questionId)) {
        throw new Error("Erreur de génération d'UUID pour la question");
      }

      const { error } = await supabase
        .from("reading_questions")
        .insert({
          id: questionId,
          book_slug: data.book_slug,
          segment: data.segment,
          question: data.question.trim(),
          answer: data.answer.trim().toLowerCase(),
        });

      if (error) throw error;

      toast({
        title: `Question ajoutée : La question pour le segment ${data.segment} a été créée avec succès.`,
      });

      form.reset();
      setIsDialogOpen(false);
      onQuestionAdded();
    } catch (error: any) {
      console.error("Erreur lors de l'ajout de la question:", error);
      toast({
        title: `Erreur : Impossible d'ajouter la question: ${error.message}`,
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
          Ajouter une question
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Ajouter une question de validation</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="book_slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug du livre</FormLabel>
                  <FormControl>
                    <Input placeholder="livre-exemple" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="segment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de segment</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Input placeholder="Quel est le nom du personnage principal ?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Réponse (un seul mot)</FormLabel>
                  <FormControl>
                    <Input placeholder="Jean" {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    La réponse doit contenir un seul mot, sans espace.
                  </p>
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
                  "Créer la question"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
