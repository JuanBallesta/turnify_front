// src/lib/validators.js

/**
 * Valida una contraseña según un conjunto de reglas de seguridad.
 * @param {string} password - La contraseña a validar.
 * @returns {{
 *  isValid: boolean,
 *  errors: string[],
 *  requirements: {
 *    length: boolean,
 *    uppercase: boolean,
 *    lowercase: boolean,
 *    number: boolean,
 *    special: boolean
 *  }
 * }} Un objeto con el resultado de la validación.
 */
export const validatePassword = (password) => {
  const errors = [];
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  if (!requirements.length) {
    errors.push("Debe tener al menos 8 caracteres.");
  }
  if (!requirements.uppercase) {
    errors.push("Debe contener al menos una mayúscula.");
  }
  if (!requirements.lowercase) {
    errors.push("Debe contener al menos una minúscula.");
  }
  if (!requirements.number) {
    errors.push("Debe contener al menos un número.");
  }
  if (!requirements.special) {
    errors.push("Debe contener al menos un carácter especial (!@#$%).");
  }

  return {
    isValid: errors.length === 0,
    errors,
    requirements,
  };
};

/**
 * Calcula la "fuerza" de una contraseña basándose en el número de requisitos que cumple.
 * @param {object} requirements - El objeto de requisitos devuelto por validatePassword.
 * @returns {{ strength: number, color: string, label: string }}
 */
export const getPasswordStrength = (requirements) => {
  if (!requirements) return { strength: 0, color: "bg-gray-200", label: "" };
  const score = Object.values(requirements).filter(Boolean).length;
  if (score <= 2) return { strength: 25, color: "bg-red-500", label: "Débil" };
  if (score === 3)
    return { strength: 50, color: "bg-orange-500", label: "Regular" };
  if (score === 4)
    return { strength: 75, color: "bg-yellow-500", label: "Buena" };
  return { strength: 100, color: "bg-green-500", label: "Excelente" };
};
