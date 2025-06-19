import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import apiClient from "@/services/api"; // Importamos apiClient para las llamadas directas

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

  // Estados de cambio de contraseña
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
    if (!password) return { strength: 0, color: "bg-gray-200", label: "" };
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

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    if (passwordErrors[field] || passwordErrors.general) {
      setPasswordErrors({});
    }
  };

  const handleChangePassword = async () => {
    setPasswordErrors({});
    setPasswordSuccess("");
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrors({ confirmPassword: "Las contraseñas no coinciden." });
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
        setShowPasswordDialog(false);
        setPasswordSuccess("");
      }, 2000);
    } catch (error) {
      setPasswordErrors({ general: error.message });
    }
  };

  const getRoleLabel = (role) => {
    const roles = {
      client: "Cliente",
      employee: "Empleado",
      administrator: "Administrador",
      superuser: "Super Usuario",
    };
    return roles[role] || role;
  };

  const getRoleBadgeVariant = (role) => {
    const variants = {
      client: "secondary",
      employee: "default",
      administrator: "primary",
      superuser: "default",
    };
    return variants[role] || "secondary";
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileErrors({});
    setProfileSuccess("");
    try {
      if (!user || !user.id) throw new Error("Usuario no encontrado");

      const endpoint =
        user.role === "client" ? `/users/${user.id}` : `/employees/${user.id}`;

      const response = await apiClient.put(endpoint, profileData);

      updateUser(response.data.user);
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

  if (!user) {
    return (
      <div className="p-6">
        <PageHeader title="Cargando Perfil..." />
      </div>
    );
  }

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
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <ProfilePhotoUpload
                    currentPhoto={user.photo}
                    userName={user.name}
                    onPhotoUpdate={(photoUrl) =>
                      updateUser({ photo: photoUrl })
                    }
                    isLoading={authIsLoading}
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
                        Guardar
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
          <ProfileStats user={user} appointments={appointments} />
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
                      <h4 className="font-medium text-gray-900">Contraseña</h4>
                      <p className="text-sm text-gray-600">
                        Actualiza tu contraseña para mantener la seguridad
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
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FiShield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Verificación en Dos Pasos
                      </h4>
                      <p className="text-sm text-gray-600">
                        Próximamente disponible
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" disabled>
                    Configurar
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
                <span>Preferencias de Usuario</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FiSettings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Próximamente
                </h3>
                <p className="text-gray-600">
                  Las preferencias de usuario estarán disponibles en una próxima
                  actualización.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Actualiza tu contraseña para mantener tu cuenta segura
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
                    placeholder="Tu contraseña actual"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => togglePasswordVisibility("current")}
                  >
                    {showPasswords.current ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400" />
                    )}
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
                    placeholder="Tu nueva contraseña"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => togglePasswordVisibility("new")}
                  >
                    {showPasswords.new ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400" />
                    )}
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
                  <Progress value={passwordStrength.strength} className="h-2" />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div
                      className={`flex items-center space-x-1 ${passwordRequirements.length ? "text-green-600" : "text-gray-400"}`}
                    >
                      {passwordRequirements.length ? (
                        <FiCheck className="w-3 h-3" />
                      ) : (
                        <FiX className="w-3 h-3" />
                      )}
                      <span>8+ caracteres</span>
                    </div>
                    <div
                      className={`flex items-center space-x-1 ${passwordRequirements.uppercase ? "text-green-600" : "text-gray-400"}`}
                    >
                      {passwordRequirements.uppercase ? (
                        <FiCheck className="w-3 h-3" />
                      ) : (
                        <FiX className="w-3 h-3" />
                      )}
                      <span>Mayúscula</span>
                    </div>
                    <div
                      className={`flex items-center space-x-1 ${passwordRequirements.lowercase ? "text-green-600" : "text-gray-400"}`}
                    >
                      {passwordRequirements.lowercase ? (
                        <FiCheck className="w-3 h-3" />
                      ) : (
                        <FiX className="w-3 h-3" />
                      )}
                      <span>Minúscula</span>
                    </div>
                    <div
                      className={`flex items-center space-x-1 ${passwordRequirements.number ? "text-green-600" : "text-gray-400"}`}
                    >
                      {passwordRequirements.number ? (
                        <FiCheck className="w-3 h-3" />
                      ) : (
                        <FiX className="w-3 h-3" />
                      )}
                      <span>Número</span>
                    </div>
                  </div>
                </div>
              )}
              <FormField
                label="Confirmar Nueva Contraseña"
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
                    placeholder="Confirma tu nueva contraseña"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    {showPasswords.confirm ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </FormField>
            </div>
            <div className="flex space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
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
