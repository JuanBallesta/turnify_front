import React, { useState, useRef } from "react";
import { Button } from "./button";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Alert, AlertDescription } from "./alert";
import { ActionButton } from "./action-button";
import {
  FiCamera,
  FiUpload,
  FiX,
  FiRotateCw,
  FiCrop,
  FiCheck,
  FiTrash2,
} from "react-icons/fi";

const ProfilePhotoUpload = ({
  currentPhoto,
  userName,
  onPhotoUpdate,
  isLoading = false,
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Límites de archivo
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError("Formato no soportado. Usa JPG, PNG, GIF o WebP.");
      return;
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("La imagen es muy grande. Máximo 5MB.");
      return;
    }

    setUploadError("");
    setSelectedFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    setShowDialog(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Simular upload (en una app real, aquí subirías a un servicio como S3, Cloudinary, etc.)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Crear URL simulada (en producción sería la URL real del servicio)
      const fakeUrl = previewUrl; // En real sería la URL devuelta por el servicio

      // Llamar callback para actualizar el perfil
      await onPhotoUpdate?.(fakeUrl);

      // Cerrar dialog y limpiar estado
      handleCloseDialog();
    } catch (error) {
      setUploadError("Error al subir la imagen. Inténtalo de nuevo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await onPhotoUpdate?.(null);
      handleCloseDialog();
    } catch (error) {
      setUploadError("Error al eliminar la foto.");
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      {/* Avatar con botón de cambio */}
      <div className="relative group">
        <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
          <AvatarImage src={currentPhoto} />
          <AvatarFallback className="text-2xl bg-violet-100 text-violet-700">
            {userName
              ?.split(" ")
              .map((n) => n[0])
              .join("") || "U"}
          </AvatarFallback>
        </Avatar>

        {/* Overlay de edición */}
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-white hover:bg-white/20"
          >
            <FiCamera className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Botón de cambio de foto */}
      <Button
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
      >
        <FiCamera className="w-4 h-4 mr-2" />
        {currentPhoto ? "Cambiar Foto" : "Subir Foto"}
      </Button>

      {/* Input oculto para seleccionar archivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Dialog de edición */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Actualizar Foto de Perfil</DialogTitle>
            <DialogDescription>
              Elige una nueva imagen para tu perfil. Se recomienda una imagen
              cuadrada.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {uploadError && (
              <Alert variant="destructive">
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            {/* Preview de la imagen */}
            {previewUrl && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-full border-4 border-violet-200"
                    />
                  </div>
                </div>

                {/* Información del archivo */}
                {selectedFile && (
                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium truncate">
                        {selectedFile.name}
                      </span>
                      <span className="text-gray-500 ml-2">
                        {formatFileSize(selectedFile.size)}
                      </span>
                    </div>
                    <div className="text-gray-600 mt-1">
                      {selectedFile.type}
                    </div>
                  </div>
                )}

                {/* Herramientas de edición futuras */}
                <div className="flex justify-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    <FiRotateCw className="w-4 h-4 mr-2" />
                    Rotar
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <FiCrop className="w-4 h-4 mr-2" />
                    Recortar
                  </Button>
                </div>
              </div>
            )}

            {/* Consejos */}
            <div className="bg-violet-50 rounded-lg p-3 text-sm">
              <h4 className="font-medium text-violet-900 mb-2">Consejos:</h4>
              <ul className="text-violet-700 space-y-1">
                <li>• Usa una imagen clara y bien iluminada</li>
                <li>• Formato cuadrado funciona mejor</li>
                <li>• Tamaño máximo: 5MB</li>
                <li>• Formatos: JPG, PNG, GIF, WebP</li>
              </ul>
            </div>

            {/* Acciones */}
            <div className="flex space-x-3">
              {!previewUrl ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCloseDialog}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <FiUpload className="w-4 h-4 mr-2" />
                    Seleccionar Archivo
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCloseDialog}
                    disabled={isUploading}
                  >
                    <FiX className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>

                  {currentPhoto && (
                    <Button
                      variant="outline"
                      onClick={handleRemovePhoto}
                      disabled={isUploading}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FiTrash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  )}

                  <ActionButton
                    onClick={handleUpload}
                    isLoading={isUploading}
                    loadingText="Subiendo..."
                    icon={FiCheck}
                    className="flex-1"
                  >
                    Guardar Foto
                  </ActionButton>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { ProfilePhotoUpload };
