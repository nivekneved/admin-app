import React, { useState, useEffect } from 'react';
import { 
    Save, RefreshCw, Loader2, 
    Type, Layout, ChevronRight, Globe, 
    Info, Home, Phone, HelpCircle, 
    ArrowLeft, Image as ImageIcon, 
    FileText, Layers, Map as MapIcon,
    Search, ExternalLink, Settings,
    Plane, Building2, Anchor, MapPin
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { showAlert } from '../utils/swal';
import ImageUpload from '../components/ImageUpload';

const CMS = () => {
    // UI State
    const [view, setView] = useState('sitemap'); // 'sitemap', 'sections', 'edit'
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Data State
    const [pages, setPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState(null);
    const [sections, setSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState(null);
    const [content, setContent] = useState({});

    // 1. Initial Fetch: Get all available pages (unique slugs)
    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('content_blocks')
                .select('page_slug');
            
            if (error) throw error;
            
            const uniqueSlugs = [...new Set(data.map(item => item.page_slug))].sort();
            const mappedPages = uniqueSlugs.map(slug => ({
                slug: slug,
                name: slug.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                icon: getIconForPage(slug),
                description: `Manage content for the ${slug} page.`
            }));
            
            setPages(mappedPages);
        } catch (error) {
            console.error('Error fetching CMS pages:', error);
            showAlert('Synchronization Error', 'Failed to scan site map architectural blocks.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // 2. Fetch Sections for selected page
    const handleSelectPage = async (page) => {
        setLoading(true);
        setSelectedPage(page);
        try {
            const { data, error } = await supabase
                .from('content_blocks')
                .select('*')
                .eq('page_slug', page.slug)
                .order('section_key', { ascending: true });

            if (error) throw error;
            setSections(data);
            setView('sections');
        } catch (error) {
            console.error('Error fetching sections:', error);
            showAlert('Mapping Failure', 'Unable to retrieve block definitions for this route.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // 3. Select specific section for editing
    const handleEditSection = (section) => {
        setSelectedSection(section);
        setContent(section.content || {});
        setView('edit');
    };

    const handleSave = async () => {
        if (!selectedSection) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('content_blocks')
                .update({ 
                    content: content, 
                    updated_at: new Date().toISOString() 
                })
                .eq('id', selectedSection.id);

            if (error) throw error;

            // Update local state for subsequent edits in same session
            setSections(prev => prev.map(s => s.id === selectedSection.id ? { ...s, content: content } : s));
            
            showAlert('Block Deployed', `Changes to [${formatKey(selectedSection.section_key)}] have been synchronized.`, 'success');
        } catch (error) {
            console.error('CMS_SAVE: Critical failure:', error);
            showAlert('Deployment Interrupted', error.message || 'Check your permissions and network connection.', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Helper functions
    const getIconForPage = (slug) => {
        const s = slug.toLowerCase();
        if (s.includes('home')) return <Home size={40} />;
        if (s.includes('about')) return <Info size={40} />;
        if (s.includes('contact')) return <Phone size={40} />;
        if (s.includes('faq')) return <HelpCircle size={40} />;
        if (s.includes('flight')) return <Plane size={40} />;
        if (s.includes('hotel')) return <Building2 size={40} />;
        if (s.includes('cruise')) return <Anchor size={40} />;
        if (s.includes('dest')) return <MapPin size={40} />;
        if (s.includes('search')) return <Search size={40} />;
        if (s.includes('news')) return <FileText size={40} />;
        return <Layout size={40} />;
    };

    const formatKey = (key) => {
        if (!key) return '';
        return key.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const handleContentChange = (key, value) => {
        setContent(prev => ({ ...prev, [key]: value }));
    };

    const handleArrayChange = (key, index, subKey, value) => {
        const newArray = [...(content[key] || [])];
        newArray[index] = { ...newArray[index], [subKey]: value };
        handleContentChange(key, newArray);
    };

    // Main renderers
    const renderSitemap = () => (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-4">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-2">Architectural Blueprint</span>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">Site Map</h2>
                <p className="text-slate-500 max-w-xl font-medium">Select a primary route to manage its modular content blocks and visual choreography.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.map(page => (
                    <button
                        key={page.slug}
                        onClick={() => handleSelectPage(page)}
                        className="p-8 bg-white border border-slate-100 rounded-[2.5rem] text-left transition-all hover:border-red-100 hover:shadow-2xl hover:shadow-red-900/5 group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-5 transition-transform group-hover:scale-110 group-hover:rotate-12">
                            {page.icon}
                        </div>
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-300 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                            {React.cloneElement(page.icon, { size: 32 })}
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">{page.name}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{page.slug}</p>
                        <div className="mt-6 flex items-center gap-2 text-red-600 font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0">
                            Explore Sections <ChevronRight size={14} />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderSections = () => (
        <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setView('sitemap')}
                    className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em]">Site Map / {selectedPage?.name}</span>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">MODULAR BLOCKS</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {sections.map(section => (
                    <button
                        key={section.id}
                        onClick={() => handleEditSection(section)}
                        className="p-8 bg-white border border-slate-100 rounded-3xl text-left flex items-center justify-between transition-all hover:bg-slate-900 hover:text-white hover:shadow-xl group"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white/10 group-hover:text-white transition-colors">
                                <Layers size={20} />
                            </div>
                            <div>
                                <h3 className="text-[13px] font-black uppercase tracking-[0.1em]">{formatKey(section.section_key)}</h3>
                                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-1">Block ID: {section.id.slice(0, 13)}</p>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:border-white/20 transition-all">
                            <ChevronRight size={18} />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderEditForm = () => (
        <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setView('sections')}
                        className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em]">Sections / {formatKey(selectedSection?.section_key)}</span>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">ORCHESTRATOR</h2>
                    </div>
                </div>

                <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="bg-red-600 hover:bg-red-700 text-white px-10 py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-200 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Synchronizing...' : 'DEPLOY CHANGES'}
                </Button>
            </div>

            <div className="bg-white rounded-[3.5rem] border border-slate-100 p-12 lg:p-20 shadow-2xl shadow-slate-200/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none">
                    <FileText size={400} />
                </div>
                
                <div className="grid grid-cols-1 gap-14 relative z-10">
                    {Object.entries(content).map(([key, value]) => {
                        const isImage = key.toLowerCase().includes('image') || key.toLowerCase().includes('url') || key.toLowerCase().includes('logo') || key.toLowerCase().includes('icon');
                        const isDescription = key.toLowerCase().includes('desc') || key.toLowerCase().includes('content') || key.toLowerCase().includes('text') || key.toLowerCase().includes('quote');
                        const isArray = Array.isArray(value);

                        if (isArray) {
                            return (
                                <div key={key} className="space-y-10 pt-16 border-t border-slate-50 first:pt-0 first:border-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1.5 h-10 bg-red-600 rounded-full"></div>
                                            <h4 className="text-[15px] font-black text-slate-900 uppercase tracking-[0.2em]">{formatKey(key)} Architecture</h4>
                                        </div>
                                        <span className="px-5 py-2 bg-slate-50 text-slate-400 text-[10px] font-black rounded-xl uppercase tracking-widest">{value.length} Iterations</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-8">
                                        {value.map((item, index) => (
                                            <div key={index} className="p-12 bg-slate-50/40 rounded-[3rem] border border-slate-100 relative group transition-all hover:bg-white hover:shadow-2xl hover:shadow-slate-100/50">
                                                <div className="absolute top-8 right-12 w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[11px] font-black text-slate-400 shadow-sm">
                                                    {String(index + 1).padStart(2, '0')}
                                                </div>
                                                <div className="grid grid-cols-1 gap-8 pt-4">
                                                    {Object.keys(item).map(subKey => (
                                                        <InputField 
                                                            key={subKey}
                                                            label={formatKey(subKey)}
                                                            value={item[subKey] || ''}
                                                            onChange={(val) => handleArrayChange(key, index, subKey, val)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        }

                        if (isImage) {
                            return (
                                <ImageUpload
                                    key={key}
                                    label={formatKey(key)}
                                    value={value || ''}
                                    onChange={(url) => handleContentChange(key, url)}
                                    folder={selectedPage?.slug || 'global'}
                                    aspectRatio={key.includes('hero') ? 'aspect-[21/9]' : 'aspect-square'}
                                />
                            );
                        }

                        if (isDescription) {
                            return (
                                <TextAreaField 
                                    key={key}
                                    label={formatKey(key)}
                                    value={value || ''}
                                    onChange={(val) => handleContentChange(key, val)}
                                />
                            );
                        }

                        return (
                            <InputField 
                                key={key}
                                label={formatKey(key)}
                                value={value || ''}
                                onChange={(val) => handleContentChange(key, val)}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );

    if (loading && view === 'sitemap') {
        return (
            <div className="py-40 flex flex-col items-center">
                <div className="w-24 h-24 relative mb-8">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Initializing Site Map Architect...</h3>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/30 -mt-6 -mx-6 p-10 lg:p-16">
            <div className="max-w-7xl mx-auto">
                {view === 'sitemap' && renderSitemap()}
                {view === 'sections' && renderSections()}
                {view === 'edit' && renderEditForm()}
            </div>
        </div>
    );
};

const InputField = ({ label, value, onChange }) => (
    <div className="space-y-4 group">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-3 transition-colors group-focus-within:text-red-600">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full scale-0 group-focus-within:scale-100 transition-all duration-300"></span>
            {label}
        </label>
        <div className="relative">
            <input
                type="text"
                className="w-full px-8 py-5 bg-white border-2 border-slate-50 rounded-3xl focus:border-slate-900 focus:outline-none transition-all font-bold text-slate-800 text-sm shadow-sm group-hover:border-slate-200 group-focus-within:shadow-2xl group-focus-within:shadow-slate-200"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Enter ${label.toLowerCase()}...`}
            />
        </div>
    </div>
);

const TextAreaField = ({ label, value, onChange }) => (
    <div className="space-y-4 group">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-3 transition-colors group-focus-within:text-red-600">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full scale-0 group-focus-within:scale-100 transition-all duration-300"></span>
            {label}
        </label>
        <div className="relative">
            <textarea
                className="w-full px-8 py-6 bg-white border-2 border-slate-50 rounded-[2.5rem] focus:border-slate-900 focus:outline-none transition-all font-bold text-slate-800 text-sm h-48 resize-none leading-relaxed shadow-sm group-hover:border-slate-200 group-focus-within:shadow-2xl group-focus-within:shadow-slate-200"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Detailed ${label.toLowerCase()} content...`}
            />
        </div>
    </div>
);

export default CMS;
