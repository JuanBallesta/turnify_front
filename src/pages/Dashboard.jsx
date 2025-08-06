import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { getDashboardData } from "@/services/DashboardService";

// UI Components
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable } from "@/components/ui/data-table";
import { InfoCard } from "@/components/ui/info-card";
import { ActionButton } from "@/components/ui/action-button";
import { EmptyState } from "@/components/ui/empty-state";
import { UpcomingAppointments } from "@/components/ui/upcoming-appointments";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

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
  FiSettings,
} from "react-icons/fi";

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
        actionLink="/availability"
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
              .map((a) => a.userId),
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
  adminView,
  ...props
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <StatsCard
        title="Citas de hoy"
        value={stats.today}
        description={
          adminView === "personal"
            ? "Tus citas personales para hoy"
            : "Citas del negocio para hoy"
        }
        icon={FiCalendar}
        variant="primary"
        actionLink="/availability"
      />
      <StatsCard
        title="Total Citas (Mes)"
        value={stats.monthly}
        description={
          adminView === "personal"
            ? "Tus citas personales este mes"
            : "Todas las citas del negocio"
        }
        icon={FiCalendar}
        variant="primary"
      />
      <StatsCard
        title="Servicios Activos"
        value={servicesCount}
        description="Servicios disponibles"
        icon={FiSettings}
      />
      <StatsCard
        title="Ingresos (Mes)"
        value="$0"
        description="No implementado"
        icon={FiDollarSign}
        variant="success"
      />
      <StatsCard
        title="Tasa de Ocupación"
        value="0%"
        description="No implementado"
        icon={FiTrendingUp}
      />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <InfoCard
        title="Programar Cita"
        description="Agenda nuevas citas"
        actions={
          <Link to="/book">
            <ActionButton icon={FiPlus}>Programar</ActionButton>
          </Link>
        }
      />
      <InfoCard
        title="Gestionar Servicios"
        description="Crea y edita servicios"
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
        description="Administra tu equipo"
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
        <DataTable
          columns={props.appointmentColumns}
          data={recentAppointments}
        />
      </TabsContent>
      <TabsContent value="analytics">
        <EmptyState
          icon={FiTrendingUp}
          title="Analytics Avanzados"
          description="Próximamente disponible."
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
  const [adminView, setAdminView] = useState("business");
  const isAdmin = user?.role === "administrator";

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      const viewContext = isAdmin ? adminView : undefined;
      getDashboardData(viewContext)
        .then((data) => {
          setDashboardData(data);
        })
        .catch(() => setError("No se pudieron cargar los datos del panel."))
        .finally(() => setIsLoading(false));
    }
  }, [user, adminView]);

  const { stats, recentAppointments, upcomingAppointments, servicesCount } =
    useMemo(() => {
      if (!dashboardData) {
        return {
          stats: {},
          recentAppointments: [],
          upcomingAppointments: [],
          servicesCount: 0,
        };
      }

      let relevantAppointments = dashboardData.recentAppointments || [];
      let relevantUpcoming = dashboardData.upcomingAppointments || [];
      let currentStats = dashboardData.stats;
      let services = dashboardData.additionalData?.services || 0;

      if (isAdmin && adminView === "personal") {
        const allAppointments = [...relevantAppointments, ...relevantUpcoming];
        const personalAppointments = allAppointments.filter(
          (apt) => apt.client?.email === user.email,
        );

        relevantAppointments = personalAppointments.slice(0, 10);
        relevantUpcoming = personalAppointments
          .filter(
            (a) =>
              a.status === "scheduled" && new Date(a.startTime) >= new Date(),
          )
          .slice(0, 5);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        );

        currentStats = {
          total: personalAppointments.length,
          scheduled: personalAppointments.filter(
            (a) => a.status === "scheduled",
          ).length,
          completed: personalAppointments.filter(
            (a) => a.status === "completed",
          ).length,
          cancelled: personalAppointments.filter(
            (a) => a.status === "cancelled",
          ).length,
          monthly: personalAppointments.filter(
            (a) => new Date(a.startTime) >= startOfMonth,
          ).length,
          today: personalAppointments.filter(
            (a) => new Date(a.startTime) >= startOfToday,
          ).length,
        };
      }

      return {
        stats: currentStats,
        recentAppointments: relevantAppointments,
        upcomingAppointments: relevantUpcoming,
        servicesCount: services,
      };
    }, [dashboardData, adminView, isAdmin, user?.email]);

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
          <div className="font-medium">{row.offering?.name || "N/A"}</div>
        </div>
      ),
    },
    {
      key: "startTime",
      title: "Fecha y Hora",
      render: (value) =>
        new Date(value).toLocaleString("es-ES", {
          dateStyle: "short",
          timeStyle: "short",
        }),
    },
    ...(user?.role !== "client"
      ? [
          {
            key: "client",
            title: "Cliente",
            render: (val) => `${val?.name || ""} ${val?.lastName || ""}`,
          },
        ]
      : []),
    ...(user?.role === "client" || isAdmin || user?.role === "superuser"
      ? [
          {
            key: "employee",
            title: "Empleado",
            render: (val) => `${val?.name || ""} ${val?.lastName || ""}`,
          },
        ]
      : []),
    {
      key: "status",
      title: "Estado",
      render: (value) => <StatusBadge status={value} />,
    },
  ];

  const renderDashboardByRole = () => {
    if (!dashboardData) return <EmptyState title="Cargando datos..." />;

    // El objeto props se mantiene igual, ya que la lógica de filtrado está en el backend
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
      adminView, // Pasamos la vista actual
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

  return (
    <>
      <div className="p-6 space-y-6">
        <PageHeader
          title={`¡Bienvenido, ${user.name}!`}
          description={getHeaderDescription()}
        />

        {isAdmin && (
          <Tabs value={adminView} onValueChange={setAdminView}>
            <TabsList>
              <TabsTrigger value="business">Citas del Negocio</TabsTrigger>
              <TabsTrigger value="personal">Mis Citas Personales</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {renderDashboardByRole()}
      </div>
    </>
  );
};

export default Dashboard;
