import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";

// UI Components
import { PageHeader } from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form-field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ActionButton } from "@/components/ui/action-button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ProfileStats } from "@/components/ui/profile-stats";
import { ProfilePhotoUpload } from "@/components/ui/profile-photo-upload";
import { Textarea } from "@/components/ui/textarea";

// Icons
import {
  FiUser,
  FiEdit3,
  FiLock,
  FiMail,
  FiPhone,
  FiCalendar,
  FiSave,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiX,
  FiShield,
  FiSettings,
  FiFileText,
} from "react-icons/fi";

const Profile = () => {
  const {
    user,
    token,
    updateUser,
    changePassword,
    isLoading: authIsLoading,
  } = useAuth();
  const { appointments } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    lastName: "",
    phone: "",
    notes: "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSuccess, setProfileSuccess] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Estados de cambio de contraseña (sin cambios en la estructura)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        notes: user.notes || "",
      });
    }
  }, [user]);

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    return requirements;
  };
  const getPasswordStrength = (password) => {
    const requirements = validatePassword(password);
    const score = Object.values(requirements).filter(Boolean).length;

    if (score <= 2)
      return { strength: 25, color: "bg-red-500", label: "Débil" };
    if (score <= 3)
      return { strength: 50, color: "bg-orange-500", label: "Regular" };
    if (score <= 4)
      return { strength: 75, color: "bg-yellow-500", label: "Buena" };
    return { strength: 100, color: "bg-green-500", label: "Excelente" };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);
  const passwordRequirements = validatePassword(passwordData.newPassword);
  const handlePasswordChange = (field, value) =>
    setPasswordData((prev) => ({ ...prev, [field]: value }));

  const validatePasswordChange = () => {};

  const handleChangePassword = async () => {};
  const getRoleLabel = (role) => {};
  const getRoleBadgeVariant = (role) => {};
  const togglePasswordVisibility = (field) =>
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name]) {
      setProfileErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateProfile = () => {
    const errors = {};
    if (!profileData.name.trim()) errors.name = "El nombre es requerido";
    if (!profileData.lastName.trim())
      errors.lastName = "El apellido es requerido";
    if (!profileData.phone.trim()) errors.phone = "El teléfono es requerido";
    return errors;
  };

  const handleSaveProfile = async () => {
    const errors = validateProfile();
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }
    setIsSavingProfile(true);
    setProfileSuccess("");
    setProfileErrors({});
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      if (!API_URL) {
        throw new Error(
          "Error de configuración: VITE_API_URL no está definida.",
        );
      }

      // *** LÓGICA DE DECISIÓN DE RUTA ***
      // Basado en el rol del usuario, decidimos a qué endpoint llamar.
      const endpoint =
        user.role === "client"
          ? `/users/${user.id}` // Para clientes, usamos la ruta de 'users'
          : `/employees/${user.id}`; // Para todos los demás, usamos la ruta de 'employees'

      const fullUrl = `${API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL}${endpoint}`;

      const response = await fetch(fullUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || "No se pudo actualizar el perfil.");
      }

      // La respuesta del back-end (tanto de updateUser como de updateEmployee)
      // debe devolver un objeto con la clave 'user' para ser consistente.
      updateUser(data.user);
      setProfileSuccess("Perfil actualizado exitosamente");
      setIsEditing(false);
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (error) {
      setProfileErrors({ general: error.message });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setProfileData({
        name: user.name || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        notes: user.notes || "",
      });
    }
    setProfileErrors({});
    setIsEditing(false);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Mi Perfil"
        description="Gestiona tu información personal y configuración de cuenta"
        breadcrumbs={[{ label: "Perfil", href: "/profile" }]}
      />
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Información Personal</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="preferences">Preferencias</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-6">
          <Card>
            {/* CardHeader permanece igual */}
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <ProfilePhotoUpload
                    currentPhoto={user?.photo}
                    userName={user?.name}
                    onPhotoUpdate={async (photoUrl) =>
                      await updateUser({ photo: photoUrl })
                    }
                    isLoading={authIsLoading}
                  />
                  <div>
                    <CardTitle className="text-2xl">
                      {user?.name} {user?.lastName}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={getRoleBadgeVariant(user?.role)}>
                        {getRoleLabel(user?.role)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        @{user?.userName}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>
                      <FiEdit3 className="w-4 h-4 mr-2" /> Editar Perfil
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={handleCancelEdit}>
                        <FiX className="w-4 h-4 mr-2" /> Cancelar
                      </Button>
                      <ActionButton
                        onClick={handleSaveProfile}
                        isLoading={isSavingProfile}
                        loadingText="Guardando..."
                        icon={FiSave}
                      >
                        Guardar
                      </ActionButton>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mensajes de éxito y error permanecen igual */}
              {profileSuccess && (
                <Alert>
                  <FiCheck className="h-4 w-4" />
                  <AlertDescription>{profileSuccess}</AlertDescription>
                </Alert>
              )}
              {profileErrors.general && (
                <Alert variant="destructive">
                  <AlertDescription>{profileErrors.general}</AlertDescription>
                </Alert>
              )}

              {/* Formulario adaptado al modelo `users` permanece igual */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Nombre"
                  htmlFor="name"
                  required
                  error={profileErrors.name}
                >
                  <Input
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                  />
                </FormField>
                <FormField
                  label="Apellido"
                  htmlFor="lastName"
                  required
                  error={profileErrors.lastName}
                >
                  <Input
                    id="lastName"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                  />
                </FormField>
                <FormField
                  label="Teléfono"
                  htmlFor="phone"
                  required
                  error={profileErrors.phone}
                >
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </FormField>
                <FormField
                  label="Correo Electrónico (no editable)"
                  htmlFor="email"
                >
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="pl-10"
                    />
                  </div>
                </FormField>
                <div className="md:col-span-2">
                  <FormField label="Notas Adicionales" htmlFor="notes">
                    <div className="relative">
                      <FiFileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Textarea
                        id="notes"
                        name="notes"
                        value={profileData.notes || ""}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className="pl-10"
                        placeholder="Alergias, preferencias o cualquier otra información relevante."
                      />
                    </div>
                  </FormField>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* El resto de las TABS y el DIALOG permanecen igual */}
        <TabsContent value="activity" className="space-y-6">
          <ProfileStats user={user} appointments={appointments} />
        </TabsContent>
        <TabsContent value="security" className="space-y-6">
          {/* ... */}
        </TabsContent>
        <TabsContent value="preferences" className="space-y-6">
          {/* ... */}
        </TabsContent>
      </Tabs>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>{/* ... */}</DialogHeader>
          <div className="space-y-6">
            {/* ... */}
            <div className="flex space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              {/* CORRECCIÓN FINAL: Usar `authIsLoading` para el estado de carga del cambio de contraseña */}
              <ActionButton
                onClick={handleChangePassword}
                isLoading={authIsLoading}
                loadingText="Cambiando..."
                icon={FiLock}
                className="flex-1"
              >
                Cambiar Contraseña
              </ActionButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
