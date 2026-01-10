import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, Stethoscope, UserCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_3463593f-4cba-425e-a575-89c0d925427c/artifacts/n1f21t65_unnamed-removebg-preview.png";

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'patient'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: formData.role
            });
            
            toast.success('Registration successful! Please wait for admin approval.');
            navigate('/login');
        } catch (error) {
            const message = error.response?.data?.detail || 'Registration failed. Please try again.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f4f1ea] via-white to-[#e0e6e4] flex">
            {/* Left side - Image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <div className="absolute inset-0 bg-[#0f392b]/80 z-10" />
                <img 
                    src="https://images.unsplash.com/photo-1565262353342-6e919eab5b58?w=800&h=1200&fit=crop"
                    alt="Rehabilitation center"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 z-20 flex items-center justify-center p-12">
                    <div className="text-center text-white max-w-lg">
                        <h2 className="font-manrope text-3xl font-bold mb-4">
                            Join Our Community
                        </h2>
                        <p className="text-white/80">
                            Whether you're a medical professional or seeking help, 
                            HavenWelfare is here to support your journey.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
                <div className="w-full max-w-md space-y-6">
                    <div>
                        <Link to="/" className="flex items-center gap-3 mb-8" data-testid="logo-link">
                            <img src={LOGO_URL} alt="HavenWelfare" className="w-10 h-10 object-contain" />
                            <span className="font-manrope text-xl font-bold text-[#0f392b]">HavenWelfare</span>
                        </Link>
                        <h1 className="font-manrope text-3xl font-bold text-[#0f392b] tracking-tight">
                            Create Account
                        </h1>
                        <p className="text-[#5c706a] mt-2">
                            Register as a doctor or patient
                        </p>
                    </div>

                    {/* Role Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'patient' })}
                            className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                                formData.role === 'patient'
                                    ? 'border-[#0f392b] bg-[#0f392b] text-white'
                                    : 'border-[#e0e6e4] bg-white text-[#0f392b] hover:border-[#0f392b]'
                            }`}
                            data-testid="role-patient"
                        >
                            <UserCircle className="w-8 h-8 mx-auto mb-2" />
                            <span className="font-semibold">Patient</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'doctor' })}
                            className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                                formData.role === 'doctor'
                                    ? 'border-[#0f392b] bg-[#0f392b] text-white'
                                    : 'border-[#e0e6e4] bg-white text-[#0f392b] hover:border-[#0f392b]'
                            }`}
                            data-testid="role-doctor"
                        >
                            <Stethoscope className="w-8 h-8 mx-auto mb-2" />
                            <span className="font-semibold">Doctor</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[#0f392b]">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5c706a]" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="pl-12 h-12 bg-white border-[#e0e6e4] focus:border-[#0f392b] focus:ring-[#0f392b]/20 rounded-xl"
                                    required
                                    data-testid="name-input"
                                />
                            </div>
                        </div>

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
                            <Label htmlFor="phone" className="text-[#0f392b]">Phone Number (Optional)</Label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5c706a]" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="pl-12 h-12 bg-white border-[#e0e6e4] focus:border-[#0f392b] focus:ring-[#0f392b]/20 rounded-xl"
                                    data-testid="phone-input"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[#0f392b]">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5c706a]" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a password"
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
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-[#0f392b]">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5c706a]" />
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="pl-12 h-12 bg-white border-[#e0e6e4] focus:border-[#0f392b] focus:ring-[#0f392b]/20 rounded-xl"
                                    required
                                    data-testid="confirm-password-input"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#d97757] hover:bg-[#c26649] text-white rounded-full h-12 text-lg font-semibold"
                            data-testid="register-submit"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                    Creating account...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Create Account <ArrowRight className="w-5 h-5" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-[#5c706a]">
                        Already have an account?{' '}
                        <Link to="/login" className="text-[#d97757] font-semibold hover:underline" data-testid="login-link">
                            Sign in here
                        </Link>
                    </p>

                    <p className="text-center text-xs text-[#5c706a]">
                        By registering, you agree to our Terms of Service and Privacy Policy.
                        All registrations require admin approval.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
