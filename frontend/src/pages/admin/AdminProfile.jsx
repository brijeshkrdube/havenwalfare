import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../lib/api';
import { User, Mail, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

const AdminProfile = () => {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        
        // Validate passwords if changing
        if (profileData.new_password) {
            if (!profileData.current_password) {
                toast.error('Current password is required to change password');
                return;
            }
            if (profileData.new_password !== profileData.confirm_password) {
                toast.error('New passwords do not match');
                return;
            }
            if (profileData.new_password.length < 6) {
                toast.error('New password must be at least 6 characters');
                return;
            }
        }

        setLoading(true);
        try {
            const updateData = {};
            
            if (profileData.name !== user.name) {
                updateData.name = profileData.name;
            }
            if (profileData.email !== user.email) {
                updateData.email = profileData.email;
            }
            if (profileData.new_password) {
                updateData.current_password = profileData.current_password;
                updateData.new_password = profileData.new_password;
            }

            if (Object.keys(updateData).length === 0) {
                toast.info('No changes to update');
                setLoading(false);
                return;
            }

            const response = await adminAPI.updateAdminProfile(updateData);
            toast.success(response.data.message);
            
            // Clear password fields
            setProfileData(prev => ({
                ...prev,
                current_password: '',
                new_password: '',
                confirm_password: ''
            }));

            // If email was changed, user needs to re-login
            if (updateData.email) {
                toast.info('Email changed. Please login again with your new email.');
            }
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-manrope text-3xl font-bold text-[#0f392b]">Admin Profile</h1>
                <p className="text-[#5c706a] mt-1">Update your account details and password</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Profile Information */}
                <Card className="border-[#e0e6e4]">
                    <CardHeader>
                        <CardTitle className="font-manrope text-xl text-[#0f392b] flex items-center gap-2">
                            <User className="w-5 h-5 text-[#d97757]" />
                            Profile Information
                        </CardTitle>
                        <CardDescription>Update your name and email address</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5c706a]" />
                                    <Input
                                        id="name"
                                        name="name"
                                        value={profileData.name}
                                        onChange={handleChange}
                                        className="pl-10 border-[#e0e6e4] focus:border-[#d97757]"
                                        placeholder="Your name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5c706a]" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={profileData.email}
                                        onChange={handleChange}
                                        className="pl-10 border-[#e0e6e4] focus:border-[#d97757]"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full bg-[#0f392b] hover:bg-[#0a2a1f] text-white"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Updating...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Change Password */}
                <Card className="border-[#e0e6e4]">
                    <CardHeader>
                        <CardTitle className="font-manrope text-xl text-[#0f392b] flex items-center gap-2">
                            <Lock className="w-5 h-5 text-[#d97757]" />
                            Change Password
                        </CardTitle>
                        <CardDescription>Update your account password</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current_password">Current Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5c706a]" />
                                    <Input
                                        id="current_password"
                                        name="current_password"
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={profileData.current_password}
                                        onChange={handleChange}
                                        className="pl-10 pr-10 border-[#e0e6e4] focus:border-[#d97757]"
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5c706a] hover:text-[#0f392b]"
                                    >
                                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new_password">New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5c706a]" />
                                    <Input
                                        id="new_password"
                                        name="new_password"
                                        type={showNewPassword ? "text" : "password"}
                                        value={profileData.new_password}
                                        onChange={handleChange}
                                        className="pl-10 pr-10 border-[#e0e6e4] focus:border-[#d97757]"
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5c706a] hover:text-[#0f392b]"
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm_password">Confirm New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5c706a]" />
                                    <Input
                                        id="confirm_password"
                                        name="confirm_password"
                                        type="password"
                                        value={profileData.confirm_password}
                                        onChange={handleChange}
                                        className="pl-10 border-[#e0e6e4] focus:border-[#d97757]"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full bg-[#d97757] hover:bg-[#c26649] text-white"
                                disabled={loading || !profileData.current_password || !profileData.new_password}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Updating...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Update Password
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Account Info */}
            <Card className="border-[#e0e6e4] bg-[#f4f1ea]/50">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[#0f392b] flex items-center justify-center text-white text-2xl font-bold">
                            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div>
                            <h3 className="font-manrope text-lg font-semibold text-[#0f392b]">{user?.name}</h3>
                            <p className="text-[#5c706a]">{user?.email}</p>
                            <span className="inline-block mt-1 px-3 py-1 bg-[#0f392b] text-white text-xs rounded-full uppercase">
                                {user?.role}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminProfile;
