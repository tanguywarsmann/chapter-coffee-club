
-- Insérer un nouvel article de blog sur les classiques de la littérature portugaise
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
  'À quel roman majeur de la littérature portugaise ressembles-tu le plus ?',
  'quel-roman-portugais-te-ressemble',
  'Silencieux, mystique, politique ou intérieur ? Voici cinq chefs-d''œuvre portugais qui pourraient bien parler de toi sans te connaître.',
  '<h2>Portugal, mémoire intérieure</h2>
<p>On parle peu de la littérature portugaise. Et pourtant, elle est là. Discrète, sensible, insaisissable. Elle ne crie pas, elle insiste doucement. Elle parle du temps, du manque, de l''attente, du retour. Et peut-être qu''en elle, un roman te ressemble déjà.</p>
<p>Voici cinq œuvres qui traversent les silences et les siècles. Cinq manières d''être au monde. Et peut-être, une façon de mieux te lire toi-même.</p>

<h2>5 romans portugais, 5 sensibilités</h2>

<h3>1. <strong>L''Année de la mort de Ricardo Reis – José Saramago</strong></h3>
<p>Tu es contemplatif·ve, distant·e, hanté·e par les temps qui se croisent. Tu marches dans les villes avec un regard de poète. Tu parles peu, tu observes tout. Comme Ricardo Reis, tu vis dans les marges — et c''est là que tu respires.</p>

<h3>2. <strong>Le Livre de l''intranquillité – Fernando Pessoa</strong></h3>
<p>Tu es un monde intérieur. Tu vis dans les nuances, les doutes, les contradictions. Tu écris dans ta tête. Tu ressens sans éclat, mais avec intensité. Tu es une constellation cachée sous une chemise simple.</p>

<h3>3. <strong>Balades au vent de l''ouest – Lídia Jorge</strong></h3>
<p>Tu es mémoire, corps, terre. Tu écoutes les voix des femmes et des enfances, des absents et des survivants. Tu es sensible à ce qu''on oublie trop vite. Tu racontes, tu transmets, tu sauves du silence.</p>

<h3>4. <strong>Le Testament de M. Napumoceno – Germano Almeida (Cap-Vert)</strong></h3>
<p>Tu caches une vie intérieure sous les apparences. Tu joues le jeu social, mais tu écris ton vrai roman ailleurs. Tu es plein·e de surprises. Et peut-être que personne ne te connaît vraiment, sauf toi-même.</p>

<h3>5. <strong>La Lucidité – José Saramago</strong></h3>
<p>Tu doutes de tout. Tu ne crois pas à l''ordre établi. Tu poses les questions que les autres évitent. Tu es clair·e, radical·e, implacable. Et pourtant, tu ne cries jamais. Tu insistes, tu creuses, tu résistes.</p>

<h2>Et toi, tu vis dans quelle page&nbsp;?</h2>

<p>Sur READ, ces voix portugaises sont là pour t''accompagner. On les lit doucement, par fragments, avec attention. Et parfois, elles répondent à des choses qu''on n''avait jamais su formuler.</p>

<p><strong>📚 Certains romans ne te ressemblent pas. Ils t''expliquent. Lentement, et sans forcer.</strong></p>',
  'READ',
  ARRAY['littérature portugaise', 'classiques', 'identité', 'lecture', 'slow reading'],
  true,
  '2025-07-04 10:30:00+00'::timestamptz,
  '2025-07-04 10:30:00+00'::timestamptz
);
