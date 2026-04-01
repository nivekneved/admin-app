import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { showAlert } from '../utils/swal';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

// ─────────────────────────────────────────────
// Login — Clean & Simple
// Only calls signInWithPassword.
// AuthContext handles all role verification.
// ─────────────────────────────────────────────

const Login = () => {
    const [email, setEmail]                   = useState('');
    const [password, setPassword]             = useState('');
    const [loading, setLoading]               = useState(false);
    const [isResetting, setIsResetting]       = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);

    const { session, isAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // If already logged in as admin, skip the login page
    useEffect(() => {
        if (!authLoading && session && isAdmin) {
            console.log('[Login] Already authenticated. Redirecting to dashboard.');
            navigate('/', { replace: true });
        }
    }, [session, isAdmin, authLoading, navigate]);

    // Show initializing spinner while auth context is resolving
    if (authLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-brand-charcoal px-4">
                <Loader2 className="w-12 h-12 animate-spin text-brand-red mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Initializing Portal...
                </p>
            </div>
        );
    }

    // ── Login handler — no RPC here, AuthContext does the role check ──
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password || loading) return;

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) throw error;

            // Success — Supabase session is live.
            // AuthContext's onAuthStateChange will fire SIGNED_IN,
            // run the admin RPC check, and update isAdmin.
            // The useEffect above will then redirect to dashboard.
            // Nothing else needed here.
            console.log('[Login] Sign-in successful. Awaiting AuthContext verification...');

        } catch (error) {
            console.error('[Login] Sign-in error:', error.message);

            // Supabase returns "Invalid login credentials" for wrong email/password
            const friendlyMessage =
                error.message?.toLowerCase().includes('invalid login credentials')
                    ? 'Incorrect email or password. Please try again.'
                    : error.message || 'Authentication failed. Please try again.';

            showAlert('Login Failed', friendlyMessage, 'error');
            setLoading(false);
        }
        // Note: we intentionally don't clear loading on SUCCESS
        // because the page will navigate away. Clearing it would cause a flash.
    };

    // ── Reset password handler ──
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;

            setResetEmailSent(true);
            showAlert('Email Sent', 'Password reset instructions have been sent to your email.', 'success');
        } catch (error) {
            console.error('[Login] Reset error:', error.message);
            showAlert('Error', error.message || 'Failed to send reset email. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-charcoal p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Accent bar */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-brand-red"></div>

                    {/* Header */}
                    <div className="text-center mb-10 mt-2">
                        <img src={logo} alt="Travel Lounge" className="h-16 mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">
                            {isResetting ? 'Reset Password' : 'Admin Portal'}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {isResetting
                                ? 'Enter your email to receive a secure reset link'
                                : 'Sign in to manage your bookings'}
                        </p>
                    </div>

                    {/* ── Sign In Form ── */}
                    {!isResetting ? (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 block ml-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-slate-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                                        placeholder="admin@travellounge.mu"
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-semibold text-gray-700">Password</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsResetting(true)}
                                        className="text-[10px] font-black uppercase tracking-widest text-brand-red hover:underline"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-slate-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 bg-brand-red text-white hover:bg-red-700 focus:ring-4 focus:ring-red-200 font-bold rounded-xl flex items-center justify-center space-x-2 transition-all transform hover:opacity-90 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <LogIn size={20} />
                                        <span>Sign In</span>
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                    /* ── Reset Password Form ── */
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 block ml-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-slate-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                                        placeholder="admin@travellounge.mu"
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || resetEmailSent}
                                className="w-full py-3 px-4 bg-gray-900 text-white hover:bg-black font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <span>{resetEmailSent ? 'Instructions Sent ✓' : 'Send Reset Link'}</span>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => { setIsResetting(false); setResetEmailSent(false); }}
                                className="w-full text-center text-xs text-gray-500 font-bold hover:text-gray-900 transition-colors"
                            >
                                ← Back to Sign In
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center pt-6 border-t border-slate-300">
                        <p className="text-gray-400 text-xs">
                            &copy; {new Date().getFullYear()} Travel Lounge. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
