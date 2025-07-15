import React, { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "./loading-spinner";
import { FiCamera } from "react-icons/fi";
import { uploadProfilePhoto } from "@/services/ProfileService"; // Importamos el servicio
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

    // Crear vista previa
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    setIsUploading(true);
    try {
      const response = await uploadProfilePhoto(user.id, user.role, file);
      // Notificar al componente padre (Profile.jsx) sobre la nueva URL
      onPhotoUpdate(response.data.photoUrl);
    } catch (error) {
      alert("Error al subir la imagen.");
      setPreview(null); // Revertir la vista previa si hay error
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
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
      <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
        <AvatarImage
          src={preview || currentPhoto}
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
