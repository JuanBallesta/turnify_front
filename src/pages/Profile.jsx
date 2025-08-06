import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/services/api";
import { uploadProfilePhoto } from "@/services/ProfileService";
import { validatePassword, getPasswordStrength } from "@/lib/validators";

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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ActionButton } from "@/components/ui/action-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ProfilePhotoUpload } from "@/components/ui/ProfilePhotoUpload";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";

// Icons
import {
  FiEdit3,
  FiLock,
  FiMail,
  FiPhone,
  FiSave,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiX,
  FiShield,
  FiSettings,
  FiFileText,
} from "react-icons/fi";

// Asumimos que tienes un componente para las estadísticas de perfil
const ProfileStats = () => (
  <Card>
    <CardHeader>
      <CardTitle>Actividad</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Estadísticas de actividad del usuario próximamente.</p>
    </CardContent>
  </Card>
);

const Profile = () => {
  const {
    user,
    updateUser,
    changePassword,
    isLoading: authIsLoading,
  } = useAuth();

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
  const [isUploading, setIsUploading] = useState(false);

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

  const passwordValidationResult = validatePassword(passwordData.newPassword);
  const passwordStrength = getPasswordStrength(
    passwordValidationResult.requirements,
  );

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

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePhotoSelect = async (file) => {
    if (!user) return;
    setIsUploading(true);
    try {
      const response = await uploadProfilePhoto(user.id, user.role, file);
      updateUser({ photo: response.data.photoUrl });
    } catch (error) {
      alert("Error al subir la foto de perfil.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileSuccess("");
    setProfileErrors({});
    try {
      if (!user || !user.id) throw new Error("Usuario no autenticado.");
      const endpoint =
        user.role === "client" ? `/users/${user.id}` : `/employees/${user.id}`;
      const response = await apiClient.put(endpoint, profileData);

      const updatedUserData = response.data.user || response.data.data;
      if (updatedUserData) {
        updateUser(updatedUserData);
      }
      setProfileSuccess("Perfil actualizado exitosamente");
      setIsEditing(false);
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (error) {
      setProfileErrors({
        general:
          error.response?.data?.msg || "No se pudo actualizar el perfil.",
      });
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

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const validateAndSubmitPassword = async () => {
    setPasswordErrors({});
    const errors = {};
    if (!passwordData.currentPassword)
      errors.currentPassword = "La contraseña actual es requerida.";
    const newPassValidation = validatePassword(passwordData.newPassword);
    if (!newPassValidation.isValid) {
      errors.newPassword = newPassValidation.errors[0];
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden.";
    }
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      setPasswordSuccess("Contraseña cambiada exitosamente");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => {
        setPasswordSuccess("");
        setShowPasswordDialog(false);
      }, 2000);
    } catch (error) {
      setPasswordErrors({ general: error.message });
    }
  };

  const togglePasswordVisibility = (field) =>
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  const getRoleLabel = (role) =>
    ({
      client: "Cliente",
      employee: "Empleado",
      administrator: "Administrador",
      superuser: "Super Usuario",
    })[role] || role;
  const getRoleBadgeVariant = (role) =>
    ({
      client: "secondary",
      employee: "default",
      administrator: "primary",
      superuser: "default",
    })[role] || "secondary";

  if (!user) {
    return (
      <>
        <div className="p-6 text-center">Cargando perfil...</div>
      </>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Mi Perfil"
          description="Gestiona tu información personal y configuración de cuenta"
        />
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Información Personal</TabsTrigger>
            {/* <TabsTrigger value="activity">Actividad</TabsTrigger> */}
            <TabsTrigger value="security">Seguridad</TabsTrigger>
            {/* <TabsTrigger value="preferences">Preferencias</TabsTrigger> */}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <ProfilePhotoUpload
                      currentPhoto={user.photo}
                      displayName={`${user.name} ${user.lastName}`}
                      onFileSelect={handleProfilePhotoSelect}
                      isUploading={isUploading}
                    />
                    <div>
                      <CardTitle className="text-2xl">
                        {user.name} {user.lastName}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          @{user.userName}
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
                          Guardar Cambios
                        </ActionButton>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Nombre" htmlFor="name" required>
                    <Input
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </FormField>
                  <FormField label="Apellido" htmlFor="lastName" required>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                    />
                  </FormField>
                  <FormField label="Teléfono" htmlFor="phone">
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
                  <FormField label="Correo (no editable)" htmlFor="email">
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={user.email || ""}
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

          <TabsContent value="activity" className="space-y-6">
            <ProfileStats user={user} />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FiShield className="w-5 h-5" />
                  <span>Configuración de Seguridad</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-violet-100 rounded-lg">
                        <FiLock className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Contraseña</h4>
                        <p className="text-sm text-gray-600">
                          Actualiza tu contraseña periódicamente
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowPasswordDialog(true)}
                    >
                      <FiLock className="w-4 h-4 mr-2" />
                      Cambiar Contraseña
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FiSettings className="w-5 h-5" />
                  <span>Preferencias</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="Próximamente"
                  description="Las preferencias de usuario estarán disponibles en una futura actualización."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cambiar Contraseña</DialogTitle>
              <DialogDescription>
                Usa una contraseña segura para proteger tu cuenta
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {passwordSuccess && (
                <Alert>
                  <FiCheck className="h-4 w-4" />
                  <AlertDescription>{passwordSuccess}</AlertDescription>
                </Alert>
              )}
              {passwordErrors.general && (
                <Alert variant="destructive">
                  <AlertDescription>{passwordErrors.general}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-4">
                <FormField
                  label="Contraseña Actual"
                  htmlFor="currentPassword"
                  required
                  error={passwordErrors.currentPassword}
                >
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        handlePasswordChange("currentPassword", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => togglePasswordVisibility("current")}
                    >
                      {showPasswords.current ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </FormField>
                <FormField
                  label="Nueva Contraseña"
                  htmlFor="newPassword"
                  required
                  error={passwordErrors.newPassword}
                >
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        handlePasswordChange("newPassword", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => togglePasswordVisibility("new")}
                    >
                      {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </FormField>

                {passwordData.newPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Fortaleza:</span>
                      <span
                        className={`text-sm font-medium ${passwordStrength.color.replace("bg-", "text-")}`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <Progress
                      value={passwordStrength.strength}
                      className={`h-2 ${passwordStrength.color}`}
                    />
                    <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                      <div
                        className={`flex items-center space-x-1 ${passwordValidationResult.requirements.length ? "text-green-600" : "text-gray-500"}`}
                      >
                        {passwordValidationResult.requirements.length ? (
                          <FiCheck className="w-3 h-3" />
                        ) : (
                          <FiX className="w-3 h-3" />
                        )}
                        <span>8+ caracteres</span>
                      </div>
                      <div
                        className={`flex items-center space-x-1 ${passwordValidationResult.requirements.uppercase ? "text-green-600" : "text-gray-500"}`}
                      >
                        {passwordValidationResult.requirements.uppercase ? (
                          <FiCheck className="w-3 h-3" />
                        ) : (
                          <FiX className="w-3 h-3" />
                        )}
                        <span>Mayúscula</span>
                      </div>
                      <div
                        className={`flex items-center space-x-1 ${passwordValidationResult.requirements.lowercase ? "text-green-600" : "text-gray-500"}`}
                      >
                        {passwordValidationResult.requirements.lowercase ? (
                          <FiCheck className="w-3 h-3" />
                        ) : (
                          <FiX className="w-3 h-3" />
                        )}
                        <span>Minúscula</span>
                      </div>
                      <div
                        className={`flex items-center space-x-1 ${passwordValidationResult.requirements.number ? "text-green-600" : "text-gray-500"}`}
                      >
                        {passwordValidationResult.requirements.number ? (
                          <FiCheck className="w-3 h-3" />
                        ) : (
                          <FiX className="w-3 h-3" />
                        )}
                        <span>Número</span>
                      </div>
                      <div
                        className={`flex items-center space-x-1 ${passwordValidationResult.requirements.special ? "text-green-600" : "text-gray-500"}`}
                      >
                        {passwordValidationResult.requirements.special ? (
                          <FiCheck className="w-3 h-3" />
                        ) : (
                          <FiX className="w-3 h-3" />
                        )}
                        <span>Carácter especial</span>
                      </div>
                    </div>
                  </div>
                )}

                <FormField
                  label="Confirmar Contraseña"
                  htmlFor="confirmPassword"
                  required
                  error={passwordErrors.confirmPassword}
                >
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        handlePasswordChange("confirmPassword", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => togglePasswordVisibility("confirm")}
                    >
                      {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </FormField>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordDialog(false)}
                >
                  Cancelar
                </Button>
                <ActionButton
                  onClick={validateAndSubmitPassword}
                  isLoading={authIsLoading}
                  loadingText="Cambiando..."
                  icon={FiLock}
                >
                  Cambiar Contraseña
                </ActionButton>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Profile;
