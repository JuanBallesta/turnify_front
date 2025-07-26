import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import EmployeeForm from "@/components/EmployeeForm";
import { getEmployees, deleteEmployee } from "@/services/EmployeeService";

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
import { StatusBadge } from "@/components/ui/StatusBadge";

// Icons
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
  ArrowUpDown,
} from "lucide-react";

export default function Employees() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(undefined);
  const [sortConfig, setSortConfig] = useState({
    key: "lastName",
    direction: "ascending",
  });

  const loadEmployees = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const businessIdToFilter =
        user.role === "administrator" ? user.businessId : null;
      const data = await getEmployees(businessIdToFilter);
      setEmployees(data);
    } catch (err) {
      setError("No se pudieron cargar los empleados.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadEmployees();
    }
  }, [user?.id]);

  const sortedEmployees = useMemo(() => {
    let sortableItems = [...employees];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue = a;
        let bValue = b;
        sortConfig.key.split(".").forEach((key) => {
          aValue = aValue?.[key];
          bValue = bValue?.[key];
        });

        if (aValue == null || aValue < bValue)
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (bValue == null || aValue > bValue)
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [employees, sortConfig]);

  const requestSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };
  const handleDelete = async (employeeId) => {
    try {
      await deleteEmployee(employeeId);
      loadEmployees();
    } catch {
      alert("Error al eliminar el empleado.");
    }
  };
  const handleFormSuccess = () => {
    loadEmployees();
    setIsFormOpen(false);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Empleados</h1>
            <p className="text-gray-600 mt-1">Administra cuentas y permisos</p>
          </div>
          <Button
            onClick={handleNewEmployee}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Empleado
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total</p>
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
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>
              {user?.role === "administrator"
                ? `Empleados de tu Negocio`
                : "Todos los Empleados"}
            </CardTitle>
            <CardDescription>
              {user?.role === "administrator"
                ? "Una lista de los empleados registrados en tu negocio."
                : "Una lista completa de todos los empleados en todos los negocios."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">Cargando empleados...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => requestSort("lastName")}
                        >
                          Empleado <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Contacto</TableHead>
                      {user?.role === "superuser" && (
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => requestSort("business.name")}
                          >
                            Negocio <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                      )}
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => requestSort("userType.name")}
                        >
                          Rol <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedEmployees.length > 0 ? (
                      sortedEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <div className="font-medium">
                              {employee.lastName}, {employee.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{employee.userName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1.5 text-gray-400" />
                              {employee.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              +{employee.phone}
                            </div>
                          </TableCell>
                          {user?.role === "superuser" && (
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <Building2 className="h-4 w-4" />
                                </div>
                                <span>{employee.business?.name || "N/A"}</span>
                              </div>
                            </TableCell>
                          )}
                          <TableCell>
                            <Badge variant="secondary">
                              {employee.userType?.name || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={employee.isActive} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(employee)}
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
                                    Eliminar Empleado
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    ¿Estás seguro? Esta acción eliminará a "
                                    {employee.name} {employee.lastName}"
                                    permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(employee.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={user?.role === "superuser" ? 6 : 5}
                          className="text-center h-24"
                        >
                          No se encontraron empleados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isFormOpen && (
        <EmployeeForm
          key={editingEmployee ? editingEmployee.id : "new-employee"}
          employee={editingEmployee}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSuccess={handleFormSuccess}
          currentUser={user}
        />
      )}
    </>
  );
}
