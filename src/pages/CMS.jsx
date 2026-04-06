import React, { useState, useEffect } from 'react';
import { 
    Save, RefreshCw, Loader2, 
    Type, Layout, ChevronRight, Globe, 
    Info, Home, Phone, HelpCircle, 
    ArrowLeft, Image as ImageIcon, 
    FileText, Layers, Map as MapIcon,
    Search, ExternalLink, Settings,
    Plane, Building2, Anchor, MapPin,
    Menu, BookOpen, ShieldCheck, Mail,
    Compass, Moon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { showAlert } from '../utils/swal';
import ImageUpload from '../components/ImageUpload';

const CMS = () => {
    // UI State
    const [loading, setLoading] = useState(true);
    const [pages, setPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState(null);
    const [sections, setSections] = useState([]);
    const [fetchingSections, setFetchingSections] = useState(false);
    
    // Initial Fetch: Get all available pages
    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        setLoading(true);
        try {
            // 1. Get slugs from content_blocks
            const { data: bBlocks, error: bError } = await supabase
                .from('content_blocks')
                .select('page_slug');
            
            if (bError) throw bError;
            const uniqueSlugs = [...new Set(bBlocks.map(item => item.page_slug))]
                .filter(slug => !/^s\d+$/.test(slug));

            // 2. Get names/links from navigations to provide better labels
            const { data: navs, error: nError } = await supabase
                .from('navigations')
                .select('label, link');
            
            if (nError) throw nError;

            // 3. Map everything
            const mappedPages = uniqueSlugs.map(slug => {
                const nav = navs.find(n => 
                    n.link === `/${slug}` || 
                    n.link === slug || 
                    (slug === 'home' && n.link === '/')
                );
                return {
                    slug: slug,
                    name: nav ? nav.label : formatSlugToName(slug),
                    icon: getIconForPage(slug),
                };
            }).sort((a, b) => a.name.localeCompare(b.name));
            
            setPages(mappedPages);
            
            // Auto-select first page if none selected
            if (mappedPages.length > 0 && !selectedPage) {
                handleSelectPage(mappedPages[0]);
            }
        } catch (error) {
            console.error('Error fetching CMS pages:', error);
            showAlert('Sync Error', 'Failed to scan architectural blocks.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPage = async (page) => {
        setSelectedPage(page);
        setFetchingSections(true);
        try {
            const { data, error } = await supabase
                .from('content_blocks')
                .select('*')
                .eq('page_slug', page.slug)
                .order('section_key', { ascending: true });

            if (error) throw error;
            setSections(data);
        } catch (error) {
            console.error('Error fetching sections:', error);
            showAlert('Mapping Failure', 'Unable to retrieve block definitions.', 'error');
        } finally {
            setFetchingSections(false);
        }
    };

    const formatSlugToName = (slug) => {
        return slug.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const getIconForPage = (slug) => {
        const s = slug.toLowerCase();
        if (s.includes('home')) return <Home size={18} />;
        if (s.includes('about')) return <Info size={18} />;
        if (s.includes('contact')) return <Phone size={18} />;
        if (s.includes('faq')) return <HelpCircle size={18} />;
        if (s.includes('flight')) return <Plane size={18} />;
        if (s.includes('hotel')) return <Building2 size={18} />;
        if (s.includes('cruise')) return <Anchor size={18} />;
        if (s.includes('day-package')) return <MapPin size={18} />;
        if (s.includes('evening-package')) return <Moon size={18} />;
        if (s.includes('dest')) return <MapPin size={18} />;
        if (s.includes('search')) return <Search size={18} />;
        if (s.includes('news')) return <FileText size={18} />;
        if (s.includes('safety')) return <ShieldCheck size={18} />;
        if (s.includes('policy') || s.includes('terms')) return <BookOpen size={18} />;
        return <Compass size={18} />;
    };

    if (loading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center">
                <Loader2 size={48} className="text-red-600 animate-spin mb-4" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Orchestrating CMS Data...</p>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-120px)] -mx-6 -mt-6 bg-slate-50 overflow-hidden">
            {/* COMPACT SIDEBAR */}
            <div className="w-72 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-6 border-bottom border-slate-100 bg-slate-50/50">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Navigation Map</h3>
                    <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">Sitemap</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                    {pages.map(page => (
                        <button
                            key={page.slug}
                            onClick={() => handleSelectPage(page)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                                selectedPage?.slug === page.slug 
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10 scale-[1.02]' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <div className={`transition-colors ${selectedPage?.slug === page.slug ? 'text-red-500' : 'text-slate-300 group-hover:text-red-400'}`}>
                                {page.icon}
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest truncate">{page.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto bg-slate-50/30 p-10 lg:p-16 custom-scrollbar">
                {fetchingSections ? (
                    <div className="h-full flex flex-col items-center justify-center">
                        <Loader2 size={32} className="text-red-600 animate-spin mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Scanning block definitions...</p>
                    </div>
                ) : selectedPage ? (
                    <div className="max-w-4xl mx-auto space-y-12">
                        {/* Header */}
                        <div className="flex flex-col gap-2 mb-10">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-red-600 text-white rounded-2xl shadow-xl shadow-red-600/20">
                                    {selectedPage.icon}
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{selectedPage.name}</h1>
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mt-1">/{selectedPage.slug}</p>
                                </div>
                            </div>
                        </div>

                        {/* Sections List */}
                        <div className="space-y-16">
                            {sections.length === 0 ? (
                                <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No editable sections found for this route.</p>
                                </div>
                            ) : (
                                sections.map(section => (
                                    <SectionEditor 
                                        key={section.id} 
                                        section={section} 
                                        pageSlug={selectedPage.slug}
                                    />
                                ))
                            )}
                        </div>

                        {/* Footer Spacer */}
                        <div className="h-20" />
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-200 mb-6 shadow-xl shadow-slate-200/50">
                            <Layers size={32} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Select an Architectural Route</h3>
                        <p className="text-slate-400 text-sm font-medium">Choose a page from the sitemap sidebar to begin orchestrating its modular content blocks.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

/* --- SUBCOMPONENT: SECTION EDITOR --- */
const SectionEditor = ({ section, pageSlug }) => {
    const [content, setContent] = useState(section.content || {});
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('content_blocks')
                .update({ 
                    content: content, 
                    updated_at: new Date().toISOString() 
                })
                .eq('id', section.id);

            if (error) throw error;
            setHasChanges(false);
            showAlert('Synchronized', `Block [${formatKey(section.section_key)}] has been deployed.`, 'success');
        } catch (error) {
            console.error('CMS_SAVE_ERR:', error);
            showAlert('Deployment Error', error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleContentChange = (key, value) => {
        setContent(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleArrayChange = (key, index, subKey, value) => {
        const newArray = [...(content[key] || [])];
        newArray[index] = { ...newArray[index], [subKey]: value };
        handleContentChange(key, newArray);
    };

    const formatKey = (key) => {
        if (!key) return '';
        return key.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden transition-all hover:shadow-red-900/5 hover:border-red-50">
            {/* Section Banner Header */}
            <div className="bg-slate-50/50 border-b border-slate-100 px-10 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                        <Layers size={18} />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">{formatKey(section.section_key)}</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Architectural Block ID: {section.id.slice(0, 8)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {hasChanges && (
                        <span className="text-[9px] font-black text-red-600 uppercase tracking-widest animate-pulse">Unsaved Modifications</span>
                    )}
                    <Button 
                        onClick={handleSave} 
                        size="sm"
                        disabled={saving || !hasChanges}
                        className={`px-6 h-10 flex items-center gap-2 ${!hasChanges ? 'opacity-50 grayscale' : 'bg-red-600 hover:bg-slate-900 text-white shadow-lg shadow-red-600/20'}`}
                    >
                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        {saving ? 'Saving...' : 'Deploy Block'}
                    </Button>
                </div>
            </div>

            {/* Inputs Grid */}
            <div className="p-10 lg:p-14 space-y-12">
                {Object.entries(content).map(([key, value]) => {
                    const isImage = key.toLowerCase().includes('image') || key.toLowerCase().includes('url') || key.toLowerCase().includes('logo') || key.toLowerCase().includes('icon');
                    const isDescription = key.toLowerCase().includes('desc') || key.toLowerCase().includes('content') || key.toLowerCase().includes('text') || key.toLowerCase().includes('quote');
                    const isArray = Array.isArray(value);

                    if (isArray) {
                        return (
                            <div key={key} className="space-y-8 pt-8 border-t border-slate-50 first:pt-0 first:border-0">
                                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1 h-6 bg-red-600 rounded-full" />
                                        <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">{formatKey(key)} Dataset</h4>
                                    </div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{value.length} Iterations</span>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    {value.map((item, index) => (
                                        <div key={index} className="p-10 bg-slate-50/30 rounded-[2.5rem] border border-slate-100 relative group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100/50">
                                            <div className="absolute top-6 right-8 text-[10px] font-black text-slate-200 group-hover:text-slate-400 transition-colors">
                                                ITEM #{String(index + 1).padStart(2, '0')}
                                            </div>
                                            <div className="grid grid-cols-1 gap-6 pt-2">
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
                                folder={pageSlug || 'global'}
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
    );
};

const InputField = ({ label, value, onChange }) => (
    <div className="space-y-3 group">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-3 transition-colors group-focus-within:text-red-600">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full scale-0 group-focus-within:scale-100 transition-all duration-300"></span>
            {label}
        </label>
        <div className="relative">
            <input
                type="text"
                className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:border-slate-900 focus:outline-none transition-all font-bold text-slate-800 text-sm shadow-sm group-hover:border-slate-200 group-focus-within:shadow-xl group-focus-within:shadow-slate-200/50"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Enter ${label.toLowerCase()}...`}
            />
        </div>
    </div>
);

const TextAreaField = ({ label, value, onChange }) => (
    <div className="space-y-3 group">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-3 transition-colors group-focus-within:text-red-600">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full scale-0 group-focus-within:scale-100 transition-all duration-300"></span>
            {label}
        </label>
        <div className="relative">
            <textarea
                className="w-full px-6 py-5 bg-white border border-slate-100 rounded-3xl focus:border-slate-900 focus:outline-none transition-all font-bold text-slate-800 text-sm h-32 resize-none leading-relaxed shadow-sm group-hover:border-slate-200 group-focus-within:shadow-xl group-focus-within:shadow-slate-200/50"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Detailed ${label.toLowerCase()} content...`}
            />
        </div>
    </div>
);

export default CMS;
