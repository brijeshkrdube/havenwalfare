import React, { useState, useEffect } from 'react';
import { donationsAPI } from '../../lib/api';
import { HandCoins, CheckCircle, XCircle, Eye, Search, Image } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DonationsManagement = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [adminRemarks, setAdminRemarks] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchDonations();
    }, [statusFilter]);

    const fetchDonations = async () => {
        setLoading(true);
        try {
            const response = await donationsAPI.getAll(statusFilter !== 'all' ? statusFilter : undefined);
            setDonations(response.data);
        } catch (error) {
            toast.error('Failed to load donations');
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (status) => {
        if (!selectedDonation) return;
        setActionLoading(true);

        try {
            await donationsAPI.approve(selectedDonation.id, status, adminRemarks);
            toast.success(`Donation ${status}`);
            setShowApproveDialog(false);
            setSelectedDonation(null);
            setAdminRemarks('');
            fetchDonations();
        } catch (error) {
            toast.error('Failed to update donation');
        } finally {
            setActionLoading(false);
        }
    };

    const openApproveDialog = (donation) => {
        setSelectedDonation(donation);
        setAdminRemarks(donation.admin_remarks || '');
        setShowApproveDialog(true);
    };

    const filteredDonations = donations.filter(d => 
        d.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.donor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status) => {
        const badges = {
            submitted: 'badge-submitted',
            under_review: 'bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium',
            approved: 'badge-approved',
            rejected: 'badge-rejected'
        };
        return badges[status] || badges.submitted;
    };

    return (
        <div className="space-y-6 fade-in" data-testid="donations-management">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-manrope text-2xl font-bold text-[#0f392b]">Donations Management</h1>
                    <p className="text-[#5c706a]">Verify and approve donation transactions</p>
                </div>
            </div>

            {/* Filters */}
            <Card className="card-haven">
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5c706a]" />
                                <Input
                                    placeholder="Search by patient, donor, or transaction ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-11 border-[#e0e6e4] focus:border-[#0f392b]"
                                    data-testid="search-donations"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px] h-11" data-testid="status-filter">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="submitted">Submitted</SelectItem>
                                <SelectItem value="under_review">Under Review</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Donations Table */}
            <Card className="card-haven overflow-hidden">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0f392b] border-t-transparent"></div>
                        </div>
                    ) : filteredDonations.length === 0 ? (
                        <div className="text-center py-12">
                            <HandCoins className="w-16 h-16 text-[#5c706a] mx-auto mb-4" />
                            <p className="text-[#5c706a]">No donations found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#f8f9fa] border-b border-[#e0e6e4]">
                                    <tr>
                                        <th className="text-left p-4 font-semibold text-[#0f392b]">Transaction</th>
                                        <th className="text-left p-4 font-semibold text-[#0f392b]">Donor</th>
                                        <th className="text-left p-4 font-semibold text-[#0f392b]">Patient</th>
                                        <th className="text-left p-4 font-semibold text-[#0f392b]">Amount</th>
                                        <th className="text-left p-4 font-semibold text-[#0f392b]">Status</th>
                                        <th className="text-left p-4 font-semibold text-[#0f392b]">Date</th>
                                        <th className="text-left p-4 font-semibold text-[#0f392b]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDonations.map((donation) => (
                                        <tr 
                                            key={donation.id} 
                                            className="border-b border-[#e0e6e4] hover:bg-[#f8f9fa] transition-colors"
                                            data-testid={`donation-row-${donation.id}`}
                                        >
                                            <td className="p-4">
                                                <p className="font-mono text-sm text-[#0f392b]">{donation.transaction_id}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-semibold text-[#0f392b]">{donation.donor_name || 'Anonymous'}</p>
                                                <p className="text-sm text-[#5c706a]">{donation.donor_email || '-'}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-[#0f392b]">{donation.patient_name}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-semibold text-[#d97757]">${donation.amount.toLocaleString()}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={getStatusBadge(donation.status)}>
                                                    {donation.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4 text-[#5c706a]">
                                                {new Date(donation.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setSelectedDonation(donation);
                                                            setShowDetailDialog(true);
                                                        }}
                                                        data-testid={`view-${donation.id}`}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    {(donation.status === 'submitted' || donation.status === 'under_review') && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                                onClick={() => openApproveDialog(donation)}
                                                                data-testid={`approve-${donation.id}`}
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => openApproveDialog(donation)}
                                                                data-testid={`reject-${donation.id}`}
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detail Dialog */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-manrope text-xl text-[#0f392b]">Donation Details</DialogTitle>
                    </DialogHeader>
                    {selectedDonation && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-[#5c706a]">Transaction ID</p>
                                    <p className="font-mono text-[#0f392b]">{selectedDonation.transaction_id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-[#5c706a]">Amount</p>
                                    <p className="font-semibold text-[#d97757]">${selectedDonation.amount.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-[#5c706a]">Donor</p>
                                    <p className="text-[#0f392b]">{selectedDonation.donor_name || 'Anonymous'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-[#5c706a]">Donor Email</p>
                                    <p className="text-[#0f392b]">{selectedDonation.donor_email || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-[#5c706a]">Patient</p>
                                    <p className="text-[#0f392b]">{selectedDonation.patient_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-[#5c706a]">Status</p>
                                    <span className={getStatusBadge(selectedDonation.status)}>
                                        {selectedDonation.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                            {selectedDonation.screenshot_url && (
                                <div>
                                    <p className="text-sm text-[#5c706a] mb-2">Payment Screenshot</p>
                                    <img 
                                        src={`${BACKEND_URL}${selectedDonation.screenshot_url}`}
                                        alt="Payment screenshot"
                                        className="max-w-full rounded-lg border"
                                    />
                                </div>
                            )}
                            {selectedDonation.admin_remarks && (
                                <div>
                                    <p className="text-sm text-[#5c706a]">Admin Remarks</p>
                                    <p className="text-[#0f392b]">{selectedDonation.admin_remarks}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Approve/Reject Dialog */}
            <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-manrope text-xl text-[#0f392b]">Verify Donation</DialogTitle>
                    </DialogHeader>
                    {selectedDonation && (
                        <div className="space-y-4">
                            <div className="p-4 bg-[#f8f9fa] rounded-xl">
                                <p className="text-sm text-[#5c706a]">Transaction ID</p>
                                <p className="font-mono text-[#0f392b]">{selectedDonation.transaction_id}</p>
                                <p className="text-sm text-[#5c706a] mt-2">Amount</p>
                                <p className="font-semibold text-[#d97757]">${selectedDonation.amount.toLocaleString()}</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Admin Remarks</Label>
                                <Textarea
                                    value={adminRemarks}
                                    onChange={(e) => setAdminRemarks(e.target.value)}
                                    placeholder="Add remarks for this decision..."
                                    className="border-[#e0e6e4] focus:border-[#0f392b]"
                                    data-testid="admin-remarks"
                                />
                            </div>
                            <DialogFooter className="gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowApproveDialog(false)}
                                    className="border-[#0f392b] text-[#0f392b]"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleApproval('rejected')}
                                    disabled={actionLoading}
                                    data-testid="reject-donation-btn"
                                >
                                    Reject
                                </Button>
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleApproval('approved')}
                                    disabled={actionLoading}
                                    data-testid="approve-donation-btn"
                                >
                                    Approve
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DonationsManagement;
