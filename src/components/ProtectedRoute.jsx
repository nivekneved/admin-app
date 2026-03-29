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
                console.log('AUTH_CHECK: Verifying user is an active admin...', session.user.id);
                const { data: adminRecord, error: adminError } = await supabase
                    .from('admins')
                    .select('id, is_active')
                    .eq('user_id', session.user.id)
                    .eq('is_active', true)
                    .single();
                
                if (adminError) {
                    // Check if it's just 'no rows found' vs. a real database error
                    if (adminError.code === 'PGRST116') {
                        console.warn('AUTH_CHECK: No active admin record found for this user ID.');
                    } else {
                        console.error('AUTH_CHECK: Admin verification failed with error:', adminError);
                    }
                }

                if (mounted) {
                    console.log('AUTH_CHECK: Admin record result:', adminRecord ? 'FOUND (ACTIVE)' : 'NOT FOUND');
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
        // This handles INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, token refreshed, etc.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`AUTH_EVENT: ${event}`, { userId: session?.user?.id });
            
            // For INITIAL_SESSION, we want to immediately check if we have a session to avoid flickering
            if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
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
