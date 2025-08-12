import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Sparkles, X } from '../ui/Icons';

interface SignupProps {
    onSwitchToLogin: () => void;
    onClose: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSwitchToLogin, onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth();
    const { showNotification } = useNotification();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (password !== confirmPassword) {
            showNotification('error', 'Passwords do not match');
            setLoading(false);
            return;
        }

        if (password.length < 8) {
            showNotification('error', 'Password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        try {
            await register(email, password, name);
            showNotification('success', 'Account created successfully! Welcome to CookiFy!');
            onClose();
        } catch (error: any) {
            showNotification('error', error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
                
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <img src="/images/cookify_icon.jpg" alt="CookiFy" className="w-12 h-12"/>
                        <h2 className="text-3xl font-bold text-orange-600">CookiFy</h2>
                    </div>
                    <p className="text-slate-600">Create your account and start cooking!</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-400/20 focus:border-orange-400 transition-all duration-300"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-400/20 focus:border-orange-400 transition-all duration-300"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-400/20 focus:border-orange-400 transition-all duration-300"
                            placeholder="Create a strong password"
                            required
                        />
                        <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters long</p>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-400/20 focus:border-orange-400 transition-all duration-300"
                            placeholder="Confirm your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:scale-100"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Creating Account...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                Create Account
                            </span>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-600">
                        Already have an account?{' '}
                        <button
                            onClick={onSwitchToLogin}
                            className="text-orange-600 font-semibold hover:text-orange-700 transition-colors"
                        >
                            Sign in here
                        </button>
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-800 transition-colors"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default Signup;
