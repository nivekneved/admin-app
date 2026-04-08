import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  DollarSign, ChevronDown, ChevronUp, Save, RefreshCw,
  LayoutGrid, Plus, Trash2, Tag, AlertCircle, CheckCircle2,
  Calendar, Hotel, Map, PackageCheck, Ship, ArrowRight, Info,
  Users, Baby
} from 'lucide-react';
import { showAlert, showConfirm } from '../utils/swal';

// ─── Constants ────────────────────────────────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

// Age groups definition - single source of truth
const AGE_GROUPS = [
  { key: 'price',        label: 'Adult',  ageRange: '18+',   color: 'slate', icon: Users },
  { key: 'price_infant', label: 'Infant', ageRange: '0–2',   color: 'purple', icon: Baby },
  { key: 'price_child',  label: 'Child',  ageRange: '3–11',  color: 'blue',  icon: Users },
  { key: 'price_teen',   label: 'Teen',   ageRange: '12–17', color: 'amber', icon: Users },
];

const SERVICE_TYPES = [
  { value: 'hotel',         label: 'Hotels',       icon: Hotel,        priceType: 'per_night'  },
  { value: 'tour',          label: 'Tours',         icon: Map,          priceType: 'per_person' },
  { value: 'activity',      label: 'Activities',    icon: PackageCheck, priceType: 'per_person' },
  { value: 'land_activity', label: 'Land Packages', icon: PackageCheck, priceType: 'per_person' },
  { value: 'sea_activity',  label: 'Sea Packages',  icon: Ship,         priceType: 'per_person' },
  { value: 'cruise',        label: 'Cruises',       icon: Ship,         priceType: 'per_person' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 1 + i);

// ─── Helpers ──────────────────────────────────────────────────
const fmt   = (n) => n != null ? Number(n).toLocaleString('en-MU') : '';
const padDay = (d) => String(d).padStart(2, '0');
const isoDate = (year, mi, day) => `${year}-${padDay(mi + 1)}-${padDay(day)}`;
const daysInMonth = (year, mi) => new Date(year, mi + 1, 0).getDate();

// ─── Empty row factory ─────────────────────────────────────────
const emptyPrices = () => ({
  price:        '',
  price_infant: '',
  price_child:  '',
  price_teen:   '',
});

const emptyGrid = (year) =>
  MONTHS.map((name, mi) => ({
    monthIdx: mi,
    name,
    expanded: false,
    notes: '',
    ...emptyPrices(),
    days: Array.from({ length: daysInMonth(year, mi) }, (_, di) => ({
      day: di + 1,
      ...emptyPrices(),
    })),
  }));

// ─── Hydrate grid from DB records ─────────────────────────────
const hydrateGrid = (base, records, year) => {
  const grid = base.map(m => ({
    ...m,
    days: m.days.map(d => ({ ...d })),
  }));

  for (const rec of records) {
    const from  = new Date(rec.date_from);
    const mi    = from.getMonth();
    const isMonthly =
      from.getDate() === 1 &&
      new Date(rec.date_to).getDate() === daysInMonth(year, mi) &&
      from.getMonth() === new Date(rec.date_to).getMonth();

    const patch = {
      price:        rec.price        != null ? String(rec.price)        : '',
      price_infant: rec.price_infant != null ? String(rec.price_infant) : '',
      price_child:  rec.price_child  != null ? String(rec.price_child)  : '',
      price_teen:   rec.price_teen   != null ? String(rec.price_teen)   : '',
    };

    if (isMonthly) {
      grid[mi] = { ...grid[mi], ...patch, notes: rec.notes || '' };
    } else {
      const dayIdx = from.getDate() - 1;
      if (grid[mi]?.days[dayIdx]) {
        grid[mi].days[dayIdx] = { ...grid[mi].days[dayIdx], ...patch };
      }
    }
  }
  return grid;
};

// ─── Small sub-component: price input cell ────────────────────
const PriceCell = ({ value, onChange, placeholder, colorClass = 'slate' }) => (
  <div className="relative">
    <div className={`flex items-center border rounded-xl overflow-hidden focus-within:ring-2 bg-white
      ${colorClass === 'slate' ? 'border-slate-200 focus-within:ring-brand-red' : ''}
      ${colorClass === 'purple' ? 'border-purple-200 focus-within:ring-purple-400' : ''}
      ${colorClass === 'blue'  ? 'border-blue-200  focus-within:ring-blue-400'   : ''}
      ${colorClass === 'amber' ? 'border-amber-200 focus-within:ring-amber-400'  : ''}
    `}>
      <span className={`px-1.5 text-[9px] font-black border-r py-2 bg-slate-50 shrink-0
        ${colorClass === 'slate'  ? 'text-slate-400 border-slate-200'   : ''}
        ${colorClass === 'purple' ? 'text-purple-400 border-purple-200'  : ''}
        ${colorClass === 'blue'   ? 'text-blue-400  border-blue-200'    : ''}
        ${colorClass === 'amber'  ? 'text-amber-500 border-amber-200'   : ''}
      `}>Rs</span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || '0'}
        className="flex-1 px-1.5 py-2 text-xs font-bold text-slate-800 outline-none w-full min-w-0"
      />
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
const PriceManager = () => {
  // Selectors
  const [serviceType, setServiceType] = useState(null);
  const [services,    setServices]    = useState([]);
  const [selectedSvc, setSelectedSvc] = useState(null);
  const [variants,    setVariants]    = useState([]);
  const [selectedVar, setSelectedVar] = useState(null);
  const [year,        setYear]        = useState(CURRENT_YEAR);

  // Grid state
  const [grid,    setGrid]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);

  // Variant panel
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [newVariantName, setNewVariantName] = useState('');
  const [addingVariant,  setAddingVariant]  = useState(false);

  // Bulk fill (one per age group)
  const [bulk, setBulk] = useState(emptyPrices());

  // ── Load services when type changes ──────────────────────────
  useEffect(() => {
    if (!serviceType) return;
    setSelectedSvc(null);
    setVariants([]);
    setSelectedVar(null);
    setGrid([]);

    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('services')
        .select('id, name, base_price, service_type')
        .eq('service_type', serviceType)
        .eq('is_active', true)
        .order('name');
      setServices(data || []);
      setLoading(false);
    })();
  }, [serviceType]);

  // ── Load variants when service changes ────────────────────────
  useEffect(() => {
    if (!selectedSvc) { setVariants([]); setSelectedVar(null); return; }

    (async () => {
      const { data } = await supabase
        .from('room_types')
        .select('id, name, weekday_price, weekend_price')
        .eq('service_id', selectedSvc.id)
        .order('name');
      setVariants(data || []);
      setSelectedVar(null);
      setGrid([]);
    })();
  }, [selectedSvc]);

  // ── Load pricing grid ─────────────────────────────────────────
  const loadPricing = useCallback(async () => {
    if (!selectedSvc || !selectedVar) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('service_pricing')
      .select('*')
      .eq('service_id', selectedSvc.id)
      .eq('variant_id', selectedVar.id)
      .gte('date_from', `${year}-01-01`)
      .lte('date_to',   `${year}-12-31`);

    if (error) {
      showAlert('Load Error', 'Failed to load pricing data', 'error');
    } else {
      setGrid(hydrateGrid(emptyGrid(year), data || [], year));
    }
    setLoading(false);
  }, [selectedSvc, selectedVar, year]);

  useEffect(() => { loadPricing(); }, [loadPricing]);

  // ── Toggle month expansion ────────────────────────────────────
  const toggleMonth = (mi) =>
    setGrid(prev => prev.map((m, i) =>
      i === mi ? { ...m, expanded: !m.expanded } : m
    ));

  // ── Update month-level field ──────────────────────────────────
  const updateMonth = (mi, field, value) =>
    setGrid(prev => prev.map((m, i) =>
      i === mi ? { ...m, [field]: value } : m
    ));

  // ── Update day-level field ────────────────────────────────────
  const updateDay = (mi, dayIdx, field, value) =>
    setGrid(prev => prev.map((m, i) => {
      if (i !== mi) return m;
      const days = m.days.map((d, di) =>
        di === dayIdx ? { ...d, [field]: value } : d
      );
      return { ...m, days };
    }));

  // ── Apply bulk to all months ──────────────────────────────────
  const applyBulk = () => {
    const hasValue = Object.values(bulk).some(v => v !== '');
    if (!hasValue) return;
    setGrid(prev => prev.map(m => ({  // bulk apply
      ...m,
      price:        bulk.price        || m.price,
      price_infant: bulk.price_infant || m.price_infant,
      price_child:  bulk.price_child  || m.price_child,
      price_teen:   bulk.price_teen   || m.price_teen,
    })));
    showAlert('Bulk Applied', 'Prices applied to all 12 months', 'success');
  };

  // ── Copy month prices to all its days ────────────────────────
  const copyMonthToDays = (mi) => {
    const m = grid[mi];
    setGrid(prev => prev.map((month, i) => {
      if (i !== mi) return month;
      return {
        ...month,
        expanded: true,
        days: month.days.map(d => ({
          ...d,
          price:        m.price        || d.price,
          price_infant: m.price_infant || d.price_infant,
          price_child:  m.price_child  || d.price_child,
          price_teen:   m.price_teen   || d.price_teen,
        })),
      };
    }));
  };

  // ── Save all ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedSvc || !selectedVar) return;
    setSaving(true);

    try {
      const priceType = SERVICE_TYPES.find(t => t.value === serviceType)?.priceType || 'per_person';

      // Clear existing records for this combo + year
      await supabase
        .from('service_pricing')
        .delete()
        .eq('service_id', selectedSvc.id)
        .eq('variant_id', selectedVar.id)
        .gte('date_from', `${year}-01-01`)
        .lte('date_to',   `${year}-12-31`);

      const toInsert = [];

      for (const m of grid) {
        const { monthIdx: mi } = m;
        const hasMonthPrice = m.price || m.price_infant || m.price_child || m.price_teen;

        if (hasMonthPrice) {
          toInsert.push({
            service_id:   selectedSvc.id,
            variant_id:   selectedVar.id,
            label:        selectedVar.name,
            date_from:    isoDate(year, mi, 1),
            date_to:      isoDate(year, mi, daysInMonth(year, mi)),
            price:        parseFloat(m.price)        || 0,
            price_infant: parseFloat(m.price_infant) || 0,
            price_child:  parseFloat(m.price_child)  || 0,
            price_teen:   parseFloat(m.price_teen)   || 0,
            currency:     'MUR',
            price_type:   priceType,
            notes:        m.notes || null,
          });
        }

        // Day-level overrides (only for expanded months with any price set)
        if (m.expanded) {
          for (const d of m.days) {
            const hasDayPrice = d.price || d.price_infant || d.price_child || d.price_teen;
            if (hasDayPrice) {
              toInsert.push({
                service_id:   selectedSvc.id,
                variant_id:   selectedVar.id,
                label:        selectedVar.name,
                date_from:    isoDate(year, mi, d.day),
                date_to:      isoDate(year, mi, d.day),
                price:        parseFloat(d.price)        || 0,
                price_infant: parseFloat(d.price_infant) || 0,
                price_child:  parseFloat(d.price_child)  || 0,
                price_teen:   parseFloat(d.price_teen)   || 0,
                currency:     'MUR',
                price_type:   priceType,
                notes:        null,
              });
            }
          }
        }
      }

      if (toInsert.length > 0) {
        const { error } = await supabase.from('service_pricing').insert(toInsert);
        if (error) throw error;
      }

      showAlert('Saved', `${toInsert.length} price records saved for ${year}`, 'success');
    } catch (err) {
      console.error(err);
      showAlert('Save Failed', err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Add variant ───────────────────────────────────────────────
  const handleAddVariant = async () => {
    if (!newVariantName.trim() || !selectedSvc) return;
    setAddingVariant(true);
    const { data, error } = await supabase
      .from('room_types')
      .insert({ service_id: selectedSvc.id, name: newVariantName.trim(), weekday_price: 0, weekend_price: 0 })
      .select().single();

    if (error) {
        showAlert('Error', 'Could not add variant', 'error');
    } else {
      setVariants(prev => [...prev, data]);
      setNewVariantName('');
      setShowAddVariant(false);
      showAlert('Added', `Variant "${data.name}" added`, 'success');
    }
    setAddingVariant(false);
  };

  // ── Delete variant ────────────────────────────────────────────
  const handleDeleteVariant = async (v) => {
    const result = await showConfirm('Delete Variant', `Delete "${v.name}" and all its pricing? This cannot be undone.`);
    if (!result.isConfirmed) return;
    await supabase.from('room_types').delete().eq('id', v.id);
    setVariants(prev => prev.filter(x => x.id !== v.id));
    if (selectedVar?.id === v.id) { setSelectedVar(null); setGrid([]); }
    showAlert('Deleted', 'Variant deleted', 'success');
  };

  // ── Derived ───────────────────────────────────────────────────
  const variantLabel   = serviceType === 'hotel' ? 'Room Type' : 'Variant';
  const filledMonths   = grid.filter(m => m.price !== '').length;
  const selectedTypeInfo = SERVICE_TYPES.find(t => t.value === serviceType);

  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <DollarSign size={22} className="text-brand-red" />
            Price Manager
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Yearly price calendars — per month or per day, across all age groups (Adult / Infant / Child / Teen).
          </p>
          {/* Disclaimer */}
          <div className="mt-2 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-amber-700 text-[11px] font-semibold max-w-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>Prices are subject to change due to season and availability.</span>
          </div>
        </div>
        {selectedSvc && selectedVar && (
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg px-3 py-1.5 font-semibold">
              {filledMonths} / 12 months set
            </span>
            <button onClick={loadPricing} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button onClick={handleSave} disabled={saving || loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-red text-white text-xs font-black hover:bg-red-700 transition shadow-lg shadow-red-200 disabled:opacity-50">
              <Save size={13} />
              {saving ? 'Saving…' : 'Save Prices'}
            </button>
          </div>
        )}
      </div>

      {/* ── Age Groups Legend ── */}
      <div className="flex flex-wrap gap-2">
        {AGE_GROUPS.map(g => (
          <span key={g.key} className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide px-3 py-1.5 rounded-full border
            ${g.color === 'slate'  ? 'bg-slate-100  text-slate-600  border-slate-200'  : ''}
            ${g.color === 'purple' ? 'bg-purple-50  text-purple-700 border-purple-200' : ''}
            ${g.color === 'blue'   ? 'bg-blue-50    text-blue-700   border-blue-200'   : ''}
            ${g.color === 'amber'  ? 'bg-amber-50   text-amber-700  border-amber-200'  : ''}
          `}>
            <g.icon size={10} /> {g.label} ({g.ageRange})
          </span>
        ))}
        <span className="text-[10px] text-slate-400 italic flex items-center gap-1">
          <Info size={10} /> Day-level overrides take precedence over monthly prices on the website.
        </span>
      </div>

      {/* ── Step Selectors ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* 1: Service Type */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">1 · Service Type</label>
          <div className="grid grid-cols-2 gap-1.5">
            {SERVICE_TYPES.map(t => (
              <button key={t.value} onClick={() => setServiceType(t.value)}
                className={`flex items-center gap-1.5 px-2 py-2 rounded-xl text-[11px] font-bold transition border ${
                  serviceType === t.value
                    ? 'bg-brand-red text-white border-red-600 shadow'
                    : 'border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}>
                <t.icon size={12} /> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2: Service */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">2 · Service</label>
          {!serviceType ? (
            <p className="text-xs text-slate-400 italic">Select a service type first</p>
          ) : (
            <select value={selectedSvc?.id || ''}
              onChange={e => setSelectedSvc(services.find(s => s.id === e.target.value) || null)}
              className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-brand-red bg-white text-slate-800 font-semibold">
              <option value="">— Select service —</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
          {selectedSvc && (
            <p className="text-[10px] text-slate-400 mt-2">
              Base price: <span className="font-bold text-slate-600">MUR {fmt(selectedSvc.base_price)}</span>
            </p>
          )}
        </div>

        {/* 3: Variant */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center justify-between">
            3 · {variantLabel}
            {selectedSvc && (
              <button onClick={() => setShowAddVariant(v => !v)} className="text-brand-red hover:text-red-700 transition" title={`Add ${variantLabel}`}>
                <Plus size={14} />
              </button>
            )}
          </label>

          {!selectedSvc ? (
            <p className="text-xs text-slate-400 italic">Select a service first</p>
          ) : (
            <>
              {showAddVariant && (
                <div className="flex gap-1.5 mb-2">
                  <input value={newVariantName} onChange={e => setNewVariantName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddVariant()}
                    placeholder={`New ${variantLabel}…`}
                    className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-brand-red" />
                  <button onClick={handleAddVariant} disabled={addingVariant}
                    className="px-3 py-1.5 bg-brand-red text-white rounded-lg text-xs font-bold hover:bg-red-700 transition disabled:opacity-50">
                    Add
                  </button>
                </div>
              )}
              {variants.length === 0 ? (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
                  No {variantLabel.toLowerCase()}s. Click + to add one.
                </p>
              ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {variants.map(v => (
                    <div key={v.id} onClick={() => setSelectedVar(v)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer border transition text-xs ${
                        selectedVar?.id === v.id
                          ? 'bg-red-50 border-red-200 text-brand-red font-bold'
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}>
                      <span>{v.name}</span>
                      <button onClick={e => { e.stopPropagation(); handleDeleteVariant(v); }}
                        className="text-slate-300 hover:text-red-500 transition ml-2">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* 4: Year */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">4 · Year</label>
          <div className="grid grid-cols-3 gap-1.5">
            {YEAR_OPTIONS.map(y => (
              <button key={y} onClick={() => setYear(y)}
                className={`py-2 rounded-xl text-xs font-black border transition ${
                  year === y
                    ? 'bg-brand-red text-white border-red-600 shadow'
                    : 'border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}>
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Ready: show grid ── */}
      {selectedSvc && selectedVar ? (
        <>
          {/* ── Bulk Fill ── */}
          <div className="bg-slate-800 rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <span className="text-xs font-black text-white tracking-wider uppercase flex items-center gap-2">
                <LayoutGrid size={14} className="text-slate-400" />
                Bulk Fill All Months
              </span>
              <div className="flex flex-wrap gap-2 flex-1">
                {AGE_GROUPS.map(g => (
                  <div key={g.key} className="flex items-center gap-1.5 bg-slate-700 rounded-xl px-3 py-2 min-w-[130px]">
                    <span className={`text-[9px] font-black uppercase shrink-0
                      ${g.color === 'slate'  ? 'text-slate-400'  : ''}
                      ${g.color === 'purple' ? 'text-purple-400' : ''}
                      ${g.color === 'blue'   ? 'text-blue-400'   : ''}
                      ${g.color === 'amber'  ? 'text-amber-400'  : ''}
                    `}>{g.label}</span>
                    <input type="number" value={bulk[g.key]}
                      onChange={e => setBulk(prev => ({ ...prev, [g.key]: e.target.value }))}
                      placeholder="Rs 0"
                      className="w-full bg-transparent text-white text-xs outline-none placeholder-slate-500" />
                  </div>
                ))}
              </div>
              <button onClick={applyBulk}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-red text-white rounded-xl text-xs font-black hover:bg-red-600 transition shrink-0">
                <ArrowRight size={14} /> Apply All Months
              </button>
            </div>
          </div>

          {/* ── Month Grid ── */}
          {loading ? (
            <div className="text-center py-16 text-slate-400 text-sm animate-pulse">Loading price calendar…</div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">

              {/* Column Headers */}
              <div className="min-w-[960px]">
                <div className="grid bg-slate-50 border-b border-slate-200 px-4 py-3"
                  style={{ gridTemplateColumns: '130px 1fr 1fr 1fr 1fr 160px 70px 96px' }}>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Month</span>
                  {AGE_GROUPS.map(g => (
                    <span key={g.key} className={`text-[10px] font-black uppercase tracking-widest
                      ${g.color === 'slate'  ? 'text-slate-500'  : ''}
                      ${g.color === 'purple' ? 'text-purple-500' : ''}
                      ${g.color === 'blue'   ? 'text-blue-500'   : ''}
                      ${g.color === 'amber'  ? 'text-amber-500'  : ''}
                    `}>
                      {g.label} <span className="font-normal opacity-60">({g.ageRange})</span>
                    </span>
                  ))}
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Notes</span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</span>
                </div>

                {grid.map((m, mi) => (
                  <div key={mi} className="border-b border-slate-100 last:border-0">
                    {/* Month Row */}
                    <div className={`grid items-center gap-2 px-4 py-3 min-w-0 transition-colors
                      ${m.price ? 'bg-white' : 'bg-slate-50/40'}`}
                      style={{ gridTemplateColumns: '130px 1fr 1fr 1fr 1fr 160px 70px 96px' }}>

                      <span className="text-sm font-black text-slate-800">{m.name}</span>

                      {AGE_GROUPS.map(g => (
                        <PriceCell
                          key={g.key}
                          value={m[g.key]}
                          onChange={val => updateMonth(mi, g.key, val)}
                          colorClass={g.color}
                          placeholder={g.key === 'price' ? '' : (m.price ? `${m.price}` : '0')}
                        />
                      ))}

                      {/* Notes */}
                      <input type="text" value={m.notes}
                        onChange={e => updateMonth(mi, 'notes', e.target.value)}
                        placeholder="e.g. Peak season"
                        className="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-600 outline-none focus:ring-2 focus:ring-brand-red" />

                      {/* Status */}
                      <div className="flex justify-center">
                        {m.price ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 whitespace-nowrap">
                            <CheckCircle2 size={10} /> Set
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                            <AlertCircle size={10} /> Empty
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-1">
                        {m.price && (
                          <button onClick={() => copyMonthToDays(mi)} title="Copy to all days"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-red hover:bg-red-50 transition">
                            <Calendar size={13} />
                          </button>
                        )}
                        <button onClick={() => toggleMonth(mi)} title={m.expanded ? 'Collapse days' : 'Day-level prices'}
                          className={`p-1.5 rounded-lg transition ${m.expanded ? 'text-brand-red bg-red-50' : 'text-slate-400 hover:text-brand-red hover:bg-red-50'}`}>
                          {m.expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* ── Day Rows (expanded) ── */}
                    {m.expanded && (
                      <div className="bg-blue-50/30 border-t border-blue-100">
                        {/* Day header */}
                        <div className="grid items-center px-6 py-2 border-b border-blue-100 bg-blue-50/50"
                          style={{ gridTemplateColumns: '130px 1fr 1fr 1fr 1fr 160px 60px' }}>
                          <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Day</span>
                          {AGE_GROUPS.map(g => (
                            <span key={g.key} className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                              {g.label}
                            </span>
                          ))}
                          <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest text-right">Clear</span>
                        </div>

                        <div className="max-h-[480px] overflow-y-auto">
                          {m.days.map((d, di) => {
                            const hasOverride = AGE_GROUPS.some(g => d[g.key] !== '' && d[g.key] !== m[g.key]);
                            return (
                              <div key={di}
                                className={`grid items-center gap-2 px-6 py-2 border-b border-blue-100/60 last:border-0
                                  ${hasOverride ? 'bg-blue-50' : ''}`}
                                style={{ gridTemplateColumns: '130px 1fr 1fr 1fr 1fr 160px 60px' }}>

                                <span className="text-xs font-semibold text-slate-500">
                                  {m.name.slice(0,3)} {d.day}
                                  {hasOverride && (
                                    <span className="ml-1.5 text-[8px] text-blue-600 font-black bg-blue-100 rounded-full px-1.5 py-0.5">override</span>
                                  )}
                                </span>

                                {AGE_GROUPS.map(g => (
                                  <PriceCell
                                    key={g.key}
                                    value={d[g.key]}
                                    onChange={val => updateDay(mi, di, g.key, val)}
                                    colorClass={g.color}
                                    placeholder={m[g.key] || '0'}
                                  />
                                ))}

                                {/* Spacer for notes column */}
                                <span />

                                {/* Clear day */}
                                <div className="flex justify-end">
                                  {AGE_GROUPS.some(g => d[g.key] !== '') && (
                                    <button onClick={() => {
                                      AGE_GROUPS.forEach(g => updateDay(mi, di, g.key, ''));
                                    }} className="text-slate-300 hover:text-red-500 transition" title="Clear day">
                                      <Trash2 size={11} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Bottom Save Bar ── */}
          <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-sm">
            <div>
              <p className="text-xs font-black text-slate-700">
                {selectedSvc?.name} — {selectedVar?.name} — {year}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {filledMonths} months have adult prices set. Day-level entries override monthly defaults on the website.
              </p>
            </div>
            <button onClick={handleSave} disabled={saving || loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-red text-white text-sm font-black hover:bg-red-700 transition shadow-lg shadow-red-200 disabled:opacity-50">
              <Save size={16} />
              {saving ? 'Saving…' : `Save ${year} Price Calendar`}
            </button>
          </div>
        </>
      ) : (
        /* ── Empty state ── */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
            <DollarSign size={28} className="text-brand-red" />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-1">Select a Service &amp; Variant</h3>
          <p className="text-sm text-slate-400 max-w-sm">
            Choose a service type, then a specific service, then a {variantLabel?.toLowerCase() || 'variant'}
            to start editing the yearly price calendar.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6 text-xs text-slate-500">
            {['Service Type', 'Service', variantLabel || 'Variant', 'Year'].map((step, i, arr) => (
              <React.Fragment key={step}>
                <span className="bg-slate-100 rounded-full px-3 py-1 font-bold">{step}</span>
                {i < arr.length - 1 && <ArrowRight size={12} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceManager;
