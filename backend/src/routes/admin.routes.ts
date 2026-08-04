import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/requireRole.js';
import { validateBody } from '../middleware/validate.js';
import {
  adminUserUpdateSchema,
  productoSchema,
  promocionSchema,
} from '../validation/catalogo.schema.js';

export const adminRouter = Router();

// Todo lo de aquí abajo exige sesión iniciada Y rol ADMIN.
adminRouter.use(requireAuth, requireRole('ADMIN'));

adminRouter.get('/promociones', adminController.listPromociones);
adminRouter.post(
  '/promociones',
  validateBody(promocionSchema),
  adminController.createPromocion
);
adminRouter.put(
  '/promociones/:id',
  validateBody(promocionSchema),
  adminController.updatePromocion
);
adminRouter.delete('/promociones/:id', adminController.deletePromocion);

adminRouter.get('/productos', adminController.listProductos);
adminRouter.post(
  '/productos',
  validateBody(productoSchema),
  adminController.createProducto
);
adminRouter.put(
  '/productos/:id',
  validateBody(productoSchema),
  adminController.updateProducto
);
adminRouter.delete('/productos/:id', adminController.deleteProducto);

adminRouter.get('/usuarios', adminController.listUsuarios);
adminRouter.put(
  '/usuarios/:id',
  validateBody(adminUserUpdateSchema),
  adminController.updateUsuario
);
adminRouter.delete('/usuarios/:id', adminController.deleteUsuario);

adminRouter.get('/logs', adminController.listLogs);
