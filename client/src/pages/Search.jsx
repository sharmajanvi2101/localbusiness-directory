import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
    Search as SearchIcon, MapPin, Filter, Star,
    Briefcase, SlidersHorizontal, ArrowLeft,
    ChevronRight, LayoutGrid, List, X
} from 'lucide-react';
import businessService from '../services/businessService';
import metaService from '../services/metaService';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import { CATEGORY_META } from '../constants/categoryMeta';

const SearchBusinessCard = ({ biz, viewMode }) => {
    const meta = CATEGORY_META[biz.category?.name] || { emoji: '📍', color: 'bg-gray-50 text-gray-600' };
    return (
        <motion.div layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className={`market-card group flex ${viewMode === 'list' ? 'flex-col sm:flex-row min-h-[16rem]' : 'flex-col'}`}>
            <div className={`relative overflow-hidden shrink-0 ${viewMode === 'list' ? 'w-full sm:w-64 h-48 sm:h-full' : 'h-48 w-full'}`}>
                {biz.images?.[0] ? <img src={biz.images[0]} alt={biz.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                : <div className={`w-full h-full ${meta.color.split(' ')[0]} flex items-center justify-center`}><span className="text-5xl">{meta.emoji}</span></div>}
                <div className="absolute top-4 left-4"><span className="badge-category">{biz.category?.name}</span></div>
            </div>
            <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                    <div className="flex justify-between items-start mb-2 gap-4">
                        <h3 className="text-xl font-black text-stone-900 group-hover:text-primary-600 transition-colors leading-tight line-clamp-1"><Link to={`/business/${biz._id}`}>{biz.name}</Link></h3>
                        <div className="flex items-center gap-1 text-amber-500 font-bold shrink-0"><Star size={16} fill="currentColor" /><span className="text-sm">{biz.averageRating?.toFixed(1) || 'New'}</span></div>
                    </div>
                    <p className="text-stone-400 text-xs font-medium mb-4 line-clamp-2 leading-relaxed italic">{biz.description}</p>
                </div>
                <div className="pt-4 border-t border-orange-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-stone-400 text-[10px] font-bold uppercase tracking-widest"><MapPin size={14} className="text-primary-500" />{biz.city?.name}</div>
                    <Link to={`/business/${biz._id}`} className="text-xs font-black text-primary-600 hover:text-primary-700 flex items-center gap-1 hover:gap-2 transition-all">View Details <ChevronRight size={16} /></Link>
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

    const query = searchParams.get('search') || '';
    const categoryName = searchParams.get('category') || '';
    const city = searchParams.get('city') || '';
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

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
                // Prefer city-based filtering if city name is provided, as radius search (lat/lng) can be too restrictive
                if (lat && lng && !city) {
                    // Only coordinates provided -> perform nearby radius search
                    response = await businessService.getNearbyBusinesses(lat, lng, 20);
                    
                    if (categoryName || query) {
                        let filtered = response.data || [];
                        if (categoryName) {
                            filtered = filtered.filter(b => b.category?.name?.toLowerCase() === categoryName.toLowerCase());
                        }
                        if (query) {
                            filtered = filtered.filter(b => b.name?.toLowerCase().includes(query.toLowerCase()));
                        }
                        response.data = filtered;
                    }
                } else {
                    // Standard search by city, category, or query
                    response = await businessService.getBusinesses({
                        search: query,
                        category: categoryId,
                        city: cityId || city,
                        isVerified: true
                    });
                }

                setBusinesses(response.data);
            } catch (error) {
                toast.error("Failed to fetch search results");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [searchParams, query, categoryName, city, lat, lng]);

    return (
        <div className="pt-28 min-h-screen" style={{ background: '#fffdf9' }}>
            <div className="container mx-auto px-4">
                {/* Search Header */}
                <div className="bg-white p-8 md:p-12 rounded-3xl border border-orange-100 shadow-sm mb-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-50 transition-opacity" />

                    <div className="relative z-10">
                        <Link to="/" className="inline-flex items-center gap-2 text-primary-600 font-bold mb-6 hover:gap-3 transition-all">
                            <ArrowLeft size={18} />
                            Back to Home
                        </Link>

                        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-stone-900 mb-4 tracking-tight">
                                    {categoryName || query || 'All Explorations'}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3">
                                    <p className="text-stone-400 font-semibold flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-secondary-500 animate-pulse" />
                                        Showing {businesses.length} verified listings
                                    </p>
                                    
                                    {(city || (lat && lng)) && (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100 shadow-sm">
                                            <MapPin size={12} className="text-orange-400" />
                                            <span>{city || 'Current Location'}</span>
                                            <button 
                                                onClick={() => {
                                                    const newParams = new URLSearchParams(searchParams);
                                                    newParams.delete('city');
                                                    newParams.delete('lat');
                                                    newParams.delete('lng');
                                                    setSearchParams(newParams);
                                                }}
                                                className="ml-1.5 w-4 h-4 flex items-center justify-center rounded-full bg-orange-200/50 hover:bg-orange-200 hover:text-orange-800 transition-colors"
                                                title="Clear Location"
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
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-primary-600' : 'text-stone-400 hover:text-stone-600'}`}
                                    >
                                        <LayoutGrid size={20} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-primary-600' : 'text-stone-400 hover:text-stone-600'}`}
                                    >
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
                                    <div className="flex items-center gap-3 text-stone-900 font-black uppercase tracking-widest text-xs">
                                        <SlidersHorizontal size={18} className="text-primary-600" />
                                        <span>Browse Categories</span>
                                    </div>
                                    <button onClick={() => setShowMobileFilters(false)} className="lg:hidden text-stone-400 hover:text-stone-600">
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                <div className="space-y-2.5">
                                    <button
                                        onClick={() => {
                                            const params = { search: query, city };
                                            if (lat) params.lat = lat;
                                            if (lng) params.lng = lng;
                                            setSearchParams(params);
                                            setShowMobileFilters(false);
                                        }}
                                        className={`w-full text-left px-5 py-3.5 rounded-xl transition-all flex items-center justify-between group text-sm font-semibold ${!categoryName ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'text-stone-500 hover:bg-orange-50 border border-transparent hover:border-orange-100'}`}
                                    >
                                        <span>All Listings</span>
                                        {!categoryName && <ChevronRight size={16} />}
                                    </button>

                                    {categories.map(cat => (
                                        <button
                                            key={cat._id}
                                            onClick={() => {
                                                const params = { search: query, city, category: cat.name };
                                                if (lat) params.lat = lat;
                                                if (lng) params.lng = lng;
                                                setSearchParams(params);
                                                setShowMobileFilters(false);
                                            }}
                                            className={`w-full text-left px-5 py-3.5 rounded-xl transition-all flex items-center justify-between group text-sm font-semibold ${categoryName.toLowerCase() === cat.name.toLowerCase() ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'text-stone-500 hover:bg-orange-50 border border-transparent hover:border-orange-100'}`}
                                        >
                                            <span className="truncate">{cat.name}</span>
                                            {categoryName.toLowerCase() === cat.name.toLowerCase() && <ChevronRight size={16} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Results Grid */}
                    <main className="flex-1 pb-20">
                        {loading ? (
                            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                                {[1, 2, 4, 6].map(n => (
                                    <div key={n} className="h-72 bg-orange-50/50 border border-orange-100 animate-pulse rounded-2xl" />
                                ))}
                            </div>
                        ) : businesses.length > 0 ? (
                            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                                {businesses.map(biz => <SearchBusinessCard key={biz._id} biz={biz} viewMode={viewMode} />)}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-orange-100 flex flex-col items-center">
                                <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-8 text-orange-200">
                                    <SearchIcon size={48} />
                                </div>
                                <h3 className="text-3xl font-black text-stone-900 mb-4 tracking-tight">No Discoveries Found</h3>
                                <p className="text-stone-400 max-w-sm mx-auto mb-10 text-lg font-medium leading-relaxed">
                                    We couldn't find matches for "{query}" in {city || 'your area'}. Try broadening your search.
                                </p>
                                <button
                                    onClick={() => setSearchParams({})}
                                    className="px-10 py-4 bg-orange-600 text-white font-black rounded-xl shadow-xl shadow-orange-100 hover:scale-105 active:scale-95 transition-all text-sm shine-effect"
                                >
                                    Browse All Categories
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default SearchResultPage;
