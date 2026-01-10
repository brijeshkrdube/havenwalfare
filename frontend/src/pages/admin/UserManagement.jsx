import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../lib/api';
import { UserCheck, UserX, Ban, RefreshCw, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [roleFilter, statusFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {};
            if (roleFilter !== 'all') params.role = roleFilter;
            if (statusFilter !== 'all') params.status = statusFilter;
            
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

    const handleStatusChange = async (userId, newStatus) => {
        setActionLoading(true);
        try {
            await adminAPI.updateUserStatus(userId, newStatus);
            toast.success(`User status updated to ${newStatus}`);
            fetchUsers();
            setShowDialog(false);
        } catch (error) {
            toast.error('Failed to update user status');
        } finally {
            setActionLoading(false);
        }
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
                                                {user.role !== 'admin' && (
                                                    <div className="flex gap-2">
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
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default UserManagement;
