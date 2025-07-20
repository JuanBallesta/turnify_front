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
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { SuccessModal } from "@/components/modals/SuccessModal";

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

  const [currentModal, setCurrentModal] = useState(null); // 'datetime', 'confirmation', 'success'
  const [selectedService, setSelectedService] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([getOfferings(), getAllBusinessesForSelect()])
      .then(([servicesData, businessesData]) => {
        setServices(servicesData);
        setBusinesses(businessesData);
      })
      .catch(() => setError("No se pudieron cargar los datos."))
      .finally(() => setIsLoading(false));
  }, []);

  // --- FUNCIÓN DE FILTROS AÑADIDA ---
  const handleFilterChange = (filterName, value) => {
    if (filterName === "clearAll") {
      setFilters(INITIAL_FILTERS);
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
    setCurrentModal("datetime");
  };

  const handleDateTimeComplete = (data) => {
    setBookingData(data);
    setCurrentModal("confirmation");
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
      setCurrentModal("success");
    } catch (err) {
      setError(err.response?.data?.msg || "Error al crear la cita.");
    } finally {
      setIsConfirming(false);
    }
  };

  const resetFlow = () => {
    setCurrentModal(null);
    setSelectedService(null);
    setBookingData(null);
    setAppointmentNotes("");
    setError("");
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

      {selectedService && (
        <>
          <Dialog
            open={currentModal === "datetime"}
            onOpenChange={(isOpen) => !isOpen && resetFlow()}
          >
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Reservar: {selectedService.name}</DialogTitle>
                <DialogDescription>
                  Selecciona un profesional, fecha y hora para tu cita.
                </DialogDescription>
              </DialogHeader>
              <BookingDateTimePicker
                service={selectedService}
                onSelectionComplete={handleDateTimeComplete}
              />
            </DialogContent>
          </Dialog>

          <ConfirmationModal
            open={currentModal === "confirmation"}
            onOpenChange={(isOpen) => !isOpen && resetFlow()}
            service={selectedService}
            bookingData={bookingData}
            onConfirm={() => handleConfirmBooking(appointmentNotes)}
            onBack={() => setCurrentModal("datetime")}
            isConfirming={isConfirming}
            error={error}
            notes={appointmentNotes}
            setNotes={setAppointmentNotes}
          />

          <SuccessModal
            open={currentModal === "success"}
            onOpenChange={(isOpen) => !isOpen && resetFlow()}
            onBookAnother={resetFlow}
            onGoToAppointments={() => navigate("/appointments")}
          />
        </>
      )}
    </>
  );
};

export default BookAppointment;
