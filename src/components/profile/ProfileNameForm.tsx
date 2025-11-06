
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  username: z.string().min(3, "Le nom doit contenir au moins 3 caractères").max(50, "Le nom est trop long")
});

interface ProfileNameFormProps {
  currentUsername: string | null;
  onSave: () => void;
}

export function ProfileNameForm({ currentUsername, onSave }: ProfileNameFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: currentUsername || ""
    }
  });

  const saveUsername = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: values.username })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Votre nom public a été mis à jour avec succès.", {
        description: "Nom de profil enregistré"
      });

      onSave();
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue lors de l'enregistrement du nom.", {
        description: "Erreur"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(saveUsername)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-coffee-darker">Nom de profil</FormLabel>
              <FormControl>
                <Input
                  placeholder="Choisissez un nom public"
                  className="bg-background"
                  {...field}
                />
              </FormControl>
              <p className="text-caption text-muted-foreground">
                Ce nom sera visible par les autres utilisateurs.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-coffee-dark hover:bg-coffee-darker"
          disabled={isLoading}
        >
          {isLoading ? "Enregistrement..." : "Enregistrer mon nom de profil"}
        </Button>
      </form>
    </Form>
  );
}
