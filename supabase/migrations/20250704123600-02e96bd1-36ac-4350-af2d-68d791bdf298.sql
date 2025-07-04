
-- Insérer un nouvel article de blog sur les classiques de la littérature italienne
INSERT INTO public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  author,
  tags,
  published,
  created_at,
  updated_at
) VALUES (
  'À quel roman incontournable de la littérature italienne ressembles-tu le plus ?',
  'quel-roman-italien-te-ressemble',
  'Esthète, mélancolique, frondeur, solitaire ? Et si un chef-d''œuvre italien éclairait ta manière de vivre, d''aimer, de résister ?',
  '<h2>Ce que la littérature italienne dit de toi</h2>
<p>La littérature italienne est une voix plurielle — passionnée, raffinée, souvent traversée de mémoire, de politique et de beauté. Elle n''a pas peur du chaos. Elle embrasse les contrastes. Et parfois, elle nous reflète avec plus de clarté qu''un miroir.</p>
<p>Quel roman italien te ressemble&nbsp;? Voici cinq œuvres majeures. Cinq visages. Peut-être le tien.</p>

<h2>5 romans italiens, 5 regards sur soi</h2>

<h3>1. <strong>Le Guépard – Giuseppe Tomasi di Lampedusa</strong></h3>
<p>Tu es lucide. Tu vois les fins venir avant les autres. Tu crois à la beauté qui passe, à l''élégance dans la défaite. Tu fais partie d''un monde qui s''efface — et tu l''acceptes avec grâce.</p>

<h3>2. <strong>L''Amie prodigieuse – Elena Ferrante</strong></h3>
<p>Tu es ancré·e dans la complexité du lien. Tu sais ce que c''est que grandir à l''ombre d''un autre. Tu explores, tu t''émancipes, tu te construis. Tu es ambivalent·e — profondément vrai·e.</p>

<h3>3. <strong>Si c''est un homme – Primo Levi</strong></h3>
<p>Tu portes en toi une mémoire grave. Tu crois à la rigueur, à l''exactitude, à la dignité même dans l''indicible. Tu observes sans tricher. Tu transmets sans pathos.</p>

<h3>4. <strong>Le Nom de la rose – Umberto Eco</strong></h3>
<p>Tu aimes chercher, comprendre, relier. Tu crois au savoir, à l''ironie, à l''énigme. Tu doutes, mais tu avances. Tu es moine et enquêteur à la fois. Et tu trouves dans les livres ce que d''autres cherchent ailleurs.</p>

<h3>5. <strong>Une vie inutile – Italo Svevo</strong></h3>
<p>Tu es introspectif·ve, décalé·e, parfois en marge. Tu parles peu, mais tu penses beaucoup. Tu n''es pas spectaculaire, mais tu es rare. Tu observes le monde — et il t''échappe un peu moins chaque jour.</p>

<h2>Alors, dans quelle page vis-tu&nbsp;?</h2>

<p>READ propose de (re)découvrir ces œuvres sans se perdre. Segment par segment. Sans performance. Avec des repères. Et une vraie place pour le doute, la lenteur, le silence. L''Italie en littérature, c''est tout ça.</p>

<p><strong>📚 Et toi, tu ressembles à quel roman italien&nbsp;? Laisse-le te lire en retour.</strong></p>',
  'READ',
  ARRAY['littérature italienne', 'classiques', 'identité', 'roman', 'slow reading'],
  true,
  '2025-07-03 14:00:00+00'::timestamptz,
  '2025-07-03 14:00:00+00'::timestamptz
);
