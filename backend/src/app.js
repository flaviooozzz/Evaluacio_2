import express from 'express';
import cors from 'cors';
import menuRoutes from './routes/menu.routes.js';
import reservaRoutes from './routes/reserva.routes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/menu', menuRoutes);
app.use('/api/reserva', reservaRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
