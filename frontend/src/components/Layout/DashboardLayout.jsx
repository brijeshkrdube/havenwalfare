import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import { Menu, X, Bell } from 'lucide-react';

const DashboardLayout = ({ allowedRoles }) => {
    const { user, loading, isAuthenticated } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0f392b] border-t-transparent"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        // Redirect to appropriate dashboard
        const redirectPath = user?.role === 'admin' ? '/admin' : 
                            user?.role === 'doctor' ? '/doctor' : 
                            user?.role === 'patient' ? '/patient' : '/';
        return <Navigate to={redirectPath} replace />;
    }

    return (
        <div className="dashboard-container" data-testid="dashboard-layout">
            {/* Mobile header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#0f392b] text-white p-4 z-50 flex items-center justify-between">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-white/10 rounded-lg"
                    data-testid="mobile-menu-btn"
                >
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <span className="font-manrope font-bold">HavenWelfare</span>
                <button className="p-2 hover:bg-white/10 rounded-lg">
                    <Bell className="w-6 h-6" />
                </button>
            </div>

            {/* Sidebar - desktop */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Sidebar - mobile */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-40">
                    <div 
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="relative w-64 h-full">
                        <Sidebar />
                    </div>
                </div>
            )}

            {/* Main content */}
            <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
                <div className="p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
