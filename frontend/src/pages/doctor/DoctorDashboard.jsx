import React, { useState, useEffect } from 'react';
import { treatmentAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { ClipboardList, Users, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';

const DoctorDashboard = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await treatmentAPI.getAll();
            setRequests(response.data);
        } catch (error) {
            toast.error('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const acceptedCount = requests.filter(r => r.status === 'accepted').length;

    return (
        <div className="space-y-8 fade-in" data-testid="doctor-dashboard">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-[#0f392b] to-[#1a5c47] rounded-3xl p-8 text-white">
                <h1 className="font-manrope text-3xl font-bold">Welcome, Dr. {user?.name}!</h1>
                <p className="text-white/70 mt-2">Manage your patients and treatment requests.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="card-haven">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[#5c706a] text-sm">Pending Requests</p>
                                <p className="font-manrope text-3xl font-bold text-[#0f392b] mt-2">{pendingCount}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="card-haven">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[#5c706a] text-sm">Active Patients</p>
                                <p className="font-manrope text-3xl font-bold text-[#0f392b] mt-2">{acceptedCount}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="card-haven">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[#5c706a] text-sm">Total Requests</p>
                                <p className="font-manrope text-3xl font-bold text-[#0f392b] mt-2">{requests.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-[#d97757]/20 rounded-2xl flex items-center justify-center">
                                <ClipboardList className="w-6 h-6 text-[#d97757]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Requests */}
            <Card className="card-haven">
                <CardHeader>
                    <CardTitle className="font-manrope text-xl text-[#0f392b]">Recent Patient Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0f392b] border-t-transparent"></div>
                        </div>
                    ) : requests.length === 0 ? (
                        <p className="text-center text-[#5c706a] py-8">No patient requests yet</p>
                    ) : (
                        <div className="space-y-4">
                            {requests.slice(0, 5).map((request) => (
                                <div 
                                    key={request.id} 
                                    className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-xl"
                                >
                                    <div>
                                        <p className="font-semibold text-[#0f392b]">{request.patient_name}</p>
                                        <p className="text-sm text-[#5c706a]">
                                            {request.addiction_type_name} • {request.rehab_center_name}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {request.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DoctorDashboard;
