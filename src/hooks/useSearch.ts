import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PoojaResult {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
}

interface TempleResult {
  id: string;
  name: string;
  city: string | null;
  deity: string | null;
}

interface PunditResult {
  id: string;
  name: string;
  location: string | null;
}

export interface SearchResults {
  poojas: PoojaResult[];
  temples: TempleResult[];
  pundits: PunditResult[];
}

export function useSearch(query: string, debounceMs = 300) {
  const [results, setResults] = useState<SearchResults>({
    poojas: [],
    temples: [],
    pundits: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Debounced query
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  useEffect(() => {
    const searchQuery = debouncedQuery.trim();
    
    if (!searchQuery || searchQuery.length < 2) {
      setResults({ poojas: [], temples: [], pundits: [] });
      setIsLoading(false);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const searchPattern = `%${searchQuery}%`;

        // Perform all three queries in parallel
        const [poojasResponse, templesResponse, punditsResponse] = await Promise.all([
          supabase
            .from('pooja_services')
            .select('id, name, category, description')
            .eq('is_active', true)
            .or(`name.ilike.${searchPattern},description.ilike.${searchPattern},category.ilike.${searchPattern}`)
            .limit(5),
          supabase
            .from('temples')
            .select('id, name, city, deity')
            .eq('is_active', true)
            .or(`name.ilike.${searchPattern},city.ilike.${searchPattern},deity.ilike.${searchPattern}`)
            .limit(5),
          supabase
            .from('pundits')
            .select('id, name, location')
            .eq('is_active', true)
            .or(`name.ilike.${searchPattern},location.ilike.${searchPattern}`)
            .limit(5),
        ]);

        setResults({
          poojas: poojasResponse.data || [],
          temples: templesResponse.data || [],
          pundits: punditsResponse.data || [],
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Search failed'));
        setResults({ poojas: [], temples: [], pundits: [] });
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const hasResults = useMemo(() => {
    return results.poojas.length > 0 || results.temples.length > 0 || results.pundits.length > 0;
  }, [results]);

  return { results, isLoading, error, hasResults };
}
