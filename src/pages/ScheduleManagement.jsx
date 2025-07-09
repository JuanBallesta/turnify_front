import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { ActionButton } from "@/components/ui/action-button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Icons
import { FiPlus, FiTrash2, FiSave } from "react-icons/fi";

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

  // Cargar la lista de empleados que el usuario actual puede gestionar
  useEffect(() => {
    if (!user) return;

    if (canSelectEmployee) {
      const businessId = user.role === "administrator" ? user.businessId : null;
      getEmployees(businessId).then(setEmployees).catch(console.error);
    } else if (user.role === "employee") {
      // Si es un empleado, se auto-selecciona y no necesita la lista
      setSelectedEmployeeId(user.id.toString());
    }
  }, [user, canSelectEmployee]);

  // Cargar los horarios del empleado seleccionado
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
      setTimeout(() => setSuccessMessage(""), 3000); // Ocultar mensaje después de 3s
    } catch (error) {
      alert("Error al guardar los horarios.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
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

        {/* El selector de empleados solo se muestra si el usuario tiene permisos */}
        {canSelectEmployee && (
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Empleado</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedEmployeeId}
                onValueChange={setSelectedEmployeeId}
              >
                <SelectTrigger className="w-full md:w-1/3">
                  <SelectValue placeholder="Selecciona un empleado..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.name} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* La tarjeta de horarios se muestra si hay un empleado seleccionado */}
        {selectedEmployeeId ? (
          <Card>
            <CardHeader>
              <CardTitle>Horario Semanal</CardTitle>
              <CardDescription>
                {canSelectEmployee
                  ? `Horario para ${employees.find((e) => e.id.toString() === selectedEmployeeId)?.name || "..."}.`
                  : "Tu horario de trabajo."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <p>Cargando horario...</p>
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
                <Alert className="mt-4">
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
          // Mensaje para cuando un admin/superuser no ha seleccionado a nadie
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
