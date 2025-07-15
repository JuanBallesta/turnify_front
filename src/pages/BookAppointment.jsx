import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// API Services
import { getOfferings } from "@/services/OfferingService";
import { getAllBusinessesForSelect } from "@/services/BusinessService";
import { getAvailability } from "@/services/AvailabilityService";
import { createAppointment } from "@/services/AppointmentService";
import { getOfferingWithEmployees } from "@/services/AssignmentService";

// UI Components
import Layout from "@/components/Layout";
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { ServiceBookingFilters } from "@/components/ui/ServiceBookingFilters";
import { ActionButton } from "@/components/ui/action-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Icons
import {
  FiClock,
  FiDollarSign,
  FiUser,
  FiCheck,
  FiArrowLeft,
  FiScissors,
  FiSearch,
  FiGrid,
  FiList,
} from "react-icons/fi";

const INITIAL_FILTERS = {
  search: "",
  businessId: "all",
  category: "all",
  priceRange: [0, 50000],
};

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [employeesForService, setEmployeesForService] = useState([]);

  const [step, setStep] = useState("selection"); // 'selection', 'datetime', 'confirmation', 'success'
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("any");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [appointmentNotes, setAppointmentNotes] = useState("");

  useEffect(() => {
    setIsLoading(true);
    Promise.all([getOfferings(), getAllBusinessesForSelect()])
      .then(([servicesData, businessesData]) => {
        setServices(servicesData);
        setBusinesses(businessesData);
      })
      .catch(() => setError("No se pudieron cargar los servicios."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (showBookingModal && selectedService && selectedDate) {
      setIsLoadingAvailability(true);
      setAvailability([]);
      setSelectedTimeSlot(null);
      const dateString = selectedDate.toISOString().split("T")[0];
      getAvailability(selectedService.id, dateString, selectedEmployeeId)
        .then(setAvailability)
        .catch(() => alert("No se pudo cargar la disponibilidad."))
        .finally(() => setIsLoadingAvailability(false));
    }
  }, [showBookingModal, selectedService, selectedDate, selectedEmployeeId]);

  const handleFilterChange = (filterName, value) => {
    if (filterName === "clearAll") {
      const maxPrice =
        services.length > 0
          ? Math.max(...services.map((s) => Number(s.price)))
          : 50000;
      setFilters({
        ...INITIAL_FILTERS,
        priceRange: [0, Math.ceil(maxPrice / 1000) * 1000],
      });
    } else {
      setFilters((prev) => ({ ...prev, [filterName]: value }));
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const { search, businessId, category, priceRange } = filters;
      return (
        (service.name?.toLowerCase() || "").includes(search.toLowerCase()) &&
        (businessId === "all" ||
          service.businessId?.toString() === businessId) &&
        (category === "all" || service.category === category) &&
        Number(service.price) >= priceRange[0] &&
        Number(service.price) <= priceRange[1]
      );
    });
  }, [services, filters]);

  const handleServiceSelect = async (service) => {
    setSelectedService(service);
    setSelectedEmployeeId("any");
    try {
      const serviceDetails = await getOfferingWithEmployees(service.id);
      setEmployeesForService(serviceDetails.employees || []);
    } catch {
      setEmployeesForService([]);
    }
    setStep("datetime");
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTimeSlot) return;
    setIsConfirming(true);
    setError("");
    try {
      const serviceDuration = selectedService.durationMinutes;
      const [hours, minutes] = selectedTimeSlot.time.split(":");
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);
      const endTime = new Date(startTime.getTime() + serviceDuration * 60000);

      const appointmentData = {
        employeeId: selectedTimeSlot.employeeId,
        offeringId: selectedService.id,
        startTime,
        endTime,
        notes: appointmentNotes,
      };
      await createAppointment(appointmentData);
      setStep("success");
    } catch (err) {
      setError(err.response?.data?.msg || "Error al crear la cita.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCloseModal = () => {
    setShowBookingModal(false);
    setTimeout(() => {
      // Delay para que la animación de cierre termine
      setStep("selection");
      setSelectedService(null);
      setSelectedTimeSlot(null);
      setAppointmentNotes("");
      setError("");
    }, 300);
  };

  const renderModalContent = () => {
    switch (step) {
      case "datetime":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>1. Elige una Fecha</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) =>
                    date <
                    new Date(new Date().setDate(new Date().getDate() - 1))
                  }
                  className="p-0 mt-2"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <Label>2. Elige un Profesional</Label>
                  <Select
                    value={selectedEmployeeId}
                    onValueChange={setSelectedEmployeeId}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Cualquier Profesional</SelectItem>
                      {employeesForService.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.name} {emp.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>3. Elige un Horario</Label>
                  {isLoadingAvailability ? (
                    <div className="text-center p-4">
                      <LoadingSpinner />
                    </div>
                  ) : availability.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pt-2">
                      {availability.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={
                            selectedTimeSlot?.time === slot.time
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setSelectedTimeSlot(slot)}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-gray-500 py-4">
                      No hay horarios.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button
                onClick={() => setStep("confirmation")}
                disabled={!selectedTimeSlot}
              >
                Continuar
              </Button>
            </DialogFooter>
          </div>
        );
      case "confirmation":
        return (
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="p-4 border rounded-lg space-y-3">
              {/* ... Resumen de la reserva ... */}
            </div>
            <div>
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                id="notes"
                value={appointmentNotes}
                onChange={(e) => setAppointmentNotes(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("datetime")}>
                <FiArrowLeft className="mr-2" />
                Volver
              </Button>
              <ActionButton
                onClick={handleConfirmBooking}
                isLoading={isConfirming}
                loadingText="Confirmando..."
              >
                Confirmar Reserva
              </ActionButton>
            </DialogFooter>
          </div>
        );
      case "success":
        return (
          <div className="text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <FiCheck className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">¡Cita Confirmada!</h3>
            <p className="text-gray-600">Tu cita ha sido agendada con éxito.</p>
            <DialogFooter className="justify-center pt-4">
              <Button variant="outline" onClick={handleCloseModal}>
                Reservar otra cita
              </Button>
              <Button onClick={() => navigate("/appointments")}>
                Ver Mis Citas
              </Button>
            </DialogFooter>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading)
    return (
      <Layout>
        <div className="text-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );

  return (
    <>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Reservar Cita"
          description="Encuentra y reserva el servicio perfecto para ti"
        />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <ServiceBookingFilters
              businesses={businesses}
              services={services}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Servicios Disponibles</h2>
              <p className="text-sm text-gray-500">
                {filteredServices.length} resultado(s)
              </p>
            </div>
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredServices.map((service) => {
                  const business = businesses.find(
                    (b) => b.id === service.businessId,
                  );
                  return (
                    <Card key={service.id} className="flex flex-col">
                      <CardHeader>
                        <CardTitle>{service.name}</CardTitle>
                        <p className="text-sm text-violet-600 font-semibold">
                          {business?.name}
                        </p>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <Badge variant="outline">{service.category}</Badge>
                        <p className="text-sm text-gray-600 mt-2">
                          {service.description}
                        </p>
                      </CardContent>
                      <div className="p-6 pt-0 mt-auto">
                        <div className="flex justify-between items-center pt-2 border-t text-sm">
                          <span className="flex items-center">
                            <FiClock className="inline mr-1.5" />
                            {service.durationMinutes} min
                          </span>
                          <span className="font-bold text-lg">
                            ${Number(service.price).toFixed(2)}
                          </span>
                        </div>
                        <Button
                          className="w-full mt-4"
                          onClick={() => handleServiceSelect(service)}
                        >
                          Reservar
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={FiSearch}
                title="No se encontraron servicios"
                description="Prueba cambiando los filtros."
              />
            )}
          </div>
        </div>
      </div>
      <Dialog open={showBookingModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedService?.name}</DialogTitle>
          </DialogHeader>
          {renderModalContent()}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookAppointment;
