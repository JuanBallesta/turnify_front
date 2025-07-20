import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FiCheck } from "react-icons/fi";

export const SuccessModal = ({
  open,
  onOpenChange,
  onBookAnother,
  onGoToAppointments,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="text-center space-y-6 py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <FiCheck className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <DialogTitle className="text-xl font-semibold">
              ¡Cita Confirmada!
            </DialogTitle>
            <p className="text-gray-600 mt-2">
              Tu reserva ha sido un éxito. Recibirás un recordatorio.
            </p>
          </div>
          <DialogFooter className="justify-center pt-4 sm:justify-center">
            <Button variant="outline" onClick={onBookAnother}>
              Reservar Otra Cita
            </Button>
            <Button onClick={onGoToAppointments}>Ver Mis Citas</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
