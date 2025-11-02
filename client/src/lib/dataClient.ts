import { supabase } from './supabaseClient';

// Unified response format
interface DataResponse<T> {
  ok: boolean;
  data: T | null;
  error: string | null;
}

// Read-only data adapter functions
export const dataClient = {
  // Users
  async getUsers(): Promise<DataResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        return { ok: false, data: null, error: error.message };
      }

      return { ok: true, data: data || [], error: null };
    } catch (error: any) {
      return { ok: false, data: null, error: error.message || 'Unknown error' };
    }
  },

  // Events
  async getEvents(): Promise<DataResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('wine_events')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        return { ok: false, data: null, error: error.message };
      }

      return { ok: true, data: data || [], error: null };
    } catch (error: any) {
      return { ok: false, data: null, error: error.message || 'Unknown error' };
    }
  },

  // Wines (from 'vini' table, read-only)
  async getWines(): Promise<DataResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('vini')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        return { ok: false, data: null, error: error.message };
      }

      return { ok: true, data: data || [], error: null };
    } catch (error: any) {
      return { ok: false, data: null, error: error.message || 'Unknown error' };
    }
  }
};
