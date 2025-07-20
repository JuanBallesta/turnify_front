import React, { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "./loading-spinner";
import { FiCamera } from "react-icons/fi";
import { uploadProfilePhoto } from "@/services/ProfileService"; // <-- Restaurado
import { useAuth } from "@/contexts/AuthContext";

export const ProfilePhotoUpload = ({
  currentPhoto,
  userName,
  onPhotoUpdate,
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setIsUploading(true);

    try {
      if (!user) throw new Error("Usuario no autenticado");
      // --- LÓGICA DE PRODUCCIÓN RESTAURADA ---
      const response = await uploadProfilePhoto(user.id, user.role, file);
      onPhotoUpdate(response.data.photoUrl);
      setPreview(null);
    } catch (error) {
      console.error("Error al subir imagen:", error.response?.data || error);
      alert("Error al subir la imagen. Por favor, inténtalo de nuevo.");
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      <Avatar className="h-24 w-24 border-2 border-white shadow-md">
        <AvatarImage
          src={
            preview ||
            (currentPhoto && `${import.meta.env.VITE_API_URL}${currentPhoto}`)
          }
          alt={userName}
          className="object-cover"
        />
        <AvatarFallback className="text-3xl">
          {getInitials(userName)}
        </AvatarFallback>
      </Avatar>
      <Button
        size="icon"
        className="absolute bottom-0 right-0 rounded-full h-8 w-8"
        onClick={handleAvatarClick}
        disabled={isUploading}
      >
        {isUploading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <FiCamera className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
