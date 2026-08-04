import { z } from 'zod';

/**
 * Reglas de la contraseña (las mismas que aplica el formulario del frontend):
 *   - mínimo 8 caracteres
 *   - al menos una letra mayúscula
 *   - al menos una letra minúscula
 *   - al menos un carácter especial (cualquiera que no sea letra, dígito o espacio)
 *
 * Se validan una a una para poder decirle al usuario exactamente cuál falla,
 * en vez de soltar un único "contraseña inválida".
 */
export const PASSWORD_MIN_LENGTH = 8;

export const passwordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`
  )
  .max(72, 'La contraseña no puede superar los 72 caracteres')
  .regex(/[A-ZÁÉÍÓÚÑ]/, 'La contraseña debe contener al menos una letra mayúscula')
  .regex(/[a-záéíóúñ]/, 'La contraseña debe contener al menos una letra minúscula')
  .regex(
    /[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s]/,
    'La contraseña debe contener al menos un carácter especial'
  );

export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
  .max(50, 'El nombre de usuario no puede superar los 50 caracteres')
  .regex(
    /^[a-zA-Z0-9._-]+$/,
    'El nombre de usuario solo admite letras, números, puntos, guiones y guiones bajos'
  );

const nombrePropio = (campo: string) =>
  z
    .string()
    .trim()
    .min(2, `El campo ${campo} debe tener al menos 2 caracteres`)
    .max(100, `El campo ${campo} no puede superar los 100 caracteres`);

export const registerSchema = z.object({
  username: usernameSchema,
  nombre: nombrePropio('nombre'),
  apellido: nombrePropio('apellido'),
  edad: z.coerce
    .number()
    .int('La edad debe ser un número entero')
    .min(14, 'La edad mínima es 14 años')
    .max(120, 'La edad máxima es 120 años'),
  peso: z.coerce
    .number()
    .min(30, 'El peso mínimo es 30 kg')
    .max(400, 'El peso máximo es 400 kg'),
  estatura: z.coerce
    .number()
    .min(1, 'La estatura mínima es 1,00 m')
    .max(2.6, 'La estatura máxima es 2,60 m'),
  password: passwordSchema,
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'El usuario es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
