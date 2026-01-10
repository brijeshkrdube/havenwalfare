import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../lib/api';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_3463593f-4cba-425e-a575-89c0d925427c/artifacts/n1f21t65_unnamed-removebg-preview.png";

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
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

        if (!token) {
            toast.error('Invalid reset token');
            return;
        }

        setLoading(true);

        try {
            await authAPI.resetPassword(token, formData.password);
            setSuccess(true);
            toast.success('Password reset successfully!');
        } catch (error) {
            const message = error.response?.data?.detail || 'Failed to reset password. The link may have expired.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f4f1ea] via-white to-[#e0e6e4] flex items-center justify-center p-8">
                <div className="w-full max-w-md text-center space-y-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="font-manrope text-2xl font-bold text-[#0f392b]">
                        Password Reset Successful
                    </h1>
                    <p className="text-[#5c706a]">
                        Your password has been reset. You can now log in with your new password.
                    </p>
                    <Link to="/login">
                        <Button className="bg-[#d97757] hover:bg-[#c26649] text-white rounded-full px-8">
                            Go to Login <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f4f1ea] via-white to-[#e0e6e4] flex items-center justify-center p-8">
                <div className="w-full max-w-md text-center space-y-6">
                    <h1 className="font-manrope text-2xl font-bold text-[#0f392b]">
                        Invalid Reset Link
                    </h1>
                    <p className="text-[#5c706a]">
                        This password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <Link to="/forgot-password">
                        <Button className="bg-[#d97757] hover:bg-[#c26649] text-white rounded-full px-8">
                            Request New Link
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f4f1ea] via-white to-[#e0e6e4] flex items-center justify-center p-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <Link to="/" className="flex items-center gap-3 mb-8">
                        <img src={LOGO_URL} alt="HavenWelfare" className="w-10 h-10 object-contain" />
                        <span className="font-manrope text-xl font-bold text-[#0f392b]">HavenWelfare</span>
                    </Link>
                    <h1 className="font-manrope text-3xl font-bold text-[#0f392b] tracking-tight">
                        Reset Password
                    </h1>
                    <p className="text-[#5c706a] mt-2">
                        Enter your new password below
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" data-testid="reset-password-form">
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-[#0f392b]">New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5c706a]" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter new password"
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
                        <Label htmlFor="confirmPassword" className="text-[#0f392b]">Confirm New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5c706a]" />
                            <Input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirm new password"
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
                        data-testid="submit-btn"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                Resetting...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Reset Password <ArrowRight className="w-5 h-5" />
                            </span>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
