import { Router } from 'express';
import { obtenerMenu } from '../services/reservaService.js';

const router = Router();

// GET /api/menu -> lista completa de platos con precio y stock
router.get('/', (req, res) => {
  res.json(obtenerMenu());
});

export default router;
