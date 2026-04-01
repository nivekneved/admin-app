import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

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
  const [loading, setLoading] = useState(true);

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);

          if (event === 'TOKEN_REFRESHED') {
            setLoading(false);
            return;
          }

          const adminVerified = await checkAdminStatus(currentSession.user);
          if (!mounted) return;
          setIsAdmin(adminVerified);
          setLoading(false);

          if (!adminVerified && event === 'SIGNED_IN') {
            console.warn('[AuthContext] Authenticated user is not an admin. Signing out.');
            await supabase.auth.signOut();
          }

        } else {
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

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
