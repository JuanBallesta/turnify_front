import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { getDashboardData } from "@/services/DashboardService";

// UI Components
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { InfoCard } from "@/components/ui/info-card";
import { ActionButton } from "@/components/ui/action-button";
import { EmptyState } from "@/components/ui/empty-state";
import { UpcomingAppointments } from "@/components/ui/upcoming-appointments";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Icons
import {
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiPlus,
  FiEye,
  FiEdit,
  FiUser,
  FiCheck,
  FiX,
  FiSettings, // <-- IMPORTACIÓN AÑADIDA
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Sub-componente para el Dashboard de Cliente ---
const ClientDashboard = ({
  stats,
  servicesCount,
  upcomingAppointments,
  InfoCard,
  ActionButton,
  Link,
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Citas Este Mes"
        value={stats.monthly}
        description="Total de citas programadas"
        icon={FiCalendar}
        variant="primary"
      />
      <StatsCard
        title="Citas Hoy"
        value={stats.today}
        description="Citas programadas para hoy"
        icon={FiClock}
        variant="default"
      />
      <StatsCard
        title="Completadas"
        value={stats.completed}
        description="Servicios terminados"
        icon={FiCheck}
        variant="success"
      />
      <StatsCard
        title="Servicios Disponibles"
        value={servicesCount}
        description="Servicios que puedes reservar"
        icon={FiTrendingUp}
        variant="default"
      />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <InfoCard
        title="Reservar Nueva Cita"
        description="Programa tu próximo servicio"
        actions={
          <Link to="/book">
            <ActionButton icon={FiPlus}>Reservar Ahora</ActionButton>
          </Link>
        }
        variant="featured"
      />
      <InfoCard
        title="Mis Citas"
        description="Revisa tus citas y tu historial"
        actions={
          <Link to="/appointments">
            <ActionButton variant="outline" icon={FiCalendar}>
              Ver Citas
            </ActionButton>
          </Link>
        }
      />
      <InfoCard
        title="Mi Perfil"
        description="Actualiza tu información personal"
        actions={
          <Link to="/profile">
            <ActionButton variant="outline" icon={FiUser}>
              Editar Perfil
            </ActionButton>
          </Link>
        }
      />
    </div>
    <UpcomingAppointments
      appointments={upcomingAppointments}
      onViewAll={() => (window.location.href = "/appointments")}
    />
  </div>
);

// --- Sub-componente para el Dashboard de Empleado ---
const EmployeeDashboard = ({
  stats,
  recentAppointments,
  appointmentColumns,
  DataTable,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  EmptyState,
  Button,
  Link,
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Citas Hoy"
        value={stats.today}
        description="Servicios programados"
        icon={FiCalendar}
        variant="primary"
      />
      <StatsCard
        title="Este Mes"
        value={stats.monthly}
        description="Total de servicios"
        icon={FiTrendingUp}
        variant="default"
      />
      <StatsCard
        title="Completadas"
        value={stats.completed}
        description="Servicios finalizados"
        icon={FiDollarSign}
        variant="success"
      />
      <StatsCard
        title="Clientes Atendidos"
        value={
          new Set(
            recentAppointments
              .filter((a) => a.status === "completed")
              .map((a) => a.clientId),
          ).size
        }
        description="Clientes únicos este mes"
        icon={FiUsers}
        variant="default"
      />
    </div>
    <Tabs defaultValue="appointments" className="space-y-4">
      <TabsList>
        <TabsTrigger value="appointments">Próximas Citas</TabsTrigger>
        <TabsTrigger value="schedule">Mi Horario</TabsTrigger>
      </TabsList>
      <TabsContent value="appointments">
        <DataTable
          columns={appointmentColumns}
          data={recentAppointments}
          emptyMessage="No tienes citas asignadas próximamente"
        />
      </TabsContent>
      <TabsContent value="schedule">
        <EmptyState
          icon={FiClock}
          title="Gestión de Horarios"
          description="Define tu disponibilidad para que los clientes puedan reservar contigo."
          action={
            <Link to="/schedules">
              <Button>Ir a Mi Horario</Button>
            </Link>
          }
        />
      </TabsContent>
    </Tabs>
  </div>
);

// --- Sub-componente para el Dashboard de Administrador/Superusuario ---
const AdminDashboard = ({
  stats,
  servicesCount,
  recentAppointments,
  appointmentColumns,
  InfoCard,
  ActionButton,
  Link,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  DataTable,
  EmptyState,
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Citas (Mes)"
        value={stats.monthly}
        description="Todas las citas del negocio"
        icon={FiCalendar}
        variant="primary"
      />
      <StatsCard
        title="Servicios Activos"
        value={servicesCount}
        description="Servicios disponibles"
        icon={FiSettings}
        variant="default"
      />
      <StatsCard
        title="Ingresos (Mes)"
        value="$12,450"
        description="Cálculo no implementado"
        icon={FiDollarSign}
        variant="success"
      />
      <StatsCard
        title="Tasa de Ocupación"
        value="75%"
        description="Cálculo no implementado"
        icon={FiTrendingUp}
        variant="default"
      />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <InfoCard
        title="Programar Cita"
        description="Agenda nuevas citas para clientes"
        actions={
          <Link to="/book">
            <ActionButton icon={FiPlus}>Programar</ActionButton>
          </Link>
        }
      />
      <InfoCard
        title="Gestionar Servicios"
        description="Crea y edita los servicios"
        actions={
          <Link to="/services">
            <ActionButton variant="outline" icon={FiEdit}>
              Servicios
            </ActionButton>
          </Link>
        }
      />
      <InfoCard
        title="Gestionar Empleados"
        description="Administra tu equipo de trabajo"
        actions={
          <Link to="/employees">
            <ActionButton variant="outline" icon={FiUsers}>
              Empleados
            </ActionButton>
          </Link>
        }
      />
    </div>
    <Tabs defaultValue="recent" className="space-y-4">
      <TabsList>
        <TabsTrigger value="recent">Citas Recientes</TabsTrigger>
        <TabsTrigger value="analytics">Análisis</TabsTrigger>
      </TabsList>
      <TabsContent value="recent">
        <DataTable columns={appointmentColumns} data={recentAppointments} />
      </TabsContent>
      <TabsContent value="analytics">
        <EmptyState
          icon={FiTrendingUp}
          title="Analytics Avanzados"
          description="Próximamente tendrás acceso a reportes detallados y métricas de rendimiento."
        />
      </TabsContent>
    </Tabs>
  </div>
);

// --- Componente Principal y Lógica de Datos ---
const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getDashboardData()
        .then((data) => {
          setDashboardData(data);
        })
        .catch((err) => {
          console.error("Error fetching dashboard data:", err);
          setError("No se pudieron cargar los datos del panel.");
        })
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  const getRoleLabel = (role) => {
    const roles = {
      client: "Cliente",
      employee: "Empleado",
      administrator: "Administrador",
      superuser: "Super Usuario",
    };
    return roles[role] || "Usuario";
  };

  const getHeaderDescription = () => {
    const roleLabel = getRoleLabel(user.role);
    if (
      (user.role === "administrator" || user.role === "employee") &&
      user.businessName
    ) {
      return `${roleLabel} de ${user.businessName}`;
    }
    return `Panel de control - ${roleLabel}`;
  };

  const appointmentColumns = [
    {
      key: "offering.name",
      title: "Servicio",
      render: (_, row) => (
        <div>
          <div className="font-medium">
            {row.offering?.name || "Servicio Eliminado"}
          </div>
        </div>
      ),
    },
    {
      key: "startTime",
      title: "Fecha y Hora",
      render: (value) =>
        new Date(value).toLocaleString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    ...(user?.role !== "client"
      ? [
          {
            key: "client",
            title: "Cliente",
            render: (val) => (
              <span>
                {val?.name
                  ? `${val.name} ${val.lastName}`
                  : "Cliente Eliminado"}
              </span>
            ),
          },
        ]
      : []),
    ...(user?.role === "client" ||
    user?.role === "administrator" ||
    user?.role === "superuser"
      ? [
          {
            key: "employee",
            title: "Empleado",
            render: (val) => (
              <span>
                {val?.name
                  ? `${val.name} ${val.lastName}`
                  : "Empleado Eliminado"}
              </span>
            ),
          },
        ]
      : []),
    {
      key: "status",
      title: "Estado",
      render: (value) => <AppointmentStatusBadge status={value} />,
    },
  ];

  const renderDashboardByRole = () => {
    if (!dashboardData)
      return <EmptyState title="No hay datos para mostrar." />;

    const props = {
      user,
      stats: dashboardData.stats,
      servicesCount: dashboardData.additionalData?.services || 0,
      recentAppointments: dashboardData.recentAppointments,
      upcomingAppointments: dashboardData.upcomingAppointments,
      appointmentColumns,
      InfoCard,
      ActionButton,
      DataTable,
      Tabs,
      TabsList,
      TabsTrigger,
      TabsContent,
      EmptyState,
      Button,
      Link,
    };

    switch (user.role) {
      case "client":
        return <ClientDashboard {...props} />;
      case "employee":
        return <EmployeeDashboard {...props} />;
      case "administrator":
      case "superuser":
        return <AdminDashboard {...props} />;
      default:
        return <EmptyState title="Rol Desconocido" />;
    }
  };

  if (isLoading || !user) {
    return (
      <>
        <div className="p-6">
          <PageHeader title="Cargando..." />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="p-6">
          <PageHeader title="Error" description={error} />
        </div>
      </>
    );
  }

  const AppointmentStatusBadge = ({ status }) => {
    const statusInfo = {
      scheduled: {
        label: "Programada",
        className: "bg-blue-100 text-blue-800",
      },
      completed: {
        label: "Completada",
        className: "bg-green-100 text-green-800",
      },
      cancelled: { label: "Cancelada", className: "bg-red-100 text-red-800" },
    };

    const currentStatus = statusInfo[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={cn("font-medium", currentStatus.className)}>
        {currentStatus.label}
      </Badge>
    );
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <PageHeader
          title={`¡Bienvenido, ${user.name}!`}
          description={getHeaderDescription()}
          breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }]}
        />
        {renderDashboardByRole()}
      </div>
    </>
  );
};

export default Dashboard;
