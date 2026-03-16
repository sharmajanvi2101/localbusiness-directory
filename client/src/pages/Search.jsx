import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
    Search as SearchIcon, MapPin, Filter, Star,
    Briefcase, SlidersHorizontal, ArrowLeft,
    ChevronRight, LayoutGrid, List, X,
    Leaf, Award, Tag, CalendarCheck, ExternalLink, Rocket
} from 'lucide-react';
import businessService from '../services/businessService';
import metaService from '../services/metaService';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import { CATEGORY_META } from '../constants/categoryMeta';

const SearchBusinessCard = ({ biz, viewMode, onCompare, isSelected }) => {
    const meta = CATEGORY_META[biz.category?.name] || { emoji: '📍', color: 'bg-gray-50 text-gray-600' };
    return (
        <motion.div layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className={`market-card group flex relative ${viewMode === 'list' ? 'flex-col sm:flex-row min-h-[16rem]' : 'flex-col'} ${isSelected ? 'ring-2 ring-primary-500 border-primary-500 shadow-xl' : ''}`}>
            {/* Comparison Toggle */}
            <div className="absolute top-4 right-4 z-20">
                <button 
                    onClick={() => onCompare(biz._id)}
                    className={`p-2 rounded-xl border transition-all duration-300 flex items-center gap-2 group/comp ${
                        isSelected 
                        ? 'bg-primary-600 text-white border-primary-600 shadow-lg' 
                        : 'bg-white/90 backdrop-blur-sm text-stone-600 border-stone-200 hover:border-primary-400 hover:text-primary-600'
                    }`}
                >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-white border-white' : 'border-stone-300'}`}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-primary-600 rounded-sm" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover/comp:block transition-all">
                        {isSelected ? 'In Compare' : 'Compare'}
                    </span>
                </button>
            </div>

            <div className={`relative overflow-hidden shrink-0 ${viewMode === 'list' ? 'w-full sm:w-64 h-48 sm:h-full' : 'h-48 w-full'}`}>
                {biz.images?.[0] ? <img src={biz.images[0]} alt={biz.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                : <div className={`w-full h-full ${meta.color.split(' ')[0]} flex items-center justify-center`}><span className="text-5xl">{meta.emoji}</span></div>}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="badge-category">{biz.category?.name}</span>
                    {biz.deals?.length > 0 && <span className="bg-orange-600 text-white text-[8px] px-2 py-1 rounded-lg font-black uppercase flex items-center gap-1 shadow-lg shadow-orange-900/40 animate-pulse"><Tag size={10} /> Active Deal</span>}
                </div>
            </div>
            <div className="p-6 flex flex-col justify-between flex-1 text-left">
                <div>
                    <div className="flex justify-between items-start mb-2 gap-4">
                        <h3 className="text-xl font-black text-stone-900 group-hover:text-primary-600 transition-colors leading-tight line-clamp-1">
                            <Link to={biz.slug ? `/b/${biz.slug}` : `/business/${biz._id}`}>{biz.name}</Link>
                        </h3>
                        <div className="flex items-center gap-1 text-amber-500 font-bold shrink-0"><Star size={16} fill="currentColor" /><span className="text-sm">{biz.averageRating?.toFixed(1) || 'New'}</span></div>
                    </div>
                    <p className="text-stone-400 text-xs font-medium mb-4 line-clamp-2 leading-relaxed italic">{biz.description}</p>
                    <div className="flex gap-2 mb-4">
                        {biz.attributes?.isWomenOwned && <Award size={14} className="text-pink-500" title="Women Owned" />}
                        {biz.attributes?.isEcoFriendly && <Leaf size={14} className="text-emerald-500" title="Eco Friendly" />}
                        {biz.services?.length > 0 && <CalendarCheck size={14} className="text-blue-500" title="Direct Booking Available" />}
                    </div>
                </div>
                <div className="pt-4 border-t border-orange-50 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 text-stone-400 text-[10px] font-bold uppercase tracking-widest"><MapPin size={14} className="text-primary-500" />{biz.city?.name}</div>
                    <div className="flex items-center gap-4">
                        <Link 
                            to={biz.slug ? `/b/${biz.slug}` : `/business/${biz._id}`} 
                            className="btn btn-primary px-4 py-2 text-[10px] flex items-center gap-2"
                        >
                             {biz.slug ? (
                                 <>Digital Store <Rocket size={14} /></>
                             ) : (
                                 <>View Details <ChevronRight size={14} /></>
                             )}
                        </Link>
                        {biz.slug && (
                            <Link to={`/business/${biz._id}?noredirect=true`} className="text-[10px] font-black text-stone-400 hover:text-primary-600 uppercase tracking-widest transition-colors border-l border-stone-200 ml-1 pl-3">
                                Get Details
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const SearchResultPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [comparisonList, setComparisonList] = useState([]);

    useEffect(() => {
        const list = JSON.parse(localStorage.getItem('comparisonList') || '[]');
        setComparisonList(list);
    }, []);

    const query = searchParams.get('search') || '';
    const categoryName = searchParams.get('category') || '';
    const city = searchParams.get('city') || '';
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    const handleCompareToggle = (bizId) => {
        const currentList = JSON.parse(localStorage.getItem('comparisonList') || '[]');
        
        let newList;
        if (currentList.includes(bizId)) {
            newList = currentList.filter(id => id !== bizId);
            toast.success('Removed from comparison');
        } else {
            if (currentList.length >= 4) {
                toast.error('Comparison list is full (max 4)');
                return;
            }
            newList = [...currentList, bizId];
            toast.success('Added to comparison!', { icon: '📊' });
        }

        localStorage.setItem('comparisonList', JSON.stringify(newList));
        setComparisonList(newList);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const catData = await metaService.getCategories();
                setCategories(catData);

                let categoryId = '';
                if (categoryName) {
                    const foundCat = catData.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
                    if (foundCat) categoryId = foundCat._id;
                }

                let cityId = '';
                if (city) {
                    const cityList = await metaService.getCities();
                    const foundCity = cityList.find(c => c.name.toLowerCase() === city.toLowerCase());
                    if (foundCity) cityId = foundCity._id;
                }

                let response;
                if (lat && lng && !city) {
                    response = await businessService.getNearbyBusinesses(lat, lng, 20);
                    if (categoryName || query) {
                        let filtered = response.data || [];
                        if (categoryName) filtered = filtered.filter(b => b.category?.name?.toLowerCase() === categoryName.toLowerCase());
                        if (query) filtered = filtered.filter(b => b.name?.toLowerCase().includes(query.toLowerCase()));
                        response.data = filtered;
                    }
                } else {
                    response = await businessService.getBusinesses({
                        search: query,
                        category: categoryId,
                        city: cityId || city,
                        isVerified: true
                    });
                }
                setBusinesses(response.data || []);
            } catch (error) {
                toast.error("Failed to fetch search results");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [searchParams, query, categoryName, city, lat, lng]);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen pb-32" 
            style={{ background: '#fffdf9' }}
        >
            <div className="container mx-auto px-4 pt-32">
                {/* Search Header */}
                <div className="bg-white p-8 md:p-12 rounded-3xl border border-orange-100 shadow-sm mb-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-50 transition-opacity" />

                    <div className="relative z-10">
                        <Link to="/" className="inline-flex items-center gap-2 text-primary-600 font-bold mb-6 hover:gap-3 transition-all text-xs uppercase tracking-widest">
                            <ArrowLeft size={16} />
                            Back to Home
                        </Link>

                        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-stone-900 mb-4 tracking-tight uppercase italic">
                                    {categoryName || query || 'All Explorations'}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3">
                                    <p className="text-stone-400 font-semibold flex items-center gap-2 text-xs uppercase tracking-widest">
                                        <span className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse" />
                                        Showing {businesses.length} verified listings
                                    </p>
                                    
                                    {(city || (lat && lng)) && (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100 shadow-sm">
                                            <MapPin size={12} className="text-orange-400" />
                                            <span>{city || 'Current Location'}</span>
                                            <button 
                                                onClick={() => {
                                                    const newParams = new URLSearchParams(searchParams);
                                                    newParams.delete('city'); newParams.delete('lat'); newParams.delete('lng');
                                                    setSearchParams(newParams);
                                                }}
                                                className="ml-1.5 w-4 h-4 flex items-center justify-center rounded-full bg-orange-200/50 hover:bg-orange-200 hover:text-orange-800 transition-colors"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                                    className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-orange-50 text-primary-600 rounded-xl border border-orange-100 font-bold text-xs uppercase tracking-widest"
                                >
                                    <Filter size={16} /> Filters
                                </button>
                                <div className="flex bg-orange-50 p-1.5 rounded-xl border border-orange-100">
                                    <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-primary-600' : 'text-stone-400'}`}>
                                        <LayoutGrid size={20} />
                                    </button>
                                    <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-primary-600' : 'text-stone-400'}`}>
                                        <List size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Filters Sidebar */}
                    <aside className={`w-full lg:w-80 shrink-0 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="sticky top-28 space-y-6">
                            <div className="bg-white p-7 rounded-3xl border border-stone-100 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3 text-stone-900 font-black uppercase tracking-widest text-[10px]">
                                        <SlidersHorizontal size={18} className="text-primary-600" />
                                        <span>Browse Categories</span>
                                    </div>
                                    <button onClick={() => setShowMobileFilters(false)} className="lg:hidden text-stone-400"><X size={20} /></button>
                                </div>
                                <div className="space-y-2">
                                    <button onClick={() => { setSearchParams({}); setShowMobileFilters(false); }}
                                        className={`w-full text-left px-5 py-3 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${!categoryName ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'text-stone-400 hover:bg-orange-50'}`}>
                                        All Listings
                                    </button>
                                    {categories.map(cat => (
                                        <button key={cat._id} onClick={() => { 
                                            const params = new URLSearchParams(searchParams);
                                            params.set('category', cat.name);
                                            setSearchParams(params);
                                            setShowMobileFilters(false);
                                        }}
                                        className={`w-full text-left px-5 py-3 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${categoryName?.toLowerCase() === cat.name.toLowerCase() ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'text-stone-400 hover:bg-orange-50'}`}>
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Results Grid */}
                    <main className="flex-1">
                        {loading ? (
                            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                                {[1, 2, 3, 4].map(n => <div key={n} className="h-72 bg-white border border-stone-100 rounded-3xl animate-pulse" />)}
                            </div>
                        ) : businesses.length > 0 ? (
                            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                                {businesses.map(biz => (
                                    <SearchBusinessCard 
                                        key={biz._id} 
                                        biz={biz} 
                                        viewMode={viewMode} 
                                        onCompare={handleCompareToggle}
                                        isSelected={comparisonList.includes(biz._id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-orange-100">
                                <SearchIcon size={64} className="mx-auto text-orange-200 mb-6" />
                                <h3 className="text-2xl font-black text-stone-900 mb-2 uppercase italic">No Discoveries Found</h3>
                                <p className="text-stone-400 text-sm font-bold uppercase tracking-widest mb-10">Try a different search or location</p>
                                <button onClick={() => setSearchParams({})} className="btn btn-primary px-10 py-4 text-xs font-black uppercase tracking-widest">Clear All Filters</button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Comparison Floating Bar */}
            <AnimatePresence>
                {comparisonList.length > 0 && (
                    <motion.div 
                        initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[80] w-[calc(100%-2rem)] max-w-2xl bg-stone-900 border border-white/10 p-5 rounded-[2.5rem] shadow-2xl backdrop-blur-xl"
                    >
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="flex -space-x-3">
                                    {comparisonList.map(id => (
                                        <div key={id} className="w-10 h-10 rounded-full border-2 border-stone-800 bg-stone-700 flex items-center justify-center text-[10px] text-white font-bold">
                                            {id.slice(-2).toUpperCase()}
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="text-white text-xs font-black uppercase tracking-widest">{comparisonList.length} Businesses Selected</p>
                                    <p className="text-stone-400 text-[10px] font-medium hidden sm:block">Analyze them side-by-side</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button onClick={() => { localStorage.setItem('comparisonList', JSON.stringify([])); setComparisonList([]); }} 
                                    className="text-stone-400 hover:text-white px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors">Clear</button>
                                <Link to="/compare" className={`px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg ${comparisonList.length >= 2 ? 'bg-primary-600 text-white shadow-primary-900/20' : 'bg-stone-800 text-stone-500 cursor-not-allowed opacity-50'}`}>
                                    {comparisonList.length < 2 ? `Add ${2 - comparisonList.length} More` : 'Compare Now'}
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SearchResultPage;
