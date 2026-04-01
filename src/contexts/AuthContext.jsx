import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// ─────────────────────────────────────────────
// Auth Context — Simple & Reliable
// Single source of truth: onAuthStateChange
// No mutex, no watchdog, no auto-signout races
// ─────────────────────────────────────────────

const AuthContext = createContext({
  session: null,
  user: null,
  isAdmin: false,
  loading: true,
  signOut: () => {},
});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser]       = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // true ONLY until first auth event resolves

  // ── Check admin role via RPC (no mutex needed — each call is independent) ──
  const checkAdminStatus = async (currentUser) => {
    if (!currentUser) return false;
    try {
      const { data, error } = await supabase.rpc('get_auth_admin_status', {
        p_user_id: currentUser.id,
      });
      if (error) {
        console.warn('[AuthContext] RPC error:', error.message);
        return false;
      }
      return Array.isArray(data) && data.length > 0;
    } catch (err) {
      console.error('[AuthContext] checkAdminStatus threw:', err);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    // ── 1. Subscribe to auth state changes (fires immediately with current state) ──
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('[AuthContext] event:', event);

        if (!mounted) return;

        if (currentSession?.user) {
          // We have a valid session — set it immediately so the app unblocks
          setSession(currentSession);
          setUser(currentSession.user);

          // TOKEN_REFRESHED: session refreshed silently — no need to re-verify admin
          // We already know they're admin. Just update the session reference.
          if (event === 'TOKEN_REFRESHED') {
            // Session is already valid; admin state is unchanged — do nothing extra
            setLoading(false);
            return;
          }

          // SIGNED_IN / USER_UPDATED: verify admin role
          const adminVerified = await checkAdminStatus(currentSession.user);
          if (!mounted) return;
          setIsAdmin(adminVerified);
          setLoading(false);

          if (!adminVerified && event === 'SIGNED_IN') {
            // Authenticated but not an admin — sign them out cleanly
            console.warn('[AuthContext] Authenticated user is not an admin. Signing out.');
            await supabase.auth.signOut();
          }

        } else {
          // No session (SIGNED_OUT or no existing session)
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ── Sign out helper ──
  const signOut = async () => {
    await supabase.auth.signOut();
    // State will be cleared by the SIGNED_OUT event above
  };

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
