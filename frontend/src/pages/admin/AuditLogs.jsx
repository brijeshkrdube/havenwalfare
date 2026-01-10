import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../lib/api';
import { Activity, Search, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getAuditLogs(200);
            setLogs(response.data);
        } catch (error) {
            toast.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => 
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getActionColor = (action) => {
        if (action.includes('LOGIN')) return 'bg-blue-100 text-blue-800';
        if (action.includes('REGISTER')) return 'bg-green-100 text-green-800';
        if (action.includes('APPROVED')) return 'bg-green-100 text-green-800';
        if (action.includes('REJECTED')) return 'bg-red-100 text-red-800';
        if (action.includes('SUSPENDED')) return 'bg-orange-100 text-orange-800';
        if (action.includes('DELETED')) return 'bg-red-100 text-red-800';
        if (action.includes('UPDATED')) return 'bg-yellow-100 text-yellow-800';
        if (action.includes('CREATED')) return 'bg-purple-100 text-purple-800';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6 fade-in" data-testid="audit-logs">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-manrope text-2xl font-bold text-[#0f392b]">Audit Logs</h1>
                    <p className="text-[#5c706a]">Track all system activities and changes</p>
                </div>
                <Button 
                    onClick={fetchLogs} 
                    variant="outline" 
                    className="border-[#0f392b] text-[#0f392b]"
                    data-testid="refresh-btn"
                >
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </Button>
            </div>

            {/* Search */}
            <Card className="card-haven">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5c706a]" />
                        <Input
                            placeholder="Search logs by action, user, or details..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 border-[#e0e6e4] focus:border-[#0f392b]"
                            data-testid="search-logs"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Logs List */}
            <Card className="card-haven overflow-hidden">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0f392b] border-t-transparent"></div>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center py-12">
                            <Activity className="w-16 h-16 text-[#5c706a] mx-auto mb-4" />
                            <p className="text-[#5c706a]">No audit logs found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#e0e6e4]">
                            {filteredLogs.map((log) => (
                                <div 
                                    key={log.id} 
                                    className="p-4 hover:bg-[#f8f9fa] transition-colors"
                                    data-testid={`log-${log.id}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                                    {log.action.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-sm text-[#5c706a]">
                                                    {log.user_email || 'System'}
                                                </span>
                                            </div>
                                            {log.details && (
                                                <p className="text-sm text-[#0f392b] mt-1">{log.details}</p>
                                            )}
                                        </div>
                                        <span className="text-xs text-[#5c706a] whitespace-nowrap ml-4">
                                            {new Date(log.created_at).toLocaleString()}
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

export default AuditLogs;
