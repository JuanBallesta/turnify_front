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
import {
  FiArrowLeft,
  FiCheck,
  FiUser,
  FiScissors,
  FiCalendar,
  FiClock,
  FiDollarSign,
} from "react-icons/fi";

export const ConfirmationModal = ({
  open,
  onOpenChange,
  service,
  business,
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
      <DialogContent className="sm:max-w-md">
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
            {/* Servicio y Profesional */}
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-violet-100 rounded-lg">
                <FiScissors className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900">
                  {service.name}
                </p>
                <p className="text-sm text-gray-600">
                  con {bookingData.employeeName}
                </p>
              </div>
            </div>

            {/* Fecha y Hora */}
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex items-center">
                <FiCalendar className="w-4 h-4 mr-3 text-gray-400" />
                <span>
                  {new Date(bookingData.date).toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
              <div className="flex items-center">
                <FiClock className="w-4 h-4 mr-3 text-gray-400" />
                <span>{bookingData.time}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between border-t pt-3 mt-3">
              <span className="font-semibold text-gray-800">Total a Pagar</span>
              <span className="font-bold text-xl text-gray-900">
                ${Number(service.price).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Alergias, preferencias, etc."
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
            onClick={onConfirm}
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
