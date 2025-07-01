
-- Insérer un nouvel article de blog sur les classiques de la littérature russe
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
  'À quel roman incontournable de la littérature russe ressembles-tu le plus ?',
  'quel-roman-russe-te-ressemble',
  'Intense, mélancolique, révolté, sage ? Et si un chef-d''œuvre de la littérature russe reflétait ta manière d''être au monde ?',
  '<h2>Quand la Russie t''écrit</h2>
<p>Lire un roman russe, c''est parfois comme se retrouver face à soi-même. Ces œuvres puissantes, vastes, tragiques ou lumineuses nous parlent souvent avec une intensité rare. Et si, parmi elles, se cachait celle qui te ressemble&nbsp;?</p>
<p>Voici cinq romans majeurs de la littérature russe. Cinq façons d''habiter le monde. Cinq échos à ce que tu es, ou à ce que tu traverses.</p>

<h2>5 chefs-d''œuvre russes, 5 profils intérieurs</h2>

<h3>1. <strong>Crime et Châtiment – Fiodor Dostoïevski</strong></h3>
<p>Tu es hanté·e par l''idée de justice, obsédé·e par le bien, le mal, le poids des décisions. Tu penses trop, tu ressens trop. Comme Raskolnikov, tu es tourmenté·e, mais profondément humain·e.</p>

<h3>2. <strong>Anna Karénine – Léon Tolstoï</strong></h3>
<p>Tu es passionné·e, entier·e, souvent en lutte entre désir et devoir. Tu vis à fleur de peau. Tu veux aimer pleinement, sans compromis. Mais à quel prix&nbsp;?</p>

<h3>3. <strong>Le Maître et Marguerite – Mikhaïl Boulgakov</strong></h3>
<p>Tu refuses les conventions. Tu aimes l''absurde, le mystique, le marginal. Tu es libre dans ta tête, même si le monde ne l''est pas toujours. Tu as un grain de folie — assumé.</p>

<h3>4. <strong>Une journée d''Ivan Denissovitch – Alexandre Soljenitsyne</strong></h3>
<p>Tu fais face, tu tiens bon. Tu connais le froid, l''attente, les jours lents. Et pourtant, tu trouves encore des raisons de croire, de résister, de rire. Tu es une force tranquille.</p>

<h3>5. <strong>Les Âmes mortes – Nicolas Gogol</strong></h3>
<p>Tu as l''œil acéré, tu observes, tu ris jaune. Tu vois l''absurdité du monde et tu la racontes. Tu es ironique, lucide, souvent en avance sur ton époque.</p>

<h2>Et toi, tu t''es reconnu·e dans lequel&nbsp;?</h2>

<p>Sur READ, ces grands textes russes sont accessibles. Segmentés, balisés, accompagnés de petites questions simples. Pas besoin d''être universitaire — juste curieux.</p>

<p><strong>📚 La Russie a ses monstres sacrés. Peut-être qu''un de ces monstres te ressemble. En tout cas, il t''attend.</strong></p>',
  'READ',
  ARRAY['littérature russe', 'classiques', 'lecture', 'identité', 'roman'],
  true,
  '2025-06-26 11:00:00+00'::timestamptz,
  '2025-06-26 11:00:00+00'::timestamptz
);
