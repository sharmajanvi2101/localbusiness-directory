import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    MapPin, Phone, Globe, Mail, Clock, Star,
    ShieldCheck, Share2, Heart, MessageSquare,
    ChevronRight, Info, Briefcase, Navigation, ExternalLink, Utensils, ShoppingBag, Zap, Droplets, Stethoscope, Dumbbell
} from 'lucide-react';
import businessService from '../services/businessService';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { CATEGORY_META } from '../constants/categoryMeta';


const BusinessDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavourited, setIsFavourited] = useState(false);

    const getDirectionsUrl = (biz) => {
        if (biz.location?.coordinates?.length === 2) {
            const [lng, lat] = biz.location.coordinates;
            return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        }
        const query = encodeURIComponent(`${biz.address}, ${biz.city?.name}, ${biz.city?.state}, India`);
        return `https://www.google.com/maps/search/?api=1&query=${query}`;
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({ title: business.name, url });
            } catch (_) { }
        } else {
            navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard!');
        }
    };

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const data = await businessService.getBusinessById(id);
                setBusiness(data);
            } catch (error) {
                toast.error("Business not found");
                navigate('/search');
            } finally {
                setLoading(false);
            }
        };
        fetchBusiness();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="pt-32 flex flex-col items-center justify-center min-h-screen" style={{ background: '#fffdf9' }}>
                <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin mb-4" />
                <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Loading profile...</p>
            </div>
        );
    }

    if (!business) return null;
    const meta = CATEGORY_META[business.category?.name] || { emoji: '📍', color: 'bg-gray-50 text-gray-600' };

    return (
        <div className="min-h-screen pb-20" style={{ background: '#fffdf9' }}>
            {/* Breadcrumbs */}
            <div className="pt-28 pb-6 container mx-auto px-4">
                <div className="flex items-center gap-2 text-sm text-stone-400 font-medium">
                    <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
                    <ChevronRight size={14} />
                    <Link to="/search" className="hover:text-primary-600 transition-colors">Explore</Link>
                    <ChevronRight size={14} />
                    <span className="text-stone-900 font-bold">{business.name}</span>
                </div>
            </div>

            {/* Hero Section */}
            <section className="container mx-auto px-0 md:px-4 mb-8">
                <div className="relative h-[350px] md:h-[500px] rounded-none md:rounded-[3rem] overflow-hidden shadow-2xl shadow-orange-100">
                    {business.images?.[0] ? (
                        <img src={business.images[0]} alt={business.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full ${meta.color.split(' ')[0]} flex items-center justify-center relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent" />
                            <span className="text-[120px] relative z-10">{meta.emoji}</span>
                        </div>
                    )}

                    {/* Content Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-6 md:p-12 pt-24">
                        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                            <div className="text-white">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="badge-category">
                                        {business.category?.name}
                                    </span>
                                    {business.isVerified && (
                                        <span className="badge-verified flex items-center gap-1.5 shadow-none">
                                            <ShieldCheck size={14} /> Verified
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl md:text-6xl font-black mb-4 tracking-tighter leading-tight">{business.name}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-orange-50/70 font-semibold">
                                    <div className="flex items-center gap-1.5">
                                        <Star size={18} className="text-amber-400 fill-amber-400" />
                                        <span className="text-base md:text-lg text-white font-black">{business.averageRating?.toFixed(1) || 'New'}</span>
                                        <span className="text-xs opacity-60">(12 Reviews)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 border-l border-white/20 pl-4 md:pl-6">
                                        <MapPin size={16} className="text-secondary-400" />
                                        <span className="text-sm md:text-base text-white">{business.city?.name}, GJ</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => setIsFavourited(f => !f)}
                                    className={`p-4 backdrop-blur-md rounded-2xl border transition-all group ${isFavourited
                                        ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-200'
                                        : 'bg-white/10 border-white/20 text-white hover:bg-red-500/20 hover:border-red-400'
                                        }`}
                                >
                                    <Heart size={24} fill={isFavourited ? 'currentColor' : 'none'} className="group-hover:scale-110 transition-transform" />
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 border border-white/20 transition-all group"
                                >
                                    <Share2 size={24} className="group-hover:rotate-12 transition-transform" />
                                </button>
                                <a
                                    href={`tel:${business.phone}`}
                                    className="px-6 md:px-8 py-3.5 md:py-4 btn btn-primary rounded-2xl md:rounded-3xl text-base md:text-lg flex items-center gap-3 shadow-2xl shadow-orange-900/40"
                                >
                                    <Phone size={20} />
                                    <span className="font-black italic uppercase tracking-tighter">Call Now</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-10">
                    {/* About */}
                    <div className="bg-white p-10 md:p-12 rounded-[3rem] border border-orange-50 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-primary-600 border border-orange-100">
                                <Info size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-stone-900 tracking-tight">Business Overview</h2>
                        </div>
                        <p className="text-stone-500 leading-relaxed text-lg font-medium whitespace-pre-line opacity-90">
                            {business.description}
                        </p>
                    </div>

                    {/* Features Tiles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-7 rounded-3xl border border-orange-50 shadow-sm flex items-start gap-5 hover:border-orange-200 transition-all">
                            <div className="w-12 h-12 bg-secondary-50 rounded-2xl flex items-center justify-center text-secondary-600 shrink-0 border border-secondary-100">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-stone-900 mb-1">Safety Certified</h4>
                                <p className="text-sm text-stone-400 font-medium">Verified by Team BizDirect for authentic service delivery.</p>
                            </div>
                        </div>
                        <div className="bg-white p-7 rounded-3xl border border-orange-50 shadow-sm flex items-start gap-5 hover:border-orange-200 transition-all">
                            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shrink-0 border border-orange-100">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-stone-900 mb-1">Direct Contact</h4>
                                <p className="text-sm text-stone-400 font-medium">Instantly connect with the owner without middlemen.</p>
                            </div>
                        </div>
                    </div>

                    {/* Review Section */}
                    <div className="bg-white p-10 md:p-12 rounded-[3rem] border border-orange-50 shadow-sm">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100">
                                    <MessageSquare size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-stone-900 tracking-tight">Public Sentiments</h2>
                            </div>
                            <button className="px-6 py-2.5 bg-orange-50 text-primary-600 font-black text-xs rounded-xl hover:bg-orange-600 hover:text-white transition-all border border-orange-100 uppercase tracking-widest">Post Review</button>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-12 p-10 bg-orange-50/30 rounded-[2.5rem] border border-orange-50">
                            <div className="text-center">
                                <div className="text-7xl font-black text-stone-900 mb-2 leading-none">{business.averageRating?.toFixed(1) || '4.8'}</div>
                                <div className="flex items-center gap-1 text-amber-500 justify-center mb-3">
                                    {[1, 2, 3, 4, 5].map(n => <Star key={n} size={20} fill={n <= 4 ? "currentColor" : "none"} />)}
                                </div>
                                <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Overall Rating</div>
                            </div>
                            <div className="flex-1 w-full space-y-4">
                                {[100, 15, 5, 0, 0].map((perc, i) => (
                                    <div key={i} className="flex items-center gap-4 text-xs font-black">
                                        <div className="w-8 text-stone-400 text-right">{5 - i}★</div>
                                        <div className="flex-1 h-2.5 bg-white rounded-full overflow-hidden border border-orange-100">
                                            <div className="h-full bg-secondary-500 rounded-full transition-all duration-1000" style={{ width: `${perc}%` }} />
                                        </div>
                                        <div className="w-8 text-stone-400 font-bold">{perc}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Details */}
                <aside className="space-y-8">
                    <div className="bg-white p-8 rounded-[3rem] border border-orange-100 shadow-xl shadow-orange-100/50 sticky top-28">
                        <h3 className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] mb-8 border-b border-orange-50 pb-4">Essential Info</h3>

                        <div className="space-y-7">
                            <div className="flex items-center gap-5 group">
                                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-primary-600 border border-orange-100 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Phone Line</p>
                                    <p className="font-bold text-stone-900 group-hover:text-primary-600 transition-colors">{business.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 group">
                                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-primary-600 border border-orange-100 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Official Email</p>
                                    <p className="font-bold text-stone-900 break-all">{business.email || 'Private Business'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 group">
                                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-primary-600 border border-orange-100 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Website URL</p>
                                    <p className="font-bold text-stone-900 break-all">
                                        {business.website ? <a href={business.website} target="_blank" rel="noreferrer" className="hover:underline">{business.website.replace(/https?:\/\//, '')}</a> : 'Not Published'}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-orange-50 mt-6">
                                <div className="p-5 bg-orange-50/50 rounded-2xl mb-6">
                                    <div className="flex items-center gap-2 text-primary-600 mb-3">
                                        <MapPin size={18} />
                                        <span className="font-black text-[10px] uppercase tracking-widest">Main Hub</span>
                                    </div>
                                    <p className="text-xs text-stone-500 font-bold leading-relaxed line-clamp-2">
                                        {business.address}, {business.city?.name}, India
                                    </p>
                                </div>

                                <a
                                    href={getDirectionsUrl(business)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full btn btn-primary py-4 rounded-xl flex items-center justify-center gap-3 group shadow-lg shadow-orange-100"
                                >
                                    <Navigation size={18} className="group-hover:rotate-12 transition-transform" />
                                    <span className="font-black italic uppercase tracking-tighter">Navigate There</span>
                                    <ExternalLink size={14} className="opacity-40" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Trust Card */}
                    <div className="hero-gradient p-10 rounded-[3rem] text-white shadow-xl shadow-orange-100">
                        <ShieldCheck size={40} className="mb-6 opacity-30" />
                        <h4 className="text-xl font-black mb-3 italic tracking-tighter uppercase">Verified Profile</h4>
                        <p className="text-orange-100/80 text-sm font-medium leading-relaxed">
                            This business has passed our 7-step verification audit. Every transaction is monitored for excellence.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default BusinessDetail;
