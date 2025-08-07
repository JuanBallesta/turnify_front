import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ActionButton } from "@/components/ui/action-button";
import { FiX } from "react-icons/fi";

export const CancellationModal = ({
  open,
  onOpenChange,
  onConfirm,
  isCancelling,
}) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    // Pasa el motivo al componente padre
    onConfirm(reason);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar Cita</DialogTitle>
          <DialogDescription>
            Por favor, indica el motivo de la cancelación. Esto ayuda al negocio
            a mejorar su servicio.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label htmlFor="cancellationReason">
            Motivo de la cancelación (opcional)
          </Label>
          <Textarea
            id="cancellationReason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej: Conflicto de horario, ya no necesito el servicio, etc."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            No cancelar
          </Button>
          <ActionButton
            onClick={handleConfirm}
            isLoading={isCancelling}
            variant="destructive"
          >
            <FiX className="mr-2 h-4 w-4" /> Confirmar Cancelación
          </ActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
