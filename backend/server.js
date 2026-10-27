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

// 1. Menú del día
app.get('/api/menu', (req, res) => {
  res.json(menu);
});

// 2. Reserva actual y saldo
app.get('/api/reserva', (req, res) => {
  res.json(estadoReserva());
});

// 3. Agregar plato a la reserva
app.post('/api/reserva/agregar', (req, res) => {
  const { alimentoId, cantidad } = req.body ?? {};

  if (!Number.isInteger(alimentoId) || !Number.isInteger(cantidad) || cantidad < 1) {
    return res.status(400).json({ message: 'Datos inválidos' });
  }

  const plato = buscarPlato(alimentoId);
  if (!plato) {
    return res.status(404).json({ message: 'Alimento no encontrado' });
  }

  if (plato.stock < cantidad) {
    return res.status(400).json({ message: 'Stock insuficiente' });
  }

  if (redondear(calcularTotal() + plato.precio * cantidad) > saldoBase) {
    return res.status(400).json({ message: 'Saldo insuficiente para esta cantidad' });
  }

  plato.stock -= cantidad;

  const itemExistente = itemsReservados.find((item) => item.id === alimentoId);
  if (itemExistente) {
    itemExistente.cantidad += cantidad;
  } else {
    itemsReservados.push({ id: alimentoId, cantidad });
  }

  // El reloj empieza cuando se agrega el primer plato
  if (!expiraEn) {
    expiraEn = Date.now() + DURACION_RESERVA_MS;
  }
  reservaExpirada = false;

  res.status(201).json(estadoReserva());
});

// 4. Subir o bajar porciones
app.put('/api/reserva/actualizar-porciones/:id', (req, res) => {
  const id = Number(req.params.id);
  const { cantidad } = req.body ?? {};

  const item = itemsReservados.find((reservado) => reservado.id === id);
  if (!item) {
    return res.status(404).json({ message: 'El platillo no está en tu reserva' });
  }

  if (!Number.isInteger(cantidad) || cantidad < 1) {
    return res.status(400).json({ message: 'La cantidad mínima es 1' });
  }

  const plato = buscarPlato(id);
  const diferencia = cantidad - item.cantidad;

  if (diferencia > plato.stock) {
    return res.status(400).json({ message: 'Stock insuficiente' });
  }

  if (redondear(calcularTotal() + diferencia * plato.precio) > saldoBase) {
    return res.status(400).json({ message: 'Saldo insuficiente para esta cantidad' });
  }

  plato.stock -= diferencia;
  item.cantidad = cantidad;

  res.json(estadoReserva());
});

// 5. Quitar un platillo y devolver el stock
app.delete('/api/reserva/eliminar/:id', (req, res) => {
  const id = Number(req.params.id);

  const item = itemsReservados.find((reservado) => reservado.id === id);
  if (!item) {
    return res.status(404).json({ message: 'El platillo no está en tu reserva' });
  }

  buscarPlato(id).stock += item.cantidad;
  itemsReservados = itemsReservados.filter((reservado) => reservado.id !== id);

  if (itemsReservados.length === 0) {
    expiraEn = null;
  }

  res.json(estadoReserva());
});

// Extra: confirmar la reserva (bloquea el stock y descuenta el saldo)
app.post('/api/reserva/confirmar', (req, res) => {
  if (itemsReservados.length === 0) {
    return res.status(400).json({ message: 'Tu reserva está vacía' });
  }

  saldoBase = redondear(saldoBase - calcularTotal());
  itemsReservados = [];
  expiraEn = null;

  res.json({ message: 'Reserva confirmada', ...estadoReserva() });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});