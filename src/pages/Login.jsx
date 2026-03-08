import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { showAlert } from '../utils/swal';
import logo from '../assets/logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            showAlert('Welcome Back', 'Login successful! Redirecting to dashboard...', 'success');
            navigate('/');
        } catch (error) {
            showAlert('Authentication Failed', error.message || 'Invalid login credentials', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-charcoal p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Subtle accent line */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-brand-red"></div>

                    <div className="text-center mb-10 mt-2">
                        <img src={logo} alt="Travel Lounge" className="h-16 mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Portal</h1>
                        <p className="text-gray-500 text-sm">Sign in to manage your bookings</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 block ml-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                                    placeholder="admin@travellounge.mu"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 block ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                                    placeholder="••••••••"
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

                    <div className="mt-8 text-center pt-6 border-t border-gray-100">
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
