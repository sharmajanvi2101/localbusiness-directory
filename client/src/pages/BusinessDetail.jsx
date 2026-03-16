import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
    MapPin, Phone, Globe, Mail, Clock, Star,
    ShieldCheck, Share2, Heart, MessageSquare,
    ChevronRight, Info, Briefcase, Navigation, ExternalLink, Utensils, ShoppingBag, Zap, Droplets, Stethoscope, Dumbbell,
    Leaf, Award, Tag, CalendarCheck, Check, ArrowLeftRight, Rocket
} from 'lucide-react';
import businessService from '../services/businessService';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORY_META } from '../constants/categoryMeta';
import { useSelector, useDispatch } from 'react-redux';
import { updateFavorites } from '../store/slices/authSlice';
import userService from '../services/userService';
import reviewService from '../services/reviewService';


const BusinessDetail = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const noredirect = searchParams.get('noredirect') === 'true';
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [business, setBusiness] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const { user } = useSelector(state => state.auth);
    const isFavourited = user?.favorites?.includes(id);
    const [comparisonList, setComparisonList] = useState([]);

    useEffect(() => {
        const list = JSON.parse(localStorage.getItem('comparisonList') || '[]');
        setComparisonList(list);
    }, []);

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
                
                // If this business has a mini-website slug, auto-redirect to it for a premium experience
                // Skip redirect if noredirect=true is passed (used by "Get Details" links)
                if (data.slug && !noredirect) {
                    navigate(`/b/${data.slug}`, { replace: true });
                    return;
                }

                setBusiness(data);
                // Fetch reviews
                const reviewsData = await reviewService.getBusinessReviews(id);
                setReviews(reviewsData.data || []);
                // Track view
                businessService.trackView(id).catch(err => console.error('View tracking failed', err));
            } catch (error) {
                toast.error("Business not found");
                navigate('/search');
            } finally {
                setLoading(false);
            }
        };
        fetchBusiness();
    }, [id, navigate]);

    const handleToggleFavorite = async () => {
        if (!user) {
            toast.error('Please login to save favorites');
            navigate('/login');
            return;
        }

        try {
            const currentFavorites = user.favorites || [];
            const isFav = currentFavorites.some(fid => fid.toString() === id);
            const newFavorites = isFav 
                ? currentFavorites.filter(fid => fid.toString() !== id)
                : [...currentFavorites, id];
            
            // Optimistic update
            dispatch(updateFavorites(newFavorites));
            
            const res = await userService.toggleFavorite(id);
            toast.success(res.message, { icon: isFav ? '💔' : '❤️' });
        } catch (error) {
            // Rollback
            if (user?.favorites) {
                dispatch(updateFavorites(user.favorites));
            }
            toast.error(error?.message || 'Failed to update favorites');
        }
    };

    const handleAddToComparison = () => {
        const currentList = JSON.parse(localStorage.getItem('comparisonList') || '[]');
        
        let newList;
        if (currentList.includes(id)) {
            newList = currentList.filter(fid => fid !== id);
            toast.success('Removed from comparison');
        } else {
            if (currentList.length >= 4) {
                toast.error('Comparison list is full (max 4)');
                return;
            }
            newList = [...currentList, id];
            toast.success('Added to comparison!', { icon: '📊' });
        }

        localStorage.setItem('comparisonList', JSON.stringify(newList));
        setComparisonList(newList);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Log in to post a review');
            navigate('/login');
            return;
        }

        if (reviewComment.length < 10) {
            toast.error('Comment must be at least 10 characters');
            return;
        }

        setSubmittingReview(true);
        try {
            await reviewService.addReview({
                businessId: id,
                rating: reviewRating,
                comment: reviewComment
            });
            toast.success('Review posted successfully!');
            // Refresh reviews
            const reviewsData = await reviewService.getBusinessReviews(id);
            setReviews(reviewsData.data || []);
            setShowReviewForm(false);
            setReviewComment('');
            setReviewRating(5);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post review');
        } finally {
            setSubmittingReview(false);
        }
    };

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
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen pb-32" 
            style={{ background: '#fffdf9' }}
        >
            {/* Breadcrumbs */}
            <div className="pt-28 pb-6 container mx-auto px-4">
                <div className="flex items-center gap-2 text-sm text-stone-400 font-medium">
                    <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
                    <ChevronRight size={14} />
                    <Link to="/search" className="hover:text-primary-600 transition-colors">Search</Link>
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
                                    onClick={handleToggleFavorite}
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
                                {business.slug && (
                                    <Link
                                        to={`/b/${business.slug}`}
                                        className="px-6 md:px-8 py-3.5 md:py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl md:rounded-3xl text-white hover:bg-white/30 transition-all flex items-center gap-3"
                                    >
                                        <Rocket size={20} />
                                        <span className="font-black italic uppercase tracking-tighter">View Store</span>
                                    </Link>
                                )}
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
                        <p className="text-stone-500 leading-relaxed text-lg font-medium whitespace-pre-line opacity-90 mb-10">
                            {business.description}
                        </p>

                        {/* Differentiation Highlights */}
                        <div className="flex flex-wrap gap-4 pt-10 border-t border-orange-50">
                            {business.attributes?.isWomenOwned && (
                                <div className="flex items-center gap-2 px-5 py-2.5 bg-pink-50 text-pink-700 rounded-2xl border border-pink-100 font-bold text-xs">
                                    <Award size={16} /> Women Owned
                                </div>
                            )}
                            {business.attributes?.isEcoFriendly && (
                                <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 font-bold text-xs">
                                    <Leaf size={16} /> Eco Friendly
                                </div>
                            )}
                            {business.attributes?.hasParking && (
                                <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-2xl border border-blue-100 font-bold text-xs">
                                    <Check size={16} /> Free Parking
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Deals - UNIQUE FEATURE */}
                    {business.deals?.length > 0 && (
                        <div className="premium-gradient p-10 md:p-12 rounded-[3.5rem] text-white shadow-2xl shadow-orange-200">
                            <div className="flex items-center gap-4 mb-8">
                                <Tag size={32} className="text-orange-300" />
                                <div>
                                    <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Flash Deals</h2>
                                    <p className="text-orange-200/60 font-black text-[10px] uppercase tracking-widest mt-2">Limited time exclusive offers</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {business.deals.map((deal, idx) => (
                                    <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[2rem] hover:bg-white/20 transition-all cursor-pointer group">
                                        <h4 className="font-black text-xl mb-2 text-white">{deal.title}</h4>
                                        <p className="text-orange-50/70 text-sm font-medium mb-4">{deal.description}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="px-4 py-2 bg-orange-500/30 rounded-xl font-black text-sm tracking-tighter border border-orange-400/30">
                                                {deal.discountCode}
                                            </div>
                                            <button className="text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">Copy Code</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Service & Booking - UNIQUE FEATURE */}
                    {business.services?.length > 0 && (
                        <div className="bg-white p-10 md:p-12 rounded-[3rem] border border-orange-50 shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
                            <div className="flex justify-between items-end mb-10 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center text-white">
                                        <CalendarCheck size={24} />
                                    </div>
                                    <h2 className="text-2xl font-black text-stone-900 tracking-tight">Services & Pricing</h2>
                                </div>
                            </div>
                            <div className="space-y-4 relative z-10">
                                {business.services.map((service, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-6 bg-stone-50 rounded-3xl border border-stone-100 hover:border-orange-200 transition-all group">
                                        <div>
                                            <h4 className="font-black text-stone-900 mb-1">{service.name}</h4>
                                            <p className="text-xs text-stone-400 font-medium">{service.duration} • {service.description}</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className="text-xl font-black text-stone-900">₹{service.price}</span>
                                            <button className="px-5 py-2.5 bg-white text-primary-600 border-2 border-orange-100 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all shadow-sm">Book</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                    <div className="bg-white p-10 md:p-12 rounded-[3rem] border border-orange-100 shadow-sm mb-12">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100">
                                    <MessageSquare size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-stone-900 tracking-tight">Public Sentiments</h2>
                            </div>
                            <button 
                                onClick={() => setShowReviewForm(!showReviewForm)}
                                className="px-6 py-2.5 bg-orange-50 text-primary-600 font-black text-xs rounded-xl hover:bg-orange-600 hover:text-white transition-all border border-orange-100 uppercase tracking-widest"
                            >
                                {showReviewForm ? 'Cancel' : 'Write Review'}
                            </button>
                        </div>

                        <AnimatePresence>
                            {showReviewForm && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <form onSubmit={handleReviewSubmit} className="bg-orange-50/50 p-8 rounded-[2rem] border border-orange-100 mb-10">
                                        <div className="flex flex-col md:flex-row gap-8">
                                            <div className="shrink-0 text-center">
                                                <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">Your Rating</div>
                                                <div className="flex items-center gap-1 justify-center">
                                                    {[1, 2, 3, 4, 5].map(n => (
                                                        <button
                                                            key={n}
                                                            type="button"
                                                            onClick={() => setReviewRating(n)}
                                                            className="transition-transform active:scale-90"
                                                        >
                                                            <Star 
                                                                size={24} 
                                                                className={n <= reviewRating ? 'text-orange-500' : 'text-stone-300'} 
                                                                fill={n <= reviewRating ? 'currentColor' : 'none'}
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex-grow">
                                                <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">Your Experience</div>
                                                <textarea 
                                                    value={reviewComment}
                                                    onChange={(e) => setReviewComment(e.target.value)}
                                                    placeholder="Share your experience with this business..."
                                                    className="w-full bg-white border border-stone-100 rounded-2xl p-5 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none min-h-[120px]"
                                                />
                                                <div className="flex justify-end mt-4">
                                                    <button 
                                                        disabled={submittingReview}
                                                        type="submit"
                                                        className="btn btn-primary px-8 py-3 rounded-xl disabled:opacity-50"
                                                    >
                                                        {submittingReview ? 'Posting...' : 'Post Review'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-8">
                            {reviews.length > 0 ? (
                                reviews.map((rev, idx) => (
                                    <div key={rev._id} className={`pb-8 ${idx !== reviews.length - 1 ? 'border-b border-orange-50' : ''}`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl premium-gradient flex items-center justify-center text-white font-black text-sm shadow-lg shadow-orange-200">
                                                    {rev.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-stone-800">{rev.user?.name || 'Anonymous'}</p>
                                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">
                                                        Verified Customer • {new Date(rev.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        size={14} 
                                                        className={i < rev.rating ? 'text-orange-500' : 'text-stone-200'} 
                                                        fill={i < rev.rating ? 'currentColor' : 'none'}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-base text-stone-600 font-medium leading-relaxed italic pl-1">
                                            "{rev.comment}"
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-stone-50 rounded-[2.5rem] border-2 border-dashed border-stone-100">
                                    <MessageSquare size={48} className="mx-auto text-stone-200 mb-4" />
                                    <p className="text-stone-400 font-black uppercase tracking-[0.3em] text-xs">No reviews have been posted yet</p>
                                </div>
                            )}
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
                                    className="w-full btn btn-primary py-4 rounded-xl flex items-center justify-center gap-3 group shadow-lg shadow-orange-100 mb-4"
                                >
                                    <Navigation size={18} className="group-hover:rotate-12 transition-transform" />
                                    <span className="font-black italic uppercase tracking-tighter">Navigate There</span>
                                    <ExternalLink size={14} className="opacity-40" />
                                </a>

                                {business.slug && (
                                    <Link
                                        to={`/b/${business.slug}`}
                                        className="w-full py-4 bg-stone-900 text-white rounded-xl flex items-center justify-center gap-3 hover:bg-stone-800 transition-all shadow-lg mb-4"
                                    >
                                        <Rocket size={18} />
                                        <span className="font-black italic uppercase tracking-tighter">Visit Digital Store</span>
                                    </Link>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={handleToggleFavorite}
                                        className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${
                                            isFavourited 
                                            ? 'bg-red-50 border-red-100 text-red-600' 
                                            : 'bg-stone-50 border-stone-100 text-stone-600 hover:bg-red-50 hover:border-red-100 hover:text-red-600'
                                        }`}
                                    >
                                        <Heart size={16} fill={isFavourited ? "currentColor" : "none"} />
                                        {isFavourited ? 'Saved' : 'Save'}
                                    </button>
                                    <button 
                                        onClick={handleAddToComparison}
                                        className="flex items-center justify-center gap-2 py-3.5 bg-stone-50 border border-stone-100 rounded-xl text-stone-600 text-xs font-black uppercase tracking-widest hover:bg-primary-50 hover:border-primary-100 hover:text-primary-600 transition-all"
                                    >
                                        <ArrowLeftRight size={16} />
                                        Compare
                                    </button>
                                </div>
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
                                    {comparisonList.map(cid => (
                                        <div key={cid} className="w-10 h-10 rounded-full border-2 border-stone-800 bg-stone-700 flex items-center justify-center text-[10px] text-white font-bold">
                                            {cid.slice(-2).toUpperCase()}
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="text-white text-xs font-black uppercase tracking-widest">{comparisonList.length} Selected</p>
                                    <p className="text-stone-400 text-[10px] font-medium hidden sm:block">Analyze them side-by-side</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button onClick={() => { localStorage.setItem('comparisonList', JSON.stringify([])); setComparisonList([]); }} 
                                    className="text-stone-400 hover:text-white px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors">Clear</button>
                                <Link to="/compare" className={`px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg ${comparisonList.length >= 2 ? 'bg-primary-600 text-white shadow-primary-900/20 hover:scale-105 active:scale-95' : 'bg-stone-800 text-stone-500 cursor-not-allowed opacity-50'}`}>
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

export default BusinessDetail;
