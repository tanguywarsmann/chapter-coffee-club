
-- Insérer un nouvel article de blog sur les classiques de la littérature allemande
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
  'À quel classique de la littérature allemande ressembles-tu le plus ?',
  'quel-classique-allemand-te-ressemble',
  'Et si une œuvre allemande te reflétait ? De Goethe à Kafka, découvre le roman qui te ressemble le plus. Sensible, rebelle, rêveur ? Lequel es-tu ?',
  '<h2>Et si un roman te reflétait ?</h2>
<p>La littérature n''est pas seulement une affaire d''analyse. Elle est aussi un miroir. Parfois, un livre semble parler de nous sans nous connaître. Il devine, éclaire, révèle. Et si, parmi les grandes œuvres allemandes, l''une d''entre elles te ressemblait&nbsp;?</p>
<p>Romantique tourmenté, esprit rationnel, rêveur marginal, rebelle solitaire... Les grandes figures littéraires allemandes incarnent toutes une posture face au monde. Et toi&nbsp;?</p>

<h2>5 romans allemands, 5 tempéraments</h2>

<h3>1. <strong>Les Souffrances du jeune Werther – Goethe</strong></h3>
<p>Tu vis intensément, tu ressens trop fort, tu tombes amoureux de l''amour lui-même. Tu es un cœur romantique, excessif, touchant, parfois tragique. Comme Werther, tu brûles vite — mais sincèrement.</p>

<h3>2. <strong>Le Tambour – Günter Grass</strong></h3>
<p>Tu observes le monde avec ironie, tu refuses de grandir, tu frappes sur ton tambour intérieur pour qu''on t''écoute. Tu es satirique, subversif, complexe. Tu n''as pas peur de déranger.</p>

<h3>3. <strong>Le Procès – Franz Kafka</strong></h3>
<p>Tu es lucide, inquiet, tu sens les absurdités du monde moderne. Tu cherches du sens dans un labyrinthe sans issue. Comme Joseph K., tu résistes, même sans comprendre les règles du jeu.</p>

<h3>4. <strong>Siddhartha – Hermann Hesse</strong></h3>
<p>Tu es en quête de paix, de spiritualité, de vérité. Le monde matériel t''intéresse peu — tu cherches le silence derrière le bruit. Tu n''es pas perdu, tu es en chemin.</p>

<h3>5. <strong>Effi Briest – Theodor Fontane</strong></h3>
<p>Tu es sensible, discret, lucide sur les contraintes sociales. Tu observes, tu encaisses, tu t''adaptes. Mais au fond, tu rêves de liberté. Effi te comprend mieux que tu ne crois.</p>

<h2>Et toi, dans quelle page t''es-tu reconnu·e ?</h2>

<p>READ n''a pas encore de quiz de personnalité, mais un jour, peut-être. En attendant, tu peux retrouver ces grands classiques allemands, découpés en segments lisibles, accompagnés de petites questions pour suivre ta lecture. Sans pression, sans jargon. Juste pour toi.</p>

<p><strong>📚 La littérature allemande est sérieuse, intense, profonde… et peut-être plus proche de toi que tu ne l''imagines.</strong></p>',
  'READ',
  ARRAY['littérature allemande', 'classiques', 'quiz', 'lecture', 'identité'],
  true,
  '2025-06-26 10:00:00+00'::timestamptz,
  '2025-06-26 10:00:00+00'::timestamptz
);
