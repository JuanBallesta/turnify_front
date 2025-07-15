import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { getMyAppointments } from "@/services/AppointmentService";

// UI Components
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ActionButton } from "@/components/ui/action-button";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchBox } from "@/components/ui/search-box";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent } from "@/components/ui/card";

// Icons
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiEdit,
  FiTrash2,
  FiEye,
  FiPlus,
  FiFilter,
  FiCheck,
  FiX,
} from "react-icons/fi";

const Appointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getMyAppointments()
        .then(setAppointments)
        .catch(() => setError("No se pudieron cargar las citas."))
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch =
        (apt.offering?.name.toLowerCase() || "").includes(lowerSearch) ||
        `${apt.client?.name} ${apt.client?.lastName}`
          .toLowerCase()
          .includes(lowerSearch) ||
        `${apt.employee?.name} ${apt.employee?.lastName}`
          .toLowerCase()
          .includes(lowerSearch);

      if (activeTab === "all") return matchesSearch;
      return matchesSearch && apt.status === activeTab;
    });
  }, [appointments, searchTerm, activeTab]);

  const stats = useMemo(
    () => ({
      total: appointments.length,
      scheduled: appointments.filter((apt) => apt.status === "scheduled")
        .length,
      completed: appointments.filter((apt) => apt.status === "completed")
        .length,
      cancelled: appointments.filter((apt) => apt.status === "cancelled")
        .length,
    }),
    [appointments],
  );

  const columns = [
    {
      key: "offering.name",
      title: "Servicio",
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">
            {row.offering?.description}
          </div>
        </div>
      ),
    },
    {
      key: "startTime",
      title: "Fecha y Hora",
      render: (value) => (
        <div>
          <div>{new Date(value).toLocaleDateString("es-ES")}</div>
          <div className="text-sm text-gray-500">
            {new Date(value).toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      ),
    },
    ...(user?.role !== "client"
      ? [
          {
            key: "client",
            title: "Cliente",
            render: (value) => (
              <div className="flex items-center">
                <FiUser className="mr-2 h-4 w-4 text-gray-400" />
                <span>
                  {value?.name} {value?.lastName}
                </span>
              </div>
            ),
          },
        ]
      : []),
    ...(user?.role !== "employee"
      ? [
          {
            key: "employee",
            title: "Empleado",
            render: (value) => (
              <div className="flex items-center">
                <FiUser className="mr-2 h-4 w-4 text-gray-400" />
                <span>
                  {value?.name} {value?.lastName}
                </span>
              </div>
            ),
          },
        ]
      : []),
    {
      key: "status",
      title: "Estado",
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: "actions",
      title: "Acciones",
      render: (_, row) => (
        <div className="flex space-x-1">
          <ActionButton
            size="sm"
            variant="ghost"
            icon={FiEye}
            tooltip="Ver detalles"
          />
        </div>
      ),
    },
  ];

  if (isLoading)
    return (
      <>
        <div>Cargando citas...</div>
      </>
    );
  if (error)
    return (
      <>
        <div>{error}</div>
      </>
    );

  return (
    <>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Mis Citas"
          description="Revisa tus citas programadas y tu historial de servicios"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total de Citas"
            value={stats.total}
            icon={FiCalendar}
          />
          <StatsCard
            title="Programadas"
            value={stats.scheduled}
            icon={FiClock}
            variant="primary"
          />
          <StatsCard
            title="Completadas"
            value={stats.completed}
            icon={FiCheck}
            variant="success"
          />
          <StatsCard
            title="Canceladas"
            value={stats.cancelled}
            icon={FiX}
            variant="danger"
          />
        </div>

        <div className="flex justify-between items-center">
          <SearchBox
            placeholder="Buscar citas..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="w-full sm:w-96"
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="all">Todas ({stats.total})</TabsTrigger>
            <TabsTrigger value="scheduled">
              Programadas ({stats.scheduled})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completadas ({stats.completed})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Canceladas ({stats.cancelled})
            </TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <Card>
              <CardContent className="pt-6">
                {filteredAppointments.length > 0 ? (
                  <DataTable columns={columns} data={filteredAppointments} />
                ) : (
                  <EmptyState
                    icon={FiCalendar}
                    title="No se encontraron citas"
                    description="No hay citas que coincidan con los filtros actuales."
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Appointments;
