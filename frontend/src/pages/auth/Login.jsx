import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_3463593f-4cba-425e-a575-89c0d925427c/artifacts/n1f21t65_unnamed-removebg-preview.png";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = await login(formData.email, formData.password);
            toast.success('Login successful!');
            
            // Redirect based on role
            switch (user.role) {
                case 'admin':
                    navigate('/admin');
                    break;
                case 'doctor':
                    navigate('/doctor');
                    break;
                case 'patient':
                    navigate('/patient');
                    break;
                default:
                    navigate('/');
            }
        } catch (error) {
            const message = error.response?.data?.detail || 'Login failed. Please try again.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f4f1ea] via-white to-[#e0e6e4] flex">
            {/* Left side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <Link to="/" className="flex items-center gap-3 mb-8" data-testid="logo-link">
                            <img src={LOGO_URL} alt="HavenWelfare" className="w-10 h-10 object-contain" />
                            <span className="font-manrope text-xl font-bold text-[#0f392b]">HavenWelfare</span>
                        </Link>
                        <h1 className="font-manrope text-3xl font-bold text-[#0f392b] tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-[#5c706a] mt-2">
                            Sign in to continue your journey
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[#0f392b]">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5c706a]" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="pl-12 h-12 bg-white border-[#e0e6e4] focus:border-[#0f392b] focus:ring-[#0f392b]/20 rounded-xl"
                                    required
                                    data-testid="email-input"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-[#0f392b]">Password</Label>
                                <Link 
                                    to="/forgot-password" 
                                    className="text-sm text-[#d97757] hover:underline"
                                    data-testid="forgot-password-link"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5c706a]" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="pl-12 pr-12 h-12 bg-white border-[#e0e6e4] focus:border-[#0f392b] focus:ring-[#0f392b]/20 rounded-xl"
                                    required
                                    data-testid="password-input"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5c706a] hover:text-[#0f392b]"
                                    data-testid="toggle-password"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#d97757] hover:bg-[#c26649] text-white rounded-full h-12 text-lg font-semibold"
                            data-testid="login-submit"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                    Signing in...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Sign In <ArrowRight className="w-5 h-5" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-[#5c706a]">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-[#d97757] font-semibold hover:underline" data-testid="register-link">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right side - Image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <div className="absolute inset-0 bg-[#0f392b]/80 z-10" />
                <img 
                    src="https://images.pexels.com/photos/8376277/pexels-photo-8376277.jpeg?w=800&h=1200&fit=crop"
                    alt="Healthcare support"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 z-20 flex items-center justify-center p-12">
                    <div className="text-center text-white max-w-lg">
                        <h2 className="font-manrope text-3xl font-bold mb-4">
                            Begin Your Recovery Journey
                        </h2>
                        <p className="text-white/80">
                            Access verified doctors, trusted rehabilitation centers, and a supportive community
                            all in one place.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
