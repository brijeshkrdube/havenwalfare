import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Building2,
    Heart,
    HandCoins,
    Settings,
    FileText,
    LogOut,
    Stethoscope,
    User,
    ClipboardList,
    CreditCard,
    Mail,
    Activity
} from 'lucide-react';

const LOGO_URL = "https://customer-assets.emergentagent.com/job_3463593f-4cba-425e-a575-89c0d925427c/artifacts/n1f21t65_unnamed-removebg-preview.png";

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const getMenuItems = () => {
        switch (user?.role) {
            case 'admin':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
                    { icon: Users, label: 'User Management', path: '/admin/users' },
                    { icon: Building2, label: 'Rehab Centers', path: '/admin/rehab-centers' },
                    { icon: Heart, label: 'Addiction Types', path: '/admin/addiction-types' },
                    { icon: HandCoins, label: 'Donations', path: '/admin/donations' },
                    { icon: CreditCard, label: 'Payment Settings', path: '/admin/payment-settings' },
                    { icon: Mail, label: 'SMTP Settings', path: '/admin/smtp-settings' },
                    { icon: Activity, label: 'Audit Logs', path: '/admin/audit-logs' },
                    { icon: User, label: 'My Profile', path: '/admin/profile' },
                ];
            case 'doctor':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/doctor' },
                    { icon: User, label: 'My Profile', path: '/doctor/profile' },
                    { icon: ClipboardList, label: 'Patient Requests', path: '/doctor/requests' },
                    { icon: FileText, label: 'Treatment Notes', path: '/doctor/notes' },
                ];
            case 'patient':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/patient' },
                    { icon: User, label: 'My Profile', path: '/patient/profile' },
                    { icon: Stethoscope, label: 'Choose Doctor', path: '/patient/choose-doctor' },
                    { icon: ClipboardList, label: 'Treatment Status', path: '/patient/treatment' },
                    { icon: HandCoins, label: 'My Donations', path: '/patient/donations' },
                ];
            default:
                return [];
        }
    };

    const menuItems = getMenuItems();

    const isActive = (path) => {
        if (path === `/${user?.role}`) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="dashboard-sidebar flex flex-col" data-testid="sidebar">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
                <Link to="/" className="flex items-center gap-3">
                    <img src={LOGO_URL} alt="HavenWelfare" className="w-10 h-10 object-contain" />
                    <span className="font-manrope text-xl font-bold text-white">HavenWelfare</span>
                </Link>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-white/10">
                <p className="text-white/60 text-sm">Welcome,</p>
                <p className="text-white font-semibold truncate">{user?.name}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 capitalize">
                    {user?.role}
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                            isActive(item.path)
                                ? 'bg-white text-[#0f392b]'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={logout}
                    data-testid="logout-btn"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
