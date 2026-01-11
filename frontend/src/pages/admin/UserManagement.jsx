import React, { useState, useEffect } from 'react';
import { adminAPI, donationsAPI, addictionTypesAPI, rehabCentersAPI } from '../../lib/api';
import { UserCheck, UserX, Ban, RefreshCw, Search, Eye, X, Heart, HandCoins, Building2, Phone, Mail, Clock, Lock, Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { toast } from 'sonner';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userDonations, setUserDonations] = useState([]);
    const [addictionTypes, setAddictionTypes] = useState([]);
    const [rehabCenters, setRehabCenters] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchReferenceData();
    }, [roleFilter, statusFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getUsers(
                statusFilter !== 'all' ? statusFilter : undefined,
                roleFilter !== 'all' ? roleFilter : undefined
            );
            setUsers(response.data);
        } catch (error) {
            toast.error('Failed to load users');
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

    const handleStatusChange = async (userId, newStatus) => {
        setActionLoading(true);
        try {
            await adminAPI.updateUserStatus(userId, newStatus);
            toast.success(`User status updated to ${newStatus}`);
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update user status');
        } finally {
            setActionLoading(false);
        }
    };

    const viewUserDetails = async (user) => {
        setSelectedUser(user);
        setShowDetailDialog(true);
        
        // Fetch donations if patient
        if (user.role === 'patient') {
            try {
                const response = await donationsAPI.getAll();
                const patientDonations = response.data.filter(d => d.patient_id === user.id);
                setUserDonations(patientDonations);
            } catch (error) {
                console.error('Failed to load donations');
            }
        }
    };

    const openPasswordDialog = (user) => {
        setSelectedUser(user);
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordDialog(true);
    };

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setActionLoading(true);
        try {
            await adminAPI.changeUserPassword(selectedUser.id, newPassword);
            toast.success(`Password changed for ${selectedUser.email}`);
            setShowPasswordDialog(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to change password');
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

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'badge-pending',
            approved: 'badge-approved',
            rejected: 'badge-rejected',
            suspended: 'bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium'
        };
        return badges[status] || badges.pending;
    };

    const totalApprovedDonations = userDonations
        .filter(d => d.status === 'approved')
        .reduce((sum, d) => sum + d.amount, 0);

    return (
        <div className="space-y-6 fade-in" data-testid="user-management">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-manrope text-2xl font-bold text-[#0f392b]">User Management</h1>
                    <p className="text-[#5c706a]">Manage doctors, patients, and their verification status</p>
                </div>
                <Button 
                    onClick={fetchUsers} 
                    variant="outline" 
                    className="border-[#0f392b] text-[#0f392b]"
                    data-testid="refresh-btn"
                >
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card className="card-haven">
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5c706a]" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-11 border-[#e0e6e4] focus:border-[#0f392b]"
                                    data-testid="search-input"
                                />
                            </div>
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[150px] h-11" data-testid="role-filter">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="doctor">Doctors</SelectItem>
                                <SelectItem value="patient">Patients</SelectItem>
                                <SelectItem value="admin">Admins</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px] h-11" data-testid="status-filter">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="card-haven overflow-hidden">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0f392b] border-t-transparent"></div>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12 text-[#5c706a]">
                            No users found matching your criteria
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#f8f9fa] border-b border-[#e0e6e4]">
                                    <tr>
                                        <th className="text-left p-4 font-semibold text-[#0f392b]">User</th>
                                        <th className="text-left p-4 font-semibold text-[#0f392b]">Role</th>
                                        <th className="text-left p-4 font-semibold text-[#0f392b]">Status</th>
                                        <th className="text-left p-4 font-semibold text-[#0f392b]">Registered</th>
                                        <th className="text-left p-4 font-semibold text-[#0f392b]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr 
                                            key={user.id} 
                                            className="border-b border-[#e0e6e4] hover:bg-[#f8f9fa] transition-colors"
                                            data-testid={`user-row-${user.id}`}
                                        >
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-semibold text-[#0f392b]">{user.name}</p>
                                                    <p className="text-sm text-[#5c706a]">{user.email}</p>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="capitalize px-3 py-1 bg-[#f4f1ea] rounded-full text-sm text-[#0f392b]">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={getStatusBadge(user.status)}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-[#5c706a]">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => viewUserDetails(user)}
                                                        className="text-[#0f392b]"
                                                        data-testid={`view-${user.id}`}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    {user.role !== 'admin' && (
                                                        <>
                                                            {user.status === 'pending' && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleStatusChange(user.id, 'approved')}
                                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                                        data-testid={`approve-${user.id}`}
                                                                    >
                                                                        <UserCheck className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleStatusChange(user.id, 'rejected')}
                                                                        variant="destructive"
                                                                        data-testid={`reject-${user.id}`}
                                                                    >
                                                                        <UserX className="w-4 h-4" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {user.status === 'approved' && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleStatusChange(user.id, 'suspended')}
                                                                    variant="outline"
                                                                    className="border-red-500 text-red-500 hover:bg-red-50"
                                                                    data-testid={`suspend-${user.id}`}
                                                                >
                                                                    <Ban className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                            {user.status === 'suspended' && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleStatusChange(user.id, 'approved')}
                                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                                    data-testid={`reactivate-${user.id}`}
                                                                >
                                                                    <UserCheck className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                            {user.status === 'rejected' && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleStatusChange(user.id, 'approved')}
                                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                                    data-testid={`approve-rejected-${user.id}`}
                                                                >
                                                                    <UserCheck className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => openPasswordDialog(user)}
                                                                className="border-[#d97757] text-[#d97757] hover:bg-[#d97757]/10"
                                                                data-testid={`change-password-${user.id}`}
                                                                title="Change Password"
                                                            >
                                                                <Key className="w-4 h-4" />
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

            {/* User Detail Dialog */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-manrope text-xl text-[#0f392b] flex items-center justify-between">
                            <span>{selectedUser?.role === 'patient' ? 'Patient' : selectedUser?.role === 'doctor' ? 'Doctor' : 'User'} Details</span>
                            <span className={`text-sm px-3 py-1 rounded-full ${getStatusBadge(selectedUser?.status)}`}>
                                {selectedUser?.status}
                            </span>
                        </DialogTitle>
                    </DialogHeader>
                    
                    {selectedUser && (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid md:grid-cols-2 gap-4 p-4 bg-[#f8f9fa] rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-[#5c706a]" />
                                    <div>
                                        <p className="text-xs text-[#5c706a]">Email</p>
                                        <p className="font-medium text-[#0f392b]">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-[#5c706a]" />
                                    <div>
                                        <p className="text-xs text-[#5c706a]">Phone</p>
                                        <p className="font-medium text-[#0f392b]">{selectedUser.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-[#5c706a]" />
                                    <div>
                                        <p className="text-xs text-[#5c706a]">Registered</p>
                                        <p className="font-medium text-[#0f392b]">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Patient-specific: Addiction & Medical History */}
                            {selectedUser.role === 'patient' && (
                                <>
                                    <Card className="border-[#d97757]/30">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="font-manrope text-lg text-[#0f392b] flex items-center gap-2">
                                                <Heart className="w-5 h-5 text-[#d97757]" />
                                                Addiction & Medical History
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {selectedUser.profile_data && Object.keys(selectedUser.profile_data).length > 0 ? (
                                                <div className="space-y-4">
                                                    <div className="grid md:grid-cols-3 gap-4">
                                                        <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                                            <p className="text-xs text-[#5c706a]">Addiction Type</p>
                                                            <p className="font-semibold text-[#0f392b]">
                                                                {getAddictionTypeName(selectedUser.profile_data.addiction_type_id)}
                                                            </p>
                                                        </div>
                                                        <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                                            <p className="text-xs text-[#5c706a]">Severity</p>
                                                            <p className="font-semibold text-[#0f392b] capitalize">
                                                                {selectedUser.profile_data.addiction_severity || 'Not specified'}
                                                            </p>
                                                        </div>
                                                        <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                                            <p className="text-xs text-[#5c706a]">Duration</p>
                                                            <p className="font-semibold text-[#0f392b]">
                                                                {selectedUser.profile_data.addiction_duration || 'Not specified'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    {selectedUser.profile_data.medical_history && (
                                                        <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                                            <p className="text-xs text-[#5c706a] mb-1">Medical History</p>
                                                            <p className="text-[#0f392b]">{selectedUser.profile_data.medical_history}</p>
                                                        </div>
                                                    )}
                                                    
                                                    {selectedUser.profile_data.previous_treatments && (
                                                        <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                                            <p className="text-xs text-[#5c706a] mb-1">Previous Treatments</p>
                                                            <p className="text-[#0f392b]">{selectedUser.profile_data.previous_treatments}</p>
                                                        </div>
                                                    )}
                                                    
                                                    {selectedUser.profile_data.current_medications && (
                                                        <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                                            <p className="text-xs text-[#5c706a] mb-1">Current Medications</p>
                                                            <p className="text-[#0f392b]">{selectedUser.profile_data.current_medications}</p>
                                                        </div>
                                                    )}

                                                    {/* Preferences */}
                                                    <div className="grid md:grid-cols-2 gap-4 pt-2 border-t">
                                                        <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                                            <p className="text-xs text-[#5c706a]">Preferred Rehab Center</p>
                                                            <p className="font-semibold text-[#0f392b]">
                                                                {getRehabCenterName(selectedUser.profile_data.preferred_rehab_center_id)}
                                                            </p>
                                                        </div>
                                                        <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                                            <p className="text-xs text-[#5c706a]">Emergency Contact</p>
                                                            <p className="font-semibold text-[#0f392b]">
                                                                {selectedUser.profile_data.emergency_contact_name || 'Not provided'}
                                                                {selectedUser.profile_data.emergency_contact_phone && (
                                                                    <span className="text-[#5c706a] font-normal"> ({selectedUser.profile_data.emergency_contact_phone})</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-[#5c706a] text-center py-4">No medical information provided yet</p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Donation History */}
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="font-manrope text-lg text-[#0f392b] flex items-center justify-between">
                                                <span className="flex items-center gap-2">
                                                    <HandCoins className="w-5 h-5 text-[#d97757]" />
                                                    Donation History
                                                </span>
                                                <span className="text-[#d97757] font-bold">
                                                    Total: ${totalApprovedDonations.toLocaleString()}
                                                </span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {userDonations.length > 0 ? (
                                                <div className="space-y-3 max-h-[200px] overflow-y-auto">
                                                    {userDonations.map((donation) => (
                                                        <div 
                                                            key={donation.id} 
                                                            className="flex items-center justify-between p-3 bg-[#f8f9fa] rounded-lg"
                                                        >
                                                            <div>
                                                                <p className="font-medium text-[#0f392b]">
                                                                    {donation.donor_name || 'Anonymous'}
                                                                </p>
                                                                <p className="text-xs text-[#5c706a]">
                                                                    {new Date(donation.created_at).toLocaleDateString()} • {donation.transaction_id}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold text-[#d97757]">${donation.amount.toLocaleString()}</p>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
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
                                            ) : (
                                                <p className="text-[#5c706a] text-center py-4">No donations received yet</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </>
                            )}

                            {/* Doctor-specific: Professional Info */}
                            {selectedUser.role === 'doctor' && selectedUser.profile_data && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="font-manrope text-lg text-[#0f392b]">Professional Information</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {selectedUser.profile_data.specialization && (
                                                <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                                    <p className="text-xs text-[#5c706a]">Specialization</p>
                                                    <p className="font-semibold text-[#0f392b]">{selectedUser.profile_data.specialization}</p>
                                                </div>
                                            )}
                                            {selectedUser.profile_data.experience && (
                                                <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                                    <p className="text-xs text-[#5c706a]">Experience</p>
                                                    <p className="font-semibold text-[#0f392b]">{selectedUser.profile_data.experience}</p>
                                                </div>
                                            )}
                                            {selectedUser.profile_data.qualification && (
                                                <div className="p-3 bg-[#f8f9fa] rounded-lg">
                                                    <p className="text-xs text-[#5c706a]">Qualification</p>
                                                    <p className="font-semibold text-[#0f392b]">{selectedUser.profile_data.qualification}</p>
                                                </div>
                                            )}
                                        </div>
                                        {selectedUser.profile_data.bio && (
                                            <div className="mt-4 p-3 bg-[#f8f9fa] rounded-lg">
                                                <p className="text-xs text-[#5c706a] mb-1">Bio</p>
                                                <p className="text-[#0f392b]">{selectedUser.profile_data.bio}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Action Buttons */}
                            {selectedUser.role !== 'admin' && (
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    {selectedUser.status === 'pending' && (
                                        <>
                                            <Button
                                                onClick={() => { handleStatusChange(selectedUser.id, 'approved'); setShowDetailDialog(false); }}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                <UserCheck className="w-4 h-4 mr-2" /> Approve
                                            </Button>
                                            <Button
                                                onClick={() => { handleStatusChange(selectedUser.id, 'rejected'); setShowDetailDialog(false); }}
                                                variant="destructive"
                                            >
                                                <UserX className="w-4 h-4 mr-2" /> Reject
                                            </Button>
                                        </>
                                    )}
                                    {selectedUser.status === 'approved' && (
                                        <Button
                                            onClick={() => { handleStatusChange(selectedUser.id, 'suspended'); setShowDetailDialog(false); }}
                                            variant="outline"
                                            className="border-red-500 text-red-500 hover:bg-red-50"
                                        >
                                            <Ban className="w-4 h-4 mr-2" /> Suspend
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>

            {/* Change Password Dialog */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="font-manrope text-xl text-[#0f392b] flex items-center gap-2">
                            <Key className="w-5 h-5 text-[#d97757]" />
                            Change Password
                        </DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4 pt-4">
                            <div className="p-3 bg-[#f4f1ea] rounded-lg">
                                <p className="text-sm text-[#5c706a]">Changing password for:</p>
                                <p className="font-semibold text-[#0f392b]">{selectedUser.name}</p>
                                <p className="text-sm text-[#5c706a]">{selectedUser.email}</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="border-[#e0e6e4] focus:border-[#d97757]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="border-[#e0e6e4] focus:border-[#d97757]"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowPasswordDialog(false)}
                                    className="border-[#e0e6e4]"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleChangePassword}
                                    disabled={actionLoading || !newPassword || !confirmPassword}
                                    className="bg-[#d97757] hover:bg-[#c26649] text-white"
                                >
                                    {actionLoading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Updating...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Lock className="w-4 h-4" />
                                            Change Password
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserManagement;
