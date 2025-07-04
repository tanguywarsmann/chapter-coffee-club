
-- Insérer un nouvel article de blog sur les classiques de la littérature espagnole
INSERT INTO public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  author,
  tags,
  published,
  image_url,
  image_alt,
  created_at,
  updated_at
) VALUES (
  'À quel roman majeur de la littérature espagnole ressembles-tu le plus ?',
  'quel-roman-espagnol-te-ressemble',
  'Idéaliste, sensuel, mélancolique ou frondeur ? Ces chefs-d''œuvre espagnols en disent long sur toi. Découvre celui qui te ressemble vraiment.',
  '<h2>Et si un roman espagnol était ton double littéraire&nbsp;?</h2>
<p>La littérature espagnole est aussi riche que contrastée. Elle parle de passion, de rêves impossibles, d''honneurs froissés, de liberté, de silence. À travers elle, des figures fortes prennent vie – parfois folles, parfois sages, toujours entières.</p>
<p>Voici cinq grands romans espagnols. Cinq personnalités. Cinq reflets potentiels de ce que tu es (ou de ce que tu caches).</p>

<h2>5 romans espagnols, 5 âmes révélées</h2>

<h3>1. <strong>Don Quichotte – Miguel de Cervantès</strong></h3>
<p>Tu es idéaliste, loyal, parfois un peu déconnecté du réel. Tu crois aux grands récits, même si le monde rit de toi. Tu préfères tenter, tomber, recommencer, que renoncer. Tu es un chevalier dans un monde moderne.</p>

<h3>2. <strong>La Régente – Leopoldo Alas "Clarín"</strong></h3>
<p>Tu es prisonnier·ère des conventions, mais ton esprit est libre. Tu observes, tu souffres en silence, tu luttes avec toi-même. Tu ressens tout trop fort. Tu es complexe, vibrant·e, vivant·e.</p>

<h3>3. <strong>Fortunata et Jacinta – Benito Pérez Galdós</strong></h3>
<p>Tu vis dans l''intensité, le désir, la contradiction. Tu veux tout, tu refuses les demi-mesures. Tu es viscéral·e, lucide, puissant·e, et terriblement humain·e.</p>

<h3>4. <strong>La Famille de Pascual Duarte – Camilo José Cela</strong></h3>
<p>Tu viens de loin, et tu portes tout en toi : la colère, l''injustice, le fatalisme. Mais aussi la lucidité. Tu es un être brut, honnête, écorché.</p>

<h3>5. <strong>Nada – Carmen Laforet</strong></h3>
<p>Tu es jeune, sensible, à la lisière du monde adulte. Tu avances dans le brouillard, mais avec une lucidité grandissante. Tu observes, tu comprends, tu changes. Tu cherches encore ton propre ton.</p>

<h2>Et toi, tu penches vers qui&nbsp;?</h2>

<p>Sur READ, ces romans ne sont pas à lire d''une traite. Ils se savourent par segments, guidés, accompagnés. Lire lentement n''est pas un défaut, c''est un choix. Et parfois, c''est ce qu''il faut pour vraiment se reconnaître.</p>

<p><strong>📚 Derrière chaque grande œuvre espagnole, il y a peut-être un peu de toi.</strong></p>',
  'READ',
  ARRAY['littérature espagnole', 'classiques', 'lecture', 'identité', 'roman'],
  true,
  '/lovable-uploads/9bca4f3c-f6e5-4e68-a197-fba652dc13ee.png',
  'Livres de littérature espagnole avec Don Quichotte de Cervantès en premier plan',
  '2025-07-02 11:30:00+00'::timestamptz,
  '2025-07-02 11:30:00+00'::timestamptz
);
