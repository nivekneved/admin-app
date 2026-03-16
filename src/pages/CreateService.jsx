import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Card, CardContent
} from '../components/Card';
import { Button } from '../components/Button';
import {
    ArrowLeft, Tag, DollarSign, Package,
    Loader2, Info, ShoppingBag, Camera,
    Save, Plus, BedDouble,
    ToggleLeft, ToggleRight, X, Calendar, Upload
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showAlert } from '../utils/swal';

const BUCKET = 'bucket';
const FOLDER = 'services';

const CreateService = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const roomFileInputRef = useRef(null);

    const [pageLoading, setPageLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingRoom, setUploadingRoom] = useState(null); // { index, type }
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        category_ids: [],
        price: '',
        stock: '',
        status: 'In Stock',
        description: '',
        image_url: '',
        amenities: [],
        room_types: [],
        itinerary: []
    });

    const isEdit = !!id;

    useEffect(() => {
        const initialize = async () => {
            setPageLoading(true);
            await fetchCategories();
            if (isEdit) {
                await fetchService();
            }
            setPageLoading(false);
        };
        initialize();
    }, [id]);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('id, name')
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (error) throw error;
            setCategories(data || []);
        } catch (e) {
            console.error('Error fetching categories:', e);
        }
    };

    const fetchService = async () => {
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*, service_categories(category_id)')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    name: data.name || '',
                    category_ids: data.service_categories?.map(pc => pc.category_id) || [],
                    price: data.base_price || '',
                    stock: data.stock || '',
                    status: data.status || 'In Stock',
                    description: data.description || '',
                    image_url: data.image_url || '',
                    amenities: data.amenities || [],
                    room_types: data.room_types || [],
                    itinerary: data.itinerary || []
                });
            }
        } catch (e) {
            console.error('Error fetching service:', e);
            showAlert('Error', 'Failed to load service details', 'error');
            navigate('/services');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation: File Type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            showAlert('Invalid Type', 'Please upload a valid image (JPEG, PNG, or WEBP).', 'error');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        // Validation: File Size (2MB)
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            showAlert('File Too Large', 'Maximum image size is 2MB.', 'error');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setUploading(true);
        try {
            const ext = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
            const filePath = `${FOLDER}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(BUCKET)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from(BUCKET)
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
            showAlert('Success', 'Image uploaded successfully', 'success');
        } catch (error) {
            console.error('Upload error:', error);
            showAlert('Upload Failed', error.message || 'Error uploading image', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleRoomFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !uploadingRoom) return;

        // Validation: File Size (2MB)
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            showAlert('File Too Large', 'Maximum image size is 2MB.', 'error');
            if (roomFileInputRef.current) roomFileInputRef.current.value = '';
            return;
        }

        const { index, type } = uploadingRoom;
        setUploadingRoom(prev => ({ ...prev, loading: true }));

        try {
            const ext = file.name.split('.').pop();
            const fileName = `room-${index}-${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
            const filePath = `${FOLDER}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(BUCKET)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from(BUCKET)
                .getPublicUrl(filePath);

            if (type === 'main') {
                updateRoomType(index, 'image_url', data.publicUrl);
            } else {
                addRoomImage(index, data.publicUrl);
            }

            showAlert('Success', 'Room image uploaded successfully', 'success');
        } catch (error) {
            console.error('Room upload error:', error);
            showAlert('Upload Failed', error.message || 'Error uploading room image', 'error');
        } finally {
            setUploadingRoom(null);
            if (roomFileInputRef.current) roomFileInputRef.current.value = '';
        }
    };

    const triggerRoomFileUpload = (index, type) => {
        setUploadingRoom({ index, type, loading: false });
        setTimeout(() => {
            roomFileInputRef.current?.click();
        }, 100);
    };

    const addRoomType = () => {
        setFormData(prev => ({
            ...prev,
            room_types: [...prev.room_types, {
                type: '',
                image_url: '',
                images: [], // Support for multiple images
                available: true,
                features: [],
                prices: { mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: '' }
            }]
        }));
    };

    const toggleAmenity = (amenity) => {
        if (!amenity) return;
        setFormData(prev => {
            const current = [...prev.amenities];
            if (current.includes(amenity)) {
                return { ...prev, amenities: current.filter(a => a !== amenity) };
            } else {
                return { ...prev, amenities: [...current, amenity] };
            }
        });
    };

    const addRoomFeature = (roomIdx, feature) => {
        if (!feature) return;
        setFormData(prev => {
            const updatedRooms = [...prev.room_types];
            const currentFeatures = updatedRooms[roomIdx].features || [];
            if (!currentFeatures.includes(feature)) {
                updatedRooms[roomIdx] = {
                    ...updatedRooms[roomIdx],
                    features: [...currentFeatures, feature]
                };
            }
            return { ...prev, room_types: updatedRooms };
        });
    };

    const removeRoomFeature = (roomIdx, feature) => {
        setFormData(prev => {
            const updatedRooms = [...prev.room_types];
            updatedRooms[roomIdx] = {
                ...updatedRooms[roomIdx],
                features: (updatedRooms[roomIdx].features || []).filter(f => f !== feature)
            };
            return { ...prev, room_types: updatedRooms };
        });
    };

    const addRoomImage = (roomIdx, url) => {
        if (!url) return;
        setFormData(prev => {
            const updatedRooms = [...prev.room_types];
            const currentImages = updatedRooms[roomIdx].images || [];
            if (!currentImages.includes(url)) {
                updatedRooms[roomIdx] = {
                    ...updatedRooms[roomIdx],
                    images: [...currentImages, url]
                };
            }
            return { ...prev, room_types: updatedRooms };
        });
    };

    const removeRoomImage = (roomIdx, url) => {
        setFormData(prev => {
            const updatedRooms = [...prev.room_types];
            updatedRooms[roomIdx] = {
                ...updatedRooms[roomIdx],
                images: (updatedRooms[roomIdx].images || []).filter(img => img !== url)
            };
            return { ...prev, room_types: updatedRooms };
        });
    };

    const removeRoomType = (idx) => {
        setFormData(prev => ({
            ...prev,
            room_types: prev.room_types.filter((_, i) => i !== idx)
        }));
    };

    const updateRoomType = (idx, field, value) => {
        setFormData(prev => {
            const updated = [...prev.room_types];
            updated[idx] = { ...updated[idx], [field]: value };
            return { ...prev, room_types: updated };
        });
    };

    const updateRoomPrice = (idx, day, value) => {
        setFormData(prev => {
            const updated = [...prev.room_types];
            updated[idx] = {
                ...updated[idx],
                prices: { ...updated[idx].prices, [day]: value }
            };
            return { ...prev, room_types: updated };
        });
    };

    const syncAllPrices = (idx, value) => {
        if (!value) return;
        setFormData(prev => {
            const updated = [...prev.room_types];
            updated[idx] = {
                ...updated[idx],
                prices: {
                    mon: value, tue: value, wed: value,
                    thu: value, fri: value, sat: value, sun: value
                }
            };
            return { ...prev, room_types: updated };
        });
    };

    // — Itinerary Handlers —
    const addItineraryDay = () => {
        setFormData(prev => ({
            ...prev,
            itinerary: [...prev.itinerary, { day: `Day ${prev.itinerary.length + 1}`, title: '', description: '' }]
        }));
    };

    const removeItineraryDay = (idx) => {
        setFormData(prev => ({
            ...prev,
            itinerary: prev.itinerary.filter((_, i) => i !== idx)
        }));
    };

    const updateItineraryDay = (idx, field, value) => {
        setFormData(prev => {
            const updated = [...prev.itinerary];
            updated[idx] = { ...updated[idx], [field]: value };
            return { ...prev, itinerary: updated };
        });
    };

    const handleCategoryToggle = (catId) => {
        setFormData(prev => {
            const current = prev.category_ids;
            if (current.includes(catId)) {
                return { ...prev, category_ids: current.filter(id => id !== catId) };
            } else {
                return { ...prev, category_ids: [...current, catId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const serviceData = {
                name: formData.name,
                base_price: parseFloat(formData.price) || 0,
                stock: parseInt(formData.stock) || 0,
                status: formData.status,
                description: formData.description,
                image_url: formData.image_url,
                amenities: formData.amenities,
                room_types: formData.room_types,
                itinerary: formData.itinerary,
                updated_at: new Date().toISOString()
            };

            let serviceId = id;

            if (isEdit) {
                const { error } = await supabase
                    .from('services')
                    .update(serviceData)
                    .eq('id', id);
                if (error) throw error;
            } else {
                const { data, error } = await supabase
                    .from('services')
                    .insert([{ ...serviceData, created_at: new Date().toISOString() }])
                    .select()
                    .single();
                if (error) throw error;
                serviceId = data.id;
            }

            // Sync Many-to-Many Categories
            // First clear existing
            const { error: deleteError } = await supabase
                .from('service_categories')
                .delete()
                .eq('service_id', serviceId);
            if (deleteError) throw deleteError;

            // Then insert new associations
            if (formData.category_ids.length > 0) {
                const associations = formData.category_ids.map(catId => ({
                    service_id: serviceId,
                    category_id: catId
                }));
                const { error: insertError } = await supabase
                    .from('service_categories')
                    .insert(associations);
                if (insertError) throw insertError;
            }

            showAlert('Success', isEdit ? 'Service updated successfully.' : 'Service listed successfully.', 'success');
            navigate('/services');
        } catch (error) {
            console.error('Save Error:', error);
            showAlert('Action Failed', error.message || 'Could not save service', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-brand-red mb-4" size={48} />
                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Loading Catalog Workspace...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header & Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/services')}
                    className="group flex items-center gap-3 text-gray-400 hover:text-brand-red transition-all font-black uppercase tracking-widest text-[10px]"
                >
                    <div className="p-2 border border-gray-300 rounded-xl group-hover:bg-red-50 group-hover:border-red-100 transition-all">
                        <ArrowLeft size={16} />
                    </div>
                    Back to Catalog
                </button>
                <div className="text-right">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                        {isEdit ? 'Refine Specification' : 'List New Service'}
                    </h1>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                        {isEdit ? `Service UID: ${id.slice(0, 8)}` : 'Global Service Registry'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Service Hero Card */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-red to-red-400 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                    <Card className="relative bg-white border border-gray-300 shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden">
                        <div className="h-40 bg-brand-charcoal relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-red/20 to-transparent"></div>
                        </div>
                        <CardContent className="px-10 pb-10 relative">
                            <div className="flex flex-col md:flex-row items-end gap-8 -mt-20">
                                {/* Image Preview Section */}
                                <div className="relative">
                                    <div className="w-56 h-56 rounded-3xl border-[6px] border-white shadow-2xl bg-gray-50 overflow-hidden group/photo relative">
                                        {formData.image_url ? (
                                            <img
                                                src={formData.image_url}
                                                alt="Preview"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover/photo:scale-110"
                                                onError={(e) => {
                                                    e.target.src = "https://placehold.co/600x600/f3f4f6/9ca3af?text=Invalid+URL";
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                                <ShoppingBag size={48} className="mb-2" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">No Image</span>
                                            </div>
                                        )}
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                                        >
                                            <Upload size={24} className="mb-2" />
                                            <span className="text-[10px] font-black uppercase">Upload New</span>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                        />
                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
                                                <Loader2 size={24} className="animate-spin text-brand-red" />
                                            </div>
                                        )}
                                    </div>
                                    <div className={`absolute bottom-4 -right-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg border-2 border-white ${formData.status === 'In Stock' ? 'bg-green-500 text-white' :
                                        formData.status === 'Low Stock' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                                        }`}>
                                        {formData.status}
                                    </div>
                                </div>

                                <div className="flex-1 pb-2 font-black">
                                    <h2 className="text-3xl text-gray-900 tracking-tight truncate max-w-md">
                                        {formData.name || "Untitled Specification"}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        {formData.category_ids.length > 0 ? (
                                            formData.category_ids.map(id => {
                                                const cat = categories.find(c => c.id === id);
                                                return cat ? (
                                                    <span key={id} className="px-2.5 py-1 text-[9px] uppercase tracking-widest rounded-lg bg-red-50 text-brand-red border border-red-100">
                                                        {cat.name}
                                                    </span>
                                                ) : null;
                                            })
                                        ) : (
                                            <span className="px-2.5 py-1 text-[9px] uppercase tracking-widest rounded-lg bg-gray-50 text-gray-500 border border-gray-100">
                                                Unassigned
                                            </span>
                                        )}
                                        <span className="text-brand-red text-lg ml-2">
                                            MUR {parseFloat(formData.price || 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="pb-2">
                                    <Button
                                        type="submit"
                                        disabled={formLoading || uploading}
                                        className="bg-brand-red text-white px-10 py-4 rounded-2xl shadow-xl shadow-red-100 flex items-center gap-3 font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all"
                                    >
                                        {formLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        {isEdit ? 'Update Specification' : 'Publish Service'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Core Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Section: Standard Details */}
                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 space-y-6">
                            <h3 className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-4">
                                <Tag size={16} className="text-brand-red" /> Service Identity
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Listing Title</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-black text-lg"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Premium VIP Lounge Access"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Service Categories (Select Multiple)</label>
                                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-4 bg-gray-50 border border-gray-300 rounded-2xl custom-scrollbar">
                                            {categories.map(cat => (
                                                <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                                                    <div className="relative flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            className="peer h-5 w-5 appearance-none border-2 border-gray-300 rounded-lg checked:bg-brand-red checked:border-brand-red transition-all cursor-pointer"
                                                            checked={formData.category_ids.includes(cat.id)}
                                                            onChange={() => handleCategoryToggle(cat.id)}
                                                        />
                                                        <Save size={10} className="absolute left-1.25 top-1.25 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                                    </div>
                                                    <span className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${formData.category_ids.includes(cat.id) ? 'text-brand-red' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                                        {cat.name}
                                                    </span>
                                                </label>
                                            ))}
                                            {categories.length === 0 && (
                                                <div className="col-span-2 text-[10px] text-gray-400 font-bold uppercase py-2 text-center">No active categories found</div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Image URL / External Path</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="image_url"
                                                className="w-full pl-6 pr-12 py-4 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-sm font-medium"
                                                value={formData.image_url}
                                                onChange={handleInputChange}
                                                placeholder="https://..."
                                            />
                                            <Camera size={16} className="absolute right-4 top-4 text-gray-300" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Detailed Narrative</label>
                                    <textarea
                                        name="description"
                                        rows={4}
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-sm font-medium resize-none leading-relaxed"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Describe the inclusions, terms, and luxury standards of this service..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Service Amenities (Add Tags)</label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {formData.amenities.map(amenity => (
                                            <span key={amenity} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-brand-red border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest animate-in zoom-in-95 duration-200">
                                                {amenity}
                                                <button type="button" onClick={() => toggleAmenity(amenity)} className="hover:text-red-700 transition-colors">
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                        {formData.amenities.length === 0 && (
                                            <span className="text-[10px] font-bold text-gray-300 uppercase italic">No amenities listed yet...</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            id="new_amenity"
                                            placeholder="e.g. Free WiFi, Infinity Pool"
                                            className="grow px-6 py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-xs font-bold"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    toggleAmenity(e.target.value);
                                                    e.target.value = '';
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                const input = document.getElementById('new_amenity');
                                                toggleAmenity(input.value);
                                                input.value = '';
                                            }}
                                            className="bg-brand-charcoal text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section: Hotel/Room Type Specifications (Conditional) */}
                        {formData.category_ids.some(id => categories.find(c => c.id === id)?.name === 'Hotels') && (
                            <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 space-y-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-[0.2em]">
                                        <BedDouble size={16} className="text-brand-red" /> Accommodation & Pricing
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={addRoomType}
                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-red hover:text-red-700 transition-colors"
                                    >
                                        <Plus size={14} /> Add Room Type
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {formData.room_types.length === 0 ? (
                                        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-300">
                                            <BedDouble size={48} className="mb-2 opacity-20" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No room types defined</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {formData.room_types.map((rt, idx) => (
                                                <div key={idx} className="p-6 bg-gray-50/50 rounded-3xl border border-gray-300 space-y-6 relative group/rt">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRoomType(idx)}
                                                        className="absolute top-4 right-4 text-gray-300 hover:text-brand-red transition-colors opacity-0 group-hover/rt:opacity-100"
                                                    >
                                                        <X size={16} />
                                                    </button>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-300">
                                                        <div>
                                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Room Type Name</label>
                                                            <input
                                                                type="text"
                                                                placeholder="e.g. Ocean View Suite"
                                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                                                                value={rt.type}
                                                                onChange={e => updateRoomType(idx, 'type', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2 space-y-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div>
                                                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Main Room Image URL</label>
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="text"
                                                                            placeholder="https://..."
                                                                            className="min-w-0 grow px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                                                                            value={rt.image_url || ''}
                                                                            onChange={e => updateRoomType(idx, 'image_url', e.target.value)}
                                                                        />
                                                                        <Button
                                                                            type="button"
                                                                            onClick={() => triggerRoomFileUpload(idx, 'main')}
                                                                            className="bg-brand-charcoal text-white rounded-xl p-3 hover:scale-105 transition-transform shrink-0"
                                                                            title="Upload from PC"
                                                                        >
                                                                            <Upload size={18} />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Additional Gallery Images</label>
                                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                                        <div className="flex grow gap-2">
                                                                            <input
                                                                                type="text"
                                                                                id={`new_room_image_${idx}`}
                                                                                placeholder="Add image URL..."
                                                                                className="min-w-0 grow px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter') {
                                                                                        e.preventDefault();
                                                                                        addRoomImage(idx, e.target.value);
                                                                                        e.target.value = '';
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <Button
                                                                                type="button"
                                                                                onClick={() => triggerRoomFileUpload(idx, 'gallery')}
                                                                                className="bg-brand-red text-white rounded-xl p-3 hover:scale-105 transition-transform shrink-0"
                                                                                title="Upload from PC"
                                                                            >
                                                                                <Upload size={18} />
                                                                            </Button>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const input = document.getElementById(`new_room_image_${idx}`);
                                                                                if (input.value) {
                                                                                    addRoomImage(idx, input.value);
                                                                                    input.value = '';
                                                                                }
                                                                            }}
                                                                            className="shrink-0 px-6 py-3 bg-brand-charcoal text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                                                                        >
                                                                            Add
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Room Image Gallery Preview */}
                                                            <div className="flex flex-wrap gap-3 mt-2">
                                                                {(rt.images || []).map((imgUrl, imgIdx) => (
                                                                    <div key={imgIdx} className="relative group/img w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                                                        <img src={imgUrl} alt={`Room ${idx} image ${imgIdx}`} className="w-full h-full object-cover" />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeRoomImage(idx, imgUrl)}
                                                                            className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"
                                                                        >
                                                                            <X size={14} />
                                                                        </button>
                                                                        {uploadingRoom?.index === idx && uploadingRoom?.type === 'gallery' && uploadingRoom?.loading && (
                                                                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                                                                <Loader2 size={14} className="animate-spin text-brand-red" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                                {(!rt.images || rt.images.length === 0) && (
                                                                    <div className="flex items-center justify-center w-20 h-20 rounded-xl border-2 border-dashed border-gray-100 text-gray-300">
                                                                        {uploadingRoom?.index === idx && uploadingRoom?.type === 'gallery' && uploadingRoom?.loading ? (
                                                                            <Loader2 size={16} className="animate-spin text-brand-red" />
                                                                        ) : (
                                                                            <Camera size={20} className="opacity-20" />
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-end pb-1 px-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateRoomType(idx, 'available', !rt.available)}
                                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all w-full md:w-auto ${rt.available
                                                                    ? 'bg-green-50 border-green-100 text-green-600'
                                                                    : 'bg-gray-100 border-gray-200 text-gray-400'
                                                                    }`}
                                                            >
                                                                {rt.available ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                                                <span className="text-[10px] font-black uppercase tracking-widest">{rt.available ? 'Rentable' : 'Rent Stopped'}</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4 pb-6 border-b border-gray-300">
                                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Room Amenities (e.g. Ocean View, Mini Bar)</label>
                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                            {(rt.features || []).map(feature => (
                                                                <span key={feature} className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-[9px] font-bold uppercase tracking-widest">
                                                                    {feature}
                                                                    <button type="button" onClick={() => removeRoomFeature(idx, feature)} className="hover:text-brand-red transition-colors">
                                                                        <X size={10} />
                                                                    </button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                id={`new_feature_${idx}`}
                                                                placeholder="Add feature..."
                                                                className="grow px-4 py-2 bg-white border border-gray-300 rounded-xl text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-brand-red"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        addRoomFeature(idx, e.target.value);
                                                                        e.target.value = '';
                                                                    }
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const input = document.getElementById(`new_feature_${idx}`);
                                                                    addRoomFeature(idx, input.value);
                                                                    input.value = '';
                                                                }}
                                                                className="px-4 py-2 border border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white rounded-xl text-[9px] font-black uppercase transition-all"
                                                            >
                                                                Add
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">
                                                                <Calendar size={12} className="text-brand-red" /> 7-Day Dynamic Pricing (MUR)
                                                            </h4>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[8px] font-black text-gray-300 uppercase tracking-tighter">Sync:</span>
                                                                <input
                                                                    type="number"
                                                                    placeholder="Quick set"
                                                                    className="w-20 px-2 py-1 bg-white border border-gray-300 rounded text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-brand-red"
                                                                    onChange={e => syncAllPrices(idx, e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-7 gap-2 pb-2">
                                                            {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                                                                <div key={day} className="space-y-1.5 flex flex-col items-center">
                                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{day}</span>
                                                                    <input
                                                                        type="number"
                                                                        value={rt.prices?.[day] || ''}
                                                                        onChange={e => updateRoomPrice(idx, day, e.target.value)}
                                                                        className="w-full px-1 py-3 bg-white border border-gray-300 rounded-xl text-[11px] font-black text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                                                                        placeholder="-"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Section: Activity/Cruise Itinerary (Conditional) */}
                        {formData.category_ids.some(id => {
                            const cat = categories.find(c => c.id === id);
                            return cat && (cat.name === 'Activities' || cat.name === 'Cruises' || cat.name === 'Group Tours');
                        }) && (
                                <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 space-y-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-[0.2em]">
                                            <Calendar size={16} className="text-brand-red" /> Itinerary & Schedule
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={addItineraryDay}
                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-red hover:text-red-700 transition-colors"
                                        >
                                            <Plus size={14} /> Add Day/Stop
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {formData.itinerary.length === 0 ? (
                                            <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-300">
                                                <Calendar size={48} className="mb-2 opacity-20" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">No itinerary defined</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {formData.itinerary.map((it, idx) => (
                                                    <div key={idx} className="p-6 bg-gray-50/50 rounded-2xl border border-gray-300 flex gap-6 relative group/it">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItineraryDay(idx)}
                                                            className="absolute top-4 right-4 text-gray-300 hover:text-brand-red transition-colors opacity-0 group-hover/it:opacity-100"
                                                        >
                                                            <X size={16} />
                                                        </button>

                                                        <div className="w-24 shrink-0">
                                                            <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Label</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Day 1"
                                                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-[10px] font-black uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-red"
                                                                value={it.day}
                                                                onChange={e => updateItineraryDay(idx, 'day', e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="flex-1 space-y-4">
                                                            <div>
                                                                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Stop Title / Highlight</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="e.g. Arrival at Blue Bay Marine Park"
                                                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-red"
                                                                    value={it.title}
                                                                    onChange={e => updateItineraryDay(idx, 'title', e.target.value)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Stop Description</label>
                                                                <textarea
                                                                    rows={2}
                                                                    placeholder="Details about the stop, highlights, or inclusions..."
                                                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[11px] font-medium leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-brand-red"
                                                                    value={it.description}
                                                                    onChange={e => updateItineraryDay(idx, 'description', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}
                    </div>

                    {/* Right Column: Numbers & Status */}
                    <div className="lg:col-span-1 space-y-8">
                        <section className="bg-brand-charcoal text-white p-8 rounded-3xl shadow-xl shadow-gray-200 space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 text-white/5 -translate-y-4 translate-x-4">
                                <DollarSign size={120} />
                            </div>

                            <h3 className="flex items-center gap-2 text-xs font-black text-brand-red uppercase tracking-[0.2em] mb-4 relative z-10">
                                Pricing & Capacity
                            </h3>

                            <div className="space-y-6 relative z-10">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Base Rental/Unit Price (MUR)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="price"
                                            required
                                            step="0.01"
                                            className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-black text-xl text-white outline-none"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                        />
                                        <DollarSign size={20} className="absolute left-4 top-4 text-brand-red" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Current Inventory Capacity</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="stock"
                                            required
                                            className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-black text-xl text-white outline-none"
                                            value={formData.stock}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                        />
                                        <Package size={20} className="absolute left-4 top-4 text-brand-red" />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Inventory Lifecycle Status</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {['In Stock', 'Low Stock', 'Out of Stock'].map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, status: s }))}
                                                className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.status === s
                                                    ? 'bg-brand-red text-white border-brand-red shadow-lg shadow-red-900/40'
                                                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                                                    }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-red-50 p-8 rounded-3xl border border-red-100 flex items-start gap-4">
                            <div className="p-3 bg-white rounded-2xl text-brand-red shadow-sm shrink-0">
                                <Info size={20} />
                            </div>
                            <div className="font-black">
                                <h4 className="text-[10px] text-red-900 uppercase tracking-widest mb-1">Catalog Integrity</h4>
                                <p className="text-[10px] text-red-700 leading-relaxed">
                                    Published services are synced immediately with the global booking engine. Ensure pricing includes all applicable taxes.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="flex justify-end gap-4 p-8 bg-gray-50/50 rounded-3xl border border-gray-300 border-dashed">
                    <button
                        type="button"
                        onClick={() => navigate('/services')}
                        className="px-8 py-3 text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all font-black"
                    >
                        Cancel
                    </button>
                    <Button
                        type="submit"
                        disabled={formLoading || uploading}
                        className="bg-brand-red text-white px-12 py-4 rounded-2xl shadow-xl shadow-red-100 flex items-center gap-3 font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all outline-none border-none ring-0 focus:ring-0 active:ring-0"
                    >
                        {formLoading && <Loader2 size={16} className="animate-spin" />}
                        {isEdit ? 'Update Service' : 'Create Service'}
                    </Button>
                </div>
                <input
                    type="file"
                    ref={roomFileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleRoomFileUpload}
                />
            </form>
        </div>
    );
};

export default CreateService;
