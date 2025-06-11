import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FiShield, FiHome, FiArrowLeft } from "react-icons/fi";

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-700 rounded-2xl flex items-center justify-center">
              <FiShield className="text-white h-8 w-8" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Acceso Denegado
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            No tienes permisos para acceder a esta página
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Acceso No Autorizado</CardTitle>
            <CardDescription className="text-center">
              Esta página requiere permisos específicos que tu cuenta no tiene.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Si crees que esto es un error, por favor contacta a tu
                administrador.
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <Link to="/dashboard">
                <Button className="w-full bg-violet-600 hover:bg-violet-700">
                  <FiHome className="h-4 w-4 mr-2" />
                  Ir al Panel Principal
                </Button>
              </Link>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.history.back()}
              >
                <FiArrowLeft className="h-4 w-4 mr-2" />
                Volver Atrás
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Unauthorized;
