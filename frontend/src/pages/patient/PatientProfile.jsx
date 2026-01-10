import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../lib/api';
import { User, Mail, Phone, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

const PatientProfile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authAPI.updateProfile(formData);
            updateUser(response.data);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 fade-in" data-testid="patient-profile">
            <div>
                <h1 className="font-manrope text-2xl font-bold text-[#0f392b]">My Profile</h1>
                <p className="text-[#5c706a]">Manage your personal information</p>
            </div>

            {/* Account Status */}
            <Card className={`card-haven ${
                user?.status === 'approved' ? 'border-green-200' : 
                user?.status === 'pending' ? 'border-yellow-200' : 'border-red-200'
            }`}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[#5c706a]">Account Status</p>
                            <p className={`font-semibold capitalize ${
                                user?.status === 'approved' ? 'text-green-600' :
                                user?.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                                {user?.status}
                            </p>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                            user?.status === 'approved' ? 'bg-green-100 text-green-800' :
                            user?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                        }`}>
                            {user?.role}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Profile Form */}
            <Card className="card-haven max-w-2xl">
                <CardHeader>
                    <CardTitle className="font-manrope text-lg text-[#0f392b] flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Personal Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5c706a]" />
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="pl-10 border-[#e0e6e4] focus:border-[#0f392b]"
                                    data-testid="name-input"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5c706a]" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="pl-10 border-[#e0e6e4] focus:border-[#0f392b]"
                                    data-testid="email-input"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5c706a]" />
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Enter your phone number"
                                    className="pl-10 border-[#e0e6e4] focus:border-[#0f392b]"
                                    data-testid="phone-input"
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#d97757] hover:bg-[#c26649] text-white rounded-full"
                            data-testid="save-profile-btn"
                        >
                            {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default PatientProfile;
