import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, Lock, Key, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showAlert } from '../utils/swal';

const ChangePasswordAdmin = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [adminUser, setAdminUser] = useState(null);
    const [passwordData, setPasswordData] = useState({
        newPassword: ''
    });

    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                const { data, error } = await supabase
                    .from('admins')
                    .select('email, username')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setAdminUser(data);
            } catch (error) {
                console.error('Fetch error:', error);
                showAlert('Error', 'Failed to load administrator details', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchAdmin();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!passwordData.newPassword) return;

        setFormLoading(true);

        try {
            const { error } = await supabase
                .from('admins')
                .update({ password: passwordData.newPassword })
                .eq('id', id);

            if (error) throw error;
            showAlert('Success', 'Password updated successfully', 'success');
            navigate('/users');
        } catch (error) {
            showAlert('Error', error.message || 'Failed to update password', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center">
                <Loader2 className="animate-spin text-brand-red w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[calc(100vh-64px)] animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-6">
                    <Link
                        to="/users"
                        className="p-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl transition-all text-gray-400 hover:text-brand-red shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Security Override</h1>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Change Account Password</p>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl">
                <Card className="border-0 shadow-2xl shadow-gray-200/50 rounded-3xl overflow-hidden bg-white">
                    <div className="h-2 bg-gradient-to-r from-brand-red to-red-600 w-full"></div>
                    <CardHeader className="pt-10 px-10">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-red-50 text-brand-red rounded-3xl">
                                <Lock size={28} />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black text-gray-900 uppercase tracking-tight">Credential Reset</CardTitle>
                                <p className="text-sm text-gray-500 font-medium mt-1">For {adminUser?.username} ({adminUser?.email})</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-3">
                                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">New Password Generation</label>
                                <div className="relative group">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-brand-red">
                                        <Key size={18} />
                                    </span>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        required
                                        className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-2 border-transparent focus:border-brand-red/10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-brand-red/5 transition-all font-bold text-gray-700 placeholder:text-gray-300"
                                        value={passwordData.newPassword}
                                        onChange={handleInputChange}
                                        placeholder="Set a new secure password"
                                    />
                                </div>
                            </div>

                            <div className="pt-10 flex items-center justify-end gap-4 border-t border-gray-50">
                                <Link to="/users">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="px-8 py-4 border-gray-100 text-gray-400 font-bold rounded-3xl hover:bg-gray-50 transition-all uppercase tracking-widest text-[10px]"
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={formLoading}
                                    className="bg-brand-red hover:bg-brand-red/90 text-white px-12 py-4 rounded-3xl flex items-center shadow-2xl shadow-brand-red/20 transition-all font-black uppercase tracking-[0.15em] text-xs hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {formLoading ? (
                                        <>
                                            <Loader2 className="animate-spin mr-3" size={18} />
                                            Encrypting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={20} className="mr-3" />
                                            Force Update
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ChangePasswordAdmin;
