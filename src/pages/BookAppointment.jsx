import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// API Services
import { getOfferings } from "@/services/OfferingService";
import { getAllBusinessesForSelect } from "@/services/BusinessService";
import { createAppointment } from "@/services/AppointmentService";
import {
  searchUsers,
  createGuestUser,
  findUserByEmail,
} from "@/services/UserService";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Icons
import { FiSearch, FiGrid, FiList, FiCheck, FiArrowLeft } from "react-icons/fi";

const INITIAL_FILTERS = {
  search: "",
  businessId: "all",
  category: "all",
  priceRange: [0, 50000],
  durationRange: [0, 240],
};

const ClientSelectionStep = ({ onClientSelect }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestData, setGuestData] = useState({
    name: "",
    lastName: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchUsers(searchQuery)
        .then((data) => setSearchResults(Array.isArray(data) ? data : []))
        .catch((error) => {
          console.error("Error buscando clientes:", error);
          setSearchResults([]);
        });
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleCreateGuest = async () => {
    if (!guestData.name || !guestData.lastName || !guestData.phone)
      return alert("Nombre, apellido y teléfono son requeridos.");
    try {
      const newGuest = await createGuestUser(guestData);
      onClientSelect(newGuest);
    } catch (err) {
      alert("Error al crear invitado.");
    }
  };

  const handleSelectMyself = async () => {
    try {
      const clientProfile = await findUserByEmail(user.email);
      onClientSelect(clientProfile);
    } catch (err) {
      alert(
        "No se encontró tu perfil de cliente. Puedes crear uno como invitado.",
      );
      setShowGuestForm(true);
      setGuestData({
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || "",
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Paso 1: ¿Para quién es la cita?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full" onClick={handleSelectMyself}>
          Agendar para Mí Mismo
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">O</span>
          </div>
        </div>
        <Input
          placeholder="Buscar otro cliente por nombre o email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchResults.length > 0 && (
          <div className="space-y-2 border-t pt-4">
            {searchResults.map((client) => (
              <Button
                key={client.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => onClientSelect(client)}
              >
                {client.name} {client.lastName}
              </Button>
            ))}
          </div>
        )}
        <Button variant="link" onClick={() => setShowGuestForm(!showGuestForm)}>
          {showGuestForm ? "Ocultar formulario" : "O agendar para un invitado"}
        </Button>
        {showGuestForm && (
          <div className="p-4 border rounded-md space-y-4 bg-slate-50 dark:bg-slate-800/50">
            <Input
              placeholder="Nombre *"
              value={guestData.name}
              onChange={(e) =>
                setGuestData((d) => ({ ...d, name: e.target.value }))
              }
            />
            <Input
              placeholder="Apellido *"
              value={guestData.lastName}
              onChange={(e) =>
                setGuestData((d) => ({ ...d, lastName: e.target.value }))
              }
            />
            <Input
              placeholder="Teléfono *"
              value={guestData.phone}
              onChange={(e) =>
                setGuestData((d) => ({ ...d, phone: e.target.value }))
              }
            />
            <Input
              type="email"
              placeholder="Email (opcional)"
              value={guestData.email}
              onChange={(e) =>
                setGuestData((d) => ({ ...d, email: e.target.value }))
              }
            />
            <Button onClick={handleCreateGuest}>Crear y Continuar</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allServices, setAllServices] = useState([]);
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [viewMode, setViewMode] = useState("grid");
  const [step, setStep] = useState(0);
  const [appointmentClient, setAppointmentClient] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingStep, setBookingStep] = useState("datetime");
  const [bookingData, setBookingData] = useState(null);
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const isStaff = user?.role !== "client";
  const isAdmin = user?.role === "administrator";
  const isEmployee = isStaff && !isAdmin;

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [servicesData, businessesData] = await Promise.all([
          getOfferings("booking"),
          getAllBusinessesForSelect(),
        ]);
        setAllServices(servicesData);
        setAllBusinesses(businessesData);
      } catch (e) {
        console.error("Error al cargar los datos:", e);
        setError("No se pudieron cargar los datos.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    if (!allServices.length) return;
    const userBusinessId = user.businessId?.toString();
    const isBookingForSelf =
      !appointmentClient ||
      appointmentClient.email?.toLowerCase() === user.email?.toLowerCase();
    if (isEmployee) {
      setServices(
        allServices.filter((s) => s.businessId?.toString() === userBusinessId),
      );
      setFilters((prev) => ({ ...prev, businessId: userBusinessId }));
      return;
    }
    if (isAdmin) {
      if (isBookingForSelf) {
        setServices(allServices);
        setFilters((prev) => ({ ...prev, businessId: "all" }));
      } else {
        setServices(
          allServices.filter(
            (s) => s.businessId?.toString() === userBusinessId,
          ),
        );
        setFilters((prev) => ({ ...prev, businessId: userBusinessId }));
      }
      return;
    }
    if (!isStaff) {
      setServices(allServices);
      setFilters((prev) => ({ ...prev, businessId: "all" }));
    }
  }, [allServices, user, isStaff, isAdmin, isEmployee, appointmentClient]);

  useEffect(() => {
    if (isStaff) {
      setStep(0);
    } else {
      setStep(1);
      setAppointmentClient(user);
    }
  }, [isStaff, user]);

  const handleFilterChange = (filterName, value) => {
    if (filterName === "clearAll") {
      const newFilters = { ...INITIAL_FILTERS };
      const isBookingForOtherClient =
        appointmentClient &&
        appointmentClient.email?.toLowerCase() !== user.email?.toLowerCase();
      if (isEmployee || (isAdmin && isBookingForOtherClient)) {
        newFilters.businessId = user.businessId.toString();
      }
      setFilters(newFilters);
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
  const handleSelectClient = (client) => {
    setAppointmentClient(client);
    setStep(1);
  };
  const resetFlow = () => {
    setAppointmentClient(null);
    if (isStaff) {
      setStep(0);
    }
    setSelectedService(null);
    setBookingData(null);
    setAppointmentNotes("");
    setError("");
    setShowBookingModal(false);
  };
  const handleSelectService = (service) => {
    if (!appointmentClient) {
      alert("Error: Por favor, selecciona un cliente primero.");
      resetFlow();
      return;
    }
    setSelectedService(service);
    setBookingStep("datetime");
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!bookingData || !selectedService || !appointmentClient) return;
    setIsConfirming(true);
    setError("");
    try {
      const { date, time, employeeId } = bookingData;

      // --- INICIO DE LA CORRECCIÓN ---
      // 1. Tomamos el objeto Date que nos da el date-picker.
      // 2. Separamos la hora y los minutos del string 'time'.
      // 3. Los establecemos en nuestro objeto Date.
      const [hours, minutes] = time.split(":").map(Number);
      const startTime = new Date(date);
      startTime.setHours(hours, minutes, 0, 0); // Seteamos hora, minutos, segundos y milisegundos

      // Verificamos si la fecha resultante es válida.
      if (isNaN(startTime.getTime())) {
        throw new Error("La fecha u hora seleccionada no es válida.");
      }

      const endTime = new Date(
        startTime.getTime() + selectedService.durationMinutes * 60000,
      );
      // --- FIN DE LA CORRECCIÓN ---

      const appointmentData = {
        userId: appointmentClient.id,
        employeeId,
        offeringId: selectedService.id,
        startTime,
        endTime,
        notes: appointmentNotes,
      };

      await createAppointment(appointmentData);
      setBookingStep("success");
    } catch (err) {
      console.error("Error al confirmar la reserva:", err);
      setError(
        err.message || err.response?.data?.msg || "Error al crear la cita.",
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
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">
                    Servicio:
                  </span>
                  <span className="font-semibold">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">
                    Especialista:
                  </span>
                  <span className="font-semibold">
                    {bookingData?.employeeName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">
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
              <p className="text-muted-foreground">
                La reserva ha sido un éxito.
              </p>
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
      <div className="p-8 text-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  if (error && !allServices.length)
    return <div className="p-8 text-center text-red-500">{error}</div>;

  const isBookingForOtherClient =
    appointmentClient &&
    appointmentClient.email?.toLowerCase() !== user.email?.toLowerCase();
  const isBusinessFilterLocked =
    isEmployee || (isAdmin && isBookingForOtherClient);

  return (
    <>
      <div className="p-4 sm:p-6 space-y-6">
        <PageHeader title={isStaff ? "Programar Cita" : "Reservar Cita"} />
        {isStaff && appointmentClient && (
          <Alert>
            <AlertDescription className="flex items-center justify-between">
              <span>
                Agendando para:{" "}
                <span className="font-semibold">
                  {appointmentClient.name} {appointmentClient.lastName}
                </span>
                .
              </span>
              <Button
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={resetFlow}
              >
                Cambiar Cliente
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {step === 0 && isStaff && (
          <ClientSelectionStep onClientSelect={handleSelectClient} />
        )}
        {step >= 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <ServiceBookingFilters
                businesses={allBusinesses}
                services={services}
                filters={filters}
                onFilterChange={handleFilterChange}
                isLocked={isBusinessFilterLocked}
              />
            </div>
            <div className="lg:col-span-3 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Paso {isStaff ? "2" : "1"}: Elige un Servicio
                </h2>
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
                      business={allBusinesses.find(
                        (b) => b.id === service.businessId,
                      )}
                      onBookService={handleSelectService}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={FiSearch}
                  title="No se encontraron servicios"
                  description="Prueba cambiando los filtros o la selección."
                />
              )}
            </div>
          </div>
        )}
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
                Completa los pasos para confirmar tu reserva para{" "}
                <span className="font-medium">
                  {appointmentClient?.name} {appointmentClient?.lastName}
                </span>
                .
              </DialogDescription>
            )}
          </DialogHeader>
          {selectedService && renderModalContent()}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookAppointment;
