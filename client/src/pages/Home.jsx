import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Search, MapPin, Star, ArrowRight, ChevronRight,
    ShieldCheck, TrendingUp, Users, Building2,
    Phone, LocateFixed, Loader2, Navigation2,
    BadgeCheck, CheckCircle2
} from 'lucide-react';
import businessService from '../services/businessService';
import metaService from '../services/metaService';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Import Assets
import HERO_IMG from '../assets/hero.png';
import RESTAURANT_IMG from '../assets/restaurant.png';
import RETAIL_IMG from '../assets/retail.png';
import DOCTOR_IMG from '../assets/doctor.png';
import GYM_IMG from '../assets/gym.png';
import ELECTRICIAN_IMG from '../assets/electrician.png';
import PALANPUR_IMG from '../assets/palanpur.png';

import { CATEGORY_META } from '../constants/categoryMeta';
const QUERY_SUGGESTIONS = [
    'Kirana Store', 'Tea Stall', 'Bakery', 'Medical Store', 'Vegetable Shop', 
    'Mobile Repair', 'Barber Shop', 'Tailor', 'Restaurants', 'Doctor', 'Gym'
];

const STATS = [
    { label: 'Verified Businesses', value: '500+', icon: Building2 },
    { label: 'Happy Customers', value: '10,000+', icon: Users },
    { label: 'Cities Covered', value: '20+', icon: MapPin },
    { label: 'Categories', value: '6', icon: TrendingUp },
];

const STEPS = [
    { step: '01', title: 'Search for Services', desc: 'Enter what you need and your city to instantly find verified local businesses near you.', icon: Search, color: 'bg-orange-50 text-orange-600 border-orange-100' },
    { step: '02', title: 'Compare & Choose', desc: 'Read ratings, reviews, and business details. Compare options and select the best fit for you.', icon: Star, color: 'bg-green-50 text-green-600 border-green-100' },
    { step: '03', title: 'Connect Directly', desc: 'Call, get directions, or visit their website. No middleman — you connect directly with the business.', icon: Phone, color: 'bg-blue-50 text-blue-600 border-blue-100' },
];


// --- Sub-Components ---
const BusinessCard = ({ biz, i }) => {
    const meta = CATEGORY_META[biz.category?.name] || { emoji: '📍', color: 'bg-gray-50 text-gray-600' };
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i || 0) * 0.04 }} className="market-card group">
            <div className="relative h-44 overflow-hidden">
                {biz.images?.[0] ? <img src={biz.images[0]} alt={biz.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> 
                : <div className={`w-full h-full ${meta.color.split(' ')[0]} flex items-center justify-center`}><span className="text-6xl">{meta.emoji}</span></div>}
                <div className="absolute top-3 left-3 flex gap-2">
                    {biz.isVerified && <span className="badge-verified"><ShieldCheck size={10} /> Verified</span>}
                </div>
                <div className="absolute top-3 right-3"><span className="badge-category">{biz.category?.name}</span></div>
            </div>
            <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-stone-900 text-base leading-snug group-hover:text-primary-600 transition-colors line-clamp-1">{biz.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500 shrink-0"><Star size={14} fill="currentColor" /><span className="text-xs font-bold text-stone-600">{biz.averageRating?.toFixed(1) || 'New'}</span></div>
                </div>
                <p className="text-stone-400 text-xs leading-relaxed line-clamp-2 mb-4">{biz.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-orange-50">
                    <div className="flex items-center gap-1.5 text-stone-400 text-xs font-medium"><MapPin size={13} className="text-primary-500" />{biz.city?.name}</div>
                    <Link to={`/business/${biz._id}`} className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 hover:gap-2 transition-all">View <ChevronRight size={14} /></Link>
                </div>
            </div>
        </motion.div>
    );
};

const SectionHeader = ({ title, subtitle, children }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
            <h2 className="section-title">{title}</h2>
            <p className="section-subtitle">{subtitle}</p>
        </div>
        {children}
    </div>
);

const CategoryCard = ({ cat, userLocation }) => {
    const meta = CATEGORY_META[cat.name] || { emoji: '📍', color: 'bg-gray-50 text-gray-600', border: 'border-gray-100' };
    const searchParams = new URLSearchParams();
    searchParams.set('category', cat.name);
    if (userLocation) {
        if (userLocation.cityName) searchParams.set('city', userLocation.cityName);
        searchParams.set('lat', userLocation.lat);
        searchParams.set('lng', userLocation.lng);
    }

    return (
        <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}>
            <Link to={`/search?${searchParams.toString()}`} className={`group relative flex flex-col items-center justify-center h-48 rounded-2xl border-2 ${meta.border} overflow-hidden hover:border-primary-400 hover:shadow-lg hover:shadow-orange-100 transition-all text-center`}>
                {meta.image ? (
                    <div className="absolute inset-0 z-0">
                        <img src={meta.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-30" />
                        <div className={`absolute inset-0 ${meta.color.split(' ')[0]} opacity-70`} />
                    </div>
                ) : <div className={`absolute inset-0 ${meta.color.split(' ')[0]}`} />}
                <div className="relative z-10 flex flex-col items-center">
                    <span className="text-4xl mb-3 drop-shadow-sm group-hover:scale-110 transition-transform">{meta.emoji}</span>
                    <span className={`font-black text-sm uppercase tracking-wider ${meta.color.split(' ')[1]}`}>{cat.name}</span>
                </div>
            </Link>
        </motion.div>
    );
};

const Home = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [userLocation, setUserLocation] = useState(() => {
        try {
            const saved = localStorage.getItem('bizDirect_location');
            return saved ? JSON.parse(saved) : null;
        } catch (_) { return null; }
    }); 
    const [searchCity, setSearchCity] = useState(() => {
        try {
            const saved = localStorage.getItem('bizDirect_location');
            if (saved) return JSON.parse(saved).cityName || '';
        } catch (_) {}
        return '';
    });
    const [businesses, setBusinesses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [querySuggestions, setQuerySuggestions] = useState([]);
    const [citySuggestions, setCitySuggestions] = useState([]);
    const [showQuerySug, setShowQuerySug] = useState(false);
    const [showCitySug, setShowCitySug] = useState(false);
    // Location detection
    const [locationLoading, setLocationLoading] = useState(false);
    const [nearbyBusinesses, setNearbyBusinesses] = useState([]);
    const [nearbyLoading, setNearbyLoading] = useState(false);
    const navigate = useNavigate();


    // Persist location whenever it changes
    useEffect(() => {
        if (userLocation) {
            localStorage.setItem('bizDirect_location', JSON.stringify(userLocation));
            if (userLocation.cityName) setSearchCity(userLocation.cityName);
        } else {
            localStorage.removeItem('bizDirect_location');
        }
    }, [userLocation]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bizData, catData, cityData] = await Promise.all([
                    businessService.getBusinesses({ isVerified: true, limit: 8 }),
                    metaService.getCategories(),
                    metaService.getCities(),
                ]);
                const confirmedCities = cityData || [];
                setBusinesses(bizData.data || []);
                setCategories(catData || []);
                setCities(confirmedCities);

                // If we have a location (from localStorage via state init), fetch its businesses
                if (userLocation) {
                    fetchNearby(userLocation, confirmedCities);
                }
            } catch (e) {
                toast.error('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []); // Only on mount

    const fetchNearby = async (loc, currentCities = []) => {
        if (!loc) return;
        setNearbyLoading(true);
        try {
            const cityName = loc.cityName || '';
            const citiesToSearch = currentCities.length > 0 ? currentCities : cities;
            const matchedCity = citiesToSearch.find(c => c.name.toLowerCase() === cityName.toLowerCase());
            
            let query = { isVerified: true };
            if (matchedCity) {
                query.city = matchedCity._id;
            } else {
                // If city name is not in our City model, use coordinate search (15km radius)
                const nearby = await businessService.getNearbyBusinesses(loc.lat, loc.lng, 15);
                setNearbyBusinesses(nearby.data || []);
                setNearbyLoading(false);
                return;
            }
            
            const res = await businessService.getBusinesses(query);
            
            // If strictly filtered city search is empty, fallback to coordinate search
            if ((res.data || []).length === 0) {
                const nearby = await businessService.getNearbyBusinesses(loc.lat, loc.lng, 15);
                setNearbyBusinesses(nearby.data || []);
            } else {
                setNearbyBusinesses(res.data || []);
            }
        } catch (_) {
            const nearby = await businessService.getNearbyBusinesses(loc.lat, loc.lng, 15);
            setNearbyBusinesses(nearby.data || []);
        } finally {
            setNearbyLoading(false);
        }
    };

    // ── Auto-detect location ──────────────────────────────────────────────
    const detectLocation = (explicitCities = []) => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                try {
                    // Reverse geocode using free Nominatim API (no key required)
                    const geoRes = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
                    );
                    const geoData = await geoRes.json();
                    const cityName =
                        geoData.address?.city ||
                        geoData.address?.town ||
                        geoData.address?.village ||
                        geoData.address?.county ||
                        '';
                    const locObj = { lat, lng, cityName };
                    setUserLocation(locObj);
                    
                    // Trigger nearby fetch immediately
                    fetchNearby(locObj, explicitCities.length > 0 ? explicitCities : cities);
                    toast.success(`📍 Location detected: ${cityName || 'Your area'}`);
                } catch (err) {
                    toast.error('Could not detect city name');
                } finally {
                    setLocationLoading(false);
                }
            },
            (err) => {
                setLocationLoading(false);
                if (err.code === err.PERMISSION_DENIED) {
                    // If user denied, we don't toast on auto-detect to be less annoying
                    // only toast if they clicked the button manually (will need a flag)
                } else {
                    toast.error('Could not get your location. Try again.');
                }
            },
            { timeout: 10000, maximumAge: 60000 }
        );
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery && !searchCity) return;
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (searchCity) params.set('city', searchCity);
        navigate(`/search?${params.toString()}`);
    };

    const handleQueryChange = (val) => {
        setSearchQuery(val);
        if (val.trim()) {
            const f = QUERY_SUGGESTIONS.filter(s => s.toLowerCase().includes(val.toLowerCase()));
            setQuerySuggestions(f);
            setShowQuerySug(f.length > 0);
        } else {
            setShowQuerySug(false);
        }
    };

    const handleCityChange = (val) => {
        setSearchCity(val);
        if (val.trim()) {
            const f = cities.filter(c => c.name.toLowerCase().includes(val.toLowerCase())).slice(0, 6);
            setCitySuggestions(f);
            setShowCitySug(f.length > 0);
        } else {
            setShowCitySug(false);
        }
    };

    return (
        <div className="min-h-screen" style={{ background: '#fffdf9' }}>
            {/* =========================================
                HERO SECTION — Marketplace Style
            ========================================= */}
            <section className="hero-gradient pt-28 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
                {/* Background Image Overlay */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <img 
                        src={HERO_IMG} 
                        alt="Background" 
                        className="w-full h-full object-cover opacity-20 scale-105 blur-[2px]" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40" />
                </div>
                
                {/* Decorative circles */}
                <div className="absolute top-10 left-[-80px] w-72 h-72 bg-white/5 rounded-full" />
                <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 bg-black/10 rounded-full" />
                <div className="absolute top-1/2 right-[5%] w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Tag pill */}
                        <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-8 border border-white/20">
                            <BadgeCheck size={16} className="text-yellow-300" />
                            India's Most Trusted Local Business Directory
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight px-4">
                            Find Trusted<br />
                            <span className="text-yellow-300">Local Businesses</span>
                        </h1>
                        <p className="text-lg md:text-xl text-orange-100 mb-10 md:mb-14 font-medium max-w-2xl mx-auto leading-relaxed px-6">
                            Search restaurants, doctors, electricians, gyms, and more — all verified & near you.
                        </p>

                        {/* ---- SEARCH BOX ---- */}
                        <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2.5 shadow-2xl shadow-orange-900/20 max-w-3xl mx-auto flex flex-col md:flex-row gap-2">
                            {/* What */}
                            <div className="relative flex-[2]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" size={20} />
                                <input
                                    value={searchQuery}
                                    onChange={e => handleQueryChange(e.target.value)}
                                    onFocus={() => searchQuery && setShowQuerySug(true)}
                                    onBlur={() => setTimeout(() => setShowQuerySug(false), 150)}
                                    className="w-full pl-12 pr-4 py-3.5 text-stone-700 font-medium rounded-xl outline-none text-sm bg-orange-50 border border-transparent focus:bg-white focus:border-orange-200 transition-all"
                                    placeholder="Restaurants, Doctor, Gym..."
                                />
                                <AnimatePresence>
                                    {showQuerySug && (
                                        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-orange-100 z-50 overflow-hidden">
                                            {querySuggestions.map(s => (
                                                <button key={s} type="button" onMouseDown={() => { setSearchQuery(s); setShowQuerySug(false); }}
                                                    className="w-full text-left px-4 py-3 hover:bg-orange-50 text-stone-700 font-medium text-sm flex items-center gap-2">
                                                    <Search size={14} className="text-orange-400" /> {s}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Divider */}
                            <div className="hidden md:block w-px bg-orange-100 my-1.5" />

                            {/* Where */}
                            <div className="relative flex-1">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" size={20} />
                                <input
                                    value={searchCity}
                                    onChange={e => handleCityChange(e.target.value)}
                                    onFocus={() => searchCity && setShowCitySug(true)}
                                    onBlur={() => setTimeout(() => setShowCitySug(false), 150)}
                                    className="w-full pl-12 pr-14 py-3.5 text-stone-700 font-medium rounded-xl outline-none text-sm bg-orange-50 border border-transparent focus:bg-white focus:border-orange-200 transition-all"
                                    placeholder="City"
                                />
                                {/* GPS detect button inside city input */}
                                <button
                                    type="button"
                                    onClick={detectLocation}
                                    disabled={locationLoading}
                                    title="Auto-detect my location"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-600 transition-all disabled:opacity-50"
                                >
                                    {locationLoading
                                        ? <Loader2 size={16} className="animate-spin" />
                                        : <LocateFixed size={16} />}
                                </button>
                                <AnimatePresence>
                                    {showCitySug && (
                                        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-orange-100 z-50 overflow-hidden">
                                            {citySuggestions.map(c => (
                                                <button key={c._id} type="button" onMouseDown={() => { setSearchCity(c.name); setShowCitySug(false); }}
                                                    className="w-full text-left px-4 py-3 hover:bg-orange-50 text-stone-700 font-medium text-sm flex items-center gap-2">
                                                    <MapPin size={14} className="text-orange-400" /> {c.name}, {c.state}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button type="submit"
                                className="px-8 py-3.5 premium-gradient-green text-white font-bold rounded-xl hover:opacity-90 transition-all shine-effect text-sm shadow-lg shadow-green-200">
                                Search
                            </button>
                        </form>

                        {/* Quick tags */}
                        <div className="flex flex-wrap justify-center gap-2 mt-6">
                            {QUERY_SUGGESTIONS.map(s => (
                                <button key={s} onClick={() => navigate(`/search?search=${s}`)}
                                    className="px-4 py-1.5 bg-white/20 border border-white/30 text-white text-xs font-semibold rounded-full hover:bg-white/30 transition-all">
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="trust-bar">
                <div className="container mx-auto px-4 flex flex-wrap justify-center md:justify-around">
                    {STATS.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="stat-item text-center py-6">
                            <Icon size={26} className="text-primary-500 mx-auto mb-2" />
                            <div className="text-2xl font-black text-stone-900">{value}</div>
                            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mt-0.5">{label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {!nearbyLoading && (
                <section className="container mx-auto px-4 py-16">
                    <SectionHeader title="Browse by Category" subtitle="Find exactly what you're looking for">
                        <div className="flex items-center gap-6">
                            {userLocation && (
                                <button onClick={() => { setUserLocation(null); setNearbyBusinesses([]); setSearchCity(''); }}
                                    className="text-stone-400 hover:text-stone-600 font-bold text-xs uppercase tracking-widest border border-stone-200 px-3 py-1.5 rounded-xl transition-all">Clear Location</button>
                            )}
                            <Link to={`/search${userLocation ? `?city=${encodeURIComponent(userLocation.cityName || '')}&lat=${userLocation.lat}&lng=${userLocation.lng}` : ''}`} className="text-primary-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                View all <ChevronRight size={18} />
                            </Link>
                        </div>
                    </SectionHeader>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map(cat => <CategoryCard key={cat._id} cat={cat} userLocation={userLocation} />)}
                    </div>
                </section>
            )}

            {/* =========================================
                NEARBY BUSINESSES (shown after location detect)
            ========================================= */}
            <AnimatePresence>
                {(userLocation || nearbyLoading || locationLoading) && (
                    <motion.section
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #fff7ed, #fffdf9)' }}
                    >
                        <div className="container mx-auto px-4 py-16">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                                            <Navigation2 size={11} className="animate-pulse" />
                                            {userLocation?.cityName ? `Near ${userLocation.cityName}` : 'Detecting location...'}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
                                        Businesses Near You
                                    </h2>
                                    <p className="text-stone-400 font-medium text-sm mt-1">Within 20 km of your current location</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Clear Location button removed from here as it is now in Category section */}
                                    {userLocation && (
                                        <Link
                                            to={`/search?city=${encodeURIComponent(userLocation.cityName || '')}${userLocation.lat ? `&lat=${userLocation.lat}&lng=${userLocation.lng}` : ''}`}
                                            className="text-primary-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all self-start"
                                        >
                                            View all <ChevronRight size={18} />
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {nearbyLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                    {[1, 2, 3, 4].map(n => (
                                        <div key={n} className="h-64 rounded-2xl bg-orange-100/60 animate-pulse" />
                                    ))}
                                </div>
                            ) : nearbyBusinesses.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                    {nearbyBusinesses.slice(0, 8).map((biz, i) => <BusinessCard key={biz._id} biz={biz} i={i} />)}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="text-5xl mb-4">📍</div>
                                    <p className="text-stone-500 font-semibold">No businesses found within 20 km of your location.</p>
                                    <p className="text-stone-400 text-sm mt-1">Try searching by city name above.</p>
                                </div>
                            )}
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {!userLocation && !nearbyLoading && (
                <section className="py-16" style={{ background: '#fff7ed' }}>
                    <div className="container mx-auto px-4">
                        <SectionHeader title="Featured Businesses" subtitle="Top-rated & verified in your area">
                            <Link to={`/search${userLocation ? `?city=${encodeURIComponent(userLocation.cityName || '')}&lat=${userLocation.lat}&lng=${userLocation.lng}` : ''}`} className="btn btn-primary text-sm shine-effect self-start">
                                Browse All <ArrowRight size={16} />
                            </Link>
                        </SectionHeader>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <div key={n} className="h-72 rounded-2xl bg-orange-50 animate-pulse" />)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {businesses.map((biz, i) => <BusinessCard key={biz._id} biz={biz} i={i} />)}
                            </div>
                        )}
                    </div>
                </section>
            )}

            
            {!nearbyLoading && (
                <section className="container mx-auto px-4 py-20">
                    <SectionHeader title="How BizDirect Works" subtitle="Simple, fast, and trusted" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {STEPS.map(({ step, title, desc, icon: Icon, color }) => (
                            <motion.div key={step} whileHover={{ y: -4 }} className="p-8 rounded-2xl bg-white border border-stone-100 shadow-sm group hover:shadow-xl hover:shadow-orange-50 transition-all">
                                <div className={`w-14 h-14 rounded-2xl border-2 ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}><Icon size={24} /></div>
                                <div className="text-xs font-black text-stone-300 uppercase tracking-[0.2em] mb-3">STEP {step}</div>
                                <h3 className="text-lg font-black text-stone-900 mb-3">{title}</h3>
                                <p className="text-stone-400 text-sm leading-relaxed">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* =========================================
                PALANPUR SPOTLIGHT
            ========================================= */}
            {!nearbyLoading && (
                <section className="py-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fffdf9 100%)' }}>
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row items-center gap-12">
                            <div className="flex-1">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                                    📍 Featured City
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-stone-900 mb-5 leading-tight">
                                    Discover Businesses<br />
                                    <span className="premium-gradient-text">in Palanpur</span>
                                </h2>
                                <p className="text-stone-500 text-lg leading-relaxed mb-8 max-w-lg">
                                    Explore 13+ verified restaurants, hospitals, electricians, gyms, and more across Banaskantha's thriving city of Palanpur.
                                </p>
                                <div className="flex flex-wrap gap-3 mb-8">
                                    {['Restaurants', 'Doctor', 'Gym', 'Electrician'].map(cat => (
                                        <Link key={cat} to={`/search?city=Palanpur&category=${cat}`}
                                            className="category-chip">
                                            {CATEGORY_META[cat]?.emoji} {cat}
                                        </Link>
                                    ))}
                                </div>
                                <Link to="/search?city=Palanpur" className="btn btn-primary shine-effect">
                                    Explore Palanpur <ArrowRight size={18} />
                                </Link>
                            </div>

                            <div className="flex-1 relative">
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { name: 'Palanpur Rasoi', cat: 'Restaurant', rating: 4.8, emoji: '🍽️', img: RESTAURANT_IMG },
                                        { name: 'Arogya Hospital', cat: 'Doctor', rating: 4.8, emoji: '🏥', img: DOCTOR_IMG },
                                        { name: 'PowerZone Fitness', cat: 'Gym', rating: 4.7, emoji: '💪', img: GYM_IMG },
                                        { name: 'Bhavani Electricals', cat: 'Electrician', rating: 4.7, emoji: '⚡', img: ELECTRICIAN_IMG },
                                    ].map(({ name, cat, rating, emoji, img }) => (
                                        <div key={name} className="market-card group overflow-hidden">
                                            <div className="h-24 relative overflow-hidden">
                                                <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-black/20" />
                                                <div className="absolute top-2 left-2 text-xl">{emoji}</div>
                                            </div>
                                            <div className="p-3 text-center">
                                                <div className="font-bold text-sm text-stone-900 mb-0.5 line-clamp-1">{name}</div>
                                                <div className="text-[9px] text-stone-400 uppercase tracking-widest font-semibold mb-1.5">{cat}</div>
                                                <div className="flex items-center justify-center gap-1 text-amber-500">
                                                    <Star size={10} fill="currentColor" />
                                                    <span className="text-xs font-bold text-stone-600">{rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Palanpur main background image */}
                                <div className="absolute -z-10 -bottom-10 -right-10 w-64 h-64 opacity-10 blur-xl">
                                    <img src={PALANPUR_IMG} alt="" className="w-full h-full object-cover rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* =========================================
                TRUST SECTION
            ========================================= */}
            {!nearbyLoading && (
                <section className="container mx-auto px-4 py-16">
                    <div className="bg-white rounded-3xl border border-orange-100 p-8 md:p-14 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                                    <ShieldCheck size={14} /> 100% Verified
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black text-stone-900 mb-5 leading-tight">
                                    Why Businesses &amp; Customers<br />Trust BizDirect
                                </h2>
                                <div className="space-y-4">
                                    {[
                                        'Every business is manually reviewed before listing',
                                        'Real ratings from real customers — no fake reviews',
                                        'Direct contact — no commissions or middlemen',
                                        'Local businesses, supporting local communities',
                                    ].map(item => (
                                        <div key={item} className="flex items-center gap-3">
                                            <CheckCircle2 size={20} className="text-secondary-600 shrink-0" />
                                            <span className="text-stone-600 font-medium text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Verified Listings', value: '500+', bg: 'bg-orange-50', text: 'text-orange-700' },
                                    { label: 'Happy Customers', value: '10K+', bg: 'bg-green-50', text: 'text-green-700' },
                                    { label: 'Cities Covered', value: '20+', bg: 'bg-blue-50', text: 'text-blue-700' },
                                    { label: 'Average Rating', value: '4.8★', bg: 'bg-amber-50', text: 'text-amber-700' },
                                ].map(({ label, value, bg, text }) => (
                                    <div key={label} className={`${bg} rounded-2xl p-6 text-center`}>
                                        <div className={`text-3xl font-black ${text} mb-1`}>{value}</div>
                                        <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">{label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* =========================================
                CTA — LIST YOUR BUSINESS
            ========================================= */}
            <section className="hero-gradient py-20">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
                            List Your Business<br />
                            <span className="text-yellow-300">Reach More Customers</span>
                        </h2>
                        <p className="text-orange-100 text-lg mb-10 font-medium">
                            Join 500+ verified businesses and start getting discovered today. Free to list.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register" className="px-10 py-4 bg-white text-primary-600 rounded-xl font-black hover:bg-orange-50 transition-all shadow-xl shine-effect text-base">
                                Get Started — It's Free
                            </Link>
                            <Link to="/search" className="px-10 py-4 border-2 border-white/40 text-white rounded-xl font-bold hover:bg-white/10 transition-all text-base">
                                Explore Businesses
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
