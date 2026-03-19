import React, { useState, useEffect } from 'react';
import { 
    Save, RefreshCw, Loader2, 
    Type, Layout, ChevronRight, Globe, 
    Info
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { showAlert } from '../utils/swal';

const CMS = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activePage, setActivePage] = useState('about-us');
    const [content, setContent] = useState({});

    useEffect(() => {
        fetchContent();
    }, [activePage]);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('content_blocks')
                .select('*')
                .eq('page_slug', activePage);

            if (error) {
                if (error.code === '42P01') {
                    setContent({});
                } else {
                    throw error;
                }
            } else {
                const contentMap = {};
                data.forEach(block => {
                    contentMap[block.section_key] = block.content;
                });
                setContent(contentMap);
            }
        } catch (error) {
            console.error('Error fetching CMS content:', error);
            showAlert('Error', 'Failed to load page content', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleContentChange = (section, key, value) => {
        setContent(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    const handleSaveSection = async (sectionKey) => {
        setSaving(sectionKey);
        try {
            const sectionContent = content[sectionKey];
            
            // Check if block exists
            const { data: existing } = await supabase
                .from('content_blocks')
                .select('id')
                .eq('page_slug', activePage)
                .eq('section_key', sectionKey)
                .single();

            if (existing) {
                const { error } = await supabase
                    .from('content_blocks')
                    .update({ content: sectionContent, updated_at: new Date() })
                    .eq('id', existing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('content_blocks')
                    .insert([{
                        page_slug: activePage,
                        section_key: sectionKey,
                        content: sectionContent
                    }]);
                if (error) throw error;
            }

            showAlert('Saved', `${sectionKey} section updated successfully`, 'success');
        } catch (error) {
            console.error('Error saving CMS block:', error);
            showAlert('Error', 'Failed to save changes. Ensure table exists.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const pages = [
        { id: 'about-us', name: 'About Us page', icon: <Info size={18} /> },
        { id: 'contact', name: 'Contact page', icon: <Globe size={18} /> },
        { id: 'home', name: 'Home sectors', icon: <Layout size={18} /> }
    ];

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center">
                <Loader2 className="animate-spin text-brand-red mb-4" size={48} />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Accessing CMS Core...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Content Management System</h1>
                    <p className="text-gray-400 text-sm font-medium">Edit website text and media without modification of code</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <Card className="lg:col-span-1 border border-slate-300 shadow-sm rounded-3xl bg-white overflow-hidden h-fit">
                    <CardHeader className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Pages</span>
                        <Button onClick={fetchContent} variant="ghost" className="p-1 h-auto text-gray-400 hover:text-brand-red">
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-2">
                        {pages.map(page => (
                            <button
                                key={page.id}
                                onClick={() => setActivePage(page.id)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                                    activePage === page.id 
                                    ? 'bg-brand-red text-white shadow-lg shadow-red-100' 
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${activePage === page.id ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-white'}`}>
                                        {page.icon}
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-tight">{page.name}</span>
                                </div>
                                <ChevronRight size={16} className={activePage === page.id ? 'text-white' : 'text-gray-300'} />
                            </button>
                        ))}
                    </CardContent>
                </Card>

                {/* Content Editor */}
                <div className="lg:col-span-3 space-y-6">
                    {activePage === 'about-us' && (
                        <>
                            {/* Hero Section Editor */}
                            <SectionEditor 
                                title="Hero Section" 
                                icon={<Layout size={20} />}
                                onSave={() => handleSaveSection('hero')}
                                isSaving={saving === 'hero'}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField 
                                        label="Main Title" 
                                        value={content.hero?.title || 'Your World, Our Expertise'} 
                                        onChange={(val) => handleContentChange('hero', 'title', val)}
                                    />
                                    <InputField 
                                        label="Red Highlight Word" 
                                        value={content.hero?.highlight || 'Expertise'} 
                                        onChange={(val) => handleContentChange('hero', 'highlight', val)}
                                    />
                                    <div className="md:col-span-2">
                                        <TextAreaField 
                                            label="Intro Paragraph" 
                                            value={content.hero?.description || 'Since 2014, Travel Lounge has been the premier destination for discerning travelers in Mauritius.'} 
                                            onChange={(val) => handleContentChange('hero', 'description', val)}
                                        />
                                    </div>
                                    <InputField 
                                        label="Banner Text" 
                                        value={content.hero?.banner || 'IATA Accredited Agency'} 
                                        onChange={(val) => handleContentChange('hero', 'banner', val)}
                                    />
                                </div>
                            </SectionEditor>

                            {/* Core Identity Editor */}
                            <SectionEditor 
                                title="Core Identity" 
                                icon={<Type size={20} />}
                                onSave={() => handleSaveSection('identity')}
                                isSaving={saving === 'identity'}
                            >
                                <div className="space-y-4">
                                    <InputField 
                                        label="Sub-headline" 
                                        value={content.identity?.subheadline || 'A One-Stop Travel Solutions Provider'} 
                                        onChange={(val) => handleContentChange('identity', 'subheadline', val)}
                                    />
                                    <TextAreaField 
                                        label="Mission Quote" 
                                        value={content.identity?.quote || 'Our mission is to provide dedicated support...'} 
                                        onChange={(val) => handleContentChange('identity', 'quote', val)}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField 
                                            label="Experience Years" 
                                            value={content.identity?.years || '10+'} 
                                            onChange={(val) => handleContentChange('identity', 'years', val)}
                                        />
                                        <InputField 
                                            label="Certification Text" 
                                            value={content.identity?.cert || 'IATA Globally Certified'} 
                                            onChange={(val) => handleContentChange('identity', 'cert', val)}
                                        />
                                    </div>
                                </div>
                            </SectionEditor>

                            {/* Vision & Mission Editor */}
                            <SectionEditor 
                                title="Vision & Mission" 
                                icon={<Globe size={20} />}
                                onSave={() => handleSaveSection('vision_mission')}
                                isSaving={saving === 'vision_mission'}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <h4 className="text-[10px] font-black text-brand-red uppercase tracking-widest">Vision Block</h4>
                                        <InputField 
                                            label="Title" 
                                            value={content.vision_mission?.vision_title || 'Our Vision'} 
                                            onChange={(val) => handleContentChange('vision_mission', 'vision_title', val)}
                                        />
                                        <TextAreaField 
                                            label="Description" 
                                            value={content.vision_mission?.vision_desc || 'To be a one-stop travel solutions provider...'} 
                                            onChange={(val) => handleContentChange('vision_mission', 'vision_desc', val)}
                                        />
                                    </div>
                                    <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <h4 className="text-[10px] font-black text-brand-red uppercase tracking-widest">Mission Block</h4>
                                        <InputField 
                                            label="Title" 
                                            value={content.vision_mission?.mission_title || 'Our Mission'} 
                                            onChange={(val) => handleContentChange('vision_mission', 'mission_title', val)}
                                        />
                                        <TextAreaField 
                                            label="Description" 
                                            value={content.vision_mission?.mission_desc || 'Our dedicated corporate team members focus on personal advice...'} 
                                            onChange={(val) => handleContentChange('vision_mission', 'mission_desc', val)}
                                        />
                                    </div>
                                </div>
                            </SectionEditor>
                        </>
                    )}

                    {activePage !== 'about-us' && (
                        <Card className="p-20 text-center flex flex-col items-center gap-4 bg-white border border-slate-300 rounded-[2.5rem]">
                            <Layout size={48} className="text-gray-200" />
                            <h3 className="text-gray-900 font-black">Module Under Development</h3>
                            <p className="text-gray-400 text-sm max-w-xs mx-auto">The CMS integration for {activePage} is being mapped and will be available shortly.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

const SectionEditor = ({ title, icon, children, onSave, isSaving }) => (
    <Card className="border border-slate-300 shadow-xl shadow-gray-200/20 rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="p-6 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gray-50 text-gray-500 rounded-xl">
                    {icon}
                </div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{title}</h3>
            </div>
            <Button 
                onClick={onSave} 
                disabled={isSaving}
                className="bg-slate-900 hover:bg-black text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
            >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {isSaving ? 'Processing' : 'Deploy Changes'}
            </Button>
        </CardHeader>
        <CardContent className="p-8">
            {children}
        </CardContent>
    </Card>
);

const InputField = ({ label, value, onChange }) => (
    <div className="space-y-1">
        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <input
            type="text"
            className="w-full px-4 py-3 bg-gray-50/50 border border-slate-300 rounded-2xl focus:border-brand-red focus:outline-none transition-all font-bold text-gray-800 text-sm"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

const TextAreaField = ({ label, value, onChange }) => (
    <div className="space-y-1">
        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <textarea
            className="w-full px-4 py-3 bg-gray-50/50 border border-slate-300 rounded-2xl focus:border-brand-red focus:outline-none transition-all font-bold text-gray-800 text-sm h-24 resize-none leading-relaxed"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

export default CMS;
