import React from 'react';
import { useSelector } from 'react-redux';
import { User, Mail, Phone, Shield, Calendar, Settings, Heart, Briefcase, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
    const { user } = useSelector((state) => state.auth);

    if (!user) return null;

    return (
        <div className="min-h-screen pt-32 pb-20 px-4" style={{ background: '#fffdf9' }}>
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[3rem] shadow-xl shadow-orange-100/50 overflow-hidden border border-orange-100"
                >
                    {/* Cover Photo Area with Saffron Gradient */}
                    <div className="hero-gradient h-48 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-3xl -ml-32 -mb-32" />
                    </div>

                    <div className="relative px-8 md:px-12 pb-12">
                        {/* Avatar */}
                        <div className="absolute -top-16 left-8 md:left-12">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-white p-2 shadow-2xl shadow-orange-200/50">
                                <div className="w-full h-full rounded-[2rem] bg-orange-50 flex items-center justify-center text-primary-600 border border-orange-100 uppercase text-4xl font-black">
                                    {user.name.charAt(0)}
                                </div>
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="pt-20">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                                <div>
                                    <h1 className="text-4xl font-black text-stone-900 tracking-tight mb-2">{user.name}</h1>
                                    <div className="flex items-center gap-3">
                                        <span className="px-4 py-1.5 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-orange-200">
                                            {user.role} Account
                                        </span>
                                        <p className="text-stone-400 font-bold text-xs uppercase tracking-widest flex items-center gap-1">
                                            <Calendar size={14} /> Joined 2024
                                        </p>
                                    </div>
                                </div>
                                <button className="btn btn-secondary px-8 rounded-2xl flex items-center gap-2 group border-2 border-orange-100 hover:bg-orange-50">
                                    <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                                    Account Settings
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-orange-50">
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] mb-4">Contact Details</h3>

                                    <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-orange-50/30 border border-transparent hover:border-orange-100 hover:bg-white hover:shadow-xl hover:shadow-orange-100 transition-all duration-500 group">
                                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform border border-orange-50">
                                            <Mail size={22} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mb-1">Email Address</p>
                                            <p className="font-bold text-stone-900 text-lg">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-orange-50/30 border border-transparent hover:border-orange-100 hover:bg-white hover:shadow-xl hover:shadow-orange-100 transition-all duration-500 group">
                                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform border border-orange-50">
                                            <Phone size={22} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mb-1">Phone Number</p>
                                            <p className="font-bold text-stone-900 text-lg">{user.phone || 'Not Provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] mb-4">Account Stats</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-8 rounded-[2rem] bg-amber-50/50 border border-amber-100/20 text-center group hover:bg-white hover:shadow-2xl hover:shadow-orange-100 transition-all duration-500">
                                            <Heart className="mx-auto mb-4 text-orange-600" size={24} />
                                            <p className="text-2xl font-black text-stone-900 leading-none">0</p>
                                            <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-2">Favorites</p>
                                        </div>
                                        <div className="p-8 rounded-[2rem] bg-orange-50/50 border border-orange-100/20 text-center group hover:bg-white hover:shadow-2xl hover:shadow-orange-100 transition-all duration-500">
                                            <Briefcase className="mx-auto mb-4 text-orange-600" size={24} />
                                            <p className="text-2xl font-black text-stone-900 leading-none">0</p>
                                            <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-2">Businesses</p>
                                        </div>
                                    </div>

                                    <div className="p-8 rounded-[2rem] bg-white border border-orange-50 flex items-center justify-between group shadow-sm hover:shadow-xl hover:shadow-orange-100 transition-all duration-500">
                                        <div className="flex items-center gap-4">
                                            <Shield size={24} className="text-secondary-500" />
                                            <span className="font-bold text-stone-900">Verification Status</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary-600 bg-secondary-50 px-3 py-1 rounded-full">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="mt-12 text-center text-stone-400 text-sm font-medium">
                    Need to delete your account? <button className="text-primary-600 font-bold hover:underline">Click here</button>.
                    <p className="mt-2 italic opacity-50">Security & Privacy Terms Apply @ BizDirect.</p>
                </div>
            </div>
        </div>
    );
};

export default Profile;
