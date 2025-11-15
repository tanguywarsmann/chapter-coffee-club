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

function randomDate(start: Date, end: Date): string {
  const timestamp = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(timestamp).toISOString();
}

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

    console.log('Starting batch 2 data population...');

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

    // 40 utilisateurs inactifs - 30 avec 1 lecture, 10 avec 2 lectures = 50 total
    const users: UserData[] = [
      { id: 'ca143f1d-df64-47a1-b28f-45a19d9e5bab', username: 'Rebbeca B', readingCount: 2 },
      { id: 'cdaf2747-b631-44ea-8ca1-579083f33e92', username: 'Carla Carla', readingCount: 2 },
      { id: '788270ce-7103-4d8d-8cdf-4e585c99baea', username: 'JP Senat', readingCount: 2 },
      { id: 'f9ffa091-27d1-4c93-a48a-50aa1f0190ad', username: 'soandelorme_b30d2a', readingCount: 2 },
      { id: 'c691396e-23f0-49fb-ad6a-7234ee99071b', username: 'Linh Ngoc', readingCount: 2 },
      { id: '2ec3f9e6-3747-4e1b-9725-5e7c613bd4d9', username: 'Finley Watson', readingCount: 2 },
      { id: '7066e951-e27a-44ed-b24a-9740725b3186', username: 'Erik Olofsson', readingCount: 2 },
      { id: '1734125a-f9fe-4481-b808-554e5967570e', username: 'Luisa Walter', readingCount: 2 },
      { id: 'd2db2320-cdaa-4186-962c-6bc55873dfd1', username: 'Élise Fournier', readingCount: 2 },
      { id: 'b352140d-3641-4286-8a3b-1b58ffc0fc6d', username: 'Mohamed Wauters', readingCount: 2 },
      { id: '28bbd6cd-bfa5-4c19-937c-7cb2966d4f46', username: 'Michael Morvan', readingCount: 1 },
      { id: '572a75d0-0dec-48f1-ac5b-ff24b9b92d3e', username: 'Anais P', readingCount: 1 },
      { id: 'bb6ce672-a78a-4e9d-80c2-308e3ddf6f56', username: 'Maxime Bonvin', readingCount: 1 },
      { id: '5e99ce09-80b1-4356-b035-05ebcc06a292', username: 'Colin Prieto', readingCount: 1 },
      { id: '92a41c65-36ea-4583-9dea-44119da47aae', username: 'Gael Cauchy', readingCount: 1 },
      { id: '59d4778f-d2d5-418d-b264-afaf617e57ec', username: 'soandelorme_1c337f', readingCount: 1 },
      { id: '2ff6dca3-19f8-4c94-be2f-884c4504836a', username: 'Ali T', readingCount: 1 },
      { id: '83563760-0d98-4106-9434-576eab97cfa9', username: 'Eddy Raphoz', readingCount: 1 },
      { id: '454431b8-37ff-4d0c-978a-175dd9e6ccd4', username: 'Koala chanceux', readingCount: 1 },
      { id: 'e4c10c41-ad99-495d-b8fa-8f864872a9b8', username: 'Joseph Bardin', readingCount: 1 },
      { id: 'f6f1243f-3d21-465c-86c9-e68d29a32c33', username: 'Ambroise Picard', readingCount: 1 },
      { id: '2a6f4f2b-a7bb-41b3-a4ef-8ac09c6be6e4', username: 'Noé Vanspauwen', readingCount: 1 },
      { id: '58e5d85b-33bc-4575-aa9c-05f4006ad3cf', username: 'Pénélope Marchand', readingCount: 1 },
      { id: '3c3ce566-bf4a-4b92-bfcc-52e5ddac92e7', username: 'Matthieu Dubois', readingCount: 1 },
      { id: 'a062f79f-f9b5-4534-baf2-07a01276b4ae', username: 'Théophile Martin', readingCount: 1 },
      { id: 'b566b1ab-afc6-4b93-a1f7-9868ed85aca0', username: 'Gaspard Colin', readingCount: 1 },
      { id: 'fe8e6d8b-7b58-428b-a180-6a6fea8f3db9', username: 'Adèle Michel', readingCount: 1 },
      { id: '1074728c-d320-4166-a7eb-1a37fb1988d6', username: 'Bénédicte C.', readingCount: 1 },
      { id: 'cfd98fc8-d15b-4591-a532-1b3d52c5d25e', username: 'Leon Le Cannet', readingCount: 1 },
      { id: '1f2c268a-98e7-4ed7-9ed6-55e88bea1829', username: 'Bertille P', readingCount: 1 },
      { id: '7ee9927b-fe2d-40a5-9918-bfb603b73439', username: 'Emilie Tran Nguyen', readingCount: 1 },
      { id: 'a0fbf070-e124-491f-b1b2-febd8aca4212', username: 'Céline Chen', readingCount: 1 },
      { id: 'e132b5b9-6a70-4e98-9a0d-5b9d9814af0b', username: 'Jean Van Hecke', readingCount: 1 },
      { id: 'b6d8ecc7-acad-4a25-b2f2-e358afe985a3', username: 'Régine Potier', readingCount: 1 },
      { id: 'c6ba2517-de67-435a-bfd8-9c8e283d994d', username: 'Lilou Bonnet', readingCount: 1 },
      { id: '13706717-8987-4a7b-ba97-00d0dbde1c08', username: 'louisadelorme_376357', readingCount: 1 },
      { id: '7de9c9cd-de02-4f42-a13b-f45745e3e8e1', username: 'Hallie Kelly', readingCount: 1 },
      { id: 'fcf6ec8d-e69a-47d3-b377-766036a643f4', username: 'Javier Santos', readingCount: 1 },
      { id: 'ab00c547-05a5-4233-be4a-e2d015c0de8f', username: 'Fanny Noetinger', readingCount: 1 },
      { id: '02487f42-c76b-4d77-a834-87c917975708', username: 'Rafaela Raposo', readingCount: 1 },
    ];

    const startedBeforeDate = new Date('2025-11-05T00:00:00Z');
    const completedStartDate = new Date('2025-11-05T00:00:00Z');
    const completedEndDate = new Date('2025-11-15T23:59:59Z');
    const earlyStartDate = new Date('2025-10-01T00:00:00Z');

    const insertions = [];

    for (const user of users) {
      console.log(`Processing ${user.username} - ${user.readingCount} readings`);
      
      const shuffledBooks = shuffleArray(books);
      const selectedBooks = shuffledBooks.slice(0, user.readingCount);

      for (const book of selectedBooks) {
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

    console.log(`Inserting ${insertions.length} reading progress records...`);
    const { data, error } = await supabase
      .from('reading_progress')
      .insert(insertions);

    if (error) {
      console.error('Error inserting data:', error);
      throw error;
    }

    console.log('Batch 2 data population completed successfully!');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully added ${insertions.length} completed readings for 40 users`,
        totalUsers: users.length,
        totalReadings: insertions.length,
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
