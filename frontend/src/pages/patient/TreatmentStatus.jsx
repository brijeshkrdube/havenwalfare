import React, { useState, useEffect } from 'react';
import { treatmentAPI } from '../../lib/api';
import { ClipboardList, CheckCircle, XCircle, Clock, User, Building2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { toast } from 'sonner';

const TreatmentStatus = () => {
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
            toast.error('Failed to load treatment requests');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'accepted': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />;
            default: return <Clock className="w-5 h-5 text-yellow-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted': return 'border-green-200 bg-green-50';
            case 'rejected': return 'border-red-200 bg-red-50';
            default: return 'border-yellow-200 bg-yellow-50';
        }
    };

    return (
        <div className="space-y-6 fade-in" data-testid="treatment-status">
            <div>
                <h1 className="font-manrope text-2xl font-bold text-[#0f392b]">Treatment Status</h1>
                <p className="text-[#5c706a]">Track the status of your treatment requests</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0f392b] border-t-transparent"></div>
                </div>
            ) : requests.length === 0 ? (
                <Card className="card-haven">
                    <CardContent className="text-center py-12">
                        <ClipboardList className="w-16 h-16 text-[#5c706a] mx-auto mb-4" />
                        <h3 className="font-manrope text-xl font-semibold text-[#0f392b] mb-2">No Treatment Requests</h3>
                        <p className="text-[#5c706a]">You haven't submitted any treatment requests yet</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <Card 
                            key={request.id} 
                            className={`card-haven border-2 ${getStatusColor(request.status)}`}
                            data-testid={`request-${request.id}`}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(request.status)}
                                        <div>
                                            <h3 className="font-semibold text-[#0f392b]">
                                                Request to Dr. {request.doctor_name}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {request.status}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-sm text-[#5c706a]">
                                        {new Date(request.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-[#5c706a]">
                                        <Building2 className="w-4 h-4" />
                                        <span>{request.rehab_center_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[#5c706a]">
                                        <span className="font-medium">Addiction:</span>
                                        <span>{request.addiction_type_name}</span>
                                    </div>
                                </div>
                                {request.description && (
                                    <p className="text-sm text-[#5c706a] mt-3 p-3 bg-white/50 rounded-lg">
                                        {request.description}
                                    </p>
                                )}
                                {request.treatment_notes && (
                                    <div className="mt-4 p-4 bg-white rounded-xl">
                                        <p className="text-sm font-medium text-[#0f392b] mb-1">Doctor's Notes:</p>
                                        <p className="text-[#5c706a]">{request.treatment_notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TreatmentStatus;
