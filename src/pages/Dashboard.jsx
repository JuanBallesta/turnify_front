import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { Link } from "react-router-dom";

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
} from "react-icons/fi";

// --- Sub-componente para el Dashboard de Cliente ---
const ClientDashboard = ({
  user,
  userAppointments,
  todayAppointments,
  monthlyAppointments,
  completedAppointments,
  services,
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Citas Este Mes"
        value={monthlyAppointments.length}
        description="Total de citas programadas"
        icon={FiCalendar}
        variant="primary"
      />
      <StatsCard
        title="Citas Hoy"
        value={todayAppointments.length}
        description="Citas programadas para hoy"
        icon={FiClock}
        variant="default"
      />
      <StatsCard
        title="Completadas"
        value={completedAppointments.length}
        description="Servicios terminados"
        icon={FiCheck}
        variant="success"
      />
      <StatsCard
        title="Servicios Disponibles"
        value={services.length}
        description="Servicios que puedes reservar"
        icon={FiTrendingUp}
        variant="default"
      />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <InfoCard
        title="Reservar Nueva Cita"
        description="Programa tu próximo servicio de belleza"
        actions={
          <Link to="/book">
            <ActionButton icon={FiPlus}>Reservar Ahora</ActionButton>
          </Link>
        }
        variant="featured"
      />
      <InfoCard
        title="Mis Citas"
        description="Revisa tus citas programadas y historial"
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
      appointments={userAppointments.filter(
        (apt) => apt.status === "scheduled",
      )}
      onViewAll={() => (window.location.href = "/appointments")}
    />
  </div>
);

// --- Sub-componente para el Dashboard de Empleado ---
const EmployeeDashboard = ({
  userAppointments,
  todayAppointments,
  monthlyAppointments,
  completedAppointments,
  appointmentColumns,
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Citas Hoy"
        value={todayAppointments.length}
        description="Servicios programados"
        icon={FiCalendar}
        variant="primary"
      />
      <StatsCard
        title="Este Mes"
        value={monthlyAppointments.length}
        description="Total de servicios"
        icon={FiTrendingUp}
        variant="default"
      />
      <StatsCard
        title="Completadas"
        value={completedAppointments.length}
        description="Servicios finalizados"
        icon={FiDollarSign}
        variant="success"
      />
      <StatsCard
        title="Clientes Atendidos"
        value={new Set(completedAppointments.map((apt) => apt.clientId)).size}
        description="Clientes únicos"
        icon={FiUsers}
        variant="default"
      />
    </div>
    <Tabs defaultValue="appointments" className="space-y-4">
      <TabsList>
        <TabsTrigger value="appointments">Mis Citas</TabsTrigger>
        <TabsTrigger value="schedule">Horario</TabsTrigger>
      </TabsList>
      <TabsContent value="appointments">
        <DataTable
          columns={appointmentColumns}
          data={userAppointments.slice(0, 10)}
          emptyMessage="No tienes citas asignadas"
        />
      </TabsContent>
      <TabsContent value="schedule">
        <EmptyState
          icon={FiClock}
          title="Gestión de Horarios"
          description="Pronto podrás configurar tu disponibilidad y horarios de trabajo."
        />
      </TabsContent>
    </Tabs>
  </div>
);

// --- Sub-componente para el Dashboard de Administrador/Superusuario ---
const AdminDashboard = ({ appointments, services, appointmentColumns }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Citas"
        value={appointments.length}
        description="Todas las citas del sistema"
        icon={FiCalendar}
        variant="primary"
      />
      <StatsCard
        title="Servicios Activos"
        value={services.length}
        description="Servicios disponibles"
        icon={FiUsers}
        variant="default"
      />
      <StatsCard
        title="Ingresos Mes"
        value="$12,450"
        description="Ingresos estimados"
        icon={FiDollarSign}
        variant="success"
        trend="up"
        trendValue="12%"
      />
      <StatsCard
        title="Tasa Completadas"
        value="87%"
        description="Citas completadas exitosamente"
        icon={FiTrendingUp}
        variant="default"
        trend="up"
        trendValue="5%"
      />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <InfoCard
        title="Programar Cita"
        description="Programa citas para los clientes"
        actions={
          <Link to="/schedule">
            <ActionButton icon={FiPlus}>Programar</ActionButton>
          </Link>
        }
      />
      <InfoCard
        title="Gestionar Servicios"
        description="Administra los servicios disponibles"
        actions={
          <Link to="/services">
            <ActionButton variant="outline" icon={FiEdit}>
              Servicios
            </ActionButton>
          </Link>
        }
      />
      <InfoCard
        title="Empleados"
        description="Gestiona tu equipo de trabajo"
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
          columns={appointmentColumns}
          data={appointments.slice(0, 10)}
        />
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

// Componente Principal y Lógica de Renderizado
const Dashboard = () => {
  const { user } = useAuth();
  const { appointments, services } = useApp();

  useEffect(() => {
    if (user) {
      console.log("Objeto de usuario en el Dashboard:", user);
      console.log("Rol del usuario:", user.role);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title="Cargando..."
          description="Preparando tu panel de control..."
        />
      </div>
    );
  }

  const today = new Date().toDateString();
  const thisMonth = new Date().getMonth();

  const getFilteredAppointments = () => {
    if (user.role === "client") {
      return appointments.filter((apt) => apt.clientId === user.id);
    }
    if (user.role === "employee") {
      return appointments.filter((apt) => apt.employeeId === user.id);
    }
    return appointments;
  };

  const relevantAppointments = getFilteredAppointments();
  const todayAppointments = relevantAppointments.filter(
    (apt) => new Date(apt.date).toDateString() === today,
  );
  const monthlyAppointments = relevantAppointments.filter(
    (apt) => new Date(apt.date).getMonth() === thisMonth,
  );
  const completedAppointments = relevantAppointments.filter(
    (apt) => apt.status === "completed",
  );
  const appointmentColumns = [
    /* ... tu definición de columnas ... */
  ];

  const getRoleLabel = (role) => {
    const roles = {
      client: "Cliente",
      employee: "Empleado",
      administrator: "Administrador",
      superuser: "Super Usuario",
    };
    return roles[role] || "Usuario Desconocido";
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

  const renderDashboardByRole = () => {
    const props = {
      user,
      appointments,
      services,
      appointmentColumns,
      todayAppointments,
      monthlyAppointments,
      completedAppointments,
      userAppointments: relevantAppointments,
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
        return (
          <EmptyState
            title="Rol Desconocido"
            description={`Rol recibido: '${user.role}'. No se puede mostrar un panel.`}
          />
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={`¡Bienvenido, ${user.name}!`}
        description={getHeaderDescription()}
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }]}
      />
      {renderDashboardByRole()}
    </div>
  );
};

export default Dashboard;
