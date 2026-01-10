import React, { useState, useEffect } from 'react';
import { treatmentAPI, addictionTypesAPI, rehabCentersAPI } from '../../lib/api';
import { CheckCircle, XCircle, Clock, User, Building2, FileText, Heart, Phone, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';

const PatientRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showNotesDialog, setShowNotesDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [treatmentNotes, setTreatmentNotes] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [addictionTypes, setAddictionTypes] = useState([]);
    const [rehabCenters, setRehabCenters] = useState([]);

    useEffect(() => {
        fetchRequests();
        fetchReferenceData();
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

    const fetchReferenceData = async () => {
        try {
            const [typesRes, centersRes] = await Promise.all([
                addictionTypesAPI.getAll(),
                rehabCentersAPI.getAll()
            ]);
            setAddictionTypes(typesRes.data);
            setRehabCenters(centersRes.data);
        } catch (error) {
            console.error('Failed to load reference data');
        }
    };

    const handleRespond = async (requestId, response) => {
        setActionLoading(true);
        try {
            await treatmentAPI.respond(requestId, response);
            toast.success(`Request ${response}`);
            fetchRequests();
            setShowDetailDialog(false);
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

    const openDetailDialog = (request) => {
        setSelectedRequest(request);
        setShowDetailDialog(true);
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

    const getAddictionTypeName = (id) => {
        const type = addictionTypes.find(t => t.id === id);
        return type?.name || 'Not specified';
    };

    const getRehabCenterName = (id) => {
        const center = rehabCenters.find(c => c.id === id);
        return center?.name || 'Not specified';
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            accepted: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return badges[status] || badges.pending;
    };

    // Get patient profile data from the request (we need to fetch it)
    const getPatientMedicalInfo = (request) => {
        // The request should contain patient info - we'll display what's available
        return request;
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
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-[#f4f1ea] rounded-full flex items-center justify-center">
                                                <User className="w-6 h-6 text-[#0f392b]" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-[#0f392b] text-lg">{request.patient_name}</h3>
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
                                                <Heart className="w-4 h-4 text-[#d97757]" />
                                                <span className="font-medium">{request.addiction_type_name}</span>
                                            </div>
                                        </div>
                                        {request.description && (
                                            <p className="text-sm text-[#5c706a] bg-[#f8f9fa] p-3 rounded-lg">
                                                <span className="font-medium">Patient Note:</span> {request.description}
                                            </p>
                                        )}
                                        <p className="text-xs text-[#5c706a]">
                                            Requested on {new Date(request.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            onClick={() => openDetailDialog(request)}
                                            variant="outline"
                                            className="border-[#0f392b] text-[#0f392b]"
                                            data-testid={`view-details-${request.id}`}
                                        >
                                            <FileText className="w-4 h-4 mr-2" /> View Details
                                        </Button>
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
                                                className="bg-[#d97757] hover:bg-[#c26649] text-white"
                                                data-testid={`notes-${request.id}`}
                                            >
                                                <FileText className="w-4 h-4 mr-2" /> Update Notes
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Patient Detail Dialog */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-manrope text-xl text-[#0f392b]">
                            Patient Details - {selectedRequest?.patient_name}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="space-y-6">
                            {/* Request Info */}
                            <div className="grid md:grid-cols-2 gap-4 p-4 bg-[#f8f9fa] rounded-xl">
                                <div>
                                    <p className="text-xs text-[#5c706a]">Addiction Type</p>
                                    <p className="font-semibold text-[#0f392b]">{selectedRequest.addiction_type_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#5c706a]">Rehab Center</p>
                                    <p className="font-semibold text-[#0f392b]">{selectedRequest.rehab_center_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#5c706a]">Request Status</p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedRequest.status)}`}>
                                        {selectedRequest.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-[#5c706a]">Requested On</p>
                                    <p className="font-semibold text-[#0f392b]">{new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Patient Description */}
                            {selectedRequest.description && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-[#5c706a]">Patient's Description</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-[#0f392b]">{selectedRequest.description}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Medical History - from patient_profile_data */}
                            {selectedRequest.patient_profile_data && Object.keys(selectedRequest.patient_profile_data).length > 0 ? (
                                <Card className="border-[#d97757]/30">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="font-manrope text-lg text-[#0f392b] flex items-center gap-2">
                                            <Heart className="w-5 h-5 text-[#d97757]" />
                                            Patient Medical History
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                                <p className="text-xs text-[#5c706a]">Addiction Type</p>
                                                <p className="font-semibold text-[#0f392b]">
                                                    {getAddictionTypeName(selectedRequest.patient_profile_data.addiction_type_id) || selectedRequest.addiction_type_name}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                                <p className="text-xs text-[#5c706a]">Severity</p>
                                                <p className="font-semibold text-[#0f392b] capitalize">
                                                    {selectedRequest.patient_profile_data.addiction_severity || 'Not specified'}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                                <p className="text-xs text-[#5c706a]">Duration</p>
                                                <p className="font-semibold text-[#0f392b]">
                                                    {selectedRequest.patient_profile_data.addiction_duration || 'Not specified'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {selectedRequest.patient_profile_data.medical_history && (
                                            <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                                <p className="text-xs text-[#5c706a] mb-1">Medical History</p>
                                                <p className="text-[#0f392b]">{selectedRequest.patient_profile_data.medical_history}</p>
                                            </div>
                                        )}
                                        
                                        {selectedRequest.patient_profile_data.previous_treatments && (
                                            <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                                <p className="text-xs text-[#5c706a] mb-1">Previous Treatments</p>
                                                <p className="text-[#0f392b]">{selectedRequest.patient_profile_data.previous_treatments}</p>
                                            </div>
                                        )}
                                        
                                        {selectedRequest.patient_profile_data.current_medications && (
                                            <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                                <p className="text-xs text-[#5c706a] mb-1">Current Medications</p>
                                                <p className="text-[#0f392b]">{selectedRequest.patient_profile_data.current_medications}</p>
                                            </div>
                                        )}

                                        {/* Emergency Contact */}
                                        {(selectedRequest.patient_profile_data.emergency_contact_name || selectedRequest.patient_profile_data.emergency_contact_phone) && (
                                            <div className="p-3 bg-[#f8f9fa] rounded-lg flex items-center gap-3">
                                                <Phone className="w-4 h-4 text-[#d97757]" />
                                                <div>
                                                    <p className="text-xs text-[#5c706a]">Emergency Contact</p>
                                                    <p className="font-semibold text-[#0f392b]">
                                                        {selectedRequest.patient_profile_data.emergency_contact_name || 'N/A'}
                                                        {selectedRequest.patient_profile_data.emergency_contact_phone && (
                                                            <span className="text-[#5c706a] font-normal ml-2">
                                                                ({selectedRequest.patient_profile_data.emergency_contact_phone})
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="border-[#d97757]/30 bg-[#d97757]/5">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-[#d97757] mt-0.5" />
                                            <div>
                                                <h3 className="font-semibold text-[#0f392b] mb-1">No Medical History Available</h3>
                                                <p className="text-sm text-[#5c706a]">
                                                    The patient has not yet provided their medical history and addiction details.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Treatment Notes (if accepted) */}
                            {selectedRequest.status === 'accepted' && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="font-manrope text-lg text-[#0f392b]">Treatment Notes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedRequest.treatment_notes ? (
                                            <p className="text-[#0f392b] bg-[#f8f9fa] p-4 rounded-lg">{selectedRequest.treatment_notes}</p>
                                        ) : (
                                            <p className="text-[#5c706a] italic">No treatment notes added yet</p>
                                        )}
                                        <Button
                                            onClick={() => { setShowDetailDialog(false); openNotesDialog(selectedRequest); }}
                                            className="mt-4 bg-[#d97757] hover:bg-[#c26649] text-white"
                                        >
                                            <FileText className="w-4 h-4 mr-2" /> {selectedRequest.treatment_notes ? 'Update' : 'Add'} Notes
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Action Buttons for Pending */}
                            {selectedRequest.status === 'pending' && (
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button
                                        onClick={() => handleRespond(selectedRequest.id, 'accepted')}
                                        disabled={actionLoading}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" /> Accept Request
                                    </Button>
                                    <Button
                                        onClick={() => handleRespond(selectedRequest.id, 'rejected')}
                                        disabled={actionLoading}
                                        variant="destructive"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" /> Reject Request
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

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
