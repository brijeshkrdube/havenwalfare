import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, doctorsAPI, rehabCentersAPI, addictionTypesAPI } from '../../lib/api';
import { User, Mail, Phone, Save, Heart, FileText, Building2, Stethoscope } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';

const PatientProfile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });
    
    // Addiction and medical history
    const [medicalData, setMedicalData] = useState({
        addiction_type_id: '',
        addiction_severity: '',
        addiction_duration: '',
        medical_history: '',
        previous_treatments: '',
        current_medications: '',
        emergency_contact_name: '',
        emergency_contact_phone: ''
    });

    // Preferences
    const [preferences, setPreferences] = useState({
        preferred_doctor_id: '',
        preferred_rehab_center_id: ''
    });

    // Data for dropdowns
    const [doctors, setDoctors] = useState([]);
    const [rehabCenters, setRehabCenters] = useState([]);
    const [addictionTypes, setAddictionTypes] = useState([]);

    useEffect(() => {
        fetchData();
        loadUserData();
    }, [user]);

    const fetchData = async () => {
        try {
            const [doctorsRes, centersRes, typesRes] = await Promise.all([
                doctorsAPI.getApproved(),
                rehabCentersAPI.getAll(),
                addictionTypesAPI.getAll()
            ]);
            setDoctors(doctorsRes.data);
            setRehabCenters(centersRes.data);
            setAddictionTypes(typesRes.data);
        } catch (error) {
            console.error('Failed to load data');
        } finally {
            setDataLoading(false);
        }
    };

    const loadUserData = () => {
        if (user?.profile_data) {
            setMedicalData({
                addiction_type_id: user.profile_data.addiction_type_id || '',
                addiction_severity: user.profile_data.addiction_severity || '',
                addiction_duration: user.profile_data.addiction_duration || '',
                medical_history: user.profile_data.medical_history || '',
                previous_treatments: user.profile_data.previous_treatments || '',
                current_medications: user.profile_data.current_medications || '',
                emergency_contact_name: user.profile_data.emergency_contact_name || '',
                emergency_contact_phone: user.profile_data.emergency_contact_phone || ''
            });
            setPreferences({
                preferred_doctor_id: user.profile_data.preferred_doctor_id || '',
                preferred_rehab_center_id: user.profile_data.preferred_rehab_center_id || ''
            });
        }
    };

    const handleBasicSubmit = async (e) => {
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

    const handleMedicalSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Update profile data via a new endpoint or using existing one
            const profileData = {
                ...user?.profile_data,
                ...medicalData,
                ...preferences
            };
            
            await authAPI.updateProfile({ 
                name: user.name,
                profile_data: profileData 
            });
            
            // Update local user state
            const updatedUser = {
                ...user,
                profile_data: profileData
            };
            updateUser(updatedUser);
            
            toast.success('Medical information updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update medical information');
        } finally {
            setLoading(false);
        }
    };

    const selectedAddictionType = addictionTypes.find(t => t.id === medicalData.addiction_type_id);

    return (
        <div className="space-y-6 fade-in" data-testid="patient-profile">
            <div>
                <h1 className="font-manrope text-2xl font-bold text-[#0f392b]">My Profile</h1>
                <p className="text-[#5c706a]">Manage your personal and medical information</p>
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

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card className="card-haven">
                    <CardHeader>
                        <CardTitle className="font-manrope text-lg text-[#0f392b] flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleBasicSubmit} className="space-y-4">
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
                                data-testid="save-basic-btn"
                            >
                                {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card className="card-haven">
                    <CardHeader>
                        <CardTitle className="font-manrope text-lg text-[#0f392b] flex items-center gap-2">
                            <Phone className="w-5 h-5" />
                            Emergency Contact
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="emergency_name">Contact Name</Label>
                            <Input
                                id="emergency_name"
                                value={medicalData.emergency_contact_name}
                                onChange={(e) => setMedicalData({ ...medicalData, emergency_contact_name: e.target.value })}
                                placeholder="Name of emergency contact"
                                className="border-[#e0e6e4] focus:border-[#0f392b]"
                                data-testid="emergency-name-input"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emergency_phone">Contact Phone</Label>
                            <Input
                                id="emergency_phone"
                                value={medicalData.emergency_contact_phone}
                                onChange={(e) => setMedicalData({ ...medicalData, emergency_contact_phone: e.target.value })}
                                placeholder="Phone number of emergency contact"
                                className="border-[#e0e6e4] focus:border-[#0f392b]"
                                data-testid="emergency-phone-input"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Addiction & Medical History */}
            <Card className="card-haven">
                <CardHeader>
                    <CardTitle className="font-manrope text-lg text-[#0f392b] flex items-center gap-2">
                        <Heart className="w-5 h-5 text-[#d97757]" />
                        Addiction & Medical History
                    </CardTitle>
                    <p className="text-sm text-[#5c706a]">
                        This information helps doctors and admin understand your situation better
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleMedicalSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Addiction Type *</Label>
                                <Select 
                                    value={medicalData.addiction_type_id || undefined} 
                                    onValueChange={(value) => setMedicalData({ ...medicalData, addiction_type_id: value })}
                                >
                                    <SelectTrigger data-testid="addiction-type-select">
                                        <SelectValue placeholder="Select addiction type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {addictionTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Severity Level</Label>
                                <Select 
                                    value={medicalData.addiction_severity || undefined} 
                                    onValueChange={(value) => setMedicalData({ ...medicalData, addiction_severity: value })}
                                >
                                    <SelectTrigger data-testid="severity-select">
                                        <SelectValue placeholder="Select severity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedAddictionType?.severity_levels?.length > 0 ? (
                                            selectedAddictionType.severity_levels.map((level) => (
                                                <SelectItem key={level} value={level}>
                                                    {level}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <>
                                                <SelectItem value="mild">Mild</SelectItem>
                                                <SelectItem value="moderate">Moderate</SelectItem>
                                                <SelectItem value="severe">Severe</SelectItem>
                                                <SelectItem value="critical">Critical</SelectItem>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration of Addiction</Label>
                                <Input
                                    id="duration"
                                    value={medicalData.addiction_duration}
                                    onChange={(e) => setMedicalData({ ...medicalData, addiction_duration: e.target.value })}
                                    placeholder="e.g., 2 years, 6 months"
                                    className="border-[#e0e6e4] focus:border-[#0f392b]"
                                    data-testid="duration-input"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="medical_history">Medical History</Label>
                            <Textarea
                                id="medical_history"
                                value={medicalData.medical_history}
                                onChange={(e) => setMedicalData({ ...medicalData, medical_history: e.target.value })}
                                placeholder="Describe any relevant medical conditions, allergies, or health issues..."
                                className="border-[#e0e6e4] focus:border-[#0f392b] min-h-[100px]"
                                data-testid="medical-history-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="previous_treatments">Previous Treatments</Label>
                            <Textarea
                                id="previous_treatments"
                                value={medicalData.previous_treatments}
                                onChange={(e) => setMedicalData({ ...medicalData, previous_treatments: e.target.value })}
                                placeholder="Describe any previous rehabilitation or treatment attempts..."
                                className="border-[#e0e6e4] focus:border-[#0f392b] min-h-[100px]"
                                data-testid="previous-treatments-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="current_medications">Current Medications</Label>
                            <Textarea
                                id="current_medications"
                                value={medicalData.current_medications}
                                onChange={(e) => setMedicalData({ ...medicalData, current_medications: e.target.value })}
                                placeholder="List any medications you are currently taking..."
                                className="border-[#e0e6e4] focus:border-[#0f392b]"
                                rows={3}
                                data-testid="medications-input"
                            />
                        </div>

                        {/* Preferred Doctor & Rehab Center */}
                        <div className="pt-4 border-t border-[#e0e6e4]">
                            <h3 className="font-manrope font-semibold text-[#0f392b] mb-4 flex items-center gap-2">
                                <Stethoscope className="w-5 h-5" />
                                Treatment Preferences
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Preferred Doctor</Label>
                                    <Select 
                                        value={preferences.preferred_doctor_id || "none"} 
                                        onValueChange={(value) => setPreferences({ ...preferences, preferred_doctor_id: value === "none" ? "" : value })}
                                    >
                                        <SelectTrigger data-testid="preferred-doctor-select">
                                            <SelectValue placeholder="Select preferred doctor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No preference</SelectItem>
                                            {doctors.map((doctor) => (
                                                <SelectItem key={doctor.id} value={doctor.id}>
                                                    {doctor.name} {doctor.profile_data?.specialization ? `(${doctor.profile_data.specialization})` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {doctors.length === 0 && (
                                        <p className="text-xs text-[#5c706a]">No verified doctors available yet</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Preferred Rehab Center</Label>
                                    <Select 
                                        value={preferences.preferred_rehab_center_id || "none"} 
                                        onValueChange={(value) => setPreferences({ ...preferences, preferred_rehab_center_id: value === "none" ? "" : value })}
                                    >
                                        <SelectTrigger data-testid="preferred-center-select">
                                            <SelectValue placeholder="Select preferred center" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No preference</SelectItem>
                                            {rehabCenters.map((center) => (
                                                <SelectItem key={center.id} value={center.id}>
                                                    {center.name} - {center.city}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {rehabCenters.length === 0 && (
                                        <p className="text-xs text-[#5c706a]">No rehab centers available yet</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#d97757] hover:bg-[#c26649] text-white rounded-full"
                            data-testid="save-medical-btn"
                        >
                            {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Medical Information</>}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Info Note */}
            <Card className="card-haven border-[#d97757]/30 bg-[#d97757]/5">
                <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-[#d97757] mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-[#0f392b] mb-1">Why is this information important?</h3>
                            <p className="text-sm text-[#5c706a]">
                                Your medical and addiction history helps doctors create a personalized treatment plan. 
                                This information is kept confidential and only shared with your assigned doctor and admin 
                                for treatment purposes.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PatientProfile;
