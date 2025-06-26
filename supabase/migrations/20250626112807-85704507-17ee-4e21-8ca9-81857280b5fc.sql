
-- Insérer l'article de blog avec le contenu fourni
INSERT INTO public.blog_posts (
  title,
  slug,
  content,
  excerpt,
  author,
  tags,
  published
) VALUES (
  'Les bienfaits d''une lecture quotidienne pour être heureux',
  'bienfaits-lecture-quotidienne',
  '<h2>Pourquoi lire chaque jour change tout</h2>
<p>Dans un monde saturé de notifications, de scrolls infinis et de sollicitations constantes, lire chaque jour peut sembler anodin. C''est pourtant un acte profondément réparateur, capable de nous reconnecter à l''essentiel.</p>
<h2>Une pause intérieure, un ancrage réel</h2>
<p>Lire ne nous divertit pas, elle nous aligne. Quelques pages par jour suffisent à rétablir le lien avec soi-même. On ralentit, on respire, on se concentre. C''est une forme de méditation active qui nous remet au centre de notre propre histoire.</p>
<h2>Un exercice de clarté mentale</h2>
<p>Plus qu''un loisir, la lecture est un entraînement. On progresse dans l''attention, dans la mémoire, dans la compréhension de soi et du monde. Lire chaque jour, même 10 minutes, c''est entraîner son esprit à résister à la dispersion. C''est cultiver une force douce mais profonde.</p>
<h2>Ce que READ propose</h2>
<p>READ n''est pas une application de plus à consommer. C''est une boussole pour retrouver votre ligne intérieure, sans pression, sans jugement. Une seule mission : vous aider à retrouver le goût et la force de lire, pour vous.</p>
<hr/>
<blockquote>
  "Lire chaque jour ne change pas le monde. Mais ça change votre façon d''y habiter." — READ
</blockquote>',
  'Pourquoi lire chaque jour peut transformer notre attention, notre bien-être et notre rapport à nous-même',
  'READ',
  ARRAY['lecture', 'bien-être', 'habitude'],
  true
);
