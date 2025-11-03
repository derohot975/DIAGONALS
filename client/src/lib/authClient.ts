// DIAGONALE - Auth Client Supabase (PIN-based)
// Frontend-only authentication using Supabase with PIN validation

import { supabase } from './supabaseClient';

export interface AuthUser {
  id: number;
  name: string;
  role: 'admin' | 'user';
}

export interface AuthResult {
  ok: boolean;
  user?: AuthUser;
  error?: string;
}

const SESSION_KEY = 'dg_session';

/**
 * Login with PIN via Supabase
 * Queries users table for PIN match and active status
 */
export async function loginWithPin(pin: string): Promise<AuthResult> {
  try {
    // Validate PIN format (4 digits)
    if (!pin || !/^\d{4}$/.test(pin)) {
      return { ok: false, error: 'PIN deve essere di 4 cifre' };
    }

    // Query Supabase for user with matching PIN
    const { data, error } = await supabase
      .from('users')
      .select('id, name, is_admin, created_at')
      .eq('pin', pin)
      .eq('active', true)
      .single();

    if (error || !data) {
      console.log('Auth error:', error?.message || 'User not found');
      return { ok: false, error: 'PIN non valido' };
    }

    // Create user session
    const user: AuthUser = {
      id: data.id,
      name: data.name,
      role: data.is_admin ? 'admin' : 'user'
    };

    // Save session to localStorage
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));

    console.log('✅ Login successful:', user.name);
    return { ok: true, user };

  } catch (error) {
    console.error('Login error:', error);
    return { ok: false, error: 'Errore di connessione' };
  }
}

/**
 * Logout - clear session
 */
export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
  console.log('🚪 Logout completed');
}

/**
 * Get current session from localStorage
 */
export function getSession(): AuthUser | null {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;

    const user = JSON.parse(sessionData) as AuthUser;
    
    // Validate session structure
    if (!user.id || !user.name || !user.role) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Session parse error:', error);
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/**
 * Check if current user is admin
 */
export function isAdmin(): boolean {
  const session = getSession();
  return session?.role === 'admin';
}
