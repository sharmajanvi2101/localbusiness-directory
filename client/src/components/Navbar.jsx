import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, PlusCircle, User, Users, LogOut, Menu, X, MapPin, ChevronDown, Bell, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import authService from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const menuRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (_) { }
        dispatch(logout());
        setIsMenuOpen(false);
        setIsMobileOpen(false);
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 w-full z-50 glass-navbar shadow-sm">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center gap-6">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 shrink-0">
                        <div className="w-9 h-9 rounded-xl premium-gradient flex items-center justify-center shadow-lg shadow-orange-200">
                            <MapPin size={20} className="text-white" />
                        </div>
                        <span className="text-2xl font-black premium-gradient-text tracking-tight">
                            BizDirect
                        </span>
                    </Link>

                    {/* Center Nav Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/search" className="text-sm font-bold text-stone-600 hover:text-primary-600 transition-colors">Explore</Link>
                        <Link to="/about" className="text-sm font-bold text-stone-600 hover:text-primary-600 transition-colors">About Us</Link>
                    </div>

                    {/* Right Side */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                {(user.role === 'owner' || user.role === 'admin') && (
                                    <Link to="/add-business" className="btn btn-primary text-sm shine-effect">
                                        <PlusCircle size={16} /> List Business
                                    </Link>
                                )}

                                <div className="relative" ref={menuRef}>
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-orange-100 hover:border-orange-300 transition-all bg-orange-50 text-stone-700"
                                    >
                                        <div className="w-7 h-7 rounded-lg premium-gradient flex items-center justify-center text-white font-bold text-sm shadow">
                                            {user?.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <span className="text-sm font-semibold max-w-[90px] truncate">{user?.name}</span>
                                        <ChevronDown size={14} className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isMenuOpen && (
                                        <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl shadow-orange-100 border border-orange-100 py-2 z-50">
                                            <div className="px-4 py-3 border-b border-orange-50 mb-1">
                                                <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">Signed in as</p>
                                                <p className="font-bold text-stone-800 truncate mt-0.5">{user?.name}</p>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] rounded-full font-bold uppercase bg-orange-100 text-orange-700 tracking-widest">{user?.role}</span>
                                            </div>
                                            {user?.role === 'owner' && (
                                                <Link
                                                    to="/owner/dashboard"
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-orange-50 hover:text-primary-600 transition-colors font-medium"
                                                >
                                                    <LayoutDashboard size={16} /> My Dashboard
                                                </Link>
                                            )}
                                            {(user?.role === 'admin' || user?.role === 'subadmin') && (
                                                <Link
                                                    to={user.role === 'admin' ? "/admin" : "/subadmin"}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-orange-50 hover:text-primary-600 transition-colors font-medium"
                                                >
                                                    <ShieldCheck size={16} /> {user.role === 'admin' ? "Admin Panel" : "Mod Panel"}
                                                </Link>
                                            )}
                                            <Link
                                                to="/profile"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-orange-50 hover:text-primary-600 transition-colors font-medium"
                                            >
                                                <User size={16} /> My Profile
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 text-left font-medium transition-colors"
                                            >
                                                <LogOut size={16} /> Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-stone-600 hover:text-primary-600 font-semibold text-sm transition-colors">
                                    Sign In
                                </Link>
                                <Link to="/register" className="btn btn-primary text-sm shine-effect">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className="md:hidden p-2 rounded-xl text-stone-600 hover:bg-orange-50 transition-colors"
                    >
                        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-orange-100 shadow-xl overflow-hidden"
                    >
                        <div className="px-4 py-5 space-y-3">
                            <Link to="/search" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-orange-50 text-stone-700 font-semibold">
                                <Search size={18} className="text-primary-500" /> Explore All
                            </Link>
                            <Link to="/about" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-orange-50 text-stone-700 font-semibold">
                                <Users size={18} className="text-orange-500" /> About Us
                            </Link>

                            <div className="border-t border-orange-50 pt-3 mt-3">
                                {isAuthenticated ? (
                                    <>
                                        {(user.role === 'owner' || user.role === 'admin') && (
                                            <Link to="/add-business" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-2 btn btn-primary w-full mb-3 shadow-orange-200">
                                                <PlusCircle size={18} /> List Your Business
                                            </Link>
                                        )}
                                        <Link to="/profile" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-orange-50 text-stone-700 font-semibold">
                                            <User size={18} className="text-primary-500" /> My Profile
                                        </Link>
                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-red-50 text-red-500 font-semibold">
                                            <LogOut size={18} /> Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        <Link to="/login" onClick={() => setIsMobileOpen(false)} className="btn btn-secondary text-sm">Sign In</Link>
                                        <Link to="/register" onClick={() => setIsMobileOpen(false)} className="btn btn-primary text-sm shadow-orange-200">Get Started</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
