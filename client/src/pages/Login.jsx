import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Mail, Lock, ArrowRight, MapPin, Eye, EyeOff } from 'lucide-react';
import { setCredentials } from '../store/slices/authSlice';
import authService from '../services/authService';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { register, handleSubmit, formState: { errors } } = useForm();

    const onLoginSubmit = async (data) => {
        setLoading(true);
        try {
            const user = await authService.login(data);
            dispatch(setCredentials(user));
            toast.success(`Welcome back, ${user.name}`);
            
            // Redirect based on role (prioritizing admins) or previous location
            const from = location.state?.from;
            
            if (user.role === 'admin' || user.role === 'subadmin') {
                redirectBasedOnRole(user.role);
            } else if (from) {
                navigate(from, { state: location.state });
            } else {
                redirectBasedOnRole(user.role);
            }
        } catch (error) {
            toast.error(error || 'Failed to login');
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
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 mt-10">
            <div className="w-full max-w-md">
                {/* Simple Logo */}
                <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
                    <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-md">
                        <MapPin size={22} className="text-white" />
                    </div>
                    <span className="text-2xl font-black text-stone-900 tracking-tight">BizDirect</span>
                </Link>

                {/* Login Card */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
                    <h2 className="text-2xl font-bold text-stone-900 mb-2 text-center text-orange-600">Account Login</h2>
                    <p className="text-stone-500 text-sm text-center mb-8">Enter your credentials to access your account</p>

                    <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-600 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-600 transition-colors z-10" size={18} />
                                <input
                                    {...register('email', { required: true })}
                                    className={`w-full bg-stone-50 border-stone-200 !pl-14 pr-4 py-3.5 rounded-2xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all font-medium text-stone-800 ${errors.email ? 'border-red-500' : 'border'}`}
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-stone-600 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-orange-600 transition-colors z-10" size={18} />
                                <input
                                    {...register('password', { required: true })}
                                    type={showPassword ? "text" : "password"}
                                    className={`w-full bg-stone-50 border-stone-200 !pl-14 pr-12 py-3.5 rounded-2xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all font-medium text-stone-800 ${errors.password ? 'border-red-500' : 'border'}`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-orange-600 transition-colors z-10"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-orange-700 active:scale-95 transition-all shadow-lg shadow-orange-100 mt-4"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In <ArrowRight size={20} /></>}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-stone-100 text-center">
                        <p className="text-stone-500 text-sm font-medium">
                            Don't have an account? {' '}
                            <Link to="/register" state={{ from: location.state?.from }} className="text-orange-600 font-bold hover:underline">
                                Sign up now
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
