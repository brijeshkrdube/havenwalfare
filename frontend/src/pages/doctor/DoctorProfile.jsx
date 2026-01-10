import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, doctorsAPI } from '../../lib/api';
import { User, Mail, Phone, Upload, Save, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DoctorProfile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });
    const [profileData, setProfileData] = useState({
        specialization: '',
        experience: '',
        qualification: '',
        bio: ''
    });

    useEffect(() => {
        if (user?.profile_data) {
            setProfileData({
                specialization: user.profile_data.specialization || '',
                experience: user.profile_data.experience || '',
                qualification: user.profile_data.qualification || '',
                bio: user.profile_data.bio || ''
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authAPI.updateProfile(formData);
            updateUser(response.data);
            toast.success('Profile updated');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileDataUpdate = async () => {
        setLoading(true);
        try {
            await doctorsAPI.updateProfileData(profileData);
            toast.success('Professional details updated');
        } catch (error) {
            toast.error('Failed to update details');
        } finally {
            setLoading(false);
        }
    };

    const handleDocumentUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            await doctorsAPI.uploadVerificationDoc(file);
            toast.success('Document uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6 fade-in" data-testid="doctor-profile">
            <div>
                <h1 className="font-manrope text-2xl font-bold text-[#0f392b]">My Profile</h1>
                <p className="text-[#5c706a]">Manage your personal and professional information</p>
            </div>

            {/* Status Banner */}
            {user?.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-yellow-800">Verification Pending</p>
                        <p className="text-sm text-yellow-700">Your account is awaiting admin approval. Please upload verification documents.</p>
                    </div>
                </div>
            )}
            {user?.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-green-800">Verified Doctor</p>
                        <p className="text-sm text-green-700">Your account has been verified by admin.</p>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Basic Info */}
                <Card className="card-haven">
                    <CardHeader>
                        <CardTitle className="font-manrope text-lg text-[#0f392b] flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="border-[#e0e6e4] focus:border-[#0f392b]"
                                    data-testid="name-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="border-[#e0e6e4] focus:border-[#0f392b]"
                                    data-testid="email-input"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="border-[#e0e6e4] focus:border-[#0f392b]"
                                    data-testid="phone-input"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#d97757] hover:bg-[#c26649] text-white rounded-full"
                                data-testid="save-basic-btn"
                            >
                                {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Professional Info */}
                <Card className="card-haven">
                    <CardHeader>
                        <CardTitle className="font-manrope text-lg text-[#0f392b] flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Professional Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="specialization">Specialization</Label>
                            <Input
                                id="specialization"
                                value={profileData.specialization}
                                onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                                placeholder="e.g., Addiction Psychiatrist"
                                className="border-[#e0e6e4] focus:border-[#0f392b]"
                                data-testid="specialization-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="experience">Years of Experience</Label>
                            <Input
                                id="experience"
                                value={profileData.experience}
                                onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                                placeholder="e.g., 10 years"
                                className="border-[#e0e6e4] focus:border-[#0f392b]"
                                data-testid="experience-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="qualification">Qualifications</Label>
                            <Input
                                id="qualification"
                                value={profileData.qualification}
                                onChange={(e) => setProfileData({ ...profileData, qualification: e.target.value })}
                                placeholder="e.g., MBBS, MD Psychiatry"
                                className="border-[#e0e6e4] focus:border-[#0f392b]"
                                data-testid="qualification-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                value={profileData.bio}
                                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                placeholder="Brief description about yourself..."
                                className="border-[#e0e6e4] focus:border-[#0f392b]"
                                rows={3}
                                data-testid="bio-input"
                            />
                        </div>
                        <Button
                            onClick={handleProfileDataUpdate}
                            disabled={loading}
                            className="w-full bg-[#d97757] hover:bg-[#c26649] text-white rounded-full"
                            data-testid="save-professional-btn"
                        >
                            {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Details</>}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Verification Documents */}
            <Card className="card-haven">
                <CardHeader>
                    <CardTitle className="font-manrope text-lg text-[#0f392b] flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        Verification Documents
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-[#5c706a] mb-4">
                        Upload your medical license, degree certificates, or other verification documents.
                    </p>
                    <Label htmlFor="doc_upload" className="cursor-pointer">
                        <div className="flex items-center justify-center gap-2 p-8 border-2 border-dashed border-[#e0e6e4] rounded-xl hover:border-[#0f392b] transition-colors">
                            <Upload className="w-6 h-6 text-[#5c706a]" />
                            <span className="text-[#5c706a]">
                                {uploading ? 'Uploading...' : 'Click to upload verification document'}
                            </span>
                        </div>
                        <Input
                            id="doc_upload"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleDocumentUpload}
                            className="hidden"
                            disabled={uploading}
                            data-testid="doc-upload-input"
                        />
                    </Label>
                    {user?.profile_data?.verification_documents?.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-[#0f392b] mb-2">Uploaded Documents:</p>
                            <div className="space-y-2">
                                {user.profile_data.verification_documents.map((doc, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 bg-[#f8f9fa] rounded-lg">
                                        <FileText className="w-4 h-4 text-[#5c706a]" />
                                        <a 
                                            href={`${BACKEND_URL}${doc}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-[#d97757] hover:underline"
                                        >
                                            Document {idx + 1}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DoctorProfile;
