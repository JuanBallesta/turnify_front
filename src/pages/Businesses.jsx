import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import BusinessForm from "../components/BusinessForm";
import { getBusinesses, deleteBusiness } from "../services/BusinessService";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Badge } from "../components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Building2,
  Users,
  Mail,
  Phone,
} from "lucide-react";

export default function Businesses() {
  const [businesses, setBusinesses] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(undefined);

  // Estados para manejar la comunicación con la API
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBusinesses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getBusinesses();
      setBusinesses(data || []); // Asegurarse de que sea un array
    } catch (err) {
      setError(
        "No se pudieron cargar los negocios. Inténtalo de nuevo más tarde.",
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  const handleEdit = (business) => {
    setEditingBusiness(business);
    setIsFormOpen(true);
  };

  const handleDelete = async (businessId) => {
    try {
      await deleteBusiness(businessId);
      loadBusinesses(); // Recarga la lista para reflejar el cambio
    } catch (err) {
      alert("Error al eliminar el negocio.");
    }
  };

  const handleFormSuccess = () => {
    loadBusinesses();
    setEditingBusiness(undefined);
  };

  const handleNewBusiness = () => {
    setEditingBusiness(undefined);
    setIsFormOpen(true);
  };

  // Cálculo de estadísticas (depende de que la API envíe `employeeCount`)
  const totalEmployees = businesses.reduce(
    (sum, business) => sum + (business.employeeCount || 0),
    0,
  );
  const averageEmployees =
    businesses.length > 0 ? Math.round(totalEmployees / businesses.length) : 0;

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Negocios
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administra tus negocios registrados
            </p>
          </div>
          <Button
            onClick={handleNewBusiness}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Negocio
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total de Negocios
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? "..." : businesses.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total de Empleados
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? "..." : totalEmployees}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Building2 className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Promedio de Empleados
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoading ? "..." : averageEmployees}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Businesses Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Todos los Negocios
            </CardTitle>
            <CardDescription>
              Una lista completa de todos los negocios registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">Cargando negocios...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  Aún no hay negocios
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Comienza creando tu primer negocio.
                </p>
                <Button
                  onClick={handleNewBusiness}
                  className="mt-4 bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Tu Primer Negocio
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Negocio</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Dirección</TableHead>
                      <TableHead>Empleados</TableHead>
                      <TableHead>Creado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {businesses.map((business) => (
                      <TableRow key={business.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {business.logo ? (
                                <img
                                  className="h-10 w-10 rounded-lg object-cover"
                                  src={business.logo}
                                  alt={business.name}
                                />
                              ) : (
                                <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                                  <Building2 className="h-5 w-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {business.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {business.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1.5 text-gray-400" />
                              {business.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="h-3 w-3 mr-1.5 text-gray-400" />
                              {business.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm max-w-xs truncate">
                            {business.address}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="bg-purple-100 text-purple-800"
                          >
                            {business.employeeCount ?? 0} empleados
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-500">
                            {new Date(business.createdAt).toLocaleDateString(
                              "es-ES",
                            )}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(business)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Eliminar Negocio
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    ¿Estás seguro de que quieres eliminar "
                                    {business.name}"? Esta acción no se puede
                                    deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(business.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BusinessForm
        business={editingBusiness}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleFormSuccess}
      />
    </>
  );
}
