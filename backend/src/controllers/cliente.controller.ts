import type { NextFunction, Request, Response } from 'express';
import * as membresiaRepository from '../repositories/membresia.repository.js';
import * as promocionRepository from '../repositories/promocion.repository.js';
import { unauthorized } from '../utils/errors.js';

/** Panel del socio: membresía, próximo pago, asistencias y promociones. */
export async function miPanel(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw unauthorized();
    const usuarioId = req.user.sub;

    const [membresia, asistencias, resumen, promociones] = await Promise.all([
      membresiaRepository.findByUsuario(usuarioId),
      membresiaRepository.listAsistencias(usuarioId, 15),
      membresiaRepository.resumenAsistencias(usuarioId),
      promocionRepository.listVigentes(),
    ]);

    res.json({ membresia, asistencias, resumen, promociones });
  } catch (error) {
    next(error);
  }
}

/** Check-in: registra una visita de hoy. */
export async function registrarAsistencia(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw unauthorized();
    await membresiaRepository.registrarAsistencia(req.user.sub);

    res.status(201).json({
      asistencias: await membresiaRepository.listAsistencias(req.user.sub, 15),
      resumen: await membresiaRepository.resumenAsistencias(req.user.sub),
    });
  } catch (error) {
    next(error);
  }
}
