import { useState, useEffect, useCallback } from 'react';
import type { PromptsData, FilterState } from '../types';
import { fetchPrompts } from '../services/api';

export function usePrompts() {
  const [data, setData] = useState<PromptsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterState>({ category: null, site: null });

  const loadPrompts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPrompts();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  // 根据过滤条件筛选提示词
  const filteredPrompts = data?.prompts.filter(prompt => {
    if (filter.category && prompt.category !== filter.category) {
      return false;
    }
    if (filter.site && filter.site !== '*') {
      if (!prompt.sites.includes('*') && !prompt.sites.includes(filter.site)) {
        return false;
      }
    }
    return true;
  }) || [];

  return {
    data,
    prompts: filteredPrompts,
    allPrompts: data?.prompts || [],
    categories: data?.categories || [],
    loading,
    error,
    filter,
    setFilter,
    refresh: loadPrompts,
  };
}
