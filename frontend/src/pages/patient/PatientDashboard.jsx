import React, { useState, useEffect } from 'react';
import { treatmentAPI, donationsAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { ClipboardList, HandCoins, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';

const PatientDashboard = () => {
    const { user } = useAuth();
    const [treatments, setTreatments] = useState([]);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [treatmentRes, donationRes] = await Promise.all([
                treatmentAPI.getAll(),
                donationsAPI.getAll()
            ]);
            setTreatments(treatmentRes.data);
            setDonations(donationRes.data);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const totalDonations = donations
        .filter(d => d.status === 'approved')
        .reduce((sum, d) => sum + d.amount, 0);

    const activeTreatment = treatments.find(t => t.status === 'accepted');

    return (
        <div className="space-y-8 fade-in" data-testid="patient-dashboard">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-[#0f392b] to-[#1a5c47] rounded-3xl p-8 text-white">
                <h1 className="font-manrope text-3xl font-bold">Welcome, {user?.name}!</h1>
                <p className="text-white/70 mt-2">Track your recovery journey and manage your profile.</p>
            </div>

            {/* Status Banner */}
            {user?.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                    <div>
                        <p className="font-semibold text-yellow-800">Account Pending Approval</p>
                        <p className="text-sm text-yellow-700">Your account is being reviewed by our admin team.</p>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="card-haven">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[#5c706a] text-sm">Treatment Status</p>
                                <p className="font-manrope text-xl font-bold text-[#0f392b] mt-2">
                                    {activeTreatment ? 'Active' : 'No Active Treatment'}
                                </p>
                            </div>
                            <div className={`w-12 h-12 ${activeTreatment ? 'bg-green-100' : 'bg-gray-100'} rounded-2xl flex items-center justify-center`}>
                                <ClipboardList className={`w-6 h-6 ${activeTreatment ? 'text-green-600' : 'text-gray-500'}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="card-haven">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[#5c706a] text-sm">Total Donations Received</p>
                                <p className="font-manrope text-3xl font-bold text-[#d97757] mt-2">
                                    ${totalDonations.toLocaleString()}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-[#d97757]/20 rounded-2xl flex items-center justify-center">
                                <HandCoins className="w-6 h-6 text-[#d97757]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="card-haven">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[#5c706a] text-sm">Treatment Requests</p>
                                <p className="font-manrope text-3xl font-bold text-[#0f392b] mt-2">
                                    {treatments.length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Active Treatment */}
            {activeTreatment && (
                <Card className="card-haven border-green-200 border-2">
                    <CardHeader>
                        <CardTitle className="font-manrope text-xl text-[#0f392b] flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Active Treatment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-[#5c706a]">Doctor</p>
                                <p className="font-semibold text-[#0f392b]">{activeTreatment.doctor_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#5c706a]">Rehab Center</p>
                                <p className="font-semibold text-[#0f392b]">{activeTreatment.rehab_center_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#5c706a]">Addiction Type</p>
                                <p className="font-semibold text-[#0f392b]">{activeTreatment.addiction_type_name}</p>
                            </div>
                        </div>
                        {activeTreatment.treatment_notes && (
                            <div className="mt-4 p-4 bg-[#f8f9fa] rounded-xl">
                                <p className="text-sm text-[#5c706a] mb-1">Doctor's Notes:</p>
                                <p className="text-[#0f392b]">{activeTreatment.treatment_notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Recent Donations */}
            <Card className="card-haven">
                <CardHeader>
                    <CardTitle className="font-manrope text-xl text-[#0f392b]">Recent Donations</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0f392b] border-t-transparent"></div>
                        </div>
                    ) : donations.length === 0 ? (
                        <p className="text-center text-[#5c706a] py-8">No donations received yet</p>
                    ) : (
                        <div className="space-y-4">
                            {donations.slice(0, 5).map((donation) => (
                                <div 
                                    key={donation.id} 
                                    className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-xl"
                                >
                                    <div>
                                        <p className="font-semibold text-[#0f392b]">
                                            {donation.donor_name || 'Anonymous Donor'}
                                        </p>
                                        <p className="text-sm text-[#5c706a]">
                                            {new Date(donation.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-[#d97757]">${donation.amount.toLocaleString()}</p>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            donation.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            donation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {donation.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PatientDashboard;
