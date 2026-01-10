import React, { useState, useEffect } from 'react';
import { treatmentAPI } from '../../lib/api';
import { CheckCircle, XCircle, Clock, User, Building2, FileText } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';

const PatientRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showNotesDialog, setShowNotesDialog] = useState(false);
    const [treatmentNotes, setTreatmentNotes] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

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

    const handleRespond = async (requestId, response) => {
        setActionLoading(true);
        try {
            await treatmentAPI.respond(requestId, response);
            toast.success(`Request ${response}`);
            fetchRequests();
        } catch (error) {
            toast.error('Failed to respond to request');
        } finally {
            setActionLoading(false);
        }
    };

    const openNotesDialog = (request) => {
        setSelectedRequest(request);
        setTreatmentNotes(request.treatment_notes || '');
        setShowNotesDialog(true);
    };

    const saveNotes = async () => {
        if (!selectedRequest) return;
        setActionLoading(true);
        try {
            await treatmentAPI.updateNotes(selectedRequest.id, treatmentNotes);
            toast.success('Treatment notes updated');
            setShowNotesDialog(false);
            fetchRequests();
        } catch (error) {
            toast.error('Failed to update notes');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            accepted: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return badges[status] || badges.pending;
    };

    return (
        <div className="space-y-6 fade-in" data-testid="patient-requests">
            <div>
                <h1 className="font-manrope text-2xl font-bold text-[#0f392b]">Patient Requests</h1>
                <p className="text-[#5c706a]">Review and manage treatment requests from patients</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0f392b] border-t-transparent"></div>
                </div>
            ) : requests.length === 0 ? (
                <Card className="card-haven">
                    <CardContent className="text-center py-12">
                        <Clock className="w-16 h-16 text-[#5c706a] mx-auto mb-4" />
                        <h3 className="font-manrope text-xl font-semibold text-[#0f392b] mb-2">No Requests</h3>
                        <p className="text-[#5c706a]">You don't have any patient requests yet</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <Card key={request.id} className="card-haven" data-testid={`request-${request.id}`}>
                            <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#f4f1ea] rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-[#0f392b]" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-[#0f392b]">{request.patient_name}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                                                    {request.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
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
                                            <p className="text-sm text-[#5c706a] bg-[#f8f9fa] p-3 rounded-lg">
                                                {request.description}
                                            </p>
                                        )}
                                        <p className="text-xs text-[#5c706a]">
                                            Requested on {new Date(request.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {request.status === 'pending' && (
                                            <>
                                                <Button
                                                    onClick={() => handleRespond(request.id, 'accepted')}
                                                    disabled={actionLoading}
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                    data-testid={`accept-${request.id}`}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" /> Accept
                                                </Button>
                                                <Button
                                                    onClick={() => handleRespond(request.id, 'rejected')}
                                                    disabled={actionLoading}
                                                    variant="destructive"
                                                    data-testid={`reject-${request.id}`}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" /> Reject
                                                </Button>
                                            </>
                                        )}
                                        {request.status === 'accepted' && (
                                            <Button
                                                onClick={() => openNotesDialog(request)}
                                                variant="outline"
                                                className="border-[#0f392b] text-[#0f392b]"
                                                data-testid={`notes-${request.id}`}
                                            >
                                                <FileText className="w-4 h-4 mr-2" /> Treatment Notes
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Treatment Notes Dialog */}
            <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-manrope text-xl text-[#0f392b]">
                            Treatment Notes - {selectedRequest?.patient_name}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Textarea
                            value={treatmentNotes}
                            onChange={(e) => setTreatmentNotes(e.target.value)}
                            placeholder="Enter treatment notes, progress, and observations..."
                            className="border-[#e0e6e4] focus:border-[#0f392b] min-h-[200px]"
                            data-testid="treatment-notes-input"
                        />
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowNotesDialog(false)}
                                className="border-[#0f392b] text-[#0f392b]"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={saveNotes}
                                disabled={actionLoading}
                                className="bg-[#d97757] hover:bg-[#c26649] text-white"
                                data-testid="save-notes-btn"
                            >
                                {actionLoading ? 'Saving...' : 'Save Notes'}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PatientRequests;
