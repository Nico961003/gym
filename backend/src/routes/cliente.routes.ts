import { Router } from 'express';
import * as clienteController from '../controllers/cliente.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const clienteRouter = Router();

clienteRouter.use(requireAuth);

clienteRouter.get('/panel', clienteController.miPanel);
clienteRouter.post('/asistencias', clienteController.registrarAsistencia);
