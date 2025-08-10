import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getEmployees } from "@/services/EmployeeService";
import { getSchedules, updateSchedules } from "@/services/ScheduleService";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { ActionButton } from "@/components/ui/action-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

// Icons
import { FiPlus, FiTrash2, FiSave } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const daysOfWeek = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

const ScheduleManagement = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const canSelectEmployee =
    user?.role === "superuser" || user?.role === "administrator";

  useEffect(() => {
    if (!user) return;
    if (canSelectEmployee) {
      const businessId = user.role === "administrator" ? user.businessId : null;
      getEmployees(businessId).then(setEmployees).catch(console.error);
    } else if (user.role === "employee") {
      setSelectedEmployeeId(user.id.toString());
    }
  }, [user, canSelectEmployee]);

  useEffect(() => {
    if (selectedEmployeeId) {
      setIsLoading(true);
      getSchedules(selectedEmployeeId)
        .then((data) => {
          const formattedSchedules = daysOfWeek.map((day) => {
            const daySchedules = data
              .filter((s) => s.dayOfWeek === day.value)
              .map((s) => ({
                startTime: s.startTime.slice(0, 5),
                endTime: s.endTime.slice(0, 5),
              }));
            return { day: day.value, label: day.label, shifts: daySchedules };
          });
          setSchedules(formattedSchedules);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setSchedules([]);
    }
  }, [selectedEmployeeId]);

  const handleAddTimeSlot = (dayIndex) => {
    const newSchedules = [...schedules];
    newSchedules[dayIndex].shifts.push({
      startTime: "09:00",
      endTime: "17:00",
    });
    setSchedules(newSchedules);
  };

  const handleRemoveTimeSlot = (dayIndex, shiftIndex) => {
    const newSchedules = [...schedules];
    newSchedules[dayIndex].shifts.splice(shiftIndex, 1);
    setSchedules(newSchedules);
  };

  const handleTimeChange = (dayIndex, shiftIndex, timeType, value) => {
    const newSchedules = [...schedules];
    newSchedules[dayIndex].shifts[shiftIndex][timeType] = value;
    setSchedules(newSchedules);
  };

  const handleSaveChanges = async () => {
    if (!selectedEmployeeId) return;
    setIsSaving(true);
    setSuccessMessage("");
    const schedulesToSave = schedules.flatMap((daySchedule) =>
      daySchedule.shifts.map((shift) => ({
        dayOfWeek: daySchedule.day,
        startTime: `${shift.startTime}:00`,
        endTime: `${shift.endTime}:00`,
      })),
    );
    try {
      await updateSchedules(selectedEmployeeId, schedulesToSave);
      setSuccessMessage("Horarios guardados exitosamente.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      alert("Error al guardar los horarios.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const n = name.trim().split(" ");
    if (n.length > 1) return `${n[0][0]}${n[n.length - 1][0]}`.toUpperCase();
    return n[0].substring(0, 2).toUpperCase();
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Gestión de Horarios"
          description={
            canSelectEmployee
              ? "Define la disponibilidad semanal de tus empleados."
              : "Revisa y ajusta tu disponibilidad semanal."
          }
        />

        {canSelectEmployee && (
          <Card>
            <CardHeader>
              <CardTitle>Paso 1: Seleccionar Empleado</CardTitle>
              <CardDescription>
                Elige un empleado para ver o editar su horario de trabajo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {employees.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {employees.map((emp) => {
                    const photoUrl = emp.photo
                      ? `${API_URL}${emp.photo}`
                      : undefined;
                    return (
                      <button
                        key={emp.id}
                        onClick={() => setSelectedEmployeeId(emp.id.toString())}
                        className={cn(
                          "p-4 border rounded-lg text-left flex items-center space-x-3 transition-all hover:shadow-md",
                          selectedEmployeeId === emp.id.toString()
                            ? "border-violet-500 bg-violet-50"
                            : "bg-white hover:border-gray-300",
                        )}
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={photoUrl} />
                          <AvatarFallback>
                            {getInitials(`${emp.name} ${emp.lastName}`)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {emp.name} {emp.lastName}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {emp.userType?.name}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No hay empleados para mostrar.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {selectedEmployeeId ? (
          <Card>
            <CardHeader>
              <CardTitle>Paso 2: Horario Semanal</CardTitle>
              <CardDescription>
                {canSelectEmployee
                  ? `Horario para ${employees.find((e) => e.id.toString() === selectedEmployeeId)?.name || "..."}.`
                  : "Tu horario de trabajo."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="text-center p-8">
                  <LoadingSpinner />
                </div>
              ) : (
                schedules.map((daySchedule, dayIndex) => (
                  <div
                    key={daySchedule.day}
                    className="p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">{daySchedule.label}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddTimeSlot(dayIndex)}
                      >
                        <FiPlus className="mr-2 h-4 w-4" /> Añadir Turno
                      </Button>
                    </div>
                    <div className="mt-2 space-y-2">
                      {daySchedule.shifts.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">
                          Día no laborable
                        </p>
                      ) : (
                        daySchedule.shifts.map((shift, shiftIndex) => (
                          <div
                            key={shiftIndex}
                            className="flex items-center space-x-2"
                          >
                            <Input
                              type="time"
                              value={shift.startTime}
                              onChange={(e) =>
                                handleTimeChange(
                                  dayIndex,
                                  shiftIndex,
                                  "startTime",
                                  e.target.value,
                                )
                              }
                            />
                            <span>-</span>
                            <Input
                              type="time"
                              value={shift.endTime}
                              onChange={(e) =>
                                handleTimeChange(
                                  dayIndex,
                                  shiftIndex,
                                  "endTime",
                                  e.target.value,
                                )
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() =>
                                handleRemoveTimeSlot(dayIndex, shiftIndex)
                              }
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
              {successMessage && (
                <Alert className="mt-4 font-bold text-green-600 bg-green-200">
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}
              <div className="flex justify-end pt-4">
                <ActionButton
                  onClick={handleSaveChanges}
                  isLoading={isSaving}
                  icon={FiSave}
                >
                  Guardar Cambios
                </ActionButton>
              </div>
            </CardContent>
          </Card>
        ) : (
          canSelectEmployee && (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                Por favor, selecciona un empleado para ver su horario.
              </CardContent>
            </Card>
          )
        )}
      </div>
    </>
  );
};

export default ScheduleManagement;
