import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookData {
  id: string;
  title: string;
  total_pages: number;
}

interface UserData {
  id: string;
  username: string;
  readingCount: number;
}

// Fonction pour générer une date aléatoire dans une plage
function randomDate(start: Date, end: Date): string {
  const timestamp = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(timestamp).toISOString();
}

// Fonction pour mélanger un tableau
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log('Starting data population...');

    // Livres récents (les 40 derniers)
    const books: BookData[] = [
      { id: 'a8bdb229-3cb0-4e1b-af5b-3f7e24286e07', title: 'Embarquements immédiats pour Noël', total_pages: 150 },
      { id: 'bf2caf93-f8de-480f-9a41-46d2886631cf', title: 'De zéro à un', total_pages: 180 },
      { id: '875f43c3-879d-4475-9a14-7a39a7bde26d', title: 'Le nid du coucou', total_pages: 390 },
      { id: '2132d1f8-cce8-405c-8271-a0bd1f917795', title: 'Les androïdes rêvent-ils de moutons électriques ?', total_pages: 210 },
      { id: '3d9fd862-cea7-4aa7-b448-371e6ebb4aff', title: 'Ubik', total_pages: 230 },
      { id: '93aa262d-a7ab-4ab4-90ae-428afb678440', title: 'Aurélia', total_pages: 75 },
      { id: 'd00cd985-97d0-4893-b83e-daa01cedfcd8', title: "Le Chef-d'œuvre inconnu", total_pages: 30 },
      { id: 'ea7d3e4b-aa0c-4a4b-bda4-8a4d7e332038', title: 'Harry Potter, Tome 7 : Les Reliques de la Mort', total_pages: 750 },
      { id: '7674022e-80dc-48ec-abe3-3dcfb1eade88', title: 'La Société très secrète des sorcières extraordinaires', total_pages: 300 },
      { id: 'a47842df-e9d8-420c-9467-19ac893db998', title: 'Sauver sa peau', total_pages: 360 },
      { id: '4badd865-89a8-4c43-b5cb-e54a5f4ca7d8', title: 'Les nouveaux Prophètes', total_pages: 300 },
      { id: 'c7a9b2e1-5d34-4b2a-8f9c-1a2b3c4d5e6f', title: "La fin de l'été", total_pages: 300 },
      { id: 'b8c3a1e2-7d54-4a9f-9132-5f6a7b8c9d10', title: 'La maîtresse italienne', total_pages: 180 },
      { id: 'ce6ef272-9843-4d4a-9d12-46041283b9ad', title: "Le Sorceleur, Tome 2 : L'Épée de la Providence", total_pages: 390 },
      { id: '18fe5999-a6db-4d58-8947-1ce17e6b8a6e', title: 'Le Sorceleur, Tome 1 : Le Dernier Vœu', total_pages: 330 },
      { id: 'bbb5ce2d-3475-4218-970d-620845f9746e', title: 'Le Maître et Marguerite', total_pages: 540 },
      { id: '2c7f3a1e-9b54-46a8-8f3d-1a2b3c4d5e6f', title: 'La Très Catastrophique Visite du Zoo', total_pages: 120 },
      { id: '9f3a2d1e-6b47-4a8c-9c1d-0e2f3b4a5c6d', title: 'Holly', total_pages: 510 },
      { id: 'f1a2b3c4-d5e6-4789-a0b1-c2d3e4f5a6b7', title: "Quelqu'un d'autre", total_pages: 210 },
      { id: 'e7b2a1c4-3d59-4f86-9a21-5c3b8d9e1f02', title: 'Je serai le dernier homme', total_pages: 150 },
      { id: 'd2b4a6f8-1c3e-4a7b-9e52-6f1a2c3b4d5e', title: 'Le village des ténèbres', total_pages: 240 },
      { id: 'a1c3d5f7-9b2e-4d6a-8c10-1e2f3a4b5c6d', title: 'Le Livre sans nom', total_pages: 390 },
      { id: '3d8c7f2a-1e45-4b6c-9a23-7f1e4c2b9d01', title: 'Oldforest', total_pages: 300 },
      { id: 'c4a7f2b9-6e3d-4c8a-9b12-7f1e5d3c2a90', title: 'Agatha Raisin enquête T7 : À la claire fontaine', total_pages: 180 },
      { id: 'b0c2d8e4-6a4a-4c2b-9a71-8f3e2c6d5a12', title: 'Agatha Raisin enquête T6 : Vacances tous risques', total_pages: 180 },
      { id: '4f6ad2b3-8c1e-4a9f-b0d2-6a3f9c8e1b55', title: 'Dream Harbor, Tome 1 : Le Pumpkin Spice Café', total_pages: 210 },
      { id: '7b2c9f1e-3a4d-4f8b-92ce-6a1d0f3e5b77', title: "Nevernight, Tome 3 : L'aube obscure", total_pages: 690 },
      { id: '9a7f1b2c-3d4e-5f60-a1b2-c3d4e5f60789', title: 'La Femme de ménage', total_pages: 270 },
      { id: '6f2d9b8a-3c61-4c0e-9a77-5e2c1f0b9a34', title: 'Acide sulfurique', total_pages: 90 },
      { id: '0f4e9a9e-6d3c-4c2a-8a6f-9a2b1f7c3e55', title: 'Métaphysique des tubes', total_pages: 90 },
      { id: '8a6b9c3d-1f24-4c8e-91a7-2f0b7c9e5a11', title: "Hygiène de l'assassin", total_pages: 150 },
      { id: '5c2f0a3e-1b0a-4c6e-9f3a-2b7d9f4a1c22', title: 'Stupeur et tremblements', total_pages: 90 },
      { id: '2b8e0b6e-5a3b-4b7c-9fd8-2f3b1f8b9c21', title: 'La Moustache', total_pages: 120 },
      { id: 'e7f3a2a9-3f8c-4f2a-9f9d-2c7bb2a6f411', title: 'Yoga', total_pages: 270 },
      { id: 'f6b7a9d2-9c8b-4f0a-9b71-6f6e9a1a2b33', title: 'Kolkhoze', total_pages: 390 },
      { id: 'd8b7b2a1-2c74-4d3f-9c2e-3f5b7a6c1e24', title: "L'Eté", total_pages: 60 },
      { id: 'c3e5a5b2-5a1a-4bb9-8c5e-1a0b3e8f2c77', title: 'Betty', total_pages: 510 },
      { id: 'b4c2f4a4-8a2c-4a1a-9d49-3d6b8b3c1a71', title: 'Un couple irréprochable', total_pages: 300 },
      { id: '9d222326-93b5-4879-bd21-d544dac5f1b8', title: 'Le Treizième Conte', total_pages: 420 },
      { id: '6dab0ece-632f-4b92-96af-0c316eef43d5', title: 'Un automne pour te pardonner', total_pages: 330 },
    ];

    // Utilisateurs inactifs avec leur nombre de lectures
    const users: UserData[] = [
      { id: '5b343db8-83a9-444f-bcd3-2dc3cd32713b', username: 'Philippine R', readingCount: 6 },
      { id: 'ceb9626d-4d60-4e7c-a4ac-e87d7dee1dc3', username: 'Charlotte Barr', readingCount: 7 },
      { id: 'a055bf42-b367-42d8-9922-73d2f32aa0c0', username: 'Théo Satty', readingCount: 8 },
      { id: 'e0ebd4ca-d8ba-4fee-8494-8304477cfd7c', username: 'Salomon C', readingCount: 9 },
      { id: '8f23978c-e3ae-49fb-80ee-e2ccae803818', username: 'Kévin Vu', readingCount: 10 },
    ];

    // Dates de plage
    const startedBeforeDate = new Date('2025-11-05T00:00:00Z');
    const completedStartDate = new Date('2025-11-05T00:00:00Z');
    const completedEndDate = new Date('2025-11-15T23:59:59Z');
    const earlyStartDate = new Date('2025-10-01T00:00:00Z');

    const insertions = [];

    // Pour chaque utilisateur
    for (const user of users) {
      console.log(`Processing ${user.username} - ${user.readingCount} readings`);
      
      // Mélanger les livres et prendre le nombre requis
      const shuffledBooks = shuffleArray(books);
      const selectedBooks = shuffledBooks.slice(0, user.readingCount);

      for (const book of selectedBooks) {
        // Générer des dates aléatoires
        const started_at = randomDate(earlyStartDate, startedBeforeDate);
        const updated_at = randomDate(completedStartDate, completedEndDate);

        const progressData = {
          user_id: user.id,
          book_id: book.id,
          status: 'completed',
          current_page: book.total_pages,
          total_pages: book.total_pages,
          started_at,
          updated_at,
        };

        insertions.push(progressData);
      }
    }

    // Insérer toutes les données
    console.log(`Inserting ${insertions.length} reading progress records...`);
    const { data, error } = await supabase
      .from('reading_progress')
      .insert(insertions);

    if (error) {
      console.error('Error inserting data:', error);
      throw error;
    }

    console.log('Data population completed successfully!');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully added ${insertions.length} completed readings`,
        details: users.map(u => ({ username: u.username, readings: u.readingCount })),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
