import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({
  session: null,
  user: null,
  isAdmin: false,
  loading: true,
  refresh: () => {},
  signOut: () => {},
});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const verifying = useRef(false);

  // SUPABASE COMPLIANCE: Verify the admin status using a server-side RPC check
  const verifyAdminStatus = async (currentUser) => {
    if (!currentUser || verifying.current) return false;
    
    try {
      verifying.current = true;
      console.log('AUTH_CONTEXT: Verifying admin permissions for', currentUser.id);
      
      const { data, error } = await supabase.rpc('get_auth_admin_status', { 
        p_user_id: currentUser.id 
      });

      if (error) throw error;
      
      const adminExists = Array.isArray(data) && data.length > 0;
      console.log('AUTH_CONTEXT: Admin verification result:', adminExists);
      return adminExists;
    } catch (err) {
      console.error('AUTH_CONTEXT: Admin verification failed:', err.message);
      return false;
    } finally {
      verifying.current = false;
    }
  };

  const syncAuthState = async () => {
    try {
      setLoading(true);
      // SUPABASE BEST PRACTICE: Use getUser() for initial server-side token validation
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      
      if (error || !currentUser) {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
      } else {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentUser);
        
        const isUserAdmin = await verifyAdminStatus(currentUser);
        setIsAdmin(isUserAdmin);

        // If logged in, but not an admin, we clear the session to prevent "limbo" states
        if (!isUserAdmin && currentSession) {
          console.warn('AUTH_CONTEXT: Non-admin session detected. Clearing...');
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setIsAdmin(false);
        }
      }
    } catch (err) {
      console.error('AUTH_CONTEXT: Sync failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial State Sync
    syncAuthState();

    // 2. Auth State Change Listener (SUPABASE RECOMMENDED PATTERN)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('AUTH_EVENT_CENTRAL:', event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          const isUserAdmin = await verifyAdminStatus(currentSession.user);
          setIsAdmin(isUserAdmin);
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setIsAdmin(false);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, loading, refresh: syncAuthState, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
