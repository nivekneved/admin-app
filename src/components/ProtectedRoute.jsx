import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const verifying = useRef(false);
    const location = useLocation();

    // C-08 WATCHDOG: Force clear loading after max 7 seconds to prevent indefinite hang
    useEffect(() => {
        if (!loading) return;
        const watchdog = setTimeout(() => {
            if (loading) {
                console.error('AUTH_WATCHDOG: Authentication timed out after 7s. Forcing fallback.');
                setLoading(false);
                setAuthenticated(false);
            }
        }, 7000);
        return () => clearTimeout(watchdog);
    }, [loading]);

    useEffect(() => {
        let mounted = true;

        const verifyAdmin = async (session) => {
            if (!mounted || !session?.user) {
                if (mounted && !session?.user) {
                    setAuthenticated(false);
                    setLoading(false);
                }
                return;
            }
            
            if (verifying.current) return;

            try {
                verifying.current = true;
                console.log('AUTH_CHECK: Verifying session for', session.user.id);
                
                const { data, error: rpcError } = await supabase.rpc('get_auth_admin_status', { 
                    p_user_id: session.user.id 
                });
                
                if (rpcError) throw rpcError;

                if (mounted) {
                    const isAdmin = Array.isArray(data) && data.length > 0;
                    setAuthenticated(isAdmin);
                }
            } catch (err) {
                console.error('AUTH_CHECK: Verification failed:', err.message);
                if (mounted) setAuthenticated(false);
            } finally {
                verifying.current = false;
                if (mounted) setLoading(false);
            }
        };

        // Standard Supabase initialization pattern
        const setupAuth = async () => {
             // 1. Get initial session immediately
             const { data: { session } } = await supabase.auth.getSession();
             if (session) {
                 await verifyAdmin(session);
             } else {
                 if (mounted) setLoading(false);
             }

             // 2. Subscribe to changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
             const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
                 console.log(`AUTH_EVENT: ${event}`);
                 if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                     await verifyAdmin(newSession);
                 } else if (event === 'SIGNED_OUT') {
                     if (mounted) {
                         setAuthenticated(false);
                         setLoading(false);
                     }
                 }
             });

             return subscription;
        };

        let authSubscription;
        setupAuth().then(sub => {
            authSubscription = sub;
        });

        return () => {
            mounted = false;
            if (authSubscription) authSubscription.unsubscribe();
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                <div className="text-center">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Authenticating...</p>
                    <p className="text-xs text-gray-300 mt-2">Checking your secure credentials</p>
                </div>
            </div>
        );
    }

    if (!authenticated) {
        console.warn('AUTH_CHECK: Access denied OR session timed out. Redirecting to login.');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
