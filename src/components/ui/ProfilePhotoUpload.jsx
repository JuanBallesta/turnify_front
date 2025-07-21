import React, { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "./loading-spinner";
import { FiCamera } from "react-icons/fi";
import { uploadProfilePhoto } from "@/services/ProfileService";
import { useAuth } from "@/contexts/AuthContext";

export const ProfilePhotoUpload = ({
  currentPhoto,
  displayName, // <-- Usaremos este prop para el nombre completo
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
    if (!name || typeof name !== "string") return "?";
    const names = name.trim().split(" ").filter(Boolean); // Filtra espacios extra
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    if (names.length === 1 && names[0].length > 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return "?";
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
          alt={displayName}
          className="object-cover"
        />
        <AvatarFallback className="text-3xl">
          {getInitials(displayName)}
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
