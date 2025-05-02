
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

interface BookMetadataEditorProps {
  book: {
    id: string;
    title: string;
    totalPages: number;
    expectedSegments: number;
    missingSegments: number[];
    slug?: string; // Added slug property to fix TypeScript errors
  };
  onUpdate: () => void;
}

export function BookMetadataEditor({ book, onUpdate }: BookMetadataEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [totalPages, setTotalPages] = useState<number | string>(book.totalPages || 0);
  const [expectedSegments, setExpectedSegments] = useState(book.expectedSegments);
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [bookSlug, setBookSlug] = useState<string | undefined>(book.slug);
  
  // Pour l'ajout rapide de questions
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

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
        .select('description, is_published, total_pages, id, slug, title, author, cover_url, created_at, updated_at')
        .eq('id', book.id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        if (data.description) setDescription(data.description);
        setIsPublished(data.is_published !== false); // Default to true if undefined
        // S'assurer que totalPages est correctement défini à partir des données de la base
        if (data.total_pages) setTotalPages(data.total_pages);
        if (data.slug) setBookSlug(data.slug);
        console.log("Données chargées depuis Supabase:", data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données du livre:", error);
    }
  };
  
  // Generate empty segments for any missing ones
  const generateMissingSegments = async () => {
    if (book.missingSegments.length === 0) {
      toast({
        title: "Information",
        description: "Tous les segments ont déjà été créés pour ce livre.",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Get the book slug
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('slug')
        .eq('id', book.id)
        .single();
      
      if (bookError) throw bookError;
      
      const segmentEntries = book.missingSegments.map(segmentNum => ({
        book_slug: bookData.slug,
        segment: segmentNum, // Déjà indexé à partir de 1 depuis le composant parent
        question: "",
        answer: ""
      }));
      
      const { error } = await supabase
        .from("reading_questions")
        .upsert(segmentEntries, { onConflict: 'book_slug,segment' });
        
      if (error) throw error;
      
      toast({
        title: "Segments générés",
        description: `${book.missingSegments.length} segments vides ont été générés avec succès.`,
      });
      
      // Fermer le dialogue et actualiser les données
      setIsOpen(false);
      console.log("Update triggered from generateMissingSegments");
      onUpdate();
    } catch (error: any) {
      console.error("Erreur lors de la génération des segments:", error);
      toast({
        title: "Erreur",
        description: `Impossible de générer les segments: ${error.message}`,
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
      // Convertir totalPages en nombre entier pour s'assurer que c'est un nombre valide
      const parsedTotalPages = parseInt(String(totalPages), 10);
      
      if (isNaN(parsedTotalPages)) {
        throw new Error("Le nombre de pages doit être un nombre valide");
      }
      
      // Ajouter les logs de débogage pour vérifier l'identifiant utilisé
      console.log("Tentative de mise à jour pour ID:", book.id, "Slug:", bookSlug);
      
      // Requête Supabase temporaire pour vérifier si l'ID existe
      const test = await supabase.from("books").select("*").eq("id", book.id);
      console.log("Résultat recherche par ID:", test.data);
      
      // Si aucune ligne trouvée par ID, essayer avec le slug récupéré
      let targetId = book.id;
      let targetSlug = bookSlug;
      
      if (!test.data || test.data.length === 0) {
        // Récupérer d'abord le slug s'il n'est pas disponible
        if (!bookSlug) {
          // Rechercher par d'autres moyens, comme le titre
          const titleSearch = await supabase.from("books").select("slug").eq("title", book.title).single();
          if (titleSearch.data) {
            targetSlug = titleSearch.data.slug;
            console.log("Slug récupéré depuis le titre:", targetSlug);
          }
        } else {
          targetSlug = bookSlug;
        }
        
        // Tester si le slug existe
        const fallback = await supabase.from("books").select("*").eq("slug", targetSlug);
        console.log("Résultat recherche par slug:", fallback.data);
        
        if (fallback.data && fallback.data.length > 0) {
          // Utiliser l'ID récupéré pour la mise à jour
          targetId = fallback.data[0].id;
          console.log("Utilisation de l'ID récupéré depuis le slug:", targetId);
        }
      }
      
      // Préparer l'objet de mise à jour
      const updatePayload = {
        total_pages: parsedTotalPages,
        description: description || null,
        is_published: isPublished
      };
      
      console.log("Payload envoyé à Supabase:", updatePayload);
      console.log("ID final ciblé:", targetId);
      console.log("Slug final ciblé:", targetSlug);
      
      // Récupérer les infos complètes du livre pour debug
      const { data: bookInfo, error: bookInfoError } = await supabase
        .from('books')
        .select('*')
        .eq('id', targetId);
        
      if (bookInfoError) {
        console.error("Erreur lors de la récupération des infos du livre:", bookInfoError);
      } else {
        console.log("Infos du livre avant mise à jour:", bookInfo);
      }
      
      // Exécuter la requête de mise à jour avec sélection pour voir ce qui est retourné
      let success = false;
      
      // Essayer d'abord avec l'ID
      const { data, error, count } = await supabase
        .from('books')
        .update(updatePayload)
        .eq('id', targetId)
        .select();
        
      if (error) {
        console.error("Erreur Supabase avec ID:", error);
      } else {
        console.log("Réponse de Supabase (ID):", { data, count, affectedRows: data?.length });
        if (data && data.length > 0) {
          success = true;
        }
      }
      
      // Si l'ID n'a pas fonctionné, essayer avec le slug
      if (!success && targetSlug) {
        const { data: dataBySlug, error: errorBySlug } = await supabase
          .from('books')
          .update(updatePayload)
          .eq('slug', targetSlug)
          .select();
          
        console.log("Résultat avec slug:", { data: dataBySlug, error: errorBySlug });
        
        if (errorBySlug) {
          console.error("Erreur Supabase (avec slug):", errorBySlug);
          throw errorBySlug;
        }
        
        if (dataBySlug && dataBySlug.length > 0) {
          success = true;
          toast({
            title: "Modifications enregistrées (via slug)",
            description: `Les informations du livre "${book.title}" ont été mises à jour.`
          });
        }
      }
      
      // Si aucune des deux méthodes n'a fonctionné
      if (!success) {
        // Dernier recours: tenter de trouver le livre par son titre
        const { data: findByTitle } = await supabase
          .from('books')
          .select('id, slug')
          .eq('title', book.title);
          
        console.log("Recherche par titre:", findByTitle);
        
        if (findByTitle && findByTitle.length > 0) {
          // Essayer une mise à jour avec cet ID
          const { data: finalAttempt, error: finalError } = await supabase
            .from('books')
            .update(updatePayload)
            .eq('id', findByTitle[0].id)
            .select();
            
          console.log("Dernière tentative par titre:", { data: finalAttempt, error: finalError });
          
          if (finalError) {
            throw finalError;
          }
          
          if (finalAttempt && finalAttempt.length > 0) {
            success = true;
            toast({
              title: "Modifications enregistrées (via titre)",
              description: `Les informations du livre "${book.title}" ont été mises à jour.`
            });
          }
        }
      }
      
      if (!success) {
        throw new Error("Impossible de mettre à jour le livre : aucune ligne correspondante trouvée");
      }
      
      // Si on est arrivé jusqu'ici sans erreur, c'est un succès
      if (success) {
        // Fermer le dialogue et actualiser les données
        setIsOpen(false);
        console.log("Update triggered from saveBookChanges");
        onUpdate();
      } else {
        toast({
          title: "Modifications enregistrées",
          description: `Les informations du livre "${book.title}" ont été mises à jour.`
        });
      }
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
      
      // Fermer le dialogue et actualiser les données
      setIsOpen(false);
      console.log("Update triggered from addValidationQuestion");
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
                disabled={isSaving || book.missingSegments.length === 0}
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
