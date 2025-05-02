
import React, { useState } from "react";
import { Book } from "@/types/book";
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

interface BookMetadataEditorProps {
  book: {
    id: string;
    title: string;
    totalPages: number;
    expectedSegments: number;
    missingSegments: number[];
  };
  onUpdate: () => void;
}

export function BookMetadataEditor({ book, onUpdate }: BookMetadataEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [totalPages, setTotalPages] = useState(book.totalPages);
  const [expectedSegments, setExpectedSegments] = useState(book.expectedSegments);
  const [description, setDescription] = useState("");
  
  // Pour l'ajout rapide de questions
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  // Fonction pour recalculer automatiquement les segments
  const recalculateSegments = () => {
    const calculated = Math.ceil(totalPages / 30);
    setExpectedSegments(calculated);
  };
  
  // Fonction pour enregistrer les modifications du livre
  const saveBookChanges = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('books')
        .update({
          total_pages: totalPages,
          description: description || null
        })
        .eq('id', book.id);
        
      if (error) throw error;
      
      toast({
        title: "Modifications enregistrées",
        description: `Les informations du livre "${book.title}" ont été mises à jour.`
      });
      
      onUpdate();
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du livre:", error);
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour le livre: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Fonction pour ajouter une question de validation
  const addValidationQuestion = async () => {
    if (!selectedSegment && selectedSegment !== 0) {
      toast({
        title: "Segment non sélectionné",
        description: "Veuillez sélectionner un segment",
        variant: "destructive"
      });
      return;
    }
    
    if (!question.trim()) {
      toast({
        title: "Question invalide",
        description: "La question ne peut pas être vide",
        variant: "destructive"
      });
      return;
    }
    
    if (!answer.trim()) {
      toast({
        title: "Réponse invalide",
        description: "La réponse ne peut pas être vide",
        variant: "destructive"
      });
      return;
    }
    
    // Vérifier si la réponse contient plus d'un mot
    if (answer.trim().split(/\s+/).length > 1) {
      toast({
        title: "Réponse invalide",
        description: "La réponse doit contenir un seul mot",
        variant: "destructive"
      });
      return;
    }
    
    setIsAddingQuestion(true);
    
    try {
      // Récupérer le slug du livre
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('slug')
        .eq('id', book.id)
        .single();
        
      if (bookError) throw bookError;
      
      // Ajouter la question
      const { error } = await supabase
        .from('reading_questions')
        .insert({
          book_slug: bookData.slug,
          segment: selectedSegment,
          question: question.trim(),
          answer: answer.trim().toLowerCase()
        });
        
      if (error) throw error;
      
      toast({
        title: "Question ajoutée",
        description: `La question pour le segment ${selectedSegment} a été ajoutée avec succès.`
      });
      
      // Réinitialiser les champs
      setQuestion("");
      setAnswer("");
      
      // Rafraîchir les données
      onUpdate();
    } catch (error: any) {
      console.error("Erreur lors de l'ajout de la question:", error);
      toast({
        title: "Erreur",
        description: `Impossible d'ajouter la question: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsAddingQuestion(false);
    }
  };
  
  // Récupérer la description du livre au moment de l'ouverture de la modale
  const loadBookDescription = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('description')
        .eq('id', book.id)
        .single();
        
      if (error) throw error;
      
      if (data && data.description) {
        setDescription(data.description);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la description:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) loadBookDescription();
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
          </div>
          
          <Separator />
          
          {/* Ajout rapide de questions de validation */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Ajouter une question de validation</h3>
            
            {book.missingSegments.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="segment">Segment manquant</Label>
                  <select 
                    id="segment"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={selectedSegment || ""}
                    onChange={(e) => setSelectedSegment(parseInt(e.target.value))}
                  >
                    <option value="">Sélectionnez un segment</option>
                    {book.missingSegments.map((segment) => (
                      <option key={segment} value={segment}>
                        Segment {segment}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <Input 
                    id="question" 
                    value={question} 
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Exemple: Quel est le nom du personnage principal ?"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="answer">Réponse (un seul mot)</Label>
                  <Input 
                    id="answer" 
                    value={answer} 
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Exemple: Jean"
                  />
                  <p className="text-xs text-muted-foreground">
                    La réponse doit contenir un seul mot, sans espace.
                  </p>
                </div>
                
                <Button 
                  onClick={addValidationQuestion} 
                  disabled={isAddingQuestion}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  {isAddingQuestion ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ajout en cours...
                    </>
                  ) : (
                    <>Ajouter la question</>
                  )}
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Tous les segments de ce livre ont déjà des questions.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
