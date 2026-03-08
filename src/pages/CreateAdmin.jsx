import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, UserPlus, Mail, Lock, Shield, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showAlert } from '../utils/swal';

const CreateAdmin = () => {
    const navigate = useNavigate();
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'staff'
    });

    const roles = [
        { value: 'admin', label: 'Universal Root Administrator', desc: 'Full system access and data modifications' },
        { value: 'manager', label: 'Operations Manager', desc: 'Manage bookings, inventory, and reports' },
        { value: 'staff', label: 'Standard Staff', desc: 'Basic data entry and customer servicing' },
        { value: 'receptionist', label: 'Receptionist / Front Desk', desc: 'Check-ins, check-outs, and scheduling' },
        { value: 'editor', label: 'Editor / Content Manager', desc: 'Updates website text, cruises, and tour info' },
        { value: 'sales', label: 'Sales Consultant', desc: 'Inquiries, customer follow-ups, and quotes' },
        { value: 'accountant', label: 'Accounts Representative', desc: 'Invoices, payments, and financial auditing' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            // 1. Create the Auth User (Credentials)
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        username: formData.username,
                        role: formData.role
                    }
                }
            });

            if (authError) throw authError;

            // 2. Insert into administrative 'admins' profile table (Metadata)
            const { error: dbError } = await supabase
                .from('admins')
                .insert([{
                    username: formData.username,
                    email: formData.email,
                    password: formData.password, // Synced with Auth for reference (though not ideal)
                    role: formData.role,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }]);

            if (dbError) throw dbError;

            showAlert('Success', 'Administrator account provisioned successfully. They can now explore the portal.', 'success');
            navigate('/users');
        } catch (error) {
            console.error('Create User Error:', error);
            showAlert('Action Failed', error.message || 'Could not provision administrator account', 'error');
        } finally {
            setFormLoading(false);
        }
    };

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
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Provision New Identity</h1>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Universal Identity & Access Management (IAM)</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                <div className="xl:col-span-8">
                    <Card className="border-0 shadow-2xl shadow-gray-200/50 rounded-3xl overflow-hidden bg-white">
                        <div className="h-2 bg-gradient-to-r from-brand-red to-red-600 w-full"></div>
                        <CardHeader className="pt-10 px-10">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-red-50 text-brand-red rounded-3xl">
                                    <UserPlus size={28} />
                                </div>
                                <CardTitle className="text-xl font-black text-gray-900 uppercase tracking-tight">Access Credentials</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">System Username</label>
                                        <div className="relative group">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-brand-red">
                                                <UserPlus size={18} />
                                            </span>
                                            <input
                                                type="text"
                                                name="username"
                                                required
                                                className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-2 border-transparent focus:border-brand-red/10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-brand-red/5 transition-all font-bold text-gray-700 placeholder:text-gray-300"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                placeholder="e.g. m.adams"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Work Email</label>
                                        <div className="relative group">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-brand-red">
                                                <Mail size={18} />
                                            </span>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-2 border-transparent focus:border-brand-red/10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-brand-red/5 transition-all font-bold text-gray-700 placeholder:text-gray-300"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="Email will be used for login"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Password Generation</label>
                                        <div className="relative group">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-brand-red">
                                                <Lock size={18} />
                                            </span>
                                            <input
                                                type="password"
                                                name="password"
                                                required
                                                className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-2 border-transparent focus:border-brand-red/10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-brand-red/5 transition-all font-bold text-gray-700 placeholder:text-gray-300"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="Set an initial password"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Authority Layer</label>
                                        <div className="relative group">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-brand-red">
                                                <Shield size={18} />
                                            </span>
                                            <select
                                                name="role"
                                                className="w-full pl-14 pr-12 py-4 bg-gray-50/50 border-2 border-transparent focus:border-brand-red/10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-brand-red/5 transition-all font-black text-gray-600 appearance-none uppercase text-xs tracking-widest cursor-pointer"
                                                value={formData.role}
                                                onChange={handleInputChange}
                                            >
                                                {roles.map(r => (
                                                    <option key={r.value} value={r.value}>{r.label.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 flex items-center justify-between border-t border-gray-50">
                                    <p className="text-xs text-gray-400 font-bold hidden md:block">
                                        Confirm identity details before deployment
                                    </p>
                                    <div className="flex gap-4">
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
                                                    Provisioning...
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus size={20} className="mr-3" />
                                                    Grant System Access
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="xl:col-span-4 space-y-8">
                    <Card className="border-0 shadow-xl shadow-gray-100 rounded-3xl overflow-hidden bg-brand-charcoal text-white">
                        <CardHeader className="pt-8 px-8">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                                <Shield size={16} className="text-brand-red" /> Role Privileges
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 space-y-6">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <h4 className="text-sm font-black text-brand-red mb-1">{formData.role.toUpperCase()} ACCESS</h4>
                                <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                                    {roles.find(r => r.value === formData.role)?.desc}
                                </p>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex gap-3 text-xs font-bold items-start group">
                                    <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                                    <span className="text-gray-300 transition-colors group-hover:text-white">Authorized Login Access</span>
                                </li>
                                <li className="flex gap-3 text-xs font-bold items-start group">
                                    <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                                    <span className="text-gray-300 transition-colors group-hover:text-white">Active Profile Creation</span>
                                </li>
                                <li className="flex gap-3 text-xs font-bold items-start group text-gray-500">
                                    <CheckCircle2 size={16} className="text-red-500 shrink-0 mt-0.5" />
                                    <span className="transition-colors group-hover:text-gray-300 italic">Conditional MFA Enforcement</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <div className="p-8 bg-red-50 rounded-[40px] border border-red-100 flex flex-col gap-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-red-100 translate-x-4 -translate-y-4 transition-transform group-hover:scale-110">
                            <Shield size={120} />
                        </div>
                        <div className="relative">
                            <h4 className="text-sm font-black text-red-900 mb-2 uppercase tracking-widest">Security Protocol</h4>
                            <p className="text-xs text-red-700/80 font-bold leading-relaxed mb-4">
                                Identity provisioning triggers multiple system updates:
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                                    <span className="text-[10px] font-black text-red-800 uppercase tracking-tighter">Auth.Users Synchronization</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                                    <span className="text-[10px] font-black text-red-800 uppercase tracking-tighter">Public.Admins Record Set</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                                    <span className="text-[10px] font-black text-red-800 uppercase tracking-tighter">Encrypted Audit Log Logged</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateAdmin;
