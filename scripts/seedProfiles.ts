
/**
 *  npx ts-node -r dotenv/config scripts/seedProfiles.ts
 *  (nécessite SUPABASE_SERVICE_ROLE_KEY et NEXT_PUBLIC_SUPABASE_URL dans .env)
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes: NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey,
  { 
    auth: { 
      autoRefreshToken: false, 
      persistSession: false 
    } 
  }
);

type SeedUser = { username: string; email: string };

const seed: SeedUser[] = [
  { username: 'lea_martin',       email: 'lea.martin@example.com' },
  { username: 'hugo_bernard',     email: 'hugo.bernard@example.com' },
  { username: 'emma_dubois',      email: 'emma.dubois@example.com' },
  { username: 'lucas_moreau',     email: 'lucas.moreau@example.com' },
  { username: 'chloe_thomas',     email: 'chloe.thomas@example.com' },
  { username: 'ines_roux',        email: 'ines.roux@example.com' },
  { username: 'theo_lambert',     email: 'theo.lambert@example.com' },
  { username: 'manon_garcia',     email: 'manon.garcia@example.com' },
  { username: 'nathan_simon',     email: 'nathan.simon@example.com' },
  { username: 'jade_faure',       email: 'jade.faure@example.com' },
  { username: 'yasmine_benali',   email: 'yasmine.benali@example.com' },
  { username: 'karim_hamidi',     email: 'karim.hamidi@example.com' },
  { username: 'sofia_hadj',       email: 'sofia.hadj@example.com' },
  { username: 'amine_cherif',     email: 'amine.cherif@example.com' },
  { username: 'nadia_boucher',    email: 'nadia.boucher@example.com' },
  { username: 'mathis_leroy',     email: 'mathis.leroy@example.com' },
  { username: 'louise_girard',    email: 'louise.girard@example.com' },
  { username: 'gabriel_fontaine', email: 'gabriel.fontaine@example.com' },
  { username: 'clara_perrin',     email: 'clara.perrin@example.com' },
  { username: 'maxime_duval',     email: 'maxime.duval@example.com' },
  { username: 'sarah_nguyen',     email: 'sarah.nguyen@example.com' },
  { username: 'antoine_mercier',  email: 'antoine.mercier@example.com' },
  { username: 'juliette_blanc',   email: 'juliette.blanc@example.com' },
  { username: 'romain_chevalier', email: 'romain.chevalier@example.com' },
  { username: 'camille_morin',    email: 'camille.morin@example.com' },
  { username: 'alexandre_petit',  email: 'alexandre.petit@example.com' },
  { username: 'marine_rousseau',  email: 'marine.rousseau@example.com' },
  { username: 'paul_fournier',    email: 'paul.fournier@example.com' },
  { username: 'alice_lefevre',    email: 'alice.lefevre@example.com' },
  { username: 'victor_martinez',  email: 'victor.martinez@example.com' }
];

async function seedProfiles() {
  console.log('🚀 Début du seeding des profils...');
  
  let successCount = 0;
  let errorCount = 0;

  for (const u of seed) {
    try {
      // Créer l'utilisateur dans auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: u.email,
        password: 'Passw0rd!',
        email_confirm: true
      });

      if (authError) {
        console.error(`❌ Erreur auth pour ${u.username}:`, authError.message);
        errorCount++;
        continue;
      }

      if (!authData.user) {
        console.error(`❌ Pas d'utilisateur créé pour ${u.username}`);
        errorCount++;
        continue;
      }

      // Créer le profil dans public.profiles
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        username: u.username,
        email: u.email,
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (profileError) {
        console.error(`❌ Erreur profil pour ${u.username}:`, profileError.message);
        errorCount++;
      } else {
        console.log(`✅ ${u.username} créé avec succès`);
        successCount++;
      }

    } catch (error) {
      console.error(`❌ Erreur générale pour ${u.username}:`, error);
      errorCount++;
    }
  }

  console.log('\n📊 Résumé du seeding:');
  console.log(`✅ Succès: ${successCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);
  console.log(`📝 Total: ${seed.length}`);
  console.log('🎯 Terminé ✔️');
}

// Exécuter le script
seedProfiles().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
