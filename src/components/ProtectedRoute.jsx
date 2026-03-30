import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        let mounted = true;

        const verifyAdmin = async (session) => {
            if (!session?.user) {
                console.log('AUTH_CHECK: No valid session found');
                if (mounted) {
                    setAuthenticated(false);
                    setLoading(false);
                }
                return;
            }

            try {
                console.log('AUTH_CHECK: Verifying user is an active admin via RPC...', session.user.id);
                
                // C-07 FIX: Use RPC to bypass RLS recursion entirely
                const { data: adminRecord, error: rpcError } = await supabase
                    .rpc('get_auth_admin_status', { p_user_id: session.user.id });
                
                if (rpcError) {
                    console.error('AUTH_CHECK: RPC verification failed with error:', rpcError);
                }

                if (mounted) {
                    console.log('AUTH_CHECK: Admin record result (via RPC):', adminRecord ? 'FOUND (ACTIVE)' : 'NOT FOUND');
                    setAuthenticated(!!adminRecord);
                }
            } catch (err) {
                console.error('AUTH_CHECK: Unexpected error during verification:', err);
                if (mounted) setAuthenticated(false);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        // Standard pattern: Use onAuthStateChange as a single source of truth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`AUTH_EVENT: ${event}`, { userId: session?.user?.id });
            
            if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
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
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Authenticating...</p>
            </div>
        );
    }

    if (!authenticated) {
        console.warn('AUTH_CHECK: Access denied, redirecting to login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
