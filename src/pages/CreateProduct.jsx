import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, Tag, DollarSign, Package, Layout, Loader2, Info, CheckCircle2, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showAlert } from '../utils/swal';

const CreateProduct = () => {
    const navigate = useNavigate();
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Lounge Access',
        price: '',
        stock: '',
        status: 'In Stock',
        description: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const { error } = await supabase
                .from('products')
                .insert([{
                    ...formData,
                    price: parseFloat(formData.price) || 0,
                    stock: parseInt(formData.stock) || 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }]);

            if (error) throw error;

            showAlert('Success', 'Product catalog has been updated successfully.', 'success');
            navigate('/products');
        } catch (error) {
            console.error('Create Product Error:', error);
            showAlert('Action Failed', error.message || 'Could not add product to catalog', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="w-full h-full min-h-[calc(100vh-64px)] animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-6">
                    <Link
                        to="/products"
                        className="p-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl transition-all text-gray-400 hover:text-brand-red shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Add New Product</h1>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Global Catalog Entry</p>
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
                                    <ShoppingBag size={28} />
                                </div>
                                <CardTitle className="text-xl font-black text-gray-900 uppercase tracking-tight">Product Specifications</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Product Title</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="w-full px-6 py-4 bg-gray-50/50 border-2 border-transparent focus:border-brand-red/10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-brand-red/5 transition-all font-bold text-gray-700 placeholder:text-gray-300"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g. VIP Airport Lounge Access - Terminal A"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Market Category</label>
                                        <div className="relative group">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-brand-red">
                                                <Layout size={18} />
                                            </span>
                                            <select
                                                name="category"
                                                required
                                                className="w-full pl-14 pr-10 py-4 bg-gray-50/50 border-2 border-transparent focus:border-brand-red/10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-brand-red/5 transition-all font-bold text-gray-700 appearance-none"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                            >
                                                <option value="Lounge Access">Lounge Access</option>
                                                <option value="Meeting Space">Meeting Space</option>
                                                <option value="Wellness">Wellness</option>
                                                <option value="Food & Beverage">Food & Beverage</option>
                                                <option value="Transportation">Transportation</option>
                                                <option value="Hotels">Hotels</option>
                                                <option value="Tours">Tours</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Unit Price (MUR)</label>
                                        <div className="relative group">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-brand-red">
                                                <DollarSign size={18} />
                                            </span>
                                            <input
                                                type="number"
                                                name="price"
                                                required
                                                step="0.01"
                                                className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-2 border-transparent focus:border-brand-red/10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-brand-red/5 transition-all font-bold text-gray-700"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Available Inventory</label>
                                        <div className="relative group">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-brand-red">
                                                <Package size={18} />
                                            </span>
                                            <input
                                                type="number"
                                                name="stock"
                                                required
                                                className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-2 border-transparent focus:border-brand-red/10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-brand-red/5 transition-all font-bold text-gray-700"
                                                value={formData.stock}
                                                onChange={handleInputChange}
                                                placeholder="Current capacity/stock"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Live Status</label>
                                        <select
                                            name="status"
                                            className="w-full px-6 py-4 bg-gray-50/50 border-2 border-transparent focus:border-brand-red/10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-brand-red/5 transition-all font-bold text-gray-700 appearance-none"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                        >
                                            <option value="In Stock">Active / In Stock</option>
                                            <option value="Low Stock">Warning / Low Stock</option>
                                            <option value="Out of Stock">Hidden / Out of Stock</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Full Description</label>
                                    <textarea
                                        name="description"
                                        rows="4"
                                        className="w-full px-6 py-4 bg-gray-50/50 border-2 border-transparent focus:border-brand-red/10 rounded-3xl focus:outline-none focus:ring-4 focus:ring-brand-red/5 transition-all font-bold text-gray-700 placeholder:text-gray-300"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Provide professional details and terms for this travel service..."
                                    />
                                </div>

                                <div className="pt-10 flex items-center justify-between border-t border-gray-50">
                                    <div className="flex gap-4 w-full md:w-auto">
                                        <Link to="/products" className="flex-1 md:flex-none">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full px-8 py-4 border-gray-100 text-gray-400 font-bold rounded-3xl hover:bg-gray-50 transition-all uppercase tracking-widest text-[10px]"
                                            >
                                                Discard
                                            </Button>
                                        </Link>
                                        <Button
                                            type="submit"
                                            disabled={formLoading}
                                            className="flex-1 md:flex-none bg-brand-red hover:bg-red-700 text-white px-12 py-4 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-600/20 transition-all font-black uppercase tracking-[0.15em] text-xs hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {formLoading ? (
                                                <>
                                                    <Loader2 className="animate-spin mr-3" size={18} />
                                                    Publishing...
                                                </>
                                            ) : (
                                                <>
                                                    <Tag size={20} className="mr-3" />
                                                    List Product
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
                                <Info size={16} className="text-brand-red" /> Catalog Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 space-y-8">
                            <div className="space-y-4">
                                <div className="flex gap-4 items-center">
                                    <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center text-brand-red">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-black uppercase tracking-wider text-white">Live Publishing</h5>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global Synced</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Products added here are immediately visible in the customer-facing booking engine. Ensure all pricing includes necessary VAT and service fees.
                                </p>
                            </div>

                            <div className="pt-8 border-t border-white/5 space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Live Preview Status</label>
                                    <div className={`py-4 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest text-center border-2 transition-all ${formData.status === 'In Stock' ? 'bg-brand-red/10 border-brand-red text-brand-red' :
                                        formData.status === 'Low Stock' ? 'bg-amber-600/10 border-amber-600 text-amber-500' :
                                            'bg-red-600/10 border-red-600 text-red-500'
                                        }`}>
                                        {formData.status}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-8 bg-red-50 rounded-[40px] border border-red-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-red-100 translate-x-4 -translate-y-4 transition-transform group-hover:scale-110">
                            <ShoppingBag size={120} />
                        </div>
                        <div className="relative">
                            <h4 className="text-sm font-black text-red-900 mb-2 uppercase tracking-widest underline decoration-red-200 decoration-4 underline-offset-4">Quality Standard</h4>
                            <p className="text-xs text-red-700/80 font-bold leading-relaxed">
                                Use high-resolution imagery and clear, concise descriptions. Premium products demand premium presentation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateProduct;
