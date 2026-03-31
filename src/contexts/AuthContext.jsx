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
  const initialized = useRef(false);

  // SUPABASE COMPLIANCE: Verify the admin status using a server-side RPC check
  const verifyAdminStatus = async (currentUser) => {
    if (!currentUser || verifying.current) return false;
    
    try {
      verifying.current = true;
      console.log('AUTH_CONTEXT: Verifying permissions for', currentUser.id);
      
      const { data, error } = await supabase.rpc('get_auth_admin_status', { 
        p_user_id: currentUser.id 
      });

      if (error) {
        console.warn('AUTH_CONTEXT: Admin RPC Error:', error.message);
        return false;
      }
      
      const adminExists = Array.isArray(data) && data.length > 0;
      return adminExists;
    } catch (err) {
      console.error('AUTH_CONTEXT: Admin verification failed:', err);
      return false;
    } finally {
      verifying.current = false;
    }
  };

  const syncAuthState = async (forced = false) => {
    if (initialized.current && !forced) return;
    
    try {
      setLoading(true);
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
      initialized.current = true;
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. WATCHDOG (6 SECONDS): Absolute fail-safe for UI hangs
    const watchdog = setTimeout(() => {
        if (!initialized.current) {
            console.warn('AUTH_CONTEXT: Watchdog triggered! Auth taking too long. Forcing resolution.');
            setLoading(false);
            initialized.current = true;
        }
    }, 6000);

    // 2. Initial State Sync
    syncAuthState();

    // 3. Auth State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('AUTH_EVENT_CENTRAL:', event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          const isUserAdmin = await verifyAdminStatus(currentSession.user);
          setIsAdmin(isUserAdmin);
          setLoading(false);
          initialized.current = true;
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        initialized.current = true;
      }
    });

    return () => {
      clearTimeout(watchdog);
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
