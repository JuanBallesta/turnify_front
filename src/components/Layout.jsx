import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { NotificationCenter } from "@/components/ui/notification-center";
import useNotificationIntegration from "@/hooks/useNotificationIntegration";
import {
  FiCalendar,
  FiUser,
  FiSettings,
  FiLogOut,
  FiHome,
  FiUsers,
  FiGrid,
  FiPlus,
  FiMenu,
  FiBriefcase,
  FiClock,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.trim().split(" ");
    if (names.length > 1)
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const { unreadCount } = useNotifications();
  useNotificationIntegration();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
          { icon: FiPlus, label: "Horarios", path: "/schedules" },
          { icon: FiCalendar, label: "Citas", path: "/appointments" },
        ];
      case "administrator":
        return [
          ...baseItems,
          { icon: FiUsers, label: "Empleados", path: "/employees" },
          { icon: FiGrid, label: "Servicios", path: "/services" },
          { icon: FiCalendar, label: "Citas", path: "/appointments" },
          { icon: FiPlus, label: "Horarios", path: "/schedules" },
          {
            icon: FiBriefcase,
            label: "Configuración del negocio",
            path: "/business-settings",
          },
        ];
      case "superuser":
        return [
          ...baseItems,
          { icon: FiPlus, label: "Reservar Cita", path: "/book" },
          { icon: FiCalendar, label: "Citas", path: "/appointments" },
          { icon: FiGrid, label: "Negocios", path: "/businesses" },
          { icon: FiUsers, label: "Empleados", path: "/employees" },
          { icon: FiSettings, label: "Panel de Admin", path: "/admin" },
          {
            icon: FiSettings,
            label: "Configurar Perfil (Negocio)",
            path: "/business-settings",
          },
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();

  const getRoleLabel = (role) => {
    switch (role) {
      case "client":
        return "Cliente";
      case "employee":
        return "Empleado";
      case "administrator":
        return "Administrador";
      case "superuser":
        return "Super Usuario";
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white text-gray-800 font-bold shadow-sm border-b border-gray-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden mr-2"
              >
                <FiMenu className="h-5 w-5" />
              </Button>
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="text-2xl font-extrabold cursor-pointer text-violet-600">
                  Turnify
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationCenter />
              {user && (
                <DropdownMenu>
                  <span className="hidden sm:inline">{user.name}</span>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={
                            user.photo &&
                            `${import.meta.env.VITE_API_URL}${user.photo}`
                          }
                          alt={user.name}
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {getInitials(`${user.name} ${user.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name} {user.lastName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link to="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        Mi Perfil
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/appointments">
                      <DropdownMenuItem className="cursor-pointer">
                        Mis Citas
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                    >
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav
          className={cn(
            "w-64 bg-white shadow-sm border-r border-gray-200 fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex flex-col h-full pt-16 lg:pt-0">
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      location.pathname === item.path
                        ? "bg-violet-100 text-violet-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <main className="flex-1 lg:ml-0">
          <div className="py-6">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
