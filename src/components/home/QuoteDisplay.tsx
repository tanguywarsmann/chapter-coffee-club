
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const quotes = [
  "La lecture est une porte ouverte sur un monde enchanté.",
  "Un livre est un rêve que vous tenez dans vos mains.",
  "Tu progresses avec rigueur. Continue !",
  "Chaque page est un pas vers ton épanouissement.",
  "La lecture régulière est le secret des grandes réussites.",
  "Le savoir, comme la confiance, s'acquiert page après page.",
  "Les grandes réussites commencent souvent par un petit chapitre quotidien.",
  "L'esprit, comme le corps, s'améliore avec l'entraînement quotidien.",
  "La lecture est aux esprits ce que l'exercice est au corps.",
  "Les livres sont les amis silencieux qui façonnent l'esprit."
];

const encouragements = [
  "Tu as un excellent rythme, continue ainsi !",
  "Tu t'améliores chaque jour, c'est impressionnant.",
  "Ta constance fait toute la différence.",
  "Ton engagement est inspirant.",
  "Bravo pour ta discipline !",
  "Tu es sur la bonne voie pour atteindre tes objectifs.",
  "Chaque page te rapproche de ton objectif."
];

export function QuoteDisplay() {
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    // Random choice between quote and encouragement
    const useQuote = Math.random() > 0.4;
    const collection = useQuote ? quotes : encouragements;
    const randomIndex = Math.floor(Math.random() * collection.length);
    setMessage(collection[randomIndex]);
  }, []);

  if (!message) return null;

  return (
    <Card className="border-coffee-light bg-coffee-lightest">
      <CardContent className="p-4 flex items-start gap-3">
        <Quote className="h-5 w-5 text-coffee-dark mt-0.5 flex-shrink-0" />
        <p className="text-coffee-darker font-serif italic">{message}</p>
      </CardContent>
    </Card>
  );
}
