import { z } from 'zod';

const fecha = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener el formato AAAA-MM-DD');

export const promocionSchema = z
  .object({
    titulo: z.string().trim().min(3, 'El título es obligatorio').max(120),
    descripcion: z
      .string()
      .trim()
      .min(10, 'La descripción debe tener al menos 10 caracteres')
      .max(500),
    tipo: z.enum(['PORCENTAJE', 'IMPORTE_FIJO', 'MESES_GRATIS', 'OTRO']),
    valor: z.coerce.number().min(0, 'El valor no puede ser negativo'),
    codigo: z
      .string()
      .trim()
      .toUpperCase()
      .max(30)
      .regex(/^[A-Z0-9_-]*$/, 'El código solo admite letras, números, - y _')
      .optional()
      .or(z.literal('')),
    fechaInicio: fecha,
    fechaFin: fecha,
    activa: z.coerce.boolean().default(true),
    destacada: z.coerce.boolean().default(false),
  })
  .refine((v) => v.fechaFin >= v.fechaInicio, {
    message: 'La fecha de fin no puede ser anterior a la de inicio',
    path: ['fechaFin'],
  })
  .refine((v) => v.tipo !== 'PORCENTAJE' || v.valor <= 100, {
    message: 'Un porcentaje no puede superar 100',
    path: ['valor'],
  });

export const productoSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es obligatorio').max(120),
  precio: z.coerce.number().min(0, 'El precio no puede ser negativo').max(99999),
  stock: z.coerce
    .number()
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo'),
  fechaRegistro: fecha,
});

/** Alta/edición de usuario desde el panel de administración. */
export const adminUserUpdateSchema = z.object({
  nombre: z.string().trim().min(2).max(100),
  apellido: z.string().trim().min(2).max(100),
  rol: z.enum(['ADMIN', 'CLIENT']),
  edad: z.coerce.number().int().min(14).max(120),
  peso: z.coerce.number().min(30).max(400),
  estatura: z.coerce.number().min(1).max(2.6),
});

export type PromocionInput = z.infer<typeof promocionSchema>;
export type ProductoInput = z.infer<typeof productoSchema>;
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;
