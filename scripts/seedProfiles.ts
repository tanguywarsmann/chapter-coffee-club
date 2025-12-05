
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

// 250 profils français réalistes
const seed: SeedUser[] = [
  // Prénoms classiques français
  { username: 'lea_martin', email: 'lea.martin@example.com' },
  { username: 'hugo_bernard', email: 'hugo.bernard@example.com' },
  { username: 'emma_dubois', email: 'emma.dubois@example.com' },
  { username: 'lucas_moreau', email: 'lucas.moreau@example.com' },
  { username: 'chloe_thomas', email: 'chloe.thomas@example.com' },
  { username: 'ines_roux', email: 'ines.roux@example.com' },
  { username: 'theo_lambert', email: 'theo.lambert@example.com' },
  { username: 'manon_garcia', email: 'manon.garcia@example.com' },
  { username: 'nathan_simon', email: 'nathan.simon@example.com' },
  { username: 'jade_faure', email: 'jade.faure@example.com' },
  { username: 'yasmine_benali', email: 'yasmine.benali@example.com' },
  { username: 'karim_hamidi', email: 'karim.hamidi@example.com' },
  { username: 'sofia_hadj', email: 'sofia.hadj@example.com' },
  { username: 'amine_cherif', email: 'amine.cherif@example.com' },
  { username: 'nadia_boucher', email: 'nadia.boucher@example.com' },
  { username: 'mathis_leroy', email: 'mathis.leroy@example.com' },
  { username: 'louise_girard', email: 'louise.girard@example.com' },
  { username: 'gabriel_fontaine', email: 'gabriel.fontaine@example.com' },
  { username: 'clara_perrin', email: 'clara.perrin@example.com' },
  { username: 'maxime_duval', email: 'maxime.duval@example.com' },
  { username: 'sarah_nguyen', email: 'sarah.nguyen@example.com' },
  { username: 'antoine_mercier', email: 'antoine.mercier@example.com' },
  { username: 'juliette_blanc', email: 'juliette.blanc@example.com' },
  { username: 'romain_chevalier', email: 'romain.chevalier@example.com' },
  { username: 'camille_morin', email: 'camille.morin@example.com' },
  { username: 'alexandre_petit', email: 'alexandre.petit@example.com' },
  { username: 'marine_rousseau', email: 'marine.rousseau@example.com' },
  { username: 'paul_fournier', email: 'paul.fournier@example.com' },
  { username: 'alice_lefevre', email: 'alice.lefevre@example.com' },
  { username: 'victor_martinez', email: 'victor.martinez@example.com' },
  // 31-60
  { username: 'julie_dupont', email: 'julie.dupont@example.com' },
  { username: 'thomas_robert', email: 'thomas.robert@example.com' },
  { username: 'marie_richard', email: 'marie.richard@example.com' },
  { username: 'nicolas_laurent', email: 'nicolas.laurent@example.com' },
  { username: 'laura_michel', email: 'laura.michel@example.com' },
  { username: 'kevin_lefebvre', email: 'kevin.lefebvre@example.com' },
  { username: 'pauline_garcia', email: 'pauline.garcia@example.com' },
  { username: 'julien_david', email: 'julien.david@example.com' },
  { username: 'charlotte_bertrand', email: 'charlotte.bertrand@example.com' },
  { username: 'florian_roux', email: 'florian.roux@example.com' },
  { username: 'amelie_vincent', email: 'amelie.vincent@example.com' },
  { username: 'quentin_muller', email: 'quentin.muller@example.com' },
  { username: 'marion_leroy', email: 'marion.leroy@example.com' },
  { username: 'benjamin_bonnet', email: 'benjamin.bonnet@example.com' },
  { username: 'oceane_francois', email: 'oceane.francois@example.com' },
  { username: 'adrien_martinez', email: 'adrien.martinez@example.com' },
  { username: 'elodie_legrand', email: 'elodie.legrand@example.com' },
  { username: 'damien_garnier', email: 'damien.garnier@example.com' },
  { username: 'audrey_faure', email: 'audrey.faure@example.com' },
  { username: 'pierre_andre', email: 'pierre.andre@example.com' },
  { username: 'mathilde_mercier', email: 'mathilde.mercier@example.com' },
  { username: 'clement_dupuis', email: 'clement.dupuis@example.com' },
  { username: 'anais_lambert', email: 'anais.lambert@example.com' },
  { username: 'jeremy_fontaine', email: 'jeremy.fontaine@example.com' },
  { username: 'emilie_rousseau', email: 'emilie.rousseau@example.com' },
  { username: 'sebastien_blanc', email: 'sebastien.blanc@example.com' },
  { username: 'margot_guerin', email: 'margot.guerin@example.com' },
  { username: 'arnaud_chevalier', email: 'arnaud.chevalier@example.com' },
  { username: 'celine_morel', email: 'celine.morel@example.com' },
  { username: 'guillaume_henry', email: 'guillaume.henry@example.com' },
  // 61-90
  { username: 'lucie_mathieu', email: 'lucie.mathieu@example.com' },
  { username: 'vincent_clement', email: 'vincent.clement@example.com' },
  { username: 'elise_gauthier', email: 'elise.gauthier@example.com' },
  { username: 'mickael_perrot', email: 'mickael.perrot@example.com' },
  { username: 'aurelie_robin', email: 'aurelie.robin@example.com' },
  { username: 'thibault_masson', email: 'thibault.masson@example.com' },
  { username: 'stephanie_marchand', email: 'stephanie.marchand@example.com' },
  { username: 'fabien_dumont', email: 'fabien.dumont@example.com' },
  { username: 'caroline_giraud', email: 'caroline.giraud@example.com' },
  { username: 'xavier_barbier', email: 'xavier.barbier@example.com' },
  { username: 'sandrine_arnaud', email: 'sandrine.arnaud@example.com' },
  { username: 'ludovic_meyer', email: 'ludovic.meyer@example.com' },
  { username: 'nathalie_picard', email: 'nathalie.picard@example.com' },
  { username: 'stephane_roger', email: 'stephane.roger@example.com' },
  { username: 'laetitia_schmitt', email: 'laetitia.schmitt@example.com' },
  { username: 'yannick_leroux', email: 'yannick.leroux@example.com' },
  { username: 'valerie_colin', email: 'valerie.colin@example.com' },
  { username: 'christophe_vidal', email: 'christophe.vidal@example.com' },
  { username: 'virginie_bourgeois', email: 'virginie.bourgeois@example.com' },
  { username: 'olivier_renard', email: 'olivier.renard@example.com' },
  { username: 'sabrina_lemaire', email: 'sabrina.lemaire@example.com' },
  { username: 'franck_philippe', email: 'franck.philippe@example.com' },
  { username: 'estelle_rolland', email: 'estelle.rolland@example.com' },
  { username: 'raphael_lacroix', email: 'raphael.lacroix@example.com' },
  { username: 'delphine_caron', email: 'delphine.caron@example.com' },
  { username: 'loic_meunier', email: 'loic.meunier@example.com' },
  { username: 'melanie_brunet', email: 'melanie.brunet@example.com' },
  { username: 'sylvain_blanchard', email: 'sylvain.blanchard@example.com' },
  { username: 'helene_guyon', email: 'helene.guyon@example.com' },
  { username: 'cedric_prevost', email: 'cedric.prevost@example.com' },
  // 91-120
  { username: 'marion_julien', email: 'marion.julien@example.com' },
  { username: 'alexis_bouvier', email: 'alexis.bouvier@example.com' },
  { username: 'emeline_hubert', email: 'emeline.hubert@example.com' },
  { username: 'anthony_carpentier', email: 'anthony.carpentier@example.com' },
  { username: 'justine_dufour', email: 'justine.dufour@example.com' },
  { username: 'matthieu_berger', email: 'matthieu.berger@example.com' },
  { username: 'fanny_sanchez', email: 'fanny.sanchez@example.com' },
  { username: 'cyril_da_silva', email: 'cyril.da_silva@example.com' },
  { username: 'agathe_fernandez', email: 'agathe.fernandez@example.com' },
  { username: 'gregory_poirier', email: 'gregory.poirier@example.com' },
  { username: 'amandine_adam', email: 'amandine.adam@example.com' },
  { username: 'samuel_carre', email: 'samuel.carre@example.com' },
  { username: 'gaelle_jacquet', email: 'gaelle.jacquet@example.com' },
  { username: 'remi_aubert', email: 'remi.aubert@example.com' },
  { username: 'angelique_rey', email: 'angelique.rey@example.com' },
  { username: 'jonathan_renaud', email: 'jonathan.renaud@example.com' },
  { username: 'claire_maillard', email: 'claire.maillard@example.com' },
  { username: 'alexis_fabre', email: 'alexis.fabre@example.com' },
  { username: 'marine_jean', email: 'marine.jean@example.com' },
  { username: 'tony_perez', email: 'tony.perez@example.com' },
  { username: 'ophelie_lecomte', email: 'ophelie.lecomte@example.com' },
  { username: 'david_sauvage', email: 'david.sauvage@example.com' },
  { username: 'morgane_gilles', email: 'morgane.gilles@example.com' },
  { username: 'johan_gosselin', email: 'johan.gosselin@example.com' },
  { username: 'clemence_brun', email: 'clemence.brun@example.com' },
  { username: 'maxence_lemoine', email: 'maxence.lemoine@example.com' },
  { username: 'solene_bouchard', email: 'solene.bouchard@example.com' },
  { username: 'aurelien_pichon', email: 'aurelien.pichon@example.com' },
  { username: 'margaux_menard', email: 'margaux.menard@example.com' },
  { username: 'florent_fleury', email: 'florent.fleury@example.com' },
  // 121-150
  { username: 'coralie_pasquier', email: 'coralie.pasquier@example.com' },
  { username: 'dylan_noel', email: 'dylan.noel@example.com' },
  { username: 'laurie_descamps', email: 'laurie.descamps@example.com' },
  { username: 'bastien_guyot', email: 'bastien.guyot@example.com' },
  { username: 'eva_paris', email: 'eva.paris@example.com' },
  { username: 'jordan_fischer', email: 'jordan.fischer@example.com' },
  { username: 'lena_humbert', email: 'lena.humbert@example.com' },
  { username: 'axel_devaux', email: 'axel.devaux@example.com' },
  { username: 'lisa_leblanc', email: 'lisa.leblanc@example.com' },
  { username: 'enzo_charrier', email: 'enzo.charrier@example.com' },
  { username: 'morgane_chauvin', email: 'morgane.chauvin@example.com' },
  { username: 'valentin_navarro', email: 'valentin.navarro@example.com' },
  { username: 'eleonore_weber', email: 'eleonore.weber@example.com' },
  { username: 'robin_leclercq', email: 'robin.leclercq@example.com' },
  { username: 'alexia_hardy', email: 'alexia.hardy@example.com' },
  { username: 'dorian_jacob', email: 'dorian.jacob@example.com' },
  { username: 'maeva_klein', email: 'maeva.klein@example.com' },
  { username: 'simon_courtois', email: 'simon.courtois@example.com' },
  { username: 'anna_guillot', email: 'anna.guillot@example.com' },
  { username: 'leo_huet', email: 'leo.huet@example.com' },
  { username: 'elsa_grondin', email: 'elsa.grondin@example.com' },
  { username: 'martin_poulain', email: 'martin.poulain@example.com' },
  { username: 'romane_thibault', email: 'romane.thibault@example.com' },
  { username: 'hugo_foucher', email: 'hugo.foucher@example.com' },
  { username: 'lola_benoit', email: 'lola.benoit@example.com' },
  { username: 'tanguy_leduc', email: 'tanguy.leduc@example.com' },
  { username: 'alicia_riviere', email: 'alicia.riviere@example.com' },
  { username: 'erwan_parent', email: 'erwan.parent@example.com' },
  { username: 'ninon_boulet', email: 'ninon.boulet@example.com' },
  { username: 'baptiste_collin', email: 'baptiste.collin@example.com' },
  // 151-180
  { username: 'noemie_rodriguez', email: 'noemie.rodriguez@example.com' },
  { username: 'lucas_charpentier', email: 'lucas.charpentier@example.com' },
  { username: 'zoe_riou', email: 'zoe.riou@example.com' },
  { username: 'arthur_lebreton', email: 'arthur.lebreton@example.com' },
  { username: 'sarah_bailly', email: 'sarah.bailly@example.com' },
  { username: 'louis_launay', email: 'louis.launay@example.com' },
  { username: 'iris_lopez', email: 'iris.lopez@example.com' },
  { username: 'oscar_gomez', email: 'oscar.gomez@example.com' },
  { username: 'capucine_payet', email: 'capucine.payet@example.com' },
  { username: 'jules_boulanger', email: 'jules.boulanger@example.com' },
  { username: 'victoire_masse', email: 'victoire.masse@example.com' },
  { username: 'nathan_boutin', email: 'nathan.boutin@example.com' },
  { username: 'alix_daniel', email: 'alix.daniel@example.com' },
  { username: 'gabin_legall', email: 'gabin.legall@example.com' },
  { username: 'constance_marty', email: 'constance.marty@example.com' },
  { username: 'malo_raynaud', email: 'malo.raynaud@example.com' },
  { username: 'ambre_texier', email: 'ambre.texier@example.com' },
  { username: 'mael_picard', email: 'mael.picard@example.com' },
  { username: 'jeanne_hamel', email: 'jeanne.hamel@example.com' },
  { username: 'come_potier', email: 'come.potier@example.com' },
  { username: 'salome_monnier', email: 'salome.monnier@example.com' },
  { username: 'titouan_buisson', email: 'titouan.buisson@example.com' },
  { username: 'apolline_lacombe', email: 'apolline.lacombe@example.com' },
  { username: 'noah_briand', email: 'noah.briand@example.com' },
  { username: 'rose_ferreira', email: 'rose.ferreira@example.com' },
  { username: 'eliott_baron', email: 'eliott.baron@example.com' },
  { username: 'charlie_gilbert', email: 'charlie.gilbert@example.com' },
  { username: 'sacha_leclerc', email: 'sacha.leclerc@example.com' },
  { username: 'faustine_lemaitre', email: 'faustine.lemaitre@example.com' },
  { username: 'antoine_cordier', email: 'antoine.cordier@example.com' },
  // 181-210
  { username: 'albane_langlois', email: 'albane.langlois@example.com' },
  { username: 'gaspard_coulon', email: 'gaspard.coulon@example.com' },
  { username: 'diane_bigot', email: 'diane.bigot@example.com' },
  { username: 'timothee_olivier', email: 'timothee.olivier@example.com' },
  { username: 'flavie_giraud', email: 'flavie.giraud@example.com' },
  { username: 'nolan_moulin', email: 'nolan.moulin@example.com' },
  { username: 'marine_lefevre', email: 'marine.lefevre@example.com' },
  { username: 'yanis_gaillard', email: 'yanis.gaillard@example.com' },
  { username: 'lou_vasseur', email: 'lou.vasseur@example.com' },
  { username: 'theo_delmas', email: 'theo.delmas@example.com' },
  { username: 'Philippine_renard', email: 'philippine.renard@example.com' },
  { username: 'pablo_marechal', email: 'pablo.marechal@example.com' },
  { username: 'sixtine_bourdon', email: 'sixtine.bourdon@example.com' },
  { username: 'ethan_joubert', email: 'ethan.joubert@example.com' },
  { username: 'celia_vaillant', email: 'celia.vaillant@example.com' },
  { username: 'rafael_morvan', email: 'rafael.morvan@example.com' },
  { username: 'juliette_lefort', email: 'juliette.lefort@example.com' },
  { username: 'ruben_robert', email: 'ruben.robert@example.com' },
  { username: 'camelia_perrier', email: 'camelia.perrier@example.com' },
  { username: 'evan_baudry', email: 'evan.baudry@example.com' },
  { username: 'constance_lelievre', email: 'constance.lelievre@example.com' },
  { username: 'marius_chauvet', email: 'marius.chauvet@example.com' },
  { username: 'anna_thierry', email: 'anna.thierry@example.com' },
  { username: 'lilian_aubry', email: 'lilian.aubry@example.com' },
  { username: 'gabrielle_dupuy', email: 'gabrielle.dupuy@example.com' },
  { username: 'ilian_camus', email: 'ilian.camus@example.com' },
  { username: 'berenice_dias', email: 'berenice.dias@example.com' },
  { username: 'leonard_marie', email: 'leonard.marie@example.com' },
  { username: 'lilou_laporte', email: 'lilou.laporte@example.com' },
  { username: 'matteo_salmon', email: 'matteo.salmon@example.com' },
  // 211-250
  { username: 'madeleine_seguin', email: 'madeleine.seguin@example.com' },
  { username: 'adam_vial', email: 'adam.vial@example.com' },
  { username: 'coline_ollivier', email: 'coline.ollivier@example.com' },
  { username: 'achille_regnier', email: 'achille.regnier@example.com' },
  { username: 'roxane_lopes', email: 'roxane.lopes@example.com' },
  { username: 'abel_etienne', email: 'abel.etienne@example.com' },
  { username: 'maelle_ferry', email: 'maelle.ferry@example.com' },
  { username: 'antonin_valette', email: 'antonin.valette@example.com' },
  { username: 'lise_prevot', email: 'lise.prevot@example.com' },
  { username: 'tristan_guillet', email: 'tristan.guillet@example.com' },
  { username: 'eugenie_hoarau', email: 'eugenie.hoarau@example.com' },
  { username: 'felix_royer', email: 'felix.royer@example.com' },
  { username: 'apolline_lucas', email: 'apolline.lucas@example.com' },
  { username: 'livio_renault', email: 'livio.renault@example.com' },
  { username: 'leonie_monnet', email: 'leonie.monnet@example.com' },
  { username: 'amaury_pages', email: 'amaury.pages@example.com' },
  { username: 'lina_tanguy', email: 'lina.tanguy@example.com' },
  { username: 'adele_guichard', email: 'adele.guichard@example.com' },
  { username: 'celian_besson', email: 'celian.besson@example.com' },
  { username: 'leana_barre', email: 'leana.barre@example.com' },
  { username: 'naomi_le_gall', email: 'naomi.le_gall@example.com' },
  { username: 'lorenzo_imbert', email: 'lorenzo.imbert@example.com' },
  { username: 'elena_marchal', email: 'elena.marchal@example.com' },
  { username: 'victor_techer', email: 'victor.techer@example.com' },
  { username: 'aya_mounier', email: 'aya.mounier@example.com' },
  { username: 'edouard_coste', email: 'edouard.coste@example.com' },
  { username: 'louna_pons', email: 'louna.pons@example.com' },
  { username: 'augustin_barreau', email: 'augustin.barreau@example.com' },
  { username: 'lena_jacquemin', email: 'lena.jacquemin@example.com' },
  { username: 'achille_charron', email: 'achille.charron@example.com' },
  { username: 'chiara_germain', email: 'chiara.germain@example.com' },
  { username: 'gabriel_evrard', email: 'gabriel.evrard@example.com' },
  { username: 'mila_godard', email: 'mila.godard@example.com' },
  { username: 'tiago_besnard', email: 'tiago.besnard@example.com' },
  { username: 'elya_pasquet', email: 'elya.pasquet@example.com' },
  { username: 'samuel_langlais', email: 'samuel.langlais@example.com' },
  { username: 'maya_leconte', email: 'maya.leconte@example.com' },
  { username: 'nathan_verdier', email: 'nathan.verdier@example.com' },
  { username: 'yasmine_laroche', email: 'yasmine.laroche@example.com' },
  { username: 'matheo_peltier', email: 'matheo.peltier@example.com' },
];

// Génère une date aléatoire entre le 1er septembre et le 30 novembre 2024
function getRandomDate(): string {
  const start = new Date('2024-09-01T00:00:00Z');
  const end = new Date('2024-11-30T23:59:59Z');
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime).toISOString();
}

async function seedProfiles() {
  console.log(`🚀 Début du seeding de ${seed.length} profils...`);
  
  let successCount = 0;
  let errorCount = 0;

  for (const u of seed) {
    try {
      const createdAt = getRandomDate();
      
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
        created_at: createdAt,
        updated_at: createdAt
      });

      if (profileError) {
        console.error(`❌ Erreur profil pour ${u.username}:`, profileError.message);
        errorCount++;
      } else {
        console.log(`✅ ${u.username} créé (${createdAt.slice(0, 10)})`);
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
