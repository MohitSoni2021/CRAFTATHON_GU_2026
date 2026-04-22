'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaChartLine, FaUsers, FaSignOutAlt, FaCog, FaArrowLeft, FaCapsules, FaRobot } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/store/slices/authSlice';
import { AppDispatch } from '@/store/store';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const AdminSidebar = ({ isOpen = false, onClose }: SidebarProps) => {
    const pathname = usePathname();
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const handleLogout = async () => {
        await dispatch(logoutUser());
        router.push('/login');
    };

    const navItems = [
        { name: 'Overview', path: '/admin', icon: FaChartLine },
        { name: 'Medical DB', path: '/admin/medical-database', icon: FaCapsules },
        { name: 'AI Monitor', path: '/admin/ai-monitoring', icon: FaRobot },
        // { name: 'Settings', path: '/admin/settings', icon: FaCog },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className={`h-screen w-72 bg-white border-r border-gray-200 fixed left-0 top-0 z-50 flex flex-col font-sans transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="p-8">
                    <h1 className="text-2xl font-extrabold flex items-center space-x-2 text-gray-900 tracking-tight">
                        <span className="text-[#3AAFA9]">Admin</span><span>Panel</span>
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={onClose}
                                className={`flex items-center space-x-3 px-5 py-3.5 rounded-sm transition-all duration-300 group ${isActive
                                    ? 'bg-gradient-primary text-white shadow-md shadow-[#7A8E6B]/20'
                                    : 'text-gray-500 hover:bg-[#7A8E6B]/10 hover:text-[#7A8E6B]'
                                    }`}
                            >
                                <item.icon className={`text-xl ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#7A8E6B]'}`} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 space-y-2">
                    <Link
                        href="/dashboard"
                        onClick={onClose}
                        className="flex items-center space-x-3 px-4 py-2 w-full rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                        <FaArrowLeft className="text-lg" />
                        <span className="font-medium">User View</span>
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <FaSignOutAlt className="text-xl" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default AdminSidebar;
