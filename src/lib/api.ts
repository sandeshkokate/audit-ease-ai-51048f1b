import { supabase } from './supabase';

export async function fetchWithAuth<T>(
  table: string,
  query?: Record<string, any>
): Promise<T[]> {
  let request = supabase.from(table).select('*');
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      request = request.eq(key, value);
    });
  }
  const { data, error } = await request;
  if (error) throw error;
  return data as T[];
}
