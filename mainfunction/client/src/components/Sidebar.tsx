import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaHeartbeat,
  FaBookMedical,
  FaFileMedical,
  FaUserMd,
  FaSignOutAlt,
  FaMicrophone,
  FaCamera,
  FaUser,
  FaLightbulb,
  FaCalendarAlt,
  FaUsers,
  FaBell,
  FaHistory,
  FaStar,
  FaCog,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/store/slices/authSlice";
import { AppDispatch } from "@/store/store";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((state: any) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/login");
  };

  // Build nav items dynamically based on role
  const navItems = useMemo(() => {
    const items = [
      { name: "Dashboard", path: "/dashboard", icon: FaHome },
      { name: "AI Consultation", path: "/consultation", icon: FaMicrophone },
      { name: "My History", path: "/consultation/history", icon: FaHistory },
      { name: "Measurements", path: "/measurements", icon: FaHeartbeat },
      { name: "Diary", path: "/diary", icon: FaBookMedical },
      { name: "Medical Info", path: "/medical-info", icon: FaBookMedical },
      { name: "Lab Reports", path: "/lab-reports", icon: FaFileMedical },
      { name: "Doctor Reports", path: "/doctor-reports", icon: FaUserMd },
      { name: "Appointments", path: "/appointments", icon: FaCalendarAlt },
      { name: "Doctors", path: "/doctors", icon: FaUserMd },
      { name: "Family Health", path: "/family", icon: FaUsers },
      { name: "Insights", path: "/insights", icon: FaLightbulb },
    ];

    // Add Doctor specific items
    if (user?.type === "doctor") {
      items.unshift({
        name: "Doctor Dashboard",
        path: "/doctor/dashboard",
        icon: FaUserMd,
      });
      items.push({
        name: "Patient Appointments",
        path: "/doctor/appointments",
        icon: FaCalendarAlt,
      });
      items.push({
        name: "Setup Details",
        path: "/doctor/setup",
        icon: FaCog,
      });
    }

    // Add Admin specific items
    if (user?.type === "admin") {
      items.unshift({ name: "Admin Panel", path: "/admin", icon: FaUsers });
    }

    return items;
  }, [user]);

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`h-screen w-72 bg-white border-r border-gray-200 fixed left-0 top-0 z-50 flex flex-col font-sans transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-8">
          <h1 className="text-2xl font-black flex items-center space-x-2 text-gray-900 tracking-tighter">
            <span className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white text-base">S</span>
            <span className="text-xl">Swasthya<span className="text-primary">Saathi</span></span>
          </h1>
        </div>

        <nav
          id="onboarding-sidebar"
          className="flex-1 px-4 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="px-4 py-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Main Menu</p>
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                id={`sidebar-nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                href={item.path}
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-gray-500 hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <item.icon
                  className={`text-lg ${isActive ? "text-white" : "text-gray-400 group-hover:text-primary"}`}
                />
                <span className="text-sm font-bold">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-50 space-y-4">
          <div className="px-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Account</p>
            <div className="space-y-1">
              <Link
                href="/profile"
                onClick={onClose}
                className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-gray-600 hover:bg-primary/5 hover:text-primary transition-all group"
              >
                <FaUser className="text-lg text-gray-400 group-hover:text-primary" />
                <span className="text-sm font-bold">Profile</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-all group"
              >
                <FaSignOutAlt className="text-lg text-red-400 group-hover:text-red-500" />
                <span className="text-sm font-bold">Logout</span>
              </button>
            </div>
          </div>
          
          {user && (
            <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-black">
                    {user.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-gray-900 truncate">{user.name}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{user.type || 'Patient'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
