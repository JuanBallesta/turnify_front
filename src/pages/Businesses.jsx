import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import BusinessForm from "@/components/BusinessForm";
import { getBusinesses, deleteBusiness } from "@/services/BusinessService";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";

// Icons
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
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(undefined);

  const loadBusinesses = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const responseData = await getBusinesses(page, 6);
      if (responseData && responseData.ok && responseData.data) {
        setBusinesses(responseData.data.businesses || []);
        setPagination({
          currentPage: responseData.data.currentPage,
          totalPages: responseData.data.totalPages,
        });
      } else {
        throw new Error("Formato de respuesta de API inválido.");
      }
    } catch (err) {
      console.error("Error al cargar negocios:", err);
      setError("No se pudieron cargar los negocios.");
      setBusinesses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadBusinesses(1);
    }
  }, [user]);

  const handlePageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= pagination.totalPages &&
      newPage !== pagination.currentPage
    ) {
      loadBusinesses(newPage);
    }
  };

  const handleEdit = (business) => {
    setEditingBusiness(business);
    setIsFormOpen(true);
  };

  const handleDelete = async (businessId) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar este negocio y todos sus datos asociados?",
      )
    ) {
      try {
        await deleteBusiness(businessId);
        if (businesses.length === 1 && pagination.currentPage > 1) {
          handlePageChange(pagination.currentPage - 1);
        } else {
          loadBusinesses(pagination.currentPage);
        }
      } catch (err) {
        alert("Error al eliminar el negocio.");
      }
    }
  };

  const handleFormSuccess = () => {
    loadBusinesses(pagination.currentPage);
    setIsFormOpen(false);
    setEditingBusiness(undefined);
  };
  const handleNewBusiness = () => {
    setEditingBusiness(undefined);
    setIsFormOpen(true);
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Negocios</h1>
            <p className="text-gray-600 mt-1">
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

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Todos los Negocios</CardTitle>
            <CardDescription>
              Una lista de todos los negocios registrados en el sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-24">Cargando negocios...</div>
            ) : error ? (
              <div className="text-center py-24 text-red-500">{error}</div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-24">
                No hay negocios para mostrar.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Negocio</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Dirección</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {businesses.map((business) => (
                        <TableRow key={business.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-gray-500" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {business.name}
                                </div>
                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                  {business.description}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{business.email}</div>
                            <div className="text-sm text-gray-500">
                              {business.phone}
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm max-w-xs truncate">
                              {business.address}
                            </p>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(business)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
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
                                    ¿Estás seguro? Esta acción eliminará "
                                    {business.name}" y todos sus datos asociados
                                    (empleados, servicios, etc.). No se puede
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(pagination.currentPage - 1);
                            }}
                            disabled={pagination.currentPage === 1}
                          />
                        </PaginationItem>

                        {[...Array(pagination.totalPages).keys()].map(
                          (pageNumber) => (
                            <PaginationItem key={pageNumber + 1}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(pageNumber + 1);
                                }}
                                isActive={
                                  pagination.currentPage === pageNumber + 1
                                }
                              >
                                {pageNumber + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ),
                        )}

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(pagination.currentPage + 1);
                            }}
                            disabled={
                              pagination.currentPage === pagination.totalPages
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {isFormOpen && (
        <BusinessForm
          key={editingBusiness ? editingBusiness.id : "new-business"}
          business={editingBusiness}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSuccess={handleFormSuccess}
        />
      )}
    </>
  );
}
