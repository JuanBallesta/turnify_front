import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// API Services
import { getOfferings } from "@/services/OfferingService";
import { getAllBusinessesForSelect } from "@/services/BusinessService";
import { createAppointment } from "@/services/AppointmentService";

// UI Components
import { PageHeader } from "@/components/ui/page-header";
import { ServiceBookingFilters } from "@/components/ui/ServiceBookingFilters";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { BookingDateTimePicker } from "@/components/ui/BookingDateTimePicker";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
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

// Icons
import {
  FiSearch,
  FiGrid,
  FiList,
  FiCheck,
  FiArrowLeft,
  FiClock,
  FiDollarSign,
  FiUser,
} from "react-icons/fi";

const INITIAL_FILTERS = {
  search: "",
  businessId: "all",
  category: "all",
  priceRange: [0, 50000],
  durationRange: [0, 240],
};

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [viewMode, setViewMode] = useState("grid");
  const [error, setError] = useState("");

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingStep, setBookingStep] = useState("datetime");
  const [bookingData, setBookingData] = useState(null);
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([getOfferings(), getAllBusinessesForSelect()])
      .then(([servicesData, businessesData]) => {
        setServices(servicesData);
        setBusinesses(businessesData);
        const maxPrice =
          servicesData.length > 0
            ? Math.max(...servicesData.map((s) => Number(s.price)))
            : 50000;
        const maxDuration =
          servicesData.length > 0
            ? Math.max(...servicesData.map((s) => Number(s.durationMinutes)))
            : 240;
        setFilters({
          ...INITIAL_FILTERS,
          priceRange: [0, Math.ceil(maxPrice / 1000) * 1000],
          durationRange: [0, Math.ceil(maxDuration / 15) * 15],
        });
      })
      .catch(() => setError("No se pudieron cargar los datos iniciales."))
      .finally(() => setIsLoading(false));
  }, []);

  const handleFilterChange = (filterName, value) => {
    if (filterName === "clearAll") {
      const maxPrice =
        services.length > 0
          ? Math.max(...services.map((s) => Number(s.price)))
          : 50000;
      const maxDuration =
        services.length > 0
          ? Math.max(...services.map((s) => Number(s.durationMinutes)))
          : 240;
      setFilters({
        ...INITIAL_FILTERS,
        priceRange: [0, Math.ceil(maxPrice / 1000) * 1000],
        durationRange: [0, Math.ceil(maxDuration / 15) * 15],
      });
    } else {
      setFilters((prev) => ({ ...prev, [filterName]: value }));
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const { search, businessId, category, priceRange, durationRange } =
        filters;
      return (
        (service.name?.toLowerCase() || "").includes(search.toLowerCase()) &&
        (businessId === "all" ||
          service.businessId?.toString() === businessId) &&
        (category === "all" || service.category === category) &&
        Number(service.price) >= priceRange[0] &&
        Number(service.price) <= priceRange[1] &&
        service.durationMinutes >= durationRange[0] &&
        service.durationMinutes <= durationRange[1]
      );
    });
  }, [services, filters]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setBookingStep("datetime");
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!bookingData || !selectedService) return;
    setIsConfirming(true);
    setError("");
    try {
      const { date, time, employeeId } = bookingData;
      const serviceDuration = selectedService.durationMinutes;
      const [hours, minutes] = time.split(":");
      const startTime = new Date(date);
      startTime.setHours(hours, minutes, 0, 0);
      const endTime = new Date(startTime.getTime() + serviceDuration * 60000);

      const appointmentData = {
        employeeId,
        offeringId: selectedService.id,
        startTime,
        endTime,
        notes: appointmentNotes,
      };
      await createAppointment(appointmentData);
      setBookingStep("success");
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          "Error al crear la cita. El horario puede haber sido ocupado.",
      );
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCloseModal = () => {
    setShowBookingModal(false);
    setTimeout(() => {
      setSelectedService(null);
      setBookingData(null);
      setBookingStep("datetime");
      setAppointmentNotes("");
      setError("");
    }, 300);
  };

  const renderModalContent = () => {
    const selectedBusiness = businesses.find(
      (b) => b.id === selectedService?.businessId,
    );

    switch (bookingStep) {
      case "datetime":
        return (
          <>
            <div className="p-1">
              <BookingDateTimePicker
                service={selectedService}
                onSelectionChange={setBookingData}
              />
            </div>
            <DialogFooter className="pt-4 border-t">
              <Button variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button
                onClick={() => setBookingStep("confirmation")}
                disabled={!bookingData}
              >
                Continuar
              </Button>
            </DialogFooter>
          </>
        );
      case "confirmation":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Servicio:</span>
                  <span className="font-semibold">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">
                    Especialista:
                  </span>
                  <span className="font-semibold">
                    {bookingData?.employeeName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">
                    Fecha y Hora:
                  </span>
                  <span className="font-semibold">
                    {new Date(bookingData?.date).toLocaleDateString("es-ES", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                    , {bookingData?.time}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3 mt-3">
                  <span className="font-semibold text-lg">Total:</span>
                  <span className="font-semibold text-xl">
                    ${Number(selectedService?.price).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                <Textarea
                  id="notes"
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  rows={3}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setBookingStep("datetime")}
              >
                <FiArrowLeft className="mr-2" />
                Volver
              </Button>
              <Button onClick={handleConfirmBooking} disabled={isConfirming}>
                {isConfirming ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Confirmando...
                  </>
                ) : (
                  <>
                    <FiCheck className="mr-2" />
                    Confirmar Reserva
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        );
      case "success":
        return (
          <div className="text-center space-y-6 py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <FiCheck className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">¡Cita Confirmada!</h3>
              <p className="text-gray-600">Tu reserva ha sido un éxito.</p>
            </div>
            <DialogFooter className="justify-center pt-4">
              <Button variant="outline" onClick={handleCloseModal}>
                Reservar Otra Cita
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
      <>
        <div className="p-8 text-center">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  if (error)
    return (
      <>
        <div className="p-8 text-center text-red-500">{error}</div>
      </>
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
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <FiGrid />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <FiList />
                </Button>
              </div>
            </div>
            {filteredServices.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                    : "space-y-4"
                }
              >
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    business={businesses.find(
                      (b) => b.id === service.businessId,
                    )}
                    onBookService={handleServiceSelect}
                  />
                ))}
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

      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {bookingStep === "success"
                ? "Reserva Exitosa"
                : `Reservar: ${selectedService?.name}`}
            </DialogTitle>
            {bookingStep !== "success" && (
              <DialogDescription>
                Completa los pasos para confirmar tu reserva
              </DialogDescription>
            )}
          </DialogHeader>
          {renderModalContent()}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookAppointment;
