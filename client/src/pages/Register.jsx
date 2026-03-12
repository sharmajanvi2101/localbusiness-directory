import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, Phone, Briefcase, Users, MapPin } from 'lucide-react';
import { setCredentials } from '../store/slices/authSlice';
import authService from '../services/authService';

const Register = () => {
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('customer');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors }, watch } = useForm();

    const onSignupSubmit = async (data) => {
        setLoading(true);
        try {
            const payload = { ...data, role: selectedRole };
            const user = await authService.register(payload);
            dispatch(setCredentials(user));
            toast.success(`Welcome, ${user.name}`);
            redirectBasedOnRole(user.role);
        } catch (error) {
            toast.error(error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const redirectBasedOnRole = (role) => {
        if (role === 'admin') navigate('/admin');
        else if (role === 'subadmin') navigate('/subadmin');
        else if (role === 'owner') navigate('/owner/dashboard');
        else navigate('/');
    };

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 mt-16">
            <div className="w-full max-w-lg">
                <Link to="/" className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-md">
                        <MapPin size={22} className="text-white" />
                    </div>
                    <span className="text-2xl font-black text-stone-900 tracking-tight">BizDirect</span>
                </Link>

                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-stone-200">
                    <h2 className="text-2xl font-bold text-stone-900 mb-2 text-center text-orange-600">Create Account</h2>
                    <p className="text-stone-500 text-sm text-center mb-8">Join our community and explore business hubs</p>

                    {/* Simple Role Selector */}
                    <div className="flex p-1 bg-stone-100 rounded-2xl mb-8 border border-stone-200">
                        <button
                            onClick={() => setSelectedRole('customer')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${selectedRole === 'customer' ? 'bg-white text-orange-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            <Users size={16} /> Customer
                        </button>
                        <button
                            onClick={() => setSelectedRole('owner')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${selectedRole === 'owner' ? 'bg-white text-orange-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            <Briefcase size={16} /> Business Owner
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSignupSubmit)} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-600 transition-colors z-10" size={18} />
                                    <input
                                        {...register('name', { required: true })}
                                        className={`w-full bg-stone-50 border-stone-200 !pl-14 pr-4 py-3 rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-medium text-stone-800 ${errors.name ? 'border-red-500' : 'border'}`}
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider ml-1">Phone</label>
                                <div className="relative group">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-600 transition-colors z-10" size={18} />
                                    <input
                                        {...register('phone', { required: true })}
                                        className={`w-full bg-stone-50 border-stone-200 !pl-14 pr-4 py-3 rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-medium text-stone-800 ${errors.phone ? 'border-red-500' : 'border'}`}
                                        placeholder="+91 0000 0000"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-600 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-600 transition-colors z-10" size={18} />
                                <input
                                    {...register('email', { required: true })}
                                    className={`w-full bg-stone-50 border-stone-200 !pl-14 pr-4 py-3 rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-medium text-stone-800 ${errors.email ? 'border-red-500' : 'border'}`}
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider ml-1">Password</label>
                                <input
                                    {...register('password', { required: true, minLength: 6 })}
                                    type="password"
                                    className={`w-full bg-stone-50 border-stone-200 px-6 py-3 rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-medium text-stone-800 ${errors.password ? 'border-red-500' : 'border'}`}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider ml-1">Confirm</label>
                                <input
                                    {...register('confirmPassword', { 
                                        required: true, 
                                        validate: (val) => watch('password') === val 
                                    })}
                                    type="password"
                                    className={`w-full bg-stone-50 border-stone-200 px-6 py-3 rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-medium text-stone-800 ${errors.confirmPassword ? 'border-red-500' : 'border'}`}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-black active:scale-95 transition-all shadow-lg mt-4"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Sign Up"}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-stone-100 text-center">
                        <p className="text-stone-500 text-sm font-medium">
                            Already have an account? {' '}
                            <Link to="/login" className="text-orange-600 font-bold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
