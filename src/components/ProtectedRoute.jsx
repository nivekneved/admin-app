import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// ─────────────────────────────────────────────
// ProtectedRoute — Simple Gate
// Shows spinner while auth initializes,
// redirects to /login if no valid admin session.
// ─────────────────────────────────────────────

const ProtectedRoute = ({ children }) => {
    const { session, isAdmin, loading } = useAuth();
    const location = useLocation();

    // Still waiting for Supabase to resolve the initial session
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col space-y-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-25"></div>
                    <Loader2 className="w-10 h-10 animate-spin text-red-600 relative z-10" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">
                        Authenticating Portal Access...
                    </p>
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-2">
                        Checking your secure administrative credentials
                    </p>
                </div>
            </div>
        );
    }

    // No session or not an admin → send to login
    if (!session || !isAdmin) {
        console.warn('[ProtectedRoute] No valid admin session. Redirecting to login.');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
