import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";

// UI Components
import { PageHeader } from "@/components/ui/page-header";
import { ServiceBookingFilters } from "@/components/ui/service-booking-filters";
import { ServiceCard } from "@/components/ui/service-card";
import { BookingDateTimePicker } from "@/components/ui/booking-datetime-picker";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  FiCalendar,
  FiSearch,
  FiGrid,
  FiList,
  FiCheck,
  FiArrowLeft,
  FiClock,
  FiDollarSign,
  FiUser,
  FiMapPin,
} from "react-icons/fi";

const BookAppointment = () => {
  const { user } = useAuth();
  const {
    services,
    businesses,
    employees,
    createAppointment,
    getAvailableSlots,
  } = useApp();
  const navigate = useNavigate();

  // Estados
  const [filteredServices, setFilteredServices] = useState(services);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' o 'list'
  const [isLoading, setIsLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState("selection"); // 'selection', 'datetime', 'confirmation'
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Aplicar filtros
  const applyFilters = (filters) => {
    let filtered = [...services];

    // Filtro por búsqueda de texto
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm) ||
          service.description.toLowerCase().includes(searchTerm) ||
          service.category.toLowerCase().includes(searchTerm) ||
          service.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
      );
    }

    // Filtro por negocio
    if (filters.businessId && filters.businessId !== "all") {
      filtered = filtered.filter(
        (service) => service.businessId === filters.businessId,
      );
    }

    // Filtro por categoría
    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter(
        (service) => service.category === filters.category,
      );
    }

    // Filtro por rango de precio
    if (filters.priceRange) {
      filtered = filtered.filter(
        (service) =>
          service.price >= filters.priceRange[0] &&
          service.price <= filters.priceRange[1],
      );
    }

    // Filtro por duración
    if (filters.durationRange) {
      filtered = filtered.filter(
        (service) =>
          service.duration >= filters.durationRange[0] &&
          service.duration <= filters.durationRange[1],
      );
    }

    // Filtro por calificación mínima
    if (filters.minRating) {
      filtered = filtered.filter(
        (service) => service.rating >= filters.minRating,
      );
    }

    // Filtro por tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((service) =>
        filters.tags.some((tag) => service.tags.includes(tag)),
      );
    }

    setFilteredServices(filtered);
  };

  // Manejar selección de servicio
  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setBookingStep("datetime");
    setShowBookingModal(true);
  };

  // Manejar selección de fecha y hora
  const handleDateTimeSelect = (selection) => {
    setBookingData(selection);
  };

  // Continuar a confirmación
  const handleContinueToConfirmation = () => {
    if (bookingData) {
      setBookingStep("confirmation");
    }
  };

  // Confirmar reserva
  const handleConfirmBooking = async () => {
    if (!bookingData || !selectedService) return;

    setIsLoading(true);
    try {
      const appointmentData = {
        ...bookingData,
        notes: appointmentNotes,
      };

      await createAppointment(appointmentData);
      setBookingSuccess(true);
      setBookingStep("success");
    } catch (error) {
      console.error("Error al crear la cita:", error);
      // Aquí podrías mostrar un toast de error
    } finally {
      setIsLoading(false);
    }
  };

  // Cerrar modal y resetear
  const handleCloseModal = () => {
    setShowBookingModal(false);
    setSelectedService(null);
    setBookingData(null);
    setBookingStep("selection");
    setAppointmentNotes("");
    setBookingSuccess(false);
  };

  // Ir a mis citas
  const goToAppointments = () => {
    navigate("/appointments");
  };

  // Renderizar contenido del modal según el paso
  const renderModalContent = () => {
    const selectedBusiness = businesses.find(
      (b) => b.id === selectedService?.businessId,
    );
    const serviceEmployees = employees.filter(
      (emp) => emp.businessId === selectedService?.businessId,
    );

    switch (bookingStep) {
      case "datetime":
        return (
          <div className="space-y-6">
            <div className="text-center border-b pb-4">
              <h3 className="text-lg font-semibold">{selectedService?.name}</h3>
              <p className="text-gray-600">{selectedBusiness?.name}</p>
              <div className="flex items-center justify-center space-x-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <FiClock className="w-4 h-4" />
                  <span>{selectedService?.duration} min</span>
                </span>
                <span className="flex items-center space-x-1">
                  <FiDollarSign className="w-4 h-4" />
                  <span>${selectedService?.price}</span>
                </span>
              </div>
            </div>

            <BookingDateTimePicker
              service={selectedService}
              business={selectedBusiness}
              employees={serviceEmployees}
              onSelectionChange={handleDateTimeSelect}
              getAvailableSlots={getAvailableSlots}
            />

            <div className="flex space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleContinueToConfirmation}
                disabled={!bookingData}
                className="flex-1"
              >
                Continuar
              </Button>
            </div>
          </div>
        );

      case "confirmation":
        return (
          <div className="space-y-6">
            <div className="text-center border-b pb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Confirmar Reserva
              </h3>
              <p className="text-gray-600">Revisa los detalles de tu cita</p>
            </div>

            {/* Resumen de la reserva */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Servicio:</span>
                  <span>{selectedService?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Negocio:</span>
                  <span>{selectedBusiness?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Especialista:</span>
                  <span>{bookingData?.employeeName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Fecha:</span>
                  <span>
                    {new Date(bookingData?.date).toLocaleDateString("es-ES")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Hora:</span>
                  <span>{bookingData?.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Duración:</span>
                  <span>{selectedService?.duration} minutos</span>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold text-lg">
                    ${selectedService?.price}
                  </span>
                </div>
              </div>

              {/* Notas adicionales */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Escribe aquí cualquier comentario o solicitud especial..."
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setBookingStep("datetime")}
                className="flex-1"
              >
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button
                onClick={handleConfirmBooking}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Confirmando...
                  </>
                ) : (
                  <>
                    <FiCheck className="w-4 h-4 mr-2" />
                    Confirmar Reserva
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="text-center space-y-6 py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <FiCheck className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ¡Cita Confirmada!
              </h3>
              <p className="text-gray-600">
                Tu cita ha sido reservada exitosamente. Recibirás un
                recordatorio antes de la fecha.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 text-sm">
              <p className="font-medium text-green-900">Detalles de la cita:</p>
              <p className="text-green-700 mt-1">
                {selectedService?.name} -{" "}
                {new Date(bookingData?.date).toLocaleDateString("es-ES")} a las{" "}
                {bookingData?.time}
              </p>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleCloseModal}>
                Reservar Otra Cita
              </Button>
              <Button onClick={goToAppointments}>Ver Mis Citas</Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Reservar Cita"
        description="Encuentra y reserva el servicio de belleza perfecto para ti"
        breadcrumbs={[{ label: "Reservar", href: "/book" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filtros - Columna izquierda */}
        <div className="lg:col-span-1">
          <ServiceBookingFilters
            businesses={businesses}
            onFiltersChange={applyFilters}
          />
        </div>

        {/* Servicios - Columna principal */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header de resultados */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Servicios Disponibles
              </h2>
              <p className="text-gray-600">
                {filteredServices.length} servicio(s) encontrado(s)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <FiGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <FiList className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Lista de servicios */}
          {filteredServices.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {filteredServices.map((service) => {
                const business = businesses.find(
                  (b) => b.id === service.businessId,
                );
                return (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    business={business}
                    employees={employees}
                    onBookService={handleServiceSelect}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={FiSearch}
              title="No se encontraron servicios"
              description="Prueba ajustando los filtros para encontrar más opciones disponibles."
            />
          )}
        </div>
      </div>

      {/* Modal de reserva */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {bookingStep === "success" ? "Reserva Exitosa" : "Reservar Cita"}
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
    </div>
  );
};

export default BookAppointment;
