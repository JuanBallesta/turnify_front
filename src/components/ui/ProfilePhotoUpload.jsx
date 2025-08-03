import React, { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "./loading-spinner";
import { FiCamera } from "react-icons/fi";

export const ProfilePhotoUpload = ({
  currentPhoto,
  displayName,
  onFileSelect,
  isUploading = false,
}) => {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setPreview(null);
      return;
    }

    // Muestra una vista previa local
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    if (typeof onFileSelect === "function") {
      onFileSelect(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "?";
    const names = name.trim().split(" ").filter(Boolean);
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    if (names.length === 1 && names[0].length > 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return "?";
  };

  const finalImageSrc =
    preview || (currentPhoto ? `${API_URL}${currentPhoto}` : undefined);

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
          src={finalImageSrc}
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
