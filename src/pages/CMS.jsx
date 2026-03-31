import React, { useState, useEffect } from 'react';
import { 
    Save, RefreshCw, Loader2, 
    Type, Layout, ChevronRight, Globe, 
    Info
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { showAlert } from '../utils/swal';
import ImageUpload from '../components/ImageUpload';

const CMS = () => {
    const [loading, setLoading] = useState(true);
    const [pagesLoading, setPagesLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [pages, setPages] = useState([]);
    const [activePage, setActivePage] = useState('');
    const [sections, setSections] = useState([]);
    const [activeSection, setActiveSection] = useState(null);
    const [content, setContent] = useState({});

    // Fetch unique pages on mount
    useEffect(() => {
        const fetchPages = async () => {
            setPagesLoading(true);
            try {
                // Get unique page_slugs
                const { data, error } = await supabase
                    .from('content_blocks')
                    .select('page_slug');
                
                if (error) throw error;
                
                const uniqueSlugs = [...new Set(data.map(item => item.page_slug))].sort();
                const mappedPages = uniqueSlugs.map(slug => ({
                    id: slug,
                    name: slug.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Page',
                    icon: getIconForPage(slug)
                }));
                
                setPages(mappedPages);
                if (mappedPages.length > 0 && !activePage) {
                    setActivePage(mappedPages[0].id);
                }
            } catch (error) {
                console.error('Error fetching CMS pages:', error);
                showAlert('Error', 'Failed to load pages', 'error');
            } finally {
                setPagesLoading(false);
            }
        };
        fetchPages();
    }, []);

    // Fetch sections when activePage changes
    useEffect(() => {
        if (activePage) {
            fetchSections();
        }
    }, [activePage]);

    const fetchSections = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('content_blocks')
                .select('*')
                .eq('page_slug', activePage)
                .order('section_key', { ascending: true });

            if (error) throw error;
            
            setSections(data);
            if (data.length > 0) {
                const firstSection = data[0];
                setActiveSection(firstSection.section_key);
                setContent(firstSection.content || {});
            } else {
                setActiveSection(null);
                setContent({});
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
            showAlert('Error', 'Failed to load page sections', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getIconForPage = (slug) => {
        if (slug.includes('home')) return <Layout size={18} />;
        if (slug.includes('about')) return <Info size={18} />;
        if (slug.includes('contact')) return <Globe size={18} />;
        if (slug.includes('faq')) return <Type size={18} />;
        return <Layout size={18} />;
    };

    const formatKey = (key) => {
        if (!key) return '';
        return key.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const handleContentChange = (key, value) => {
        setContent(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleArrayChange = (key, index, subKey, value) => {
        const newArray = [...(content[key] || [])];
        newArray[index] = { ...newArray[index], [subKey]: value };
        handleContentChange(key, newArray);
    };

    const handleSave = async () => {
        if (!activeSection) return;
        setSaving(true);
        try {
            const block = sections.find(s => s.section_key === activeSection);
            if (!block) throw new Error('No active section to save');

            // 1. Audit current state
            console.log(`CMS_SAVE: Attempting to update ${activePage}/${activeSection}`);

            const { data, error } = await supabase
                .from('content_blocks')
                .update({ 
                    content: content, 
                    updated_at: new Date().toISOString() 
                })
                .eq('id', block.id)
                .select();

            if (error) {
                console.error('CMS_SAVE: Database error:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                throw new Error('Update successful but check returned no rows. Maybe policy violation.');
            }
            
            setSections(prev => prev.map(s => s.id === block.id ? { ...s, content: content } : s));
            
            showAlert('Synchronization Success', `Section [${formatKey(activeSection)}] has been deployed to production.`, 'success');
        } catch (error) {
            console.error('CMS_SAVE: Critical failure:', error);
            showAlert('Deployment Failed', error.message || 'Check your permissions and network connection.', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (pagesLoading) {
        return (
            <div className="py-20 flex flex-col items-center">
                <Loader2 className="animate-spin text-brand-red mb-4" size={48} />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Initializing CMS Interface...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen -mt-6 -mx-6 bg-slate-50">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-10 py-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                        <Layout size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">CMS Orchestrator</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Connection</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button 
                        onClick={fetchSections} 
                        variant="soft" 
                        className="rounded-xl border border-gray-100 bg-white shadow-sm px-4 py-4"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={saving || !activeSection}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-200 transition-all flex items-center gap-3"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Syncing...' : 'Deploy Changes'}
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* 1. Page & Section Menu (Combined Sidebar) */}
                <aside className="w-80 border-r border-gray-100 bg-white flex flex-col pt-8">
                    <div className="px-8 mb-6">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Architectural View</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 space-y-8 pb-10">
                        {/* Page Selection */}
                        <div className="space-y-2">
                             <div className="px-4 text-[9px] font-bold text-red-500 uppercase tracking-widest bg-red-50 py-1.5 rounded-lg mb-4">Site Maps</div>
                             {pages.map(page => (
                                <div key={page.id} className="space-y-1">
                                    <button
                                        onClick={() => setActivePage(page.id)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                                            activePage === page.id 
                                            ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                                            : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {page.icon}
                                            <span className="text-[10px] font-black uppercase tracking-tight">{page.name}</span>
                                        </div>
                                        {activePage === page.id && <ChevronRight size={14} className="text-slate-400" />}
                                    </button>
                                    
                                    {/* Inline sections if active */}
                                    {activePage === page.id && (
                                        <div className="ml-4 pl-4 border-l-2 border-slate-100 py-2 space-y-1 mt-2 mb-4 animate-in slide-in-from-left-2 duration-300">
                                            {sections.length > 0 ? sections.map(section => (
                                                <button
                                                    key={section.id}
                                                    onClick={() => {
                                                        setActiveSection(section.section_key);
                                                        setContent(section.content || {});
                                                    }}
                                                    className={`w-full text-left py-2.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${
                                                        activeSection === section.section_key 
                                                        ? 'bg-red-50 text-red-600 border border-red-100 shadow-sm' 
                                                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {formatKey(section.section_key)}
                                                </button>
                                            )) : (
                                                <p className="text-[8px] text-slate-300 uppercase px-3 italic">Empty Map</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                             ))}
                        </div>
                    </div>
                </aside>

                {/* 2. Editor Canvas */}
                <main className="flex-1 overflow-y-auto p-12 lg:p-20 bg-slate-50/50">
                    <div className="max-w-4xl mx-auto">
                        {!activeSection ? (
                            <div className="py-32 flex flex-col items-center justify-center text-center opacity-50 grayscale">
                                <div className="w-24 h-24 bg-white rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center mb-6 shadow-xl shadow-slate-100">
                                    <Layout size={32} className="text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tighter">No Block Selected</h3>
                                <p className="text-sm text-slate-500 max-w-xs font-medium">Please select a map and specific block from the left to begin orchestration.</p>
                            </div>
                        ) : (
                            <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500 pb-20">
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em]">Section Configuration</span>
                                    <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-none uppercase italic">
                                        {formatKey(activeSection)}
                                    </h2>
                                    <div className="flex items-center gap-4 mt-6 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm inline-flex w-fit">
                                        <div className="flex flex-col px-2">
                                            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Target Map</span>
                                            <span className="text-[10px] font-black text-slate-700 uppercase">{activePage}</span>
                                        </div>
                                        <div className="w-px h-6 bg-slate-100"></div>
                                        <div className="flex flex-col px-2">
                                            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Block Identification</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight font-mono">{sections.find(s => s.section_key === activeSection)?.id.slice(0, 12)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-[3rem] border border-gray-100 p-12 lg:p-16 shadow-2xl shadow-slate-200/50">
                                    <div className="grid grid-cols-1 gap-12">
                                        {Object.entries(content).map(([key, value]) => {
                                            const isImage = key.toLowerCase().includes('image') || key.toLowerCase().includes('url') || key.toLowerCase().includes('logo') || key.toLowerCase().includes('icon');
                                            const isDescription = key.toLowerCase().includes('desc') || key.toLowerCase().includes('content') || key.toLowerCase().includes('text') || key.toLowerCase().includes('quote');
                                            const isArray = Array.isArray(value);

                                            if (isArray) {
                                                return (
                                                    <div key={key} className="space-y-8 pt-10 border-t border-slate-50 first:pt-0 first:border-0">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-2 h-8 bg-red-600 rounded-full"></div>
                                                                <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em]">{formatKey(key)} Library</h4>
                                                            </div>
                                                            <span className="p-2 px-4 bg-slate-50 text-slate-400 text-[10px] font-black rounded-xl uppercase tracking-widest">{value.length} Items</span>
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-6">
                                                            {value.map((item, index) => (
                                                                <div key={index} className="p-10 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 relative group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100">
                                                                    <div className="absolute top-8 right-10 w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                                        {index + 1}
                                                                    </div>
                                                                    <div className="grid grid-cols-1 gap-6">
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
                                                        folder={activePage}
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
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

const InputField = ({ label, value, onChange }) => (
    <div className="space-y-1.5 group">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2 transition-colors group-focus-within:text-red-600">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full scale-0 group-focus-within:scale-100 transition-all"></span>
            {label}
        </label>
        <div className="relative">
            <input
                type="text"
                className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:border-slate-900 focus:outline-none transition-all font-bold text-gray-800 text-sm shadow-sm group-hover:shadow-md focus:shadow-xl focus:shadow-slate-200"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    </div>
);

const TextAreaField = ({ label, value, onChange }) => (
    <div className="space-y-1.5 group">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2 transition-colors group-focus-within:text-red-600">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full scale-0 group-focus-within:scale-100 transition-all"></span>
            {label}
        </label>
        <div className="relative">
            <textarea
                className="w-full px-6 py-4 bg-white border border-slate-200 rounded-3xl focus:border-slate-900 focus:outline-none transition-all font-bold text-gray-800 text-sm h-32 resize-none leading-relaxed shadow-sm group-hover:shadow-md focus:shadow-xl focus:shadow-slate-200"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    </div>
);

export default CMS;
