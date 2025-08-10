import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import {
  getOneBusiness,
  updateBusiness,
  uploadBusinessLogo,
} from "@/services/BusinessService";

// UI Components
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ActionButton } from "@/components/ui/action-button";
import { ProfilePhotoUpload } from "@/components/ui/ProfilePhotoUpload";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Icons
import { FiSave } from "react-icons/fi";

const BusinessProfileSettings = () => {
  const { user } = useAuth();
  const [businessData, setBusinessData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    if (user?.businessId) {
      setIsLoading(true);
      getOneBusiness(user.businessId)
        .then((response) => setBusinessData(response.data))
        .catch((err) => console.error("Error al cargar datos del negocio", err))
        .finally(() => setIsLoading(false));
    } else if (user && user.role !== "superuser") {
      setIsLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBusinessData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!businessData?.id) {
      alert("Error: No se pudo identificar el negocio a actualizar.");
      return;
    }
    setIsSaving(true);
    try {
      const { id, createdAt, updatedAt, ...dataToUpdate } = businessData;

      console.log(`Guardando datos para Business ID: ${id}`, dataToUpdate);

      await updateBusiness(id, dataToUpdate);
      alert("¡Perfil del negocio actualizado!");
    } catch (error) {
      console.error("Error al guardar:", error.response?.data || error);
      alert("Error al actualizar el perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoSelect = async (file) => {
    if (!businessData?.id) return;
    setIsUploadingLogo(true);
    try {
      const response = await uploadBusinessLogo(businessData.id, file);
      setBusinessData((prev) => ({ ...prev, logo: response.data.logoUrl }));
      alert("Logo actualizado con éxito.");
    } catch (error) {
      alert("Error al subir el logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!businessData) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <p>No se encontraron datos del negocio asociados a tu cuenta.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <PageHeader
          title="Configuración del Negocio"
          description="Edita la información que se mostrará en tu página pública."
        />

        <Card>
          <CardHeader>
            <CardTitle>Información General y Logo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-6">
              <ProfilePhotoUpload
                currentPhoto={businessData.logo}
                displayName={businessData.name}
                onFileSelect={handleLogoSelect}
                isUploading={isUploadingLogo}
              />
              <div className="flex-grow space-y-1">
                <Label htmlFor="name">Nombre del Negocio</Label>
                <Input
                  id="name"
                  name="name"
                  value={businessData.name || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Descripción del Negocio</Label>
              <Textarea
                id="description"
                name="description"
                value={businessData.description || ""}
                onChange={handleChange}
                rows={4}
                placeholder="Una descripción atractiva de tu negocio."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ubicación y Contacto</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                name="address"
                value={businessData.address || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Teléfono de Contacto</Label>
              <Input
                id="phone"
                name="phone"
                value={businessData.phone || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="email">Email Público</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={businessData.email || ""}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Redes Sociales y Sitio Web</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                name="website"
                value={businessData.website || ""}
                onChange={handleChange}
                placeholder="https://www.tu-negocio.com"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                name="instagram"
                value={businessData.instagram || ""}
                onChange={handleChange}
                placeholder="tu_usuario_de_instagram"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                name="facebook"
                value={businessData.facebook || ""}
                onChange={handleChange}
                placeholder="tu_pagina_de_facebook"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <ActionButton onClick={handleSave} isLoading={isSaving} icon={FiSave}>
            Guardar Todos los Cambios
          </ActionButton>
        </div>
      </div>
    </Layout>
  );
};

export default BusinessProfileSettings;
