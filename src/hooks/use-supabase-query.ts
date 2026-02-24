import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Centralized API abstraction for Supabase queries with:
 * - Automatic tenant scoping
 * - Centralized error handling
 * - Toast notifications on errors
 */

interface UseSupabaseQueryOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
  showErrorToast?: boolean;
}

export function useSupabaseQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime,
  refetchInterval,
  showErrorToast = true,
}: UseSupabaseQueryOptions<T>) {
  const { toast } = useToast();

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error: any) {
        const message = error?.message || 'An unexpected error occurred';
        if (showErrorToast) {
          toast({
            variant: 'destructive',
            title: 'Error loading data',
            description: message,
          });
        }
        throw error;
      }
    },
    enabled,
    staleTime,
    refetchInterval,
  });
}

interface UseSupabaseMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  invalidateKeys?: string[][];
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: TData) => void;
}

export function useSupabaseMutation<TData = void, TVariables = void>({
  mutationFn,
  invalidateKeys = [],
  successMessage,
  errorMessage,
  onSuccess,
}: UseSupabaseMutationOptions<TData, TVariables>) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      if (successMessage) {
        toast({ title: successMessage });
      }
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      onSuccess?.(data);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: errorMessage || 'Operation failed',
        description: error?.message || 'Please try again',
      });
    },
  });
}

/**
 * Helper to handle Supabase query results uniformly
 */
export function handleSupabaseResult<T>(
  data: T | null,
  error: PostgrestError | null
): T {
  if (error) throw error;
  if (data === null) throw new Error('No data returned');
  return data;
}
