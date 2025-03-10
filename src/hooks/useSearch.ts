import Fuse from 'fuse.js';
import { useMemo, useState, useCallback } from 'react';

interface SearchOptions<T> {
  data: T[];
  keys: string[];
  threshold?: number;
}

export function useSearch<T>({ data, keys, threshold = 0.3 }: SearchOptions<T>) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});

  const fuse = useMemo(() => {
    return new Fuse(data, {
      keys,
      threshold,
      shouldSort: true,
      includeScore: true,
    });
  }, [data, keys, threshold]);

  const results = useMemo(() => {
    let filteredData = data;

    // Apply filters first
    if (Object.keys(filters).length > 0) {
      filteredData = data.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          const itemValue = (item as any)[key];
          if (Array.isArray(value)) {
            return value.length === 0 || value.some(v => {
              if (Array.isArray(itemValue)) {
                return itemValue.includes(v);
              }
              return itemValue === v;
            });
          }
          return itemValue === value;
        });
      });
    }

    // Then apply search
    if (!query) return filteredData;
    return fuse.search(query).map(result => result.item);
  }, [data, query, filters, fuse]);

  const updateFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    query,
    setQuery,
    filters,
    updateFilters,
    results,
  };
}