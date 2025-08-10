import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";

// Icons
import {
  FiHome,
  FiUser,
  FiPlus,
  FiCalendar,
  FiSettings,
  FiBriefcase,
  FiClock,
  FiUsers,
  FiGrid,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

// Sub-componente Sidebar
const Sidebar = ({ navItems, isOpen, setIsOpen }) => {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/60 z-30 lg:hidden",
          isOpen ? "block" : "hidden",
        )}
        onClick={() => setIsOpen(false)}
      />
      <nav
        className={cn(
          "w-64 bg-white shadow-lg flex flex-col transition-transform duration-300 ease-in-out z-40",
          "fixed inset-y-0 left-0 transform lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-16 flex items-center justify-left pl-8 bg-violet-600  flex-shrink-0">
          <Link to="/dashboard" className="text-2xl font-bold text-white ">
            Turnify
          </Link>
        </div>
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  isActive
                    ? "bg-violet-100 text-violet-700"
                    : "text-gray-600 hover:bg-gray-50",
                )
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};

const Layout = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getNavItems = () => {
    const baseItems = [
      { icon: FiHome, label: "Panel Principal", path: "/dashboard" },
      { icon: FiUser, label: "Perfil", path: "/profile" },
    ];

    switch (user?.role) {
      case "client":
        return [
          ...baseItems,
          { icon: FiPlus, label: "Reservar Cita", path: "/book" },
          { icon: FiCalendar, label: "Citas", path: "/appointments" },
        ];
      case "employee":
        return [
          ...baseItems,
          { icon: FiClock, label: "Horarios", path: "/schedules" },
          { icon: FiCalendar, label: "Citas", path: "/appointments" },
        ];
      case "administrator":
        return [
          ...baseItems,
          { icon: FiUsers, label: "Empleados", path: "/employees" },
          { icon: FiBriefcase, label: "Servicios", path: "/services" },
          { icon: FiCalendar, label: "Citas", path: "/appointments" },
          { icon: FiClock, label: "Horarios", path: "/schedules" },
          {
            icon: FiBriefcase,
            label: "Configuración del negocio",
            path: "/business-settings",
          },
        ];
      case "superuser":
        return [
          ...baseItems,
          { icon: FiGrid, label: "Negocios", path: "/businesses" },
          { icon: FiUsers, label: "Empleados", path: "/employees" },
          { icon: FiBriefcase, label: "Servicios", path: "/services" },
          { icon: FiCalendar, label: "Citas", path: "/appointments" },
          { icon: FiClock, label: "Horarios", path: "/schedules" },
        ];
      default:
        return baseItems;
    }
  };

  if (!user) {
    return null;
  }

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:pl-64">
        <Sidebar
          navItems={navItems}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        <div className="flex-1 flex flex-col">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
