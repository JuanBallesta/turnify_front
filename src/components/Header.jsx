import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// UI Components
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
import { NotificationCenter } from "@/components/ui/notification-center";
import { FiMenu } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return "?";
    const n = name.trim().split(" ");
    if (n.length > 1) return `${n[0][0]}${n[n.length - 1][0]}`.toUpperCase();
    return n[0].substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    // --- ESTILOS CORREGIDOS ---
    <header className="bg-violet-600 text-white sticky top-0 z-20">
      <nav className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {user && onMenuClick && (
              <div className="lg:hidden mr-2">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-violet-500 hover:text-white"
                  size="icon"
                  onClick={onMenuClick}
                >
                  <FiMenu className="h-6 w-6" />
                </Button>
              </div>
            )}
            {/* El logo solo se muestra en el header del layout logueado */}
            {!onMenuClick && (
              <Link to="/" className="text-2xl font-bold">
                Turnify
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                <NotificationCenter />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 text-white hover:bg-violet-500 hover:text-white p-1 rounded-full"
                    >
                      <span className="hidden sm:inline">{user.name}</span>
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.photo && `${API_URL}${user.photo}`}
                          alt={user.name}
                        />
                        <AvatarFallback className="bg-white text-violet-600 font-bold">
                          {getInitials(`${user.name} ${user.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      {user.name} {user.lastName}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link to="/dashboard">
                      <DropdownMenuItem>Panel Principal</DropdownMenuItem>
                    </Link>
                    <Link to="/profile">
                      <DropdownMenuItem>Mi Perfil</DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600"
                    >
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link to="/login">
                  <Button className="text-white bg-violet-600 hover:bg-violet-800">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="text-white bg-violet-600 hover:bg-violet-800">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
