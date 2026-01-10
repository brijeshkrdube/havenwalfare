import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { 
    Users, Building2, HandCoins, TrendingUp, 
    UserCheck, AlertCircle, Clock, ArrowUpRight 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await adminAPI.getAnalytics();
            setAnalytics(response.data);
        } catch (error) {
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const statCards = analytics ? [
        { 
            title: 'Total Users', 
            value: analytics.total_users, 
            icon: Users, 
            color: 'bg-blue-500',
            change: '+12%'
        },
        { 
            title: 'Verified Doctors', 
            value: analytics.total_doctors, 
            icon: UserCheck, 
            color: 'bg-green-500',
            change: '+5%'
        },
        { 
            title: 'Active Patients', 
            value: analytics.total_patients, 
            icon: Users, 
            color: 'bg-purple-500',
            change: '+18%'
        },
        { 
            title: 'Rehab Centers', 
            value: analytics.total_rehab_centers, 
            icon: Building2, 
            color: 'bg-orange-500',
            change: '+3%'
        },
        { 
            title: 'Total Donations', 
            value: `$${analytics.total_donations.toLocaleString()}`, 
            icon: HandCoins, 
            color: 'bg-[#d97757]',
            change: '+24%'
        },
        { 
            title: 'Pending Approvals', 
            value: analytics.pending_approvals, 
            icon: Clock, 
            color: 'bg-yellow-500',
            alert: analytics.pending_approvals > 0
        },
    ] : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0f392b] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 fade-in" data-testid="admin-dashboard">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-[#0f392b] to-[#1a5c47] rounded-3xl p-8 text-white">
                <h1 className="font-manrope text-3xl font-bold">Welcome back, {user?.name}!</h1>
                <p className="text-white/70 mt-2">Here's an overview of your platform's activity.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat, index) => (
                    <Card 
                        key={index} 
                        className={`card-haven overflow-hidden ${stat.alert ? 'border-yellow-400 border-2' : ''}`}
                        data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[#5c706a] text-sm font-medium">{stat.title}</p>
                                    <p className="font-manrope text-3xl font-bold text-[#0f392b] mt-2">{stat.value}</p>
                                    {stat.change && (
                                        <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                                            <ArrowUpRight className="w-4 h-4" />
                                            <span>{stat.change} this month</span>
                                        </div>
                                    )}
                                </div>
                                <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            {stat.alert && (
                                <div className="flex items-center gap-2 mt-4 text-yellow-600 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Requires attention</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Donations */}
            <Card className="card-haven">
                <CardHeader>
                    <CardTitle className="font-manrope text-xl text-[#0f392b]">Recent Donations</CardTitle>
                </CardHeader>
                <CardContent>
                    {analytics?.recent_donations?.length > 0 ? (
                        <div className="space-y-4">
                            {analytics.recent_donations.map((donation, index) => (
                                <div 
                                    key={index} 
                                    className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-xl"
                                >
                                    <div>
                                        <p className="font-semibold text-[#0f392b]">
                                            {donation.donor_name || 'Anonymous Donor'}
                                        </p>
                                        <p className="text-sm text-[#5c706a]">
                                            To: {donation.patient_name}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-[#0f392b]">${donation.amount.toLocaleString()}</p>
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
                    ) : (
                        <p className="text-[#5c706a] text-center py-8">No recent donations</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;
