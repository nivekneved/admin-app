import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    setAuthenticated(false);
                    return;
                }
                // C-06 FIX: Verify user is an active admin, not just authenticated
                const { data: adminRecord } = await supabase
                    .from('admins')
                    .select('id, is_active')
                    .eq('user_id', session.user.id)
                    .eq('is_active', true)
                    .single();
                setAuthenticated(!!adminRecord);
            } catch {
                setAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!session) {
                setAuthenticated(false);
                setLoading(false);
                return;
            }
            // Re-verify admin role on auth state change
            const { data: adminRecord } = await supabase
                .from('admins')
                .select('id, is_active')
                .eq('user_id', session.user.id)
                .eq('is_active', true)
                .single();
            setAuthenticated(!!adminRecord);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    if (!authenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
