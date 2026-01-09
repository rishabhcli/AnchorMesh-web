'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  // Check and set session on mount
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          setState(prev => ({ ...prev, loading: false, error: error.message }));
          return;
        }

        setState({
          user: session?.user ?? null,
          session: session,
          loading: false,
          error: null,
        });
      } catch (e) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: e instanceof Error ? e.message : 'Failed to get session',
        }));
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session: session,
          loading: false,
        }));

        if (event === 'SIGNED_OUT') {
          router.push('/admin/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setState(prev => ({ ...prev, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }

      setState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });

      return { success: true, error: null };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Sign in failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setState(prev => ({ ...prev, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        setState(prev => ({ ...prev, loading: false }));
        return {
          success: true,
          error: null,
          message: 'Check your email to confirm your account'
        };
      }

      setState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });

      return { success: true, error: null };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Sign up failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setState(prev => ({ ...prev, loading: false, error: error.message }));
        return;
      }

      setState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });

      // Clear any localStorage auth state (for migration from demo auth)
      localStorage.removeItem('aether_admin_auth');

      router.push('/admin/login');
    } catch (e) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: e instanceof Error ? e.message : 'Sign out failed',
      }));
    }
  }, [router]);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Failed to send reset email'
      };
    }
  }, []);

  return {
    user: state.user,
    session: state.session,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.session,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}

// Hook to require authentication - redirects to login if not authenticated
export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      router.push('/admin/login');
    }
  }, [auth.loading, auth.isAuthenticated, router]);

  return auth;
}
