import React, { useState, useEffect, useMemo } from 'react';
import { 
    Save, Loader2, Search,
    Home, Info, Phone, HelpCircle, 
    Plane, Building2, Anchor, MapPin, 
    BookOpen, ShieldCheck, Compass, 
    Moon, Wine, Users, FileText, 
    Eye, Edit3, Check, X,
    ChevronRight, Layers, Layout,
    ExternalLink, Plus, Trash2,
    RefreshCw, Globe
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { showAlert } from '../utils/swal';
import ImageUpload from '../components/ImageUpload';
import { cn } from '../utils/cn';

// EXHAUSTIVE PAGE REGISTRY
const PAGE_REGISTRY = [
    { slug: 'home', name: 'Home / Landing', icon: <Home size={18} /> },
    { slug: 'about', name: 'About Agency', icon: <Info size={18} /> },
    { slug: 'about/our-story', name: 'Our Story', icon: <BookOpen size={18} /> },
    { slug: 'about/team', name: 'Our Team', icon: <Users size={18} /> },
    { slug: 'activities', name: 'Activities', icon: <Wine size={18} /> },
    { slug: 'contact', name: 'Contact Us', icon: <Phone size={18} /> },
    { slug: 'cruises', name: 'Cruises', icon: <Anchor size={18} /> },
    { slug: 'day-packages', name: 'Day Packages', icon: <MapPin size={18} /> },
    { slug: 'evening-packages', name: 'Evening Packages', icon: <Moon size={18} /> },
    { slug: 'destinations', name: 'All Destinations', icon: <Compass size={18} /> },
    { slug: 'destinations/mauritius', name: 'Mauritius Focus', icon: <MapPin size={18} /> },
    { slug: 'destinations/rodrigues', name: 'Rodrigues Focus', icon: <MapPin size={18} /> },
    { slug: 'destinations/international', name: 'International Focus', icon: <Globe size={18} /> },
    { slug: 'faq', name: 'FAQs / Support', icon: <HelpCircle size={18} /> },
    { slug: 'flights', name: 'Flights', icon: <Plane size={18} /> },
    { slug: 'hotels', name: 'Hotels', icon: <Building2 size={18} /> },
    { slug: 'hotel-packages', name: 'Hotel Packages', icon: <Layers size={18} /> },
    { slug: 'hotel-day-packages', name: 'Hotel Day Packages', icon: <Layers size={18} /> },
    { slug: 'news', name: 'News & Blog', icon: <FileText size={18} /> },
    { slug: 'packages', name: 'Packages', icon: <Layers size={18} /> },
    { slug: 'privacy-policy', name: 'Privacy Policy', icon: <ShieldCheck size={18} /> },
    { slug: 'plan-my-trip', name: 'Plan My Trip', icon: <Compass size={18} /> },
    { slug: 'restaurants', name: 'Restaurants', icon: <Wine size={18} /> },
    { slug: 'rodrigue-hotels', name: 'Rodrigues Hotels', icon: <Building2 size={18} /> },
    { slug: 'safety', name: 'Safety & Security', icon: <ShieldCheck size={18} /> },
    { slug: 'spa', name: 'Spa & Wellness', icon: <Users size={18} /> },
    { slug: 'tailormade', name: 'Tailor-Made', icon: <Edit3 size={18} /> },
    { slug: 'terms-conditions', name: 'Terms of Service', icon: <BookOpen size={18} /> },
    { slug: 'tours', name: 'Tours', icon: <Compass size={18} /> },
    { slug: 'transfers', name: 'Transfers', icon: <Plane size={18} /> },
    { slug: 'visa-services', name: 'Visa Services', icon: <FileText size={18} /> },
];

const CMS = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPage, setSelectedPage] = useState(PAGE_REGISTRY[0]);
    const [sections, setSections] = useState([]);
    const [fetchingSections, setFetchingSections] = useState(false);
    
    // Fetch sections for selected page
    useEffect(() => {
        if (selectedPage) {
            fetchSections(selectedPage.slug);
        }
    }, [selectedPage]);

    const fetchSections = async (slug) => {
        setFetchingSections(true);
        try {
            const { data, error } = await supabase
                .from('content_blocks')
                .select('*')
                .eq('page_slug', slug)
                .order('section_key', { ascending: true });

            if (error) throw error;
            setSections(data || []);
        } catch (error) {
            console.error('CMS_FETCH_ERR:', error);
            showAlert('Fetch Error', 'Failed to retrieve page sections.', 'error');
        } finally {
            setFetchingSections(false);
        }
    };

    const filteredPages = useMemo(() => {
        return PAGE_REGISTRY.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.slug.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <div className="flex h-[calc(100vh-56px)] -mx-4 md:-mx-8 -mt-4 md:-mt-8 bg-white overflow-hidden font-sans">
            {/* MINIMALIST SITEMAP SIDEBAR */}
            <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col relative z-20">
                <div className="p-4 pb-2">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-[9px] font-black text-red-600 uppercase tracking-[0.3em] mb-0.5">Architectural</h2>
                            <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase leading-none">Map</h1>
                        </div>
                        <button onClick={() => fetchSections(selectedPage.slug)} className="p-1.5 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 transition-colors shadow-sm">
                            <RefreshCw size={12} className={fetchingSections ? "animate-spin" : ""} />
                        </button>
                    </div>
                    
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={14} />
                        <input 
                            type="text"
                            placeholder="Search sitemap..."
                            className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:border-red-500/20 focus:outline-none text-[11px] font-bold text-slate-600 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 custom-scrollbar">
                    {filteredPages.map(page => (
                        <button
                            key={page.slug}
                            onClick={() => setSelectedPage(page)}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group",
                                selectedPage?.slug === page.slug 
                                ? "bg-white text-slate-900 shadow-md shadow-slate-200/50 border border-slate-200/50" 
                                : "text-slate-500 hover:bg-white/50 hover:text-slate-900"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-1.5 rounded-lg transition-all",
                                    selectedPage?.slug === page.slug ? "bg-red-600 text-white shadow-md shadow-red-600/20" : "bg-slate-100 text-slate-400 group-hover:bg-red-50 group-hover:text-red-600"
                                )}>
                                    {React.cloneElement(page.icon, { size: 14 })}
                                </div>
                                <div className="text-left">
                                    <span className="text-[10px] font-black uppercase tracking-wider block">{page.name}</span>
                                    <span className="text-[8px] font-bold block opacity-40 uppercase tracking-widest text-slate-400">/{page.slug}</span>
                                </div>
                            </div>
                            <ChevronRight size={12} className={cn(
                                "transition-transform",
                                selectedPage?.slug === page.slug ? "translate-x-0 opacity-100 text-red-600" : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-40"
                            )} />
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-200 bg-white">
                    <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight">System Ready for Orchestration</span>
                    </div>
                </div>
            </div>

            {/* HIGH-DENSITY CONTENT CANVAS */}
            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                <div className="p-6 lg:p-10 max-w-full">
                    {/* PAGE HEADER */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                                <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[8px] font-black uppercase tracking-[0.15em] shadow-lg shadow-slate-900/10">Dynamic Segment</span>
                                <a 
                                    href={`https://travellounge.mu${selectedPage.slug === 'home' ? '' : `/${selectedPage.slug}`}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center gap-2 text-[9px] font-black text-red-600 uppercase tracking-widest hover:underline"
                                >
                                    Preview Route <ExternalLink size={10} />
                                </a>
                            </div>
                            <h1 className="text-lg font-bold text-slate-900 tracking-wider uppercase leading-none mb-2">
                                {selectedPage.name}
                            </h1>
                            <div className="flex items-center gap-4">
                                <p className="text-slate-400 text-[10px] font-bold border-l-2 border-red-600 pl-3 py-0">
                                    /{selectedPage.slug}
                                </p>
                                <div className="flex items-center gap-3 text-[8px] font-black text-slate-300 uppercase tracking-widest">
                                    <span>{sections.length} Modules</span>
                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                    <span>Sync: {new Date().toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION BLOCKS */}
                    {fetchingSections ? (
                        <div className="py-20 flex flex-col items-center justify-center">
                            <div className="relative">
                                <Loader2 className="animate-spin text-red-600 mb-6" size={48} strokeWidth={1.5} />
                            </div>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">Orchestrating Library...</p>
                        </div>
                    ) : sections.length > 0 ? (
                        <div className="space-y-3 mb-10 text-slate-900">
                            {sections.map((section, idx) => (
                                <SectionSegment 
                                    key={section.id} 
                                    section={section} 
                                    index={idx + 1}
                                    pageSlug={selectedPage.slug}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-40 text-center bg-slate-50 rounded-[5rem] border-2 border-dashed border-slate-200 transition-all hover:border-red-200 group">
                            <Layout size={80} className="mx-auto text-slate-200 mb-10 group-hover:text-red-100 transition-colors" />
                            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-6 italic">Route is Currently Static</h3>
                            <p className="max-w-md mx-auto text-slate-400 font-medium mb-12 leading-relaxed text-lg">
                                This page is not yet connected to the architectural modular interface. Would you like to inject a block template?
                            </p>
                            <Button className="bg-red-600 text-white px-12 py-6 rounded-3xl font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-red-600/30 hover:bg-slate-900 transition-all">
                                Inject Initial Module
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* --- SUBCOMPONENT: SECTION SEGMENT --- */
const SectionSegment = ({ section, index, pageSlug }) => {
    const [content, setContent] = useState(section.content || {});
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const isLocked = 
        section.section_key.toLowerCase().includes('inquiry') || 
        section.section_key.toLowerCase().includes('form') ||
        section.section_key.toLowerCase().includes('emergency') ||
        section.section_key.toLowerCase().includes('legal') ||
        section.section_key.toLowerCase().includes('iata');

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('content_blocks')
                .update({ content, updated_at: new Date().toISOString() })
                .eq('id', section.id);

            if (error) throw error;
            setHasUnsavedChanges(false);
            showAlert('Synchronization Success', `Block [${section.section_key}] has been updated.`, 'success');
        } catch (error) {
            console.error('CMS_SAVE_ERR:', error);
            showAlert('Deployment Error', error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFieldChange = (key, val) => {
        setContent(prev => ({ ...prev, [key]: val }));
        setHasUnsavedChanges(true);
    };

    const formatKey = (key) => {
        return key.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <div className={cn(
            "bg-white rounded-xl border transition-all duration-500 overflow-hidden",
            hasUnsavedChanges ? "border-red-600 ring-4 ring-red-600/5" : "border-slate-100",
            isLocked && "opacity-80"
        )}>
            {/* SEGMENT HEADER */}
            <div className="px-4 py-3 flex items-center justify-between group cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center font-black text-[9px] border transition-colors",
                        isLocked ? "bg-slate-900 border-slate-900 text-white" : "bg-slate-50 border-slate-100 text-slate-300 group-hover:border-red-600"
                    )}>
                        {isLocked ? <ShieldCheck size={12} /> : String(index).padStart(2, '0')}
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            {formatKey(section.section_key)}
                            {hasUnsavedChanges && <span className="w-1 h-1 bg-red-600 rounded-full animate-pulse" />}
                            {isLocked && <span className="text-[6px] font-black bg-slate-900 text-white px-1 py-0.5 rounded tracking-tighter ml-1">ADMIN ONLY</span>}
                        </h4>
                        <p className="text-[7px] font-bold text-slate-300 uppercase mt-0.5">
                            ID: <span className="opacity-60">{section.id.slice(0, 8)}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 text-slate-200 hover:text-red-600 transition-colors"
                    >
                        {isExpanded ? <X size={14} /> : <Eye size={14} />}
                    </button>
                    {!isLocked && (
                        <Button
                            disabled={!hasUnsavedChanges || isSaving}
                            onClick={handleSave}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-wider transition-all",
                                hasUnsavedChanges 
                                ? "bg-red-600 text-white shadow-md hover:scale-[1.01] active:scale-98" 
                                : "bg-slate-50 text-slate-200"
                            )}
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={10} /> : <Save size={10} className="mr-1.5" />}
                            {isSaving ? 'Saving' : 'Save'}
                        </Button>
                    )}
                </div>
            </div>

            {/* SEGMENT CONTENT */}
            {isExpanded && (
                <div className={cn(
                    "px-4 py-4 border-t border-slate-50 space-y-4",
                    isLocked ? "bg-slate-100/30 select-none cursor-not-allowed pointer-events-none grayscale opacity-60" : "bg-white"
                )}>
                    {Object.entries(content).map(([key, value]) => (
                        <SegmentItem 
                            key={key}
                            label={formatKey(key)}
                            fieldKey={key}
                            value={value}
                            onChange={(val) => !isLocked && handleFieldChange(key, val)}
                            pageSlug={pageSlug}
                        />
                    ))}
                    
                    {/* Block Interaction Metadata */}
                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                         <span className="text-[7px] font-bold text-slate-200 uppercase tracking-widest">
                            {isLocked ? 'PROTECTED RECORD' : 'EDITABLE SEGMENT'}
                         </span>
                        <p className="text-[7px] font-black text-slate-100 uppercase">Schema: {section.section_key}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

/* --- GRANULAR ELEMENT: SEGMENT ITEM --- */
const SegmentItem = ({ label, fieldKey, value, onChange, pageSlug }) => {
    const isArray = Array.isArray(value);
    const isImage = typeof value === 'string' && (value.includes('http') || value.includes('/assets/') || fieldKey.toLowerCase().includes('image') || fieldKey.toLowerCase().includes('logo'));
    const isDescription = typeof value === 'string' && (value.length > 60 || fieldKey.toLowerCase().includes('desc') || fieldKey.toLowerCase().includes('content'));

    if (isArray) {
        return (
            <div className="space-y-3 group/collection">
                <div className="flex items-center justify-between">
                    <h5 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-1 h-3 bg-red-600 rounded-full" />
                        {label} [{value.length}]
                    </h5>
                    <button className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[8px] font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all">
                        <Plus size={10} /> Add
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                    {value.map((item, idx) => (
                        <div key={idx} className="bg-slate-50/30 border border-slate-100 rounded-xl p-4 relative group/card transition-all hover:bg-white hover:border-slate-200">
                            <div className="absolute top-3 right-3 flex items-center gap-1">
                                <button className="p-1 text-slate-200 hover:text-red-600 transition-colors opacity-0 group-hover/card:opacity-100 font-bold text-[8px] uppercase">
                                    <Trash2 size={10} />
                                </button>
                            </div>
                            
                            <div className="space-y-3 pt-1">
                                {Object.keys(item).map(subKey => (
                                    <InlineEditField 
                                        key={subKey}
                                        label={subKey.split('_').join(' ')}
                                        value={item[subKey] || ''}
                                        onChange={(val) => {
                                            const newArr = [...value];
                                            newArr[idx] = { ...newArr[idx], [subKey]: val };
                                            onChange(newArr);
                                        }}
                                        compact
                                        pageSlug={pageSlug}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="group/item relative bg-slate-50/30 p-4 rounded-xl border border-transparent hover:border-slate-100 hover:bg-white transition-all">
            <div className="mb-2 px-1">
                <label className="text-[8px] font-bold text-slate-300 uppercase tracking-wider group-focus-within/item:text-red-600 transition-colors">
                    {label}
                </label>
            </div>

            <InlineEditField 
                label=""
                value={value}
                onChange={onChange}
                fieldKey={fieldKey}
                isLarge={isDescription}
                isImage={isImage}
                pageSlug={pageSlug}
            />
        </div>
    );
};

/* --- INLINE EDITING LOGIC --- */
const InlineEditField = ({ label, value, onChange, compact = false, isLarge = false, isImage = false, fieldKey = '', pageSlug }) => {
    const [editing, setEditing] = useState(false);

    if (isImage || (typeof value === 'string' && (value.includes('http') || value.includes('/assets/')))) {
        return (
            <div className="relative group/img">
                <ImageUpload 
                    label={label}
                    value={value}
                    onChange={onChange}
                    folder={pageSlug || 'cms'}
                    aspectRatio={fieldKey.includes('hero') || fieldKey.includes('banner') ? 'aspect-[21/9]' : 'aspect-square'}
                    compact={compact}
                />
            </div>
        );
    }

    return (
        <div className="relative group/field">
            {label && <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 block pl-1">{label}</label>}
            
            <div className="relative">
                {isLarge ? (
                    <textarea 
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        onFocus={() => setEditing(true)}
                        onBlur={() => setEditing(false)}
                        className={cn(
                            "w-full bg-transparent border-0 focus:ring-0 p-0 text-slate-800 font-medium leading-relaxed resize-none transition-all outline-none",
                            compact ? "text-[9px] h-16" : "text-xs h-24",
                            editing ? "opacity-100" : "opacity-80"
                        )}
                        placeholder={`Provide ${label.toLowerCase()} content...`}
                    />
                ) : (
                    <input 
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        onFocus={() => setEditing(true)}
                        onBlur={() => setEditing(false)}
                        className={cn(
                            "w-full bg-transparent border-0 focus:ring-0 p-0 font-bold text-slate-900 transition-all outline-none tracking-tight",
                            compact ? "text-[10px]" : "text-sm",
                            editing ? "opacity-100" : "opacity-90"
                        )}
                        placeholder={`Enter ${label.toLowerCase()}...`}
                    />
                )}
                
                {/* Visual Focus Indicator */}
                <div className={cn(
                    "absolute -bottom-1 left-0 h-[1px] bg-red-600 transition-all duration-300 rounded-full",
                    editing ? "w-8 opacity-100" : "w-0 opacity-0"
                )} />
            </div>

            <div className="absolute top-0 right-0 p-1 opacity-0 group-hover/field:opacity-100 transition-opacity">
                 <Edit3 size={12} className="text-slate-200" />
            </div>
        </div>
    );
};

export default CMS;
