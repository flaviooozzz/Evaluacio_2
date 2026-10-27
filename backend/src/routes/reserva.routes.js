import { Router } from 'express';
import {
  obtenerReserva,
  agregarPlato,
  actualizarPorciones,
  eliminarPlato,
  confirmarReserva,
  iniciarReserva,
  obtenerHistorial
} from '../services/reservaService.js';

const router = Router();

// --- Los 5 endpoints obligatorios -----------------------------------------

// GET /api/reserva -> reserva activa + saldo
router.get('/', (req, res) => {
  res.json(obtenerReserva());
});

// POST /api/reserva/agregar  body: { alimentoId, cantidad }
router.post('/agregar', (req, res) => {
  const { alimentoId, cantidad } = req.body ?? {};
  res.status(201).json(agregarPlato(alimentoId, cantidad));
});

// PUT /api/reserva/actualizar-porciones/:id  body: { cantidad }
router.put('/actualizar-porciones/:id', (req, res) => {
  const id = Number(req.params.id);
  const { cantidad } = req.body ?? {};
  res.json(actualizarPorciones(id, cantidad));
});

// DELETE /api/reserva/eliminar/:id
router.delete('/eliminar/:id', (req, res) => {
  res.json(eliminarPlato(Number(req.params.id)));
});

// --- Endpoints extra (confirmar / reiniciar / historial) -------------------

// POST /api/reserva/confirmar -> descuenta saldo y bloquea el stock
router.post('/confirmar', (req, res) => {
  res.json(confirmarReserva());
});

// POST /api/reserva/iniciar -> nueva reserva (tras confirmar o expirar)
router.post('/iniciar', (req, res) => {
  res.status(201).json(iniciarReserva());
});

// GET /api/reserva/historial -> reservas confirmadas
router.get('/historial', (req, res) => {
  res.json(obtenerHistorial());
});

export default router;
