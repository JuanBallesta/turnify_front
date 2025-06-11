import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";

// UI Components - Import directly from individual files
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ActionButton } from "@/components/ui/action-button";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchBox } from "@/components/ui/search-box";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InfoCard } from "@/components/ui/info-card";
import { StatsCard } from "@/components/ui/stats-card";

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
  const { appointments, services } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Filter appointments based on user role and search
  const userAppointments = appointments.filter((apt) => {
    if (user.role === "client") {
      return apt.clientId === user.id;
    }
    if (user.role === "employee") {
      return apt.employeeId === user.id;
    }
    return true; // Admin and superuser see all
  });

  const filteredAppointments = userAppointments.filter((apt) => {
    const matchesSearch =
      apt.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.employeeName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && apt.status === activeTab;
  });

  // Statistics
  const stats = {
    total: userAppointments.length,
    scheduled: userAppointments.filter((apt) => apt.status === "scheduled")
      .length,
    completed: userAppointments.filter((apt) => apt.status === "completed")
      .length,
    cancelled: userAppointments.filter((apt) => apt.status === "cancelled")
      .length,
  };

  // Table columns
  const columns = [
    {
      key: "serviceName",
      title: "Servicio",
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.serviceDescription}</div>
        </div>
      ),
    },
    {
      key: "date",
      title: "Fecha",
      render: (value) => (
        <div className="flex items-center space-x-2">
          <FiCalendar className="w-4 h-4 text-gray-400" />
          <span>
            {new Date(value).toLocaleDateString("es-ES", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      ),
    },
    {
      key: "time",
      title: "Hora",
      render: (value) => (
        <div className="flex items-center space-x-2">
          <FiClock className="w-4 h-4 text-gray-400" />
          <span>{value}</span>
        </div>
      ),
    },
    // Show client/employee based on role
    ...(user.role !== "client"
      ? [
          {
            key: "clientName",
            title: "Cliente",
            render: (value) => (
              <div className="flex items-center space-x-2">
                <FiUser className="w-4 h-4 text-gray-400" />
                <span>{value}</span>
              </div>
            ),
          },
        ]
      : []),
    ...(user.role === "client"
      ? [
          {
            key: "employeeName",
            title: "Empleado",
            render: (value) => (
              <div className="flex items-center space-x-2">
                <FiUser className="w-4 h-4 text-gray-400" />
                <span>{value}</span>
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
      render: (value, row) => (
        <div className="flex space-x-2">
          <ActionButton
            size="sm"
            variant="ghost"
            icon={FiEye}
            tooltip="Ver detalles"
          />
          {row.status === "scheduled" && (
            <>
              <ActionButton
                size="sm"
                variant="ghost"
                icon={FiEdit}
                tooltip="Editar"
              />
              <ActionButton
                size="sm"
                variant="ghost"
                icon={FiX}
                tooltip="Cancelar"
              />
            </>
          )}
          {(user.role === "administrator" || user.role === "superuser") && (
            <ActionButton
              size="sm"
              variant="ghost"
              icon={FiTrash2}
              tooltip="Eliminar"
            />
          )}
        </div>
      ),
    },
  ];

  const tabCounts = {
    all: stats.total,
    scheduled: stats.scheduled,
    completed: stats.completed,
    cancelled: stats.cancelled,
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Gestión de Citas"
        description={
          user.role === "client"
            ? "Revisa tus citas programadas y historial de servicios"
            : user.role === "employee"
              ? "Administra las citas asignadas a ti"
              : "Gestiona todas las citas del sistema"
        }
        breadcrumbs={[{ label: "Citas", href: "/appointments" }]}
        actions={
          user.role === "client" ? (
            <ActionButton
              icon={FiPlus}
              onClick={() => (window.location.href = "/book")}
            >
              Nueva Cita
            </ActionButton>
          ) : user.role === "administrator" || user.role === "superuser" ? (
            <ActionButton
              icon={FiPlus}
              onClick={() => (window.location.href = "/schedule")}
            >
              Programar Cita
            </ActionButton>
          ) : null
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total de Citas"
          value={stats.total}
          description="Todas tus citas"
          icon={FiCalendar}
          variant="default"
        />
        <StatsCard
          title="Programadas"
          value={stats.scheduled}
          description="Próximas citas"
          icon={FiClock}
          variant="primary"
        />
        <StatsCard
          title="Completadas"
          value={stats.completed}
          description="Servicios terminados"
          icon={FiCheck}
          variant="success"
        />
        <StatsCard
          title="Canceladas"
          value={stats.cancelled}
          description="Citas canceladas"
          icon={FiX}
          variant="danger"
        />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <SearchBox
          placeholder="Buscar citas por servicio, cliente o empleado..."
          value={searchTerm}
          onValueChange={setSearchTerm}
          className="w-full sm:w-96"
        />
        <ActionButton variant="outline" icon={FiFilter}>
          Filtros Avanzados
        </ActionButton>
      </div>

      {/* Appointments Table with Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="all">Todas ({tabCounts.all})</TabsTrigger>
          <TabsTrigger value="scheduled">
            Programadas ({tabCounts.scheduled})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completadas ({tabCounts.completed})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Canceladas ({tabCounts.cancelled})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredAppointments.length > 0 ? (
            <DataTable
              columns={columns}
              data={filteredAppointments}
              onRowClick={(row) => console.log("Ver detalles de:", row)}
            />
          ) : (
            <EmptyState
              icon={FiCalendar}
              title="No se encontraron citas"
              description={
                searchTerm
                  ? "No hay citas que coincidan con tu búsqueda. Intenta con otros términos."
                  : activeTab === "all"
                    ? "Aún no tienes citas registradas. ¡Programa tu primera cita!"
                    : `No tienes citas con estado "${activeTab}".`
              }
              action={
                user.role === "client" ? "Reservar Primera Cita" : undefined
              }
              onAction={
                user.role === "client"
                  ? () => (window.location.href = "/book")
                  : undefined
              }
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      {user.role === "client" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard
            title="Reservar Nueva Cita"
            description="Programa tu próximo servicio"
            actions={
              <ActionButton
                icon={FiPlus}
                onClick={() => (window.location.href = "/book")}
              >
                Reservar
              </ActionButton>
            }
            variant="compact"
          />
          <InfoCard
            title="Historial Completo"
            description="Ve todos tus servicios anteriores"
            actions={
              <ActionButton variant="outline" icon={FiEye}>
                Ver Historial
              </ActionButton>
            }
            variant="compact"
          />
          <InfoCard
            title="Preferencias"
            description="Configura tus servicios favoritos"
            actions={
              <ActionButton variant="outline" icon={FiEdit}>
                Configurar
              </ActionButton>
            }
            variant="compact"
          />
        </div>
      )}
    </div>
  );
};

export default Appointments;
