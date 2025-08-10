import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { BookingDateTimePicker } from "@/components/ui/BookingDateTimePicker";

export const DateTimeSelectionModal = ({
  open,
  onOpenChange,
  service,
  business,
  onContinue,
  onSelectionChange,
  bookingData,
}) => {
  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Reservar: {service.name}</DialogTitle>
          <DialogDescription>
            Selecciona una fecha, profesional y horario para tu cita en{" "}
            {business?.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <BookingDateTimePicker
            service={service}
            onSelectionChange={onSelectionChange}
          />
        </div>
        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onContinue} disabled={!bookingData}>
            Continuar a Confirmación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
