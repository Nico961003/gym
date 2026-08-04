import type { NextFunction, Request, Response } from 'express';
import * as adminLogRepository from '../repositories/adminLog.repository.js';
import * as productoRepository from '../repositories/producto.repository.js';
import * as promocionRepository from '../repositories/promocion.repository.js';
import * as userRepository from '../repositories/user.repository.js';
import * as audit from '../services/audit.service.js';
import { toPublicUser } from '../types/user.js';
import { badRequest, HttpError, notFound } from '../utils/errors.js';
import type {
  AdminUserUpdateInput,
  ProductoInput,
} from '../validation/catalogo.schema.js';
import type { PromocionInput } from '../validation/catalogo.schema.js';

/** Express 5 tipa los params como `string | string[] | undefined`. */
function parseId(raw: string | string[] | undefined): number {
  const id = Number(Array.isArray(raw) ? raw[0] : raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw badRequest('Identificador inválido');
  }
  return id;
}

/* ------------------------------- Promociones ------------------------------ */

export async function listPromociones(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.json({ promociones: await promocionRepository.listAll() });
  } catch (error) {
    next(error);
  }
}

export async function createPromocion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const creada = await promocionRepository.create(req.body as PromocionInput);
    await audit.registrar({
      req,
      accion: 'CREAR',
      entidad: 'PROMOCION',
      entidadId: creada.id,
      despues: { ...creada },
    });
    res.status(201).json({ promocion: creada });
  } catch (error) {
    next(error);
  }
}

export async function updatePromocion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseId(req.params.id);
    const antes = await promocionRepository.findById(id);
    if (!antes) throw notFound('La promoción no existe');

    const despues = await promocionRepository.update(
      id,
      req.body as PromocionInput
    );

    await audit.registrar({
      req,
      accion: 'ACTUALIZAR',
      entidad: 'PROMOCION',
      entidadId: id,
      antes: { ...antes },
      despues: { ...despues },
    });

    res.json({ promocion: despues });
  } catch (error) {
    next(error);
  }
}

export async function deletePromocion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseId(req.params.id);
    const antes = await promocionRepository.findById(id);
    if (!antes) throw notFound('La promoción no existe');

    await promocionRepository.remove(id);
    await audit.registrar({
      req,
      accion: 'BORRAR',
      entidad: 'PROMOCION',
      entidadId: id,
      antes: { ...antes },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/* -------------------------------- Productos ------------------------------- */

export async function listProductos(
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

export async function createProducto(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const creado = await productoRepository.create(req.body as ProductoInput);
    await audit.registrar({
      req,
      accion: 'CREAR',
      entidad: 'PRODUCTO',
      entidadId: creado.id,
      despues: { ...creado },
    });
    res.status(201).json({ producto: creado });
  } catch (error) {
    next(error);
  }
}

export async function updateProducto(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseId(req.params.id);
    const antes = await productoRepository.findById(id);
    if (!antes) throw notFound('El producto no existe');

    const despues = await productoRepository.update(
      id,
      req.body as ProductoInput
    );

    await audit.registrar({
      req,
      accion: 'ACTUALIZAR',
      entidad: 'PRODUCTO',
      entidadId: id,
      antes: { ...antes },
      despues: { ...despues },
    });

    res.json({ producto: despues });
  } catch (error) {
    next(error);
  }
}

export async function deleteProducto(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseId(req.params.id);
    const antes = await productoRepository.findById(id);
    if (!antes) throw notFound('El producto no existe');

    await productoRepository.remove(id);
    await audit.registrar({
      req,
      accion: 'BORRAR',
      entidad: 'PRODUCTO',
      entidadId: id,
      antes: { ...antes },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/* -------------------------------- Usuarios -------------------------------- */

export async function listUsuarios(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rows = await userRepository.listAll();
    res.json({ usuarios: rows.map(toPublicUser) });
  } catch (error) {
    next(error);
  }
}

export async function updateUsuario(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseId(req.params.id);
    const antes = await userRepository.findById(id);
    if (!antes) throw notFound('El usuario no existe');

    const datos = req.body as AdminUserUpdateInput;

    // No dejar el sistema sin ningún administrador.
    if (
      antes.rol === 'ADMIN' &&
      datos.rol === 'CLIENT' &&
      (await userRepository.contarAdmins()) <= 1
    ) {
      throw new HttpError(
        409,
        'No puedes quitar el rol al último administrador'
      );
    }

    const despues = await userRepository.update(id, datos);

    await audit.registrar({
      req,
      accion: 'ACTUALIZAR',
      entidad: 'USUARIO',
      entidadId: id,
      antes: { ...toPublicUser(antes) },
      despues: despues ? { ...toPublicUser(despues) } : null,
    });

    res.json({ usuario: despues ? toPublicUser(despues) : null });
  } catch (error) {
    next(error);
  }
}

export async function deleteUsuario(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseId(req.params.id);
    const antes = await userRepository.findById(id);
    if (!antes) throw notFound('El usuario no existe');

    if (req.user?.sub === id) {
      throw new HttpError(409, 'No puedes borrar tu propia cuenta');
    }

    if (antes.rol === 'ADMIN' && (await userRepository.contarAdmins()) <= 1) {
      throw new HttpError(409, 'No puedes borrar al último administrador');
    }

    await userRepository.remove(id);
    await audit.registrar({
      req,
      accion: 'BORRAR',
      entidad: 'USUARIO',
      entidadId: id,
      antes: { ...toPublicUser(antes) },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/* --------------------------------- Logs ----------------------------------- */

export async function listLogs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limite = Number(req.query.limite ?? 50);
    const offset = Number(req.query.offset ?? 0);
    const entidad = req.query.entidad as
      | 'PROMOCION'
      | 'PRODUCTO'
      | 'USUARIO'
      | 'SESION'
      | undefined;

    res.json({
      logs: await adminLogRepository.list({
        limite: Number.isFinite(limite) ? limite : 50,
        offset: Number.isFinite(offset) ? offset : 0,
        ...(entidad ? { entidad } : {}),
      }),
      total: await adminLogRepository.contar(),
    });
  } catch (error) {
    next(error);
  }
}
