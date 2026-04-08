import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Card, CardContent
} from '../components/Card';
import { Button } from '../components/Button';
import {
    ArrowLeft, Tag, DollarSign, Package,
    Loader2, Info, Camera,
    Save, Plus, BedDouble, Utensils, Globe,
    ToggleLeft, ToggleRight, X, Calendar
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showAlert } from '../utils/swal';
import ImageUpload from '../components/ImageUpload';
import { ChevronDown, ChevronRight } from 'lucide-react';

const CreateService = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [pageLoading, setPageLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        category_ids: [],
        price: '',
        stock: '',
        status: 'In Stock',
        short_description: '',
        description: '',
        image_url: '',
        secondary_image_url: '',
        amenities: [],
        room_types: [],
        itinerary: [],
        region: 'Mauritius',
        service_type: 'activity',
        location: '',
        featured: false,
        priority: 0,
        max_group_size: '',
        max_adults: '',
        max_children: '',
        child_age_limit: 12,
        child_price: '',
        meta_title: '',
        meta_description: '',
        is_seasonal_deal: false,
        deal_note: 'Limited Time',
        is_active: true,
        is_coming_soon: false,
        gallery_images: [],
        highlights: [],
        included: [],
        not_included: [],
        cancellation_policy: '',
        terms_and_conditions: '',
        meal_plans: []
    });

    const [collapsedSections, setCollapsedSections] = useState({
        identity: false,
        narrative: false,
        mealPlans: false,
        policies: false,
        promotional: false,
        seo: false,
        gallery: false,
        accommodation: false,
        itinerary: false
    });

    const toggleSection = (section) => {
        setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

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
                    short_description: data.short_description || '',
                    description: data.description || '',
                    image_url: data.image_url || '',
                    secondary_image_url: data.secondary_image_url || '',
                    amenities: data.amenities || [],
                    room_types: data.room_types || [],
                    itinerary: data.itinerary || [],
                    region: data.region || 'Mauritius',
                    service_type: data.service_type || 'activity',
                    location: data.location || '',
                    featured: data.featured || false,
                    priority: data.priority || 0,
                    max_group_size: data.max_group_size || '',
                    max_adults: data.max_adults || '',
                    max_children: data.max_children || '',
                    child_age_limit: data.child_age_limit ?? 12,
                    child_price: data.child_price || '',
                    meta_title: data.meta_title || '',
                    meta_description: data.meta_description || '',
                    is_seasonal_deal: data.is_seasonal_deal || false,
                    deal_note: data.deal_note || 'Limited Time',
                    is_active: data.is_active ?? true,
                    is_coming_soon: data.is_coming_soon ?? false,
                    gallery_images: data.gallery_images || [],
                    highlights: data.highlights || [],
                    included: data.included || [],
                    not_included: data.not_included || [],
                    cancellation_policy: data.cancellation_policy || '',
                    terms_and_conditions: data.terms_and_conditions || '',
                    meal_plans: data.meal_plans || []
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


    const addRoomType = () => {
        setFormData(prev => ({
            ...prev,
            room_types: [...prev.room_types, {
                type: '',
                image_url: '',
                images: [], // Support for multiple images
                available: true,
                min_stay: 1,
                max_adults: 2,
                max_children: 0,
                child_age_limit: 12,
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

    const addItineraryDay = () => {
        setFormData(prev => ({
            ...prev,
            itinerary: [...prev.itinerary, { day: `Day ${prev.itinerary.length + 1}`, title: '', description: '', image_url: '' }]
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

    const addGalleryImage = (url) => {
        if (!url) return;
        setFormData(prev => ({
            ...prev,
            gallery_images: [...(prev.gallery_images || []), url].slice(0, 10)
        }));
    };

    const removeGalleryImage = (url) => {
        setFormData(prev => ({
            ...prev,
            gallery_images: (prev.gallery_images || []).filter(img => img !== url)
        }));
    };

    const toggleListValue = (field, value) => {
        if (!value) return;
        setFormData(prev => {
            const current = [...(prev[field] || [])];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter(v => v !== value) };
            } else {
                return { ...prev, [field]: [...current, value] };
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
                short_description: formData.short_description,
                description: formData.description,
                image_url: formData.image_url,
                secondary_image_url: formData.secondary_image_url,
                amenities: formData.amenities,
                room_types: formData.room_types,
                itinerary: formData.itinerary,
                region: formData.region,
                service_type: formData.service_type,
                location: formData.location,
                featured: formData.featured,
                priority: parseInt(formData.priority) || 0,
                max_group_size: parseInt(formData.max_group_size) || null,
                max_adults: parseInt(formData.max_adults) || null,
                max_children: parseInt(formData.max_children) || null,
                child_age_limit: parseInt(formData.child_age_limit) || 12,
                child_price: parseFloat(formData.child_price) || 0,
                meta_title: formData.meta_title,
                meta_description: formData.meta_description,
                is_seasonal_deal: formData.is_seasonal_deal,
                deal_note: formData.deal_note,
                is_active: formData.is_active,
                is_coming_soon: formData.is_coming_soon,
                gallery_images: formData.gallery_images,
                highlights: formData.highlights,
                included: formData.included,
                not_included: formData.not_included,
                cancellation_policy: formData.cancellation_policy,
                terms_and_conditions: formData.terms_and_conditions,
                meal_plans: formData.meal_plans,
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

            const { error: deleteError } = await supabase
                .from('service_categories')
                .delete()
                .eq('service_id', serviceId);
            if (deleteError) throw deleteError;

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
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/services')}
                    className="group flex items-center gap-3 text-gray-400 hover:text-brand-red transition-all font-black uppercase tracking-widest text-[10px]"
                >
                    <div className="p-2 border border-slate-300 rounded-xl group-hover:bg-red-50 group-hover:border-red-100 transition-all">
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
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-red to-red-400 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                    <Card className="relative bg-white border border-slate-300 shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden">
                        <div className="h-40 bg-brand-charcoal relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-red/20 to-transparent"></div>
                        </div>
                        <CardContent className="px-10 pb-10 relative">
                            <div className="flex flex-col md:flex-row items-end gap-8 -mt-20">
                                <div className="relative group/photo flex-shrink-0">
                                    <div className="w-56 h-56 rounded-3xl border-[6px] border-white shadow-2xl bg-gray-50 overflow-hidden relative">
                                        <ImageUpload
                                            value={formData.image_url}
                                            onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                                            folder="services"
                                            aspectRatio="aspect-square"
                                            showUrlInput={false}
                                            placeholder="Service Photo"
                                        />
                                    </div>
                                    <div className={`absolute bottom-4 -right-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg border-2 border-white z-10 ${formData.status === 'In Stock' ? 'bg-green-500 text-white' :
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
                                        disabled={formLoading}
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
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-300">
                            <div 
                                className="flex items-center justify-between cursor-pointer group/header"
                                onClick={() => toggleSection('identity')}
                            >
                                <h3 className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-[0.2em]">
                                    <Tag size={16} className="text-brand-red" /> Service Identity
                                </h3>
                                <div className="p-2 rounded-xl bg-gray-50 group-hover/header:bg-red-50 text-gray-400 group-hover/header:text-brand-red transition-all">
                                    {collapsedSections.identity ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                                </div>
                            </div>

                            {!collapsedSections.identity && (
                                <div className="space-y-6 mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Listing Title</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="w-full px-6 py-4 bg-gray-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-black text-lg"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Premium VIP Lounge Access"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Service Categories (Select Multiple)</label>
                                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-4 bg-gray-50 border border-slate-300 rounded-2xl custom-scrollbar">
                                            {categories.map(cat => (
                                                <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                                                    <div className="relative flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            className="peer h-5 w-5 appearance-none border-2 border-slate-300 rounded-lg checked:bg-brand-red checked:border-brand-red transition-all cursor-pointer"
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
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Secondary Image Vector (Optional Selection)</label>
                                        <div className="min-h-[128px]">
                                            <ImageUpload
                                                value={formData.secondary_image_url}
                                                onChange={(url) => setFormData(prev => ({ ...prev, secondary_image_url: url }))}
                                                folder="services"
                                                aspectRatio="aspect-[3/1]"
                                                placeholder="Secondary Image"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Geographic Region</label>
                                        <select
                                            name="region"
                                            className="w-full px-6 py-4 bg-gray-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm cursor-pointer"
                                            value={formData.region}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Mauritius">Mauritius (General)</option>
                                            <option value="North">North Mauritius</option>
                                            <option value="South">South Mauritius</option>
                                            <option value="East">East Mauritius</option>
                                            <option value="West">West Mauritius</option>
                                            <option value="Central">Central Mauritius</option>
                                            <option value="North-West">North-West Mauritius</option>
                                            <option value="South-West">South-West Mauritius</option>
                                            <option value="Rodrigues">Rodrigues</option>
                                            <option value="Reunion">Reunion</option>
                                            <option value="Seychelles">Seychelles</option>
                                            <option value="International">International</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Activity Classification</label>
                                        <select
                                            name="service_type"
                                            className="w-full px-6 py-4 bg-gray-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm"
                                            value={formData.service_type}
                                            onChange={handleInputChange}
                                        >
                                            <option value="day_package">Day Package</option>
                                            <option value="hotel">Hotel</option>
                                            <option value="restaurant">Restaurant</option>
                                            <option value="spa">Spa & Wellness</option>
                                            <option value="cruise">Cruise</option>
                                            <option value="tour">Tour</option>
                                            <option value="activity">General Activity</option>
                                            <option value="land_activity">Land activity</option>
                                            <option value="sea_activity">Sea activity</option>
                                            <option value="lounge">Airport Lounge</option>
                                            <option value="transfer">Transfer</option>
                                            <option value="flight">Flight</option>
                                            <option value="visa">Visa Service</option>
                                            <option value="corporate">Corporate Service</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Specific Location / Area</label>
                                        <input
                                            type="text"
                                            name="location"
                                            className="w-full px-6 py-4 bg-gray-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Grand Baie, North"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Adult Base Price (MUR)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            className="w-full px-6 py-4 bg-gray-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Child Price (MUR) - Optional</label>
                                        <input
                                            type="number"
                                            name="child_price"
                                            className="w-full px-6 py-4 bg-gray-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm"
                                            value={formData.child_price}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Card Teaser (Short Description)</label>
                                        <textarea
                                            name="short_description"
                                            rows={2}
                                            className="w-full px-6 py-4 bg-gray-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-sm font-bold resize-none leading-tight"
                                            value={formData.short_description}
                                            onChange={handleInputChange}
                                            placeholder="Catchy one-liner for search results and cards..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Detailed Narrative</label>
                                        <textarea
                                            name="description"
                                            rows={4}
                                            className="w-full px-6 py-4 bg-gray-50 border border-slate-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-sm font-medium resize-none leading-relaxed"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Describe the inclusions, terms, and luxury standards of this service..."
                                        />
                                    </div>
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
                                            className="grow px-6 py-3 bg-gray-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-xs font-bold"
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
                            )}
                        </section>

                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-300">
                            <div 
                                className="flex items-center justify-between cursor-pointer group/header"
                                onClick={() => toggleSection('narrative')}
                            >
                                <h3 className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-[0.2em]">
                                    <Package size={16} className="text-brand-red" /> Experience Narrative & Inclusions
                                </h3>
                                <div className="p-2 rounded-xl bg-gray-50 group-hover/header:bg-red-50 text-gray-400 group-hover/header:text-brand-red transition-all">
                                    {collapsedSections.narrative ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                                </div>
                            </div>

                            {!collapsedSections.narrative && (
                                <div className="space-y-8 mt-8 animate-in fade-in slide-in-from-top-2 duration-300">

                            <div className="space-y-8">
                                {/* Highlights */}
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Key Highlights (Scrollable List)</label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {(formData.highlights || []).map((h, i) => (
                                            <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 border border-green-100 rounded-xl text-[10px] font-black uppercase tracking-widest animate-in zoom-in-95 duration-200">
                                                {h}
                                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, highlights: prev.highlights.filter((_, idx) => idx !== i) }))} className="hover:text-green-700">
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            id="new_highlight"
                                            placeholder="e.g. Private Beach Access"
                                            className="grow px-6 py-3 bg-gray-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-xs font-bold"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (e.target.value) {
                                                        setFormData(prev => ({ ...prev, highlights: [...(prev.highlights || []), e.target.value] }));
                                                        e.target.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Included */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">What&apos;s Included</label>
                                        <div className="space-y-2 mb-3 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                            {(formData.included || []).map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl group">
                                                    <span className="text-[11px] font-bold text-gray-600">{item}</span>
                                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, included: prev.included.filter((_, idx) => idx !== i) }))} className="text-gray-300 hover:text-brand-red opacity-0 group-hover:opacity-100 transition-all">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Press Enter to add inclusion..."
                                            className="w-full px-6 py-3 bg-gray-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-xs font-bold"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (e.target.value) {
                                                        setFormData(prev => ({ ...prev, included: [...(prev.included || []), e.target.value] }));
                                                        e.target.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Not Included */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">What&apos;s Excluded</label>
                                        <div className="space-y-2 mb-3 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                            {(formData.not_included || []).map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl group">
                                                    <span className="text-[11px] font-bold text-gray-600">{item}</span>
                                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, not_included: prev.not_included.filter((_, idx) => idx !== i) }))} className="text-gray-300 hover:text-brand-red opacity-0 group-hover:opacity-100 transition-all">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Press Enter to add exclusion..."
                                            className="w-full px-6 py-3 bg-gray-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-xs font-bold"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (e.target.value) {
                                                        setFormData(prev => ({ ...prev, not_included: [...(prev.not_included || []), e.target.value] }));
                                                        e.target.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                </div>
                                </div>
                            )}
                        </section>

                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-300">
                            <div 
                                className="flex items-center justify-between cursor-pointer group/header"
                                onClick={() => toggleSection('mealPlans')}
                            >
                                <h3 className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-[0.2em]">
                                    <Utensils size={16} className="text-brand-red" /> Meal Plan Configuration
                                </h3>
                                <div className="flex items-center gap-4">
                                    <Button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFormData(prev => ({ ...prev, meal_plans: [...(prev.meal_plans || []), { id: Date.now().toString(), label: '', price: 0 }] }));
                                        }}
                                        className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-brand-red transition-all"
                                    >
                                        <Plus size={14} className="mr-1" /> Add Plan
                                    </Button>
                                    <div className="p-2 rounded-xl bg-gray-50 group-hover/header:bg-red-50 text-gray-400 group-hover/header:text-brand-red transition-all">
                                        {collapsedSections.mealPlans ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>
                            </div>

                            {!collapsedSections.mealPlans && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                {(formData.meal_plans || []).map((meal, idx) => (
                                    <div key={meal.id} className="p-6 bg-gray-50 border border-slate-200 rounded-2xl space-y-4 relative group">
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData(prev => ({ ...prev, meal_plans: prev.meal_plans.filter((_, i) => i !== idx) }))}
                                            className="absolute top-4 right-4 text-gray-300 hover:text-brand-red opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <X size={16} />
                                        </button>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="col-span-2">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Plan Name</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red font-bold text-xs"
                                                    value={meal.label}
                                                    onChange={(e) => {
                                                        const updated = [...formData.meal_plans];
                                                        updated[idx].label = e.target.value;
                                                        setFormData(prev => ({ ...prev, meal_plans: updated }));
                                                    }}
                                                    placeholder="e.g. Half Board"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Price/Pax</label>
                                                <input
                                                    type="number"
                                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red font-black text-xs"
                                                    value={meal.price}
                                                    onChange={(e) => {
                                                        const updated = [...formData.meal_plans];
                                                        updated[idx].price = parseFloat(e.target.value) || 0;
                                                        setFormData(prev => ({ ...prev, meal_plans: updated }));
                                                    }}
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(formData.meal_plans || []).length === 0 && (
                                    <div className="col-span-2 text-center py-6 text-gray-400 font-bold uppercase text-[10px] tracking-widest border border-dashed border-slate-200 rounded-2xl">
                                        No Meal Plans defined for this service
                                    </div>
                                )}
                            </div>
                        )}
                        </section>

                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-300">
                            <div 
                                className="flex items-center justify-between cursor-pointer group/header"
                                onClick={() => toggleSection('policies')}
                            >
                                <h3 className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-[0.2em]">
                                    <Info size={16} className="text-brand-red" /> Policies & Legal
                                </h3>
                                <div className="p-2 rounded-xl bg-gray-50 group-hover/header:bg-red-50 text-gray-400 group-hover/header:text-brand-red transition-all">
                                    {collapsedSections.policies ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                                </div>
                            </div>
                            
                            {!collapsedSections.policies && (
                                <div className="space-y-6 mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Cancellation Policy</label>
                                    <textarea
                                        name="cancellation_policy"
                                        rows={3}
                                        className="w-full px-6 py-4 bg-gray-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-sm font-medium resize-none leading-relaxed"
                                        value={formData.cancellation_policy}
                                        onChange={handleInputChange}
                                        placeholder="Outline the rules for refund and cancellation..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Terms & Conditions (Service Specific)</label>
                                    <textarea
                                        name="terms_and_conditions"
                                        rows={3}
                                        className="w-full px-6 py-4 bg-gray-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-sm font-medium resize-none leading-relaxed"
                                        value={formData.terms_and_conditions}
                                        onChange={handleInputChange}
                                        placeholder="Specify specific conditions for this service (e.g. age restrictions, dress code)..."
                                    />
                                </div>
                                </div>
                            )}
                        </section>


                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-300">
                            <div 
                                className="flex items-center justify-between cursor-pointer group/header"
                                onClick={() => toggleSection('promotional')}
                            >
                                <h3 className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-[0.2em]">
                                    <Tag size={16} className="text-brand-red" /> Promotional Strategy
                                </h3>
                                <div className="p-2 rounded-xl bg-gray-50 group-hover/header:bg-red-50 text-gray-400 group-hover/header:text-brand-red transition-all">
                                    {collapsedSections.promotional ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                                </div>
                            </div>

                            {!collapsedSections.promotional && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="p-6 bg-red-50/50 rounded-2xl border border-red-100 flex items-center justify-between group">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-brand-red uppercase tracking-widest leading-none">Seasonal Deal</p>
                                        <p className="text-[9px] text-gray-400 font-bold">Feature in Homepage Deals Carousel</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, is_seasonal_deal: !p.is_seasonal_deal }))}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.is_seasonal_deal ? 'bg-brand-red' : 'bg-gray-300'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_seasonal_deal ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                <div className={`transition-all duration-500 ${formData.is_seasonal_deal ? 'opacity-100 translate-y-0' : 'opacity-40 pointer-events-none'}`}>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Promo Badge Note</label>
                                    <input
                                        type="text"
                                        name="deal_note"
                                        className="w-full px-6 py-4 bg-gray-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm"
                                        value={formData.deal_note}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Limited Time, 20% OFF"
                                        disabled={!formData.is_seasonal_deal}
                                    />
                                </div>
                                </div>
                            )}
                        </section>

                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-300">
                            <div 
                                className="flex items-center justify-between cursor-pointer group/header"
                                onClick={() => toggleSection('seo')}
                            >
                                <h3 className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-[0.2em]">
                                    <Globe size={16} className="text-brand-red" /> Search Engine Optimization
                                </h3>
                                <div className="p-2 rounded-xl bg-gray-50 group-hover/header:bg-red-50 text-gray-400 group-hover/header:text-brand-red transition-all">
                                    {collapsedSections.seo ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                                </div>
                            </div>

                            {!collapsedSections.seo && (
                                <div className="space-y-6 mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Meta Title (Custom Title Tag)</label>
                                    <input
                                        type="text"
                                        name="meta_title"
                                        className="w-full px-6 py-4 bg-gray-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-bold text-sm"
                                        value={formData.meta_title}
                                        onChange={handleInputChange}
                                        placeholder="Defaults to Service Name..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Meta Description</label>
                                    <textarea
                                        name="meta_description"
                                        rows={2}
                                        className="w-full px-6 py-4 bg-gray-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all text-sm font-medium resize-none shadow-inner"
                                        value={formData.meta_description}
                                        onChange={handleInputChange}
                                        placeholder="Search engine snippet description..."
                                    />
                                </div>
                                </div>
                            )}
                        </section>

                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-300">
                            <div 
                                className="flex items-center justify-between cursor-pointer group/header"
                                onClick={() => toggleSection('gallery')}
                            >
                                <h3 className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-[0.2em]">
                                    <Camera size={16} className="text-brand-red" /> Multi-Image Experience Gallery
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className="text-[10px] text-gray-300 font-black uppercase tracking-widest">{formData.gallery_images?.length || 0} / 10 ASSETS</div>
                                    <div className="p-2 rounded-xl bg-gray-50 group-hover/header:bg-red-50 text-gray-400 group-hover/header:text-brand-red transition-all">
                                        {collapsedSections.gallery ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>
                            </div>

                            {!collapsedSections.gallery && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-4">
                                    <ImageUpload
                                        label="Push to Gallery"
                                        value=""
                                        onChange={addGalleryImage}
                                        folder="services"
                                        aspectRatio="aspect-video"
                                        placeholder="Click or Drop to Add Gallery Photo"
                                        showUrlInput={false}
                                    />
                                    <div className="p-4 bg-gray-50 border border-slate-300 border-dashed rounded-2xl">
                                        <p className="text-[9px] text-gray-400 font-bold leading-relaxed uppercase tracking-widest text-center">
                                            Images will be used in the premium carousel for this service.
                                        </p>
                                    </div>
                                </div>

                                <div className="overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
                                    <div className="grid grid-cols-2 gap-4">
                                        {(formData.gallery_images || []).map((img, i) => (
                                            <div key={i} className="relative group/gal aspect-video rounded-2xl overflow-hidden border border-slate-300 shadow-sm">
                                                <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeGalleryImage(img)}
                                                    className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover/gal:opacity-100 transition-opacity flex items-center justify-center"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>
                                        ))}
                                        {(!formData.gallery_images || formData.gallery_images.length === 0) && (
                                            <div className="col-span-2 py-10 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 text-gray-300">
                                                <Camera size={32} className="opacity-20 mb-2" />
                                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Empty Portfolio</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                </div>
                            )}
                        </section>



                        {formData.category_ids.some(id => categories.find(c => c.id === id)?.name === 'Hotels') && (
                            <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-300">
                                <div 
                                    className="flex items-center justify-between cursor-pointer group/header"
                                    onClick={() => toggleSection('accommodation')}
                                >
                                    <h3 className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-[0.2em]">
                                        <BedDouble size={16} className="text-brand-red" /> Accommodation & Pricing
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addRoomType();
                                            }}
                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-red hover:text-red-700 transition-colors"
                                        >
                                            <Plus size={14} /> Add Room Type
                                        </button>
                                        <div className="p-2 rounded-xl bg-gray-50 group-hover/header:bg-red-50 text-gray-400 group-hover/header:text-brand-red transition-all">
                                            {collapsedSections.accommodation ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                                        </div>
                                    </div>
                                </div>

                                {!collapsedSections.accommodation && (
                                    <div className="space-y-6 mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {formData.room_types.length === 0 ? (
                                        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-300">
                                            <BedDouble size={48} className="mb-2 opacity-20" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No room types defined</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {formData.room_types.map((rt, idx) => (
                                                <div key={idx} className="p-6 bg-gray-50/50 rounded-3xl border border-slate-300 space-y-6 relative group/rt">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRoomType(idx)}
                                                        className="absolute top-4 right-4 text-gray-300 hover:text-brand-red transition-colors opacity-0 group-hover/rt:opacity-100"
                                                    >
                                                        <X size={16} />
                                                    </button>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-300">
                                                        <div>
                                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Room Type Name</label>
                                                            <input
                                                                type="text"
                                                                placeholder="e.g. Ocean View Suite"
                                                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                                                                value={rt.type}
                                                                onChange={e => updateRoomType(idx, 'type', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Minimum Stay (Days)</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                placeholder="e.g. 1"
                                                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                                                                value={rt.min_stay || 1}
                                                                onChange={e => updateRoomType(idx, 'min_stay', parseInt(e.target.value) || 1)}
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                                            <div>
                                                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">ROOM ADULTS MAX</label>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                                                                    value={rt.max_adults || 2}
                                                                    onChange={e => updateRoomType(idx, 'max_adults', parseInt(e.target.value) || 2)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">ROOM KIDS MAX</label>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                                                                    value={rt.max_children || 0}
                                                                    onChange={e => updateRoomType(idx, 'max_children', parseInt(e.target.value) || 0)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">ROOM CHILD AGE LIMIT</label>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
                                                                    value={rt.child_age_limit || 12}
                                                                    onChange={e => updateRoomType(idx, 'child_age_limit', parseInt(e.target.value) || 12)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-2 space-y-4">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                <ImageUpload
                                                                    label="Main Room Photo"
                                                                    value={rt.image_url || ''}
                                                                    onChange={url => updateRoomType(idx, 'image_url', url)}
                                                                    folder="services"
                                                                    aspectRatio="aspect-video"
                                                                    placeholder="Upload Room Main Photo"
                                                                />
                                                                
                                                                <div>
                                                                    <div className="flex items-center justify-between mb-1.5 ml-1">
                                                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Room Gallery</label>
                                                                        <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest">{(rt.images || []).length} / 10 Assets</span>
                                                                    </div>
                                                                    <div className="flex flex-col gap-3">
                                                                        <div className="flex gap-2">
                                                                            <input
                                                                                type="text"
                                                                                id={`new_room_image_${idx}`}
                                                                                placeholder="Paste manual image URL..."
                                                                                className="min-w-0 grow px-4 py-3 bg-gray-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
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
                                                                                onClick={() => {
                                                                                    const input = document.getElementById(`new_room_image_${idx}`);
                                                                                    if (input.value) {
                                                                                        addRoomImage(idx, input.value);
                                                                                        input.value = '';
                                                                                    }
                                                                                }}
                                                                                className="shrink-0 px-4 py-3 bg-brand-charcoal text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                                                                            >
                                                                                Add
                                                                            </Button>
                                                                        </div>
                                                                        
                                                                        <div className="border border-slate-300 rounded-xl p-3 bg-gray-50/50 border-dashed">
                                                                            <ImageUpload
                                                                                value=""
                                                                                onChange={url => addRoomImage(idx, url)}
                                                                                folder="services"
                                                                                aspectRatio="aspect-[4/1]"
                                                                                showUrlInput={false}
                                                                                placeholder="Click here to upload gallery assets one by one"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-wrap gap-3 mt-2">
                                                                {(rt.images || []).map((imgUrl, imgIdx) => (
                                                                    <div key={imgIdx} className="relative group/img w-20 h-20 rounded-xl overflow-hidden border border-slate-300 shadow-sm">
                                                                        <img src={imgUrl} alt={`Room ${idx} image ${imgIdx}`} className="w-full h-full object-cover" />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeRoomImage(idx, imgUrl)}
                                                                            className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"
                                                                        >
                                                                            <X size={14} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                {(!rt.images || rt.images.length === 0) && (
                                                                    <div className="flex items-center justify-center w-20 h-20 rounded-xl border-2 border-dashed border-gray-100 text-gray-300">
                                                                        <Camera size={20} className="opacity-20" />
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
                                                                    : 'bg-gray-100 border-slate-300 text-gray-400'
                                                                    }`}
                                                            >
                                                                {rt.available ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                                                <span className="text-[10px] font-black uppercase tracking-widest">{rt.available ? 'Rentable' : 'Rent Stopped'}</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4 pb-6 border-b border-slate-300">
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
                                                                className="grow px-4 py-2 bg-white border border-slate-300 rounded-xl text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-brand-red"
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
                                                                    className="w-20 px-2 py-1 bg-white border border-slate-300 rounded text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-brand-red"
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
                                                                        className="w-full px-1 py-3 bg-white border border-slate-300 rounded-xl text-[11px] font-black text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-brand-red transition-all"
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
                            )}
                            </section>
                        )}

                        {formData.category_ids.some(id => {
                            const cat = categories.find(c => c.id === id);
                            return cat && (cat.name === 'Activities' || cat.name === 'Cruises' || cat.name === 'Group Tours');
                        }) && (
                                <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-300">
                                    <div 
                                        className="flex items-center justify-between cursor-pointer group/header"
                                        onClick={() => toggleSection('itinerary')}
                                    >
                                        <h3 className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-[0.2em]">
                                            <Calendar size={16} className="text-brand-red" /> Itinerary & Schedule
                                        </h3>
                                        <div className="flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addItineraryDay();
                                                }}
                                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-red hover:text-red-700 transition-colors"
                                            >
                                                <Plus size={14} /> Add Day/Stop
                                            </button>
                                            <div className="p-2 rounded-xl bg-gray-50 group-hover/header:bg-red-50 text-gray-400 group-hover/header:text-brand-red transition-all">
                                                {collapsedSections.itinerary ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                                            </div>
                                        </div>
                                    </div>

                                    {!collapsedSections.itinerary && (
                                        <div className="space-y-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                        {formData.itinerary.length === 0 ? (
                                            <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-300">
                                                <Calendar size={48} className="mb-2 opacity-20" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">No itinerary defined</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {formData.itinerary.map((it, idx) => (
                                                    <div key={idx} className="p-6 bg-gray-50/50 rounded-2xl border border-slate-300 flex gap-6 relative group/it">
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
                                                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-[10px] font-black uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-red"
                                                                value={it.day}
                                                                onChange={e => updateItineraryDay(idx, 'day', e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="flex-1 space-y-4">
                                                            <div className="flex flex-col md:flex-row gap-4">
                                                                <div className="flex-1">
                                                                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Stop Title / Highlight</label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="e.g. Arrival at Blue Bay Marine Park"
                                                                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-red"
                                                                        value={it.title}
                                                                        onChange={e => updateItineraryDay(idx, 'title', e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="w-full md:w-48 h-20">
                                                                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Stop Illustration</label>
                                                                    <ImageUpload
                                                                        value={it.image_url}
                                                                        onChange={url => updateItineraryDay(idx, 'image_url', url)}
                                                                        folder="itineraries"
                                                                        aspectRatio="aspect-video"
                                                                        showUrlInput={false}
                                                                        placeholder="Add Image"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Stop Description</label>
                                                                <textarea
                                                                    rows={2}
                                                                    placeholder="Details about the stop, highlights, or inclusions..."
                                                                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-[11px] font-medium leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-brand-red"
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
                                )}
                                </section>
                            )}
                    </div>

                    <div className="lg:col-span-1 space-y-8">
                        <section className="bg-brand-charcoal text-white p-8 rounded-3xl shadow-xl shadow-gray-200 space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 text-white/5 -translate-y-4 translate-x-4">
                                <DollarSign size={120} />
                            </div>

                            <h3 className="flex items-center gap-2 text-xs font-black text-brand-red uppercase tracking-[0.2em] mb-4 relative z-10">
                                Pricing & Capacity
                            </h3>

                            <div className="space-y-6 relative z-10">
                                <div className="pt-4 border-t border-white/5">

                                    <div className="flex items-center justify-between px-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Featured Status</label>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, featured: !prev.featured }))}
                                            className={`p-1.5 rounded-xl transition-all ${formData.featured ? 'bg-brand-red text-white' : 'bg-white/10 text-gray-500 hover:bg-white/20'}`}
                                        >
                                            {formData.featured ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between px-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Listing</label>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                                            className={`p-1.5 rounded-xl transition-all ${formData.is_active ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-500 hover:bg-white/20'}`}
                                        >
                                            {formData.is_active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between px-2 mt-4">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Coming Soon Label</label>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, is_coming_soon: !prev.is_coming_soon }))}
                                            className={`p-1.5 rounded-xl transition-all ${formData.is_coming_soon ? 'bg-amber-500 text-white' : 'bg-white/10 text-gray-500 hover:bg-white/20'}`}
                                        >
                                            {formData.is_coming_soon ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                        </button>
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Sorting Priority</label>
                                        <input
                                            type="number"
                                            name="priority"
                                            className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-red transition-all font-black text-white text-center"
                                            value={formData.priority}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                        />
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

                <div className="flex justify-end gap-4 p-8 bg-gray-50/50 rounded-3xl border border-slate-300 border-dashed">
                    <button
                        type="button"
                        onClick={() => navigate('/services')}
                        className="px-8 py-3 text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all font-black"
                    >
                        Cancel
                    </button>
                    <Button
                        type="submit"
                        disabled={formLoading}
                        className="bg-brand-red text-white px-12 py-4 rounded-2xl shadow-xl shadow-red-100 flex items-center gap-3 font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all outline-none border-none ring-0 focus:ring-0 active:ring-0"
                    >
                        {formLoading && <Loader2 size={16} className="animate-spin" />}
                        {isEdit ? 'Update Service' : 'Create Service'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateService;
