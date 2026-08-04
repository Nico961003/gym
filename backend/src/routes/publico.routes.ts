import { Router } from 'express';
import * as publicoController from '../controllers/publico.controller.js';

export const publicoRouter = Router();

publicoRouter.get('/promociones', publicoController.promocionesVigentes);
publicoRouter.get('/productos', publicoController.productos);
