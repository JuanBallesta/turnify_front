import React from "react";
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
import { ActionButton } from "@/components/ui/action-button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FiArrowLeft, FiCheck, FiUser, FiScissors } from "react-icons/fi";

export const ConfirmationModal = ({
  open,
  onOpenChange,
  service,
  bookingData,
  onConfirm,
  onBack,
  isConfirming,
  error,
  notes,
  setNotes,
}) => {
  if (!service || !bookingData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Confirmar tu Cita
          </DialogTitle>
          <DialogDescription className="text-center">
            Un último vistazo antes de confirmar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="p-4 border rounded-lg space-y-4 bg-gray-50">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Servicio:</span>
              <span className="font-semibold">{service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Especialista:</span>
              <span className="font-semibold">{bookingData.employeeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Fecha y Hora:</span>
              <span className="font-semibold">
                {new Date(bookingData.date).toLocaleDateString("es-ES", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
                , {bookingData.time}
              </span>
            </div>
            <div className="flex justify-between border-t pt-3 mt-3">
              <span className="font-semibold text-lg">Total:</span>
              <span className="font-semibold text-xl">
                ${Number(service.price).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Indica aquí cualquier preferencia o alergia..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            <FiArrowLeft className="mr-2" />
            Volver
          </Button>
          <ActionButton
            onClick={() => onConfirm()}
            isLoading={isConfirming}
            loadingText="Confirmando..."
          >
            <FiCheck className="mr-2" /> Confirmar Reserva
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
