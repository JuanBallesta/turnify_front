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
import { FiHome, FiArrowLeft, FiSearch } from "react-icons/fi";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-700 rounded-2xl flex items-center justify-center">
              <FiSearch className="text-white h-8 w-8" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Página No Encontrada
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            La página que buscas no existe o ha sido movida
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Error 404</CardTitle>
            <CardDescription className="text-center">
              No pudimos encontrar la página que estás buscando.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Verifica la URL o regresa al panel principal para continuar
                navegando.
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

export default NotFound;
