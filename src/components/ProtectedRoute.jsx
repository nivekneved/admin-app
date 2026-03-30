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
            if (!mounted) return;
            
            if (verifying.current) {
                console.log('AUTH_CHECK: Verification already in progress, skipping redundant call');
                return;
            }

            if (!session?.user) {
                console.log('AUTH_CHECK: No valid session found');
                if (mounted) {
                    setAuthenticated(false);
                    setLoading(false);
                }
                return;
            }

            try {
                verifying.current = true;
                console.log('AUTH_CHECK: Verifying admin status for:', session.user.id);
                
                // Set a manual timeout for the RPC call
                const rpcPromise = supabase.rpc('get_auth_admin_status', { p_user_id: session.user.id });
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('RPC_TIMEOUT')), 5000)
                );

                const { data, error: rpcError } = await Promise.race([rpcPromise, timeoutPromise]);
                
                if (rpcError) {
                    console.error('AUTH_CHECK: RPC Error:', rpcError);
                    throw rpcError;
                }

                if (mounted) {
                    // get_auth_admin_status returns SETOF public.admins, so data is an array
                    const isAdmin = Array.isArray(data) && data.length > 0;
                    console.log('AUTH_CHECK: Result:', isAdmin ? 'AUTHORIZED' : 'ACCESS_DENIED');
                    setAuthenticated(isAdmin);
                }
            } catch (err) {
                console.error('AUTH_CHECK: Critical Failure:', err.message || err);
                if (mounted) setAuthenticated(false);
            } finally {
                verifying.current = false;
                if (mounted) setLoading(false);
            }
        };

        // Unified initialization
        const init = async () => {
             const { data: { session } } = await supabase.auth.getSession();
             await verifyAdmin(session);
        };
        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`AUTH_EVENT: ${event}`);
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                await verifyAdmin(session);
            } else if (event === 'SIGNED_OUT') {
                if (mounted) {
                    setAuthenticated(false);
                    setLoading(false);
                }
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
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
