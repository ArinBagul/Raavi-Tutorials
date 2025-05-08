import { useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';

// Simple cache implementation
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useApi = (options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearCache = useCallback((key) => {
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  }, []);

  const getCacheKey = (table, query = {}) => {
    return `${table}:${JSON.stringify(query)}`;
  };

  const setCacheData = (key, data) => {
    cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  };

  const getCacheData = (key) => {
    const cached = cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      cache.delete(key);
      return null;
    }
    
    return cached.data;
  };

  const fetchData = useCallback(async (table, query = {}, useCache = true) => {
    const cacheKey = getCacheKey(table, query);
    
    if (useCache) {
      const cachedData = getCacheData(cacheKey);
      if (cachedData) return cachedData;
    }

    setLoading(true);
    setError(null);

    try {
      let queryBuilder = supabase.from(table);

      // Apply query parameters
      if (query.select) queryBuilder = queryBuilder.select(query.select);
      if (query.filter) {
        Object.entries(query.filter).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value);
        });
      }
      if (query.orderBy) queryBuilder = queryBuilder.order(query.orderBy);
      if (query.limit) queryBuilder = queryBuilder.limit(query.limit);

      const { data, error } = await queryBuilder;

      if (error) throw error;

      if (useCache) {
        setCacheData(cacheKey, data);
      }

      return data;
    } catch (err) {
      setError(err);
      toast.error(err.message || 'An error occurred while fetching data');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const mutateData = useCallback(async (table, action, data, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      let result;

      switch (action) {
        case 'insert':
          result = await supabase.from(table).insert(data);
          break;
        case 'update':
          result = await supabase
            .from(table)
            .update(data)
            .match(options.match || {});
          break;
        case 'delete':
          result = await supabase
            .from(table)
            .delete()
            .match(options.match || {});
          break;
        default:
          throw new Error('Invalid action type');
      }

      if (result.error) throw result.error;

      // Clear cache for the affected table
      clearCache(getCacheKey(table));

      if (options.successMessage) {
        toast.success(options.successMessage);
      }

      return result.data;
    } catch (err) {
      setError(err);
      toast.error(options.errorMessage || err.message || 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearCache]);

  return {
    loading,
    error,
    fetchData,
    mutateData,
    clearCache,
  };
};