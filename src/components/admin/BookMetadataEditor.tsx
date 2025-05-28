
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, SquarePen, Save } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Book } from "@/types/book";
import { generateUUID, isValidUUIDAny, addQuestionSchema } from "@/utils/validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface BookMetadataEditorProps {
  book: Book;
  onUpdate: () => void;
}

type QuestionFormValues = z.infer<typeof addQuestionSchema>;

export function BookMetadataEditor({ book, onUpdate }: BookMetadataEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [totalPages, setTotalPages] = useState<number | string>(book.total_pages || 0);
  const [expectedSegments, setExpectedSegments] = useState(book.expected_segments);
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [bookSlug, setBookSlug] = useState<string | undefined>(book.slug);
  
  // Pour l'ajout rapide de questions
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  const questionForm = useForm<QuestionFormValues>({
    resolver: zodResolver(addQuestionSchema),
    defaultValues: {
      book_slug: book.slug || "",
      segment: 0,
      question: "",
      answer: "",
    },
  });

  // Fonction pour recalculer automatiquement les segments
  const recalculateSegments = () => {
    const calculated = Math.ceil(Number(totalPages) / 30);
    setExpectedSegments(calculated);
  };
  
  // Load book data when opening the dialog
  const loadBookData = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('id, title, author, description, cover_url, slug, is_published, total_pages')
        .eq('slug', book.slug)
        .single();
        
      if (error || !data) {
        console.error("Erreur lors du chargement du livre :", error);
        return;
      }
      
      console.log("Données chargées depuis Supabase:", data);
      
      if (data) {
        if (data.description) setDescription(data.description);
        setIsPublished(data.is_published !== false);
        if (data.total_pages) setTotalPages(data.total_pages);
        if (data.slug) setBookSlug(data.slug);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données du livre:", error);
    }
  };
  
  // Generate empty segments for any missing ones
  const generateMissingSegments = async () => {
    if (book.missingSegments.length === 0) {
      toast({
        title: "Information : Tous les segments ont déjà été créés pour ce livre.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('slug')
        .eq('id', book.id)
        .single();
      
      if (bookError) throw bookError;
      
      const segmentEntries = book.missingSegments.map(segmentNum => {
        const questionId = generateUUID();
        
        if (!isValidUUIDAny(questionId)) {
          throw new Error(`UUID invalide généré pour le segment ${segmentNum}`);
        }
        
        return {
          id: questionId,
          book_slug: bookData.slug,
          segment: segmentNum,
          question: "",
          answer: ""
        };
      });
      
      const { error } = await supabase
        .from("reading_questions")
        .upsert(segmentEntries, { onConflict: 'book_slug,segment' });
        
      if (error) throw error;
      
      toast({
        title: `Segments générés : ${book.missingSegments.length} segments vides ont été générés avec succès.`,
      });
      
      setIsOpen(false);
      onUpdate();
    } catch (error: any) {
      console.error("Erreur lors de la génération des segments:", error);
      toast({
        title: `Erreur : Impossible de générer les segments: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Fonction pour enregistrer les modifications du livre
  const saveBookChanges = async () => {
    setIsSaving(true);
    try {
      const parsedTotalPages = parseInt(String(totalPages), 10);
      
      if (isNaN(parsedTotalPages)) {
        throw new Error("Le nombre de pages doit être un nombre valide");
      }
      
      if (!bookSlug) {
        throw new Error("Le slug du livre est manquant");
      }
      
      const updatePayload = {
        total_pages: parsedTotalPages,
        description: description || null,
        is_published: isPublished
      };
      
      const { data, error } = await supabase
        .from('books')
        .update(updatePayload)
        .eq('slug', bookSlug)
        .select();
        
      if (error) {
        console.error("Erreur Supabase lors de la mise à jour:", error);
        throw error;
      }
      
      toast({
        title: `Modifications enregistrées : Les informations du livre "${book.title}" ont été mises à jour.`
      });
      
      setIsOpen(false);
      onUpdate();
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du livre:", error);
      toast({
        title: `Erreur : Impossible de mettre à jour le livre: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Fonction pour ajouter une question de validation avec validation Zod
  const addValidationQuestion = async (data: QuestionFormValues) => {
    setIsAddingQuestion(true);
    
    try {
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('slug')
        .eq('id', book.id)
        .single();
        
      if (bookError) throw bookError;
      
      const questionId = generateUUID();
      
      if (!isValidUUIDAny(questionId)) {
        throw new Error("Erreur de génération d'UUID pour la question");
      }
      
      const { error } = await supabase
        .from('reading_questions')
        .insert({
          id: questionId,
          book_slug: bookData.slug,
          segment: data.segment,
          question: data.question.trim(),
          answer: data.answer.trim().toLowerCase()
        });
        
      if (error) throw error;
      
      toast({
        title: `Question ajoutée : La question pour le segment ${data.segment} a été ajoutée avec succès.`
      });
      
      questionForm.reset();
      setIsOpen(false);
      onUpdate();
    } catch (error: any) {
      console.error("Erreur lors de l'ajout de la question:", error);
      toast({
        title: `Erreur : Impossible d'ajouter la question: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsAddingQuestion(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) loadBookData();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <SquarePen className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Modifier "{book.title}"</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Métadonnées du livre */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Métadonnées</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalPages">Nombre total de pages</Label>
                <Input 
                  id="totalPages" 
                  type="number" 
                  value={totalPages} 
                  onChange={(e) => setTotalPages(parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expectedSegments">Nombre de segments attendus</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="expectedSegments" 
                    type="number" 
                    value={expectedSegments} 
                    onChange={(e) => setExpectedSegments(parseInt(e.target.value) || 0)}
                    min={0}
                  />
                  <Button onClick={recalculateSegments} type="button" variant="secondary">
                    Recalculer
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnelle)</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Description du livre..."
              />
            </div>
            
            <div className="flex items-center space-x-2 py-2">
              <Checkbox 
                id="isPublished"
                checked={isPublished} 
                onCheckedChange={(checked) => setIsPublished(checked === true)}
              />
              <Label htmlFor="isPublished" className="font-medium cursor-pointer">
                Publier ce livre
              </Label>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={saveBookChanges} 
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder les modifications
                  </>
                )}
              </Button>
              
              <Button
                onClick={generateMissingSegments}
                disabled={isSaving || book.missingSegments?.length === 0}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Générer les segments manquants"
                )}
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* Ajout rapide de questions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Ajouter une question de validation</h3>
            
            {book.missingSegments && book.missingSegments.length > 0 ? (
              <form onSubmit={questionForm.handleSubmit(addValidationQuestion)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="segment">Segment manquant</Label>
                  <select 
                    id="segment"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    {...questionForm.register("segment", { valueAsNumber: true })}
                  >
                    {book.missingSegments.map(segmentNum => (
                      <option key={segmentNum} value={segmentNum}>
                        Segment {segmentNum}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <Input 
                    id="question"
                    placeholder="Quelle est la couleur du ciel ?"
                    {...questionForm.register("question")}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="answer">Réponse (un seul mot)</Label>
                  <Input 
                    id="answer"
                    placeholder="bleu"
                    {...questionForm.register("answer")}
                  />
                </div>
                
                <Button type="submit" disabled={isAddingQuestion}>
                  {isAddingQuestion ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ajout en cours...
                    </>
                  ) : (
                    "Ajouter la question"
                  )}
                </Button>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucun segment manquant pour ce livre.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
