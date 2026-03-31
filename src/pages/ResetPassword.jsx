import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Loader2, Save } from 'lucide-react';
import { showAlert } from '../utils/swal';
import logo from '../assets/logo.png';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
             // SUPABASE GUIDELINE: When redirected from a password reset email, 
             // Supabase Client automatically handles the hash and creates a session.
             const { data: { session } } = await supabase.auth.getSession();
             if (!session) {
                 showAlert('Invalid Session', 'The password reset link is invalid or has expired.', 'error');
                 navigate('/login', { replace: true });
             } else {
                 setCheckingSession(false);
             }
        };
        checkSession();
    }, [navigate]);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            showAlert('Wait', 'Passwords do not match!', 'warning');
            return;
        }

        if (password.length < 6) {
            showAlert('Wait', 'Password must be at least 6 characters.', 'warning');
            return;
        }

        setLoading(true);
        try {
            // SUPABASE GUIDELINE: Update the user's password
            const { error } = await supabase.auth.updateUser({ password });

            if (error) throw error;

            showAlert('Success', 'Your password has been updated. You can now login.', 'success');
            // Log out explicitly and take to login
            await supabase.auth.signOut();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('RESET_PW: Update failed:', error.message);
            showAlert('Update Failed', error.message || 'Could not update password', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-brand-charcoal px-4">
                <Loader2 className="w-12 h-12 animate-spin text-brand-red mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Validating Link...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-charcoal p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-brand-red"></div>

                    <div className="text-center mb-10 mt-2">
                        <img src={logo} alt="Travel Lounge" className="h-16 mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Set New Password</h1>
                        <p className="text-gray-500 text-sm">Please secure your account with a new password</p>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 block ml-1">New Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-slate-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 block ml-1">Confirm New Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-slate-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-brand-red text-white hover:bg-red-700 font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <Save size={20} />
                                    <span>Update Password</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
