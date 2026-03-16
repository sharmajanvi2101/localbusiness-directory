import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    MapPin, Phone, Globe, Mail, Clock, Star, 
    Share2, Download, ExternalLink, Calendar,
    Award, ShieldCheck, Zap, Briefcase, Camera,
    ChevronRight, X, Heart, MessageSquare, Tag,
    Image as ImageIcon, Layout, Rocket, ArrowLeft,
    CheckCircle2, AlertCircle, Copy, Check, Instagram,
    Send, User, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import businessService from '../services/businessService';
import reviewService from '../services/reviewService';
import { CATEGORY_META } from '../constants/categoryMeta';

const BusinessWebsite = () => {
    const { slug } = useParams();
    const [biz, setBiz] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('about'); // about, services, photos, reviews, contact
    const [showBusinessCard, setShowBusinessCard] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchBiz = async () => {
            setLoading(true);
            try {
                const data = await businessService.getBusinessBySlug(slug);
                setBiz(data);
                businessService.trackView(data._id);
                // Fetch reviews
                const reviewData = await reviewService.getBusinessReviews(data._id);
                setReviews(reviewData.data || []);
            } catch (err) {
                toast.error("Business not found");
            } finally {
                setLoading(false);
            }
        };
        fetchBiz();
    }, [slug]);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: biz.name,
                text: biz.description,
                url: window.location.href
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        }
    };

    const shareOnWhatsApp = () => {
        const text = `Check out ${biz.name} on BizDirect! ${window.location.href}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const shareOnInstagram = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied! Share it on your Instagram bio/stories.", { icon: '📸' });
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50">
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4" />
                <p className="text-stone-400 font-bold uppercase tracking-widest text-xs animate-pulse">Building your experience...</p>
            </div>
        </div>
    );

    if (!biz) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-4xl font-black text-stone-900 mb-4">404: Not Found</h1>
            <p className="text-stone-500 mb-8">This business mini-website doesn't exist or has moved.</p>
            <Link to="/" className="btn btn-primary">Go Home</Link>
        </div>
    );

    const meta = CATEGORY_META[biz.category?.name] || { emoji: '📍', color: 'bg-primary-50 text-primary-600' };

    const TABS = [
        { id: 'about', label: 'About', icon: Info },
        { id: 'services', label: 'Services', icon: Briefcase },
        { id: 'photos', label: 'Photos', icon: ImageIcon },
        { id: 'reviews', label: 'Reviews', icon: Star },
        { id: 'contact', label: 'Contact', icon: Phone },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Minimal Sticky Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'}`}>
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className={`flex items-center gap-2 font-black text-xl transition-colors ${scrolled ? 'text-stone-900' : 'text-white'}`}>
                        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-900/20">
                            <Rocket size={18} className="text-white" />
                        </div>
                        <span className="hidden sm:inline">BizDirect</span>
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <button 
                            onClick={shareOnWhatsApp}
                            className={`p-2.5 rounded-xl transition-all hidden sm:flex ${scrolled ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-green-500/20 text-white hover:bg-green-500/30 backdrop-blur-md border border-white/10'}`}
                            title="Share on WhatsApp"
                        >
                            <Send size={18} />
                        </button>
                        <button 
                            onClick={handleShare}
                            className={`p-2.5 rounded-xl transition-all ${scrolled ? 'bg-stone-50 text-stone-900 hover:bg-stone-100' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/10'}`}
                        >
                            <Share2 size={18} />
                        </button>
                        <button 
                            onClick={() => setShowBusinessCard(true)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${scrolled ? 'bg-primary-600 text-white shadow-lg' : 'bg-white text-stone-900 shadow-xl hover:scale-105'}`}
                        >
                            <Award size={16} /> Digital Card
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative h-[45vh] md:h-[55vh] min-h-[400px] overflow-hidden bg-stone-900">
                {/* Hero Background */}
                <div className="absolute inset-0">
                    {biz.coverImage || biz.images?.[0] ? (
                        <img 
                            src={biz.coverImage || biz.images[0]} 
                            className="w-full h-full object-cover scale-105" 
                            alt={biz.name}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                    <div className="container mx-auto">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl"
                        >
                            <div className="flex items-end gap-6 mb-2">
                                {biz.logo ? (
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-white p-1 shrink-0 -mb-8 relative z-10">
                                        <img src={biz.logo} className="w-full h-full object-contain" alt="Logo" />
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white border-4 border-white flex items-center justify-center shadow-2xl text-5xl shrink-0 -mb-8 relative z-10">
                                        {meta.emoji}
                                    </div>
                                )}
                                <div className="pb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/20">Mini Site v2</span>
                                        {biz.isVerified && <span className="flex items-center gap-1 text-emerald-400 font-bold text-[10px] uppercase tracking-widest bg-emerald-400/20 px-2 py-1 rounded-md backdrop-blur-md"><ShieldCheck size={12} /> Verified</span>}
                                    </div>
                                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-2 tracking-tighter">
                                        {biz.name}
                                    </h1>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* Tabbed Navigation */}
            <div className="bg-white border-b border-stone-100 sticky top-[72px] z-[90]">
                <div className="container mx-auto px-6">
                    <div className="flex items-center gap-8 overflow-x-auto no-scrollbar py-4">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 whitespace-nowrap px-1 py-2 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-primary-600' : 'text-stone-400 hover:text-stone-600'}`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div layoutId="activeTabBr" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="container mx-auto px-6 py-12 md:py-20 min-h-[60vh]">
                <AnimatePresence mode="wait">
                    {activeTab === 'about' && (
                        <motion.div 
                            key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="max-w-4xl"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                <div className="md:col-span-2 space-y-10">
                                    <section>
                                        <h2 className="text-3xl font-black text-stone-900 tracking-tight mb-6 flex items-center gap-3">
                                            <Info className="text-primary-600" /> Our Story
                                        </h2>
                                        <p className="text-stone-500 text-lg leading-relaxed font-medium whitespace-pre-line">
                                            {biz.description}
                                        </p>
                                    </section>

                                    {biz.announcements?.length > 0 && (
                                        <section className="bg-orange-50/50 p-8 rounded-[32px] border border-orange-100 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/50 rounded-full blur-3xl -mr-32 -mt-32" />
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-8">
                                                    <Zap size={24} className="text-primary-600 fill-primary-600" />
                                                    <h2 className="text-2xl font-black text-stone-900 tracking-tight">Latest Announcements</h2>
                                                </div>
                                                <div className="space-y-6">
                                                    {biz.announcements.map((ann, idx) => (
                                                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100/50">
                                                            <h3 className="text-lg font-bold text-stone-900 mb-2">{ann.title}</h3>
                                                            <p className="text-stone-500 text-sm font-medium">{ann.content}</p>
                                                            {ann.discountCode && (
                                                                <div className="mt-4 inline-flex flex-col">
                                                                    <div className="px-4 py-2 bg-orange-50 border border-dashed border-orange-400 rounded-xl">
                                                                        <span className="text-orange-900 font-black font-mono tracking-widest">{ann.discountCode}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </section>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-stone-50 p-8 rounded-[32px] border border-stone-100">
                                        <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-6">Quick Link</h3>
                                        <div className="space-y-4">
                                            <button onClick={shareOnWhatsApp} className="w-full py-4 bg-green-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-green-600 transition-all">
                                                <Send size={14} fill="currentColor" /> Share on WhatsApp
                                            </button>
                                            <button onClick={shareOnInstagram} className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all">
                                                <Instagram size={14} /> Send to Instagram
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-primary-600 p-8 rounded-[32px] text-white shadow-xl shadow-primary-900/10">
                                        <Star size={32} className="mb-4 opacity-30" />
                                        <p className="text-2xl font-black">{biz.averageRating?.toFixed(1) || 'New'}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Verified Rating</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'services' && (
                        <motion.div 
                            key="services" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="max-w-5xl"
                        >
                            <h2 className="text-3xl font-black text-stone-900 tracking-tight mb-10">Our Services & Pricing</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {biz.services?.map((svc, idx) => (
                                    <div key={idx} className="bg-white p-8 rounded-[32px] border border-stone-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-900/5 transition-all group flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-xl font-black text-stone-900 group-hover:text-primary-600 transition-colors mb-2">{svc.name}</h4>
                                            <p className="text-stone-500 text-sm font-medium mb-6 line-clamp-3">{svc.description || 'Professional service delivered by experts.'}</p>
                                        </div>
                                        <div className="pt-6 border-t border-stone-50 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Pricing</p>
                                                <p className="text-2xl font-black text-stone-900">₹{svc.price}</p>
                                            </div>
                                            <div className="text-right">
                                                <Tag size={18} className="text-primary-500 ml-auto" />
                                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">{svc.duration || 'Standard'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'photos' && (
                        <motion.div 
                            key="photos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        >
                            <h2 className="text-3xl font-black text-stone-900 tracking-tight mb-10">Gallery & Work</h2>
                            {biz.portfolio?.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {biz.portfolio.map((item, idx) => (
                                        <div key={idx} className="aspect-square rounded-[32px] overflow-hidden group relative bg-stone-50 shadow-sm">
                                            <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.title} />
                                            <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
                                                <h4 className="text-white font-black text-sm uppercase tracking-widest mb-1">{item.title}</h4>
                                                <p className="text-stone-300 text-[10px] font-medium leading-tight">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center bg-stone-50 rounded-[48px] border-2 border-dashed border-stone-200">
                                    <Camera size={64} className="mx-auto text-stone-200 mb-6" />
                                    <h3 className="text-xl font-bold text-stone-400 uppercase tracking-widest">No Photos Yet</h3>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'reviews' && (
                        <motion.div 
                            key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="max-w-4xl"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                                <div>
                                    <h2 className="text-3xl font-black text-stone-900 tracking-tight mb-2">Customer Feedback</h2>
                                    <p className="text-stone-500 font-medium">Real reviews from our community.</p>
                                </div>
                                <div className="flex items-center gap-6 bg-stone-50 p-6 rounded-[32px] border border-stone-100">
                                    <div className="flex items-center gap-2">
                                        <Star size={32} className="text-amber-500 fill-amber-500" />
                                        <span className="text-4xl font-black text-stone-900">{biz.averageRating?.toFixed(1) || '0.0'}</span>
                                    </div>
                                    <div className="h-10 w-px bg-stone-200" />
                                    <div>
                                        <p className="text-sm font-black text-stone-900">{reviews.length} Reviews</p>
                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Total Sentiment</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {reviews.length > 0 ? reviews.map((review, idx) => (
                                    <div key={idx} className="bg-white p-8 rounded-[32px] border border-stone-100 shadow-sm relative overflow-hidden group">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-stone-900 flex items-center justify-center text-white">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-stone-900">{review.userId?.name || 'Happy Customer'}</h4>
                                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        size={14} 
                                                        fill={i < review.rating ? "currentColor" : "none"} 
                                                        className={i < review.rating ? "text-amber-500" : "text-stone-200"} 
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-stone-500 font-medium leading-relaxed italic pr-6 italic">{review.comment}</p>
                                    </div>
                                )) : (
                                    <div className="py-20 text-center bg-stone-50 rounded-[48px] border-2 border-dashed border-stone-200">
                                        <MessageSquare size={64} className="mx-auto text-stone-200 mb-6" />
                                        <h3 className="text-xl font-bold text-stone-400 uppercase tracking-widest">Be the first to review</h3>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'contact' && (
                        <motion.div 
                            key="contact" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="max-w-4xl"
                        >
                            <h2 className="text-3xl font-black text-stone-900 tracking-tight mb-10">Visit or Call Us</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div className="flex items-start gap-6">
                                        <div className="w-14 h-14 rounded-3xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 border border-primary-100">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Our Address</p>
                                            <p className="text-xl font-black text-stone-900 leading-tight">{biz.address}</p>
                                            <p className="text-stone-500 font-medium mt-1">{biz.city?.name}, Gujarat - India</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-6">
                                        <div className="w-14 h-14 rounded-3xl bg-stone-900 text-white flex items-center justify-center shrink-0 shadow-lg shadow-stone-900/10">
                                            <Phone size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Phone Enquiries</p>
                                            <p className="text-xl font-black text-stone-900 leading-tight">{biz.phone}</p>
                                            <p className="text-stone-500 font-medium mt-1">Direct call to shop owners</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-6">
                                        <div className="w-14 h-14 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                                            <Mail size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Official Email</p>
                                            <p className="text-xl font-black text-stone-900 leading-tight break-all">{biz.email || 'Private Enquiries Only'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-stone-50 p-10 rounded-[48px] border border-stone-100">
                                    <h3 className="text-lg font-black text-stone-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                                        <Clock className="text-primary-600" /> Opening Hours
                                    </h3>
                                    <div className="space-y-4">
                                        {biz.workingHours ? Object.entries(biz.workingHours).map(([day, hours]) => (
                                            <div key={day} className="flex justify-between items-center group">
                                                <span className="text-xs font-black text-stone-400 uppercase tracking-widest group-hover:text-stone-900 transition-colors">{day}</span>
                                                <div className="h-px flex-1 bg-stone-200 mx-4 opacity-30" />
                                                <span className="text-xs font-black text-stone-900">{hours || 'Closed'}</span>
                                            </div>
                                        )) : (
                                            <p className="text-sm font-bold text-stone-400 italic">No business hours provided.</p>
                                        )}
                                    </div>
                                    <div className="mt-12 pt-8 border-t border-stone-200 text-center">
                                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">Are we open now?</p>
                                        <span className="px-6 py-2 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">Open Today</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="bg-stone-50 py-12 border-t border-stone-100">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Powered by BizDirect Premium • Mini Site v2.0</p>
                </div>
            </footer>

            {/* Digital Card Modal */}
            <AnimatePresence>
                {showBusinessCard && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-stone-900/80 backdrop-blur-md"
                            onClick={() => setShowBusinessCard(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 30, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 30, opacity: 0 }}
                            className="relative w-full max-w-sm"
                        >
                            <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl overflow-hidden">
                                <div className="h-24 bg-gradient-to-br from-primary-600 to-primary-900 relative">
                                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                                        <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                                            {biz.logo ? <img src={biz.logo} className="w-full h-full object-contain p-2" /> : <span className="text-5xl">{meta.emoji}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-16 pb-10 px-10 text-center">
                                    <h2 className="text-2xl font-black text-stone-900 mb-1">{biz.name}</h2>
                                    <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-8">{biz.category?.name}</p>
                                    
                                    <div className="space-y-4 text-left">
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 rounded-2xl bg-stone-50 text-stone-400 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-600 transition-all"><Phone size={16} /></div>
                                            <p className="text-xs font-black text-stone-800">{biz.phone}</p>
                                        </div>
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 rounded-2xl bg-stone-50 text-stone-400 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-600 transition-all"><Mail size={16} /></div>
                                            <p className="text-xs font-black text-stone-800 break-all">{biz.email || 'Direct enquiry only'}</p>
                                        </div>
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 rounded-2xl bg-stone-50 text-stone-400 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-600 transition-all"><MapPin size={16} /></div>
                                            <p className="text-xs font-black text-stone-800">{biz.city?.name || 'Local'} City</p>
                                        </div>
                                    </div>

                                    <div className="mt-10 mb-6 bg-stone-50 p-6 rounded-3xl border border-stone-100">
                                        <div className="w-16 h-16 bg-white rounded-xl border border-stone-100 flex items-center justify-center mx-auto mb-3 shadow-inner">
                                            <Rocket size={24} className="text-stone-300" />
                                        </div>
                                        <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest italic">Save to Contacts</p>
                                    </div>

                                    <button 
                                        onClick={() => {
                                            toast.success("Contact file ready!");
                                        }}
                                        className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-stone-800 transition-all"
                                    >
                                        Download V-Card
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BusinessWebsite;
