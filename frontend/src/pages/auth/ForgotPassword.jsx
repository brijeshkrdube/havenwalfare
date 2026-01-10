import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../lib/api';
import { Heart, Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await authAPI.forgotPassword(email);
            setSent(true);
            toast.success('If the email exists, a reset link has been sent.');
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f4f1ea] via-white to-[#e0e6e4] flex items-center justify-center p-8">
                <div className="w-full max-w-md text-center space-y-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="font-manrope text-2xl font-bold text-[#0f392b]">
                        Check Your Email
                    </h1>
                    <p className="text-[#5c706a]">
                        If an account with <strong>{email}</strong> exists, 
                        we've sent a password reset link. Please check your inbox and spam folder.
                    </p>
                    <Link to="/login">
                        <Button className="bg-[#d97757] hover:bg-[#c26649] text-white rounded-full px-8">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
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
                        <div className="w-10 h-10 bg-[#0f392b] rounded-xl flex items-center justify-center">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-manrope text-xl font-bold text-[#0f392b]">HavenWelfare</span>
                    </Link>
                    <h1 className="font-manrope text-3xl font-bold text-[#0f392b] tracking-tight">
                        Forgot Password?
                    </h1>
                    <p className="text-[#5c706a] mt-2">
                        Enter your email and we'll send you a reset link
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" data-testid="forgot-password-form">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-[#0f392b]">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5c706a]" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-12 h-12 bg-white border-[#e0e6e4] focus:border-[#0f392b] focus:ring-[#0f392b]/20 rounded-xl"
                                required
                                data-testid="email-input"
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
                                Sending...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Send Reset Link <ArrowRight className="w-5 h-5" />
                            </span>
                        )}
                    </Button>
                </form>

                <p className="text-center text-[#5c706a]">
                    Remember your password?{' '}
                    <Link to="/login" className="text-[#d97757] font-semibold hover:underline">
                        Sign in here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
