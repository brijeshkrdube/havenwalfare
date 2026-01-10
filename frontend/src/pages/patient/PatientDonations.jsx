import React, { useState, useEffect } from 'react';
import { donationsAPI } from '../../lib/api';
import { HandCoins, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';

const PatientDonations = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDonations();
    }, []);

    const fetchDonations = async () => {
        try {
            const response = await donationsAPI.getAll();
            setDonations(response.data);
        } catch (error) {
            toast.error('Failed to load donations');
        } finally {
            setLoading(false);
        }
    };

    const totalApproved = donations
        .filter(d => d.status === 'approved')
        .reduce((sum, d) => sum + d.amount, 0);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
            default: return <Clock className="w-4 h-4 text-yellow-600" />;
        }
    };

    return (
        <div className="space-y-6 fade-in" data-testid="patient-donations">
            <div>
                <h1 className="font-manrope text-2xl font-bold text-[#0f392b]">My Donations</h1>
                <p className="text-[#5c706a]">View donations received for your treatment</p>
            </div>

            {/* Summary */}
            <Card className="card-haven bg-gradient-to-r from-[#d97757]/10 to-transparent">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[#5c706a] text-sm">Total Approved Donations</p>
                            <p className="font-manrope text-4xl font-bold text-[#d97757] mt-1">
                                ${totalApproved.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-16 h-16 bg-[#d97757]/20 rounded-2xl flex items-center justify-center">
                            <HandCoins className="w-8 h-8 text-[#d97757]" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Donations List */}
            <Card className="card-haven">
                <CardHeader>
                    <CardTitle className="font-manrope text-lg text-[#0f392b]">Donation History</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0f392b] border-t-transparent"></div>
                        </div>
                    ) : donations.length === 0 ? (
                        <div className="text-center py-12">
                            <HandCoins className="w-16 h-16 text-[#5c706a] mx-auto mb-4" />
                            <p className="text-[#5c706a]">No donations received yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {donations.map((donation) => (
                                <div 
                                    key={donation.id} 
                                    className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-xl"
                                    data-testid={`donation-${donation.id}`}
                                >
                                    <div className="flex items-center gap-4">
                                        {getStatusIcon(donation.status)}
                                        <div>
                                            <p className="font-semibold text-[#0f392b]">
                                                {donation.donor_name || 'Anonymous Donor'}
                                            </p>
                                            <p className="text-sm text-[#5c706a]">
                                                {donation.donor_email || 'No email provided'}
                                            </p>
                                            <p className="text-xs text-[#5c706a] mt-1">
                                                Transaction: {donation.transaction_id}
                                            </p>
                                        </div>
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
                                        <p className="text-xs text-[#5c706a] mt-1">
                                            {new Date(donation.created_at).toLocaleDateString()}
                                        </p>
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

export default PatientDonations;
