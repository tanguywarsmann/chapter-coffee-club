import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <>
      <Helmet>
        <title>{query ? `Recherche: ${query} | VREAD` : 'Recherche | VREAD'}</title>
        <meta name="description" content="Recherchez vos livres et contenus préférés sur VREAD" />
        <meta name="application-name" content="VREAD" />
        <meta property="og:site_name" content="VREAD" />
        <link rel="canonical" href={`https://www.vread.fr/search${query ? `?q=${encodeURIComponent(query)}` : ''}`} />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-h1 font-bold mb-8 text-center">Recherche VREAD</h1>
          
          <div className="relative mb-8">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Rechercher..."
              value={query}
              className="pl-10"
              readOnly
            />
          </div>
          
          {query ? (
            <div className="text-center">
              <p className="text-body mb-4">
                Résultats pour « <span className="font-semibold">{query}</span> » (bientôt)
              </p>
              <p className="text-body-sm text-muted-foreground">
                La fonctionnalité de recherche sera bientôt disponible.
              </p>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p className="text-body">Entrez votre recherche dans l'URL ou utilisez le formulaire ci-dessus.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Search;