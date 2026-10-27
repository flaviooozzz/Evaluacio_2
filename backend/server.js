const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;
const DURACION_RESERVA_MS = 5 * 60 * 1000; // 5 minutos para completar la reserva

app.use(cors());
app.use(express.json());

// ---------- Datos en memoria ----------
const menu = [
  { id: 101, nombre: 'Menú Ejecutivo (Pollo)', precio: 5.5, stock: 12, categoria: 'Fuerte' },
  { id: 102, nombre: 'Pasta Alfredo', precio: 4.75, stock: 8, categoria: 'Fuerte' },
  { id: 103, nombre: 'Pupusas (3 unidades)', precio: 3.0, stock: 15, categoria: 'Fuerte' },
  { id: 104, nombre: 'Ensalada Fresca', precio: 3.25, stock: 6, categoria: 'Entrada' },
  { id: 105, nombre: 'Sopa de Gallina', precio: 4.0, stock: 0, categoria: 'Entrada' },
  { id: 106, nombre: 'Fresco de Horchata', precio: 1.5, stock: 20, categoria: 'Bebida' },
  { id: 107, nombre: 'Quesadilla', precio: 2.5, stock: 10, categoria: 'Postre' },
];

let saldoBase = 25;
let itemsReservados = []; // [{ id, cantidad }]
let expiraEn = null; // timestamp en ms
let reservaExpirada = false;

// ---------- Funciones auxiliares ----------
const redondear = (numero) => Math.round(numero * 100) / 100;

const buscarPlato = (id) => menu.find((plato) => plato.id === id);

const calcularTotal = () =>
  redondear(
    itemsReservados.reduce(
      (acumulado, item) => acumulado + buscarPlato(item.id).precio * item.cantidad,
      0
    )
  );

const liberarReserva = () => {
  itemsReservados.forEach((item) => {
    buscarPlato(item.id).stock += item.cantidad;
  });
  itemsReservados = [];
  expiraEn = null;
};

const verificarExpiracion = () => {
  if (expiraEn && Date.now() > expiraEn) {
    liberarReserva();
    reservaExpirada = true;
  }
};

const estadoReserva = () => {
  const total = calcularTotal();
  return {
    saldo: redondear(saldoBase - total),
    itemsReservados,
    total,
    expiraEn,
    expirada: reservaExpirada,
  };
};

// Antes de cada petición se revisa si la reserva ya venció
app.use('/api', (req, res, next) => {
  verificarExpiracion();
  next();
});

// ---------- Endpoints ----------

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});