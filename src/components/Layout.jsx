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
  FiBell,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

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
        ];
      case "administrator":
        return [
          ...baseItems,
          { icon: FiUsers, label: "Empleados", path: "/employees" },
          { icon: FiGrid, label: "Servicios", path: "/services" },
          { icon: FiPlus, label: "Horarios", path: "/schedules" },
        ];
      case "superuser":
        return [
          ...baseItems,
          { icon: FiGrid, label: "Negocios", path: "/businesses" },
          { icon: FiUsers, label: "Empleados", path: "/employees" },
          { icon: FiSettings, label: "Panel de Admin", path: "/admin" },
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
      <header className="bg-purple-600 text-white font-bold shadow-sm border-b border-gray-200">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
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
                <div className="text-2xl font-extrabold cursor-pointer">
                  Turnify
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {/* Icono de Notificaciones */}
              <NotificationCenter />

              {/* Avatar del Usuario */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-violet-100 text-violet-700">
                        {user?.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <p className="text-xs text-violet-600 capitalize">
                        {getRoleLabel(user?.role || "")}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <FiUser className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <FiLogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-violet-100 text-violet-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      )}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 lg:ml-0">
          <div className="py-6">
            <div className="mx-auto px-8 sm:px-6 lg:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
