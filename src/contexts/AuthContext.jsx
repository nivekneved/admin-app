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
      return data?.is_admin_or_staff === true;
    } catch (err) {
      console.error('[AuthContext] checkAdminStatus threw:', err);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        const adminVerified = await checkAdminStatus(currentSession.user);
        if (!mounted) return;
        setIsAdmin(adminVerified);
        
        // If they are not an admin BUT we found a session, show warning
        if (!adminVerified) {
          console.warn('[AuthContext] Session found but user is not an admin. Signing out.');
          await supabase.auth.signOut();
        }
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);

          // Only re-verify if it's a specific auth event that implies a change
          if (['SIGNED_IN', 'USER_UPDATED', 'MFA_CHALLENGE_VERIFIED'].includes(event)) {
             const adminVerified = await checkAdminStatus(currentSession.user);
             if (!mounted) return;
             setIsAdmin(adminVerified);
             
             if (!adminVerified && event === 'SIGNED_IN') {
               console.warn('[AuthContext] New sign-in detected but user is not an admin. Signing out.');
               await supabase.auth.signOut();
             }
          }
        } else {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
        }
        setLoading(false);
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
