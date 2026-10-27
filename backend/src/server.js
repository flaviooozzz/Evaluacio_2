import app from './app.js';
import { verificarExpiracion } from './services/reservaService.js';

const PORT = process.env.PORT || 3001;

setInterval(verificarExpiracion, 1000);

app.listen(PORT, () => {
  console.log(`API Food DEI escuchando en http://localhost:${PORT}`);
});
