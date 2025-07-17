
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
  { username: 'mdussommier',     email: 'mathieu.dussommier@example.com' },
  { username: 'emarotte',        email: 'emilie.marotte@example.com' },
  { username: 'selaidi',         email: 'sofia.elaidi@example.com' },
  { username: 'jlbouritte',      email: 'jeanlouis.bouritte@example.com' },
  { username: 'nvanschou',       email: 'noe.vanschou@example.com' },
  { username: 'lgriselin',       email: 'laetitia.griselin@example.com' },
  { username: 'ibhsalah',        email: 'ismael.bhs@example.com' },
  { username: 'okervern',        email: 'oriane.kervern@example.com' },
  { username: 'fmontavon',       email: 'felix.montavon@example.com' },
  { username: 'aboutetlebon',    email: 'anaelle.boutet@example.com' },
  { username: 'croussange',      email: 'clement.roussange@example.com' },
  { username: 'yabouzeid',       email: 'yasmine.abz@example.com' },
  { username: 'glegleuher',      email: 'gaspard.gleuher@example.com' },
  { username: 'aprevostgrall',   email: 'aurore.pg@example.com' },
  { username: 'mdesrousseaux',   email: 'malo.desrousseaux@example.com' },
  { username: 'velguea',         email: 'victoire.elguea@example.com' },
  { username: 'izaidi',          email: 'idriss.zaidi@example.com' },
  { username: 'aportelance',     email: 'adele.portelance@example.com' },
  { username: 'sdubuisson',      email: 'seraphin.dubuisson@example.com' },
  { username: 'mchenot',         email: 'maelle.chenot@example.com' },
  { username: 'ksoret',          email: 'kevin.soret@example.com' },
  { username: 'lbenkacem',       email: 'louna.benkacem@example.com' },
  { username: 'rostermann',      email: 'raphael.ostermann@example.com' },
  { username: 'tchevrot',        email: 'thais.chevrot@example.com' },
  { username: 'tnguyenba',       email: 'timeo.nguyenba@example.com' },
  { username: 'sbelloc',         email: 'sasha.belloc@example.com' },
  { username: 'jmontassier',     email: 'juliette.montassier@example.com' },
  { username: 'ybensoussan',     email: 'yanis.br@example.com' },
  { username: 'mreversat',       email: 'melodie.reversat@example.com' },
  { username: 'fcaradec',        email: 'florent.caradec@example.com' }
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
