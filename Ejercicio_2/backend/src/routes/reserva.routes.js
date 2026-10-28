import { Router } from 'express';
import {
  obtenerReserva,
  agregarPlato,
  actualizarPorciones,
  eliminarPlato,
  confirmarReserva,
  cancelarReservaConfirmada,
  iniciarReserva,
  obtenerHistorial
} from '../services/reservaService.js';

const router = Router();


//reserva activa + saldo
router.get('/', (req, res) => {
  res.json(obtenerReserva());
});

//body: { alimentoId, cantidad }
router.post('/agregar', (req, res) => {
  const { alimentoId, cantidad } = req.body ?? {};
  res.status(201).json(agregarPlato(alimentoId, cantidad));
});

//body: { cantidad }
router.put('/actualizar-porciones/:id', (req, res) => {
  const id = Number(req.params.id);
  const { cantidad } = req.body ?? {};
  res.json(actualizarPorciones(id, cantidad));
});

// DELETE 
router.delete('/eliminar/:id', (req, res) => {
  res.json(eliminarPlato(Number(req.params.id)));
});

// --- Endpoints extra

//descuenta saldo y bloquea el stock
router.post('/confirmar', (req, res) => {
  res.json(confirmarReserva());
});

//nueva reserva
router.post('/iniciar', (req, res) => {
  res.status(201).json(iniciarReserva());
});

//todas las reservas confirmadas y canceladas
router.get('/historial', (req, res) => {
  res.json(obtenerHistorial());
});

//cancela una reserva confirmada
router.post('/historial/:id/cancelar', (req, res) => {
  res.json(cancelarReservaConfirmada(Number(req.params.id)));
});

export default router;
