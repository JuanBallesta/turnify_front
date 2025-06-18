import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import EmployeeForm from "../components/EmployeeForm";

import { getEmployees, deleteEmployee } from "../services/EmployeeService";

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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Building2,
} from "lucide-react";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(undefined);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getEmployees();
      setEmployees(data || []);
    } catch (err) {
      setError("No se pudieron cargar los empleados. Inténtalo de nuevo.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDelete = async (employeeId) => {
    try {
      await deleteEmployee(employeeId);
      loadEmployees();
    } catch (err) {
      alert("Error al eliminar el empleado.");
    }
  };

  const handleFormSuccess = () => {
    loadEmployees();
    setEditingEmployee(undefined);
  };

  const handleNewEmployee = () => {
    setEditingEmployee(undefined);
    setIsFormOpen(true);
  };

  const activeEmployees = employees.filter((e) => e.isActive).length;
  const inactiveEmployees = employees.length - activeEmployees;

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header (sin cambios) */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Empleados
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administra cuentas y permisos de empleados
            </p>
          </div>
          <Button
            onClick={handleNewEmployee}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Empleado
          </Button>
        </div>

        {/* Stats (La tarjeta de "Negocios" se quita porque no tenemos ese dato directamente) */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total de Empleados</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : employees.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Activos</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : activeEmployees}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <UserX className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Inactivos</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : inactiveEmployees}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employees Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Todos los Empleados
            </CardTitle>
            <CardDescription>
              Una lista completa de todos los empleados en todos los negocios
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">Cargando empleados...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : employees.length === 0 ? (
              <div className="text-center py-12">{/* ... (sin cambios) */}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>{/* ... (sin cambios) */}</TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {/* ... (sin cambios) */}
                          </div>
                        </TableCell>
                        <TableCell>{/* ... (sin cambios) */}</TableCell>
                        <TableCell>
                          {/* CAMBIO 5: Usar los datos anidados del negocio */}
                          <div className="flex items-center space-x-2">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-sm font-medium truncate">
                              {employee.business?.name || "N/A"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {/* CAMBIO 6: Usar los datos anidados del rol */}
                          <Badge
                            variant="secondary"
                            className="bg-violet-100 text-violet-800"
                          >
                            {employee.userType?.name || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>{/* ... (sin cambios) */}</TableCell>
                        <TableCell>
                          {/* CAMBIO 7: Asegurarse de que createdAt es una fecha válida */}
                          <p className="text-sm text-gray-500">
                            {new Date(employee.createdAt).toLocaleDateString(
                              "es-ES",
                            )}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          {/* ... (sin cambios) */}
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

      <EmployeeForm
        employee={editingEmployee}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleFormSuccess}
      />
    </>
  );
}
