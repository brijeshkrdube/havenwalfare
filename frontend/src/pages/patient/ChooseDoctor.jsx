import React, { useState, useEffect } from 'react';
import { doctorsAPI, rehabCentersAPI, addictionTypesAPI, treatmentAPI } from '../../lib/api';
import { Stethoscope, Building2, Heart, Search, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';

const ChooseDoctor = () => {
    const [doctors, setDoctors] = useState([]);
    const [centers, setCenters] = useState([]);
    const [addictionTypes, setAddictionTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        doctor_id: '',
        rehab_center_id: '',
        addiction_type_id: '',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [doctorsRes, centersRes, typesRes] = await Promise.all([
                doctorsAPI.getApproved(),
                rehabCentersAPI.getAll(),
                addictionTypesAPI.getAll()
            ]);
            setDoctors(doctorsRes.data);
            setCenters(centersRes.data);
            setAddictionTypes(typesRes.data);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.doctor_id || !formData.rehab_center_id || !formData.addiction_type_id) {
            toast.error('Please select all required fields');
            return;
        }

        setSubmitting(true);
        try {
            await treatmentAPI.create(formData);
            toast.success('Treatment request submitted successfully!');
            setFormData({
                doctor_id: '',
                rehab_center_id: '',
                addiction_type_id: '',
                description: ''
            });
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredDoctors = doctors.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0f392b] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in" data-testid="choose-doctor">
            <div>
                <h1 className="font-manrope text-2xl font-bold text-[#0f392b]">Choose Doctor & Center</h1>
                <p className="text-[#5c706a]">Submit a treatment request to start your recovery journey</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Doctors List */}
                <Card className="card-haven">
                    <CardHeader>
                        <CardTitle className="font-manrope text-lg text-[#0f392b] flex items-center gap-2">
                            <Stethoscope className="w-5 h-5" />
                            Available Doctors
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5c706a]" />
                            <Input
                                placeholder="Search doctors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 border-[#e0e6e4] focus:border-[#0f392b]"
                                data-testid="search-doctors"
                            />
                        </div>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {filteredDoctors.length === 0 ? (
                                <p className="text-center text-[#5c706a] py-4">No doctors available</p>
                            ) : (
                                filteredDoctors.map((doctor) => (
                                    <div
                                        key={doctor.id}
                                        onClick={() => setFormData({ ...formData, doctor_id: doctor.id })}
                                        className={`p-4 rounded-xl cursor-pointer transition-all ${
                                            formData.doctor_id === doctor.id
                                                ? 'bg-[#0f392b] text-white'
                                                : 'bg-[#f8f9fa] hover:bg-[#f4f1ea]'
                                        }`}
                                        data-testid={`doctor-${doctor.id}`}
                                    >
                                        <p className="font-semibold">{doctor.name}</p>
                                        {doctor.profile_data?.specialization && (
                                            <p className={`text-sm ${formData.doctor_id === doctor.id ? 'text-white/70' : 'text-[#5c706a]'}`}>
                                                {doctor.profile_data.specialization}
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Request Form */}
                <Card className="card-haven">
                    <CardHeader>
                        <CardTitle className="font-manrope text-lg text-[#0f392b]">Treatment Request</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Selected Doctor *</Label>
                                <Input
                                    value={doctors.find(d => d.id === formData.doctor_id)?.name || 'Select from the list'}
                                    disabled
                                    className="bg-[#f8f9fa]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Rehab Center *</Label>
                                <Select 
                                    value={formData.rehab_center_id} 
                                    onValueChange={(value) => setFormData({ ...formData, rehab_center_id: value })}
                                >
                                    <SelectTrigger data-testid="rehab-center-select">
                                        <SelectValue placeholder="Select a rehab center" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {centers.map((center) => (
                                            <SelectItem key={center.id} value={center.id}>
                                                {center.name} - {center.city}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Addiction Type *</Label>
                                <Select 
                                    value={formData.addiction_type_id} 
                                    onValueChange={(value) => setFormData({ ...formData, addiction_type_id: value })}
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
                                <Label>Description (Optional)</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe your situation and any specific needs..."
                                    className="border-[#e0e6e4] focus:border-[#0f392b]"
                                    rows={4}
                                    data-testid="description-input"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={submitting || !formData.doctor_id}
                                className="w-full bg-[#d97757] hover:bg-[#c26649] text-white rounded-full"
                                data-testid="submit-request-btn"
                            >
                                {submitting ? 'Submitting...' : <><Send className="w-4 h-4 mr-2" /> Submit Request</>}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ChooseDoctor;
