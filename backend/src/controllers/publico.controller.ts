import type { NextFunction, Request, Response } from 'express';
import * as productoRepository from '../repositories/producto.repository.js';
import * as promocionRepository from '../repositories/promocion.repository.js';

/** Promociones vigentes que se muestran en la web sin iniciar sesión. */
export async function promocionesVigentes(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.json({ promociones: await promocionRepository.listVigentes() });
  } catch (error) {
    next(error);
  }
}

/** Catálogo de la tienda, visible para cualquiera. */
export async function productos(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.json({ productos: await productoRepository.listAll() });
  } catch (error) {
    next(error);
  }
}
