import { crearMenuInicial, SALDO_INICIAL } from '../data/menu.js';
import { HttpError } from '../utils/HttpError.js';

// ---------------------------------------------------------------------------
// Estado en memoria del servidor
// ---------------------------------------------------------------------------
const DURACION_SEG = Number(process.env.RESERVA_DURACION_SEG) || 300;

const menu = crearMenuInicial(); // arreglo de platos (stock vivo)
const estado = {
  saldo: SALDO_INICIAL, // saldo confirmado (solo baja al confirmar)
  items: [], // [{ id, cantidad }]
  fase: 'vacia', // 'vacia' | 'activa' | 'expirada' | 'confirmada'
  expiraEn: null, // timestamp (ms) en que vence la reserva activa
  confirmadaId: null // id del registro del historial que se muestra como "confirmada"
};
// Reservas confirmadas: { id, items, total, confirmadaEn, estado, canceladaEn }
// estado: 'confirmada' | 'cancelada'
const historial = [];
let siguienteId = 1;

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
// Redondea a 2 decimales para evitar errores de coma flotante (0.1 + 0.2).
const redondear = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const buscarPlato = (id) => menu.find((plato) => plato.id === id);
const buscarItem = (id) => estado.items.find((item) => item.id === id);

const calcularTotal = () =>
  redondear(
    estado.items.reduce((acumulado, item) => {
      const plato = buscarPlato(item.id);
      return acumulado + plato.precio * item.cantidad;
    }, 0)
  );

// Devuelve al stock del menú todas las porciones que tenía la reserva.
const liberarItems = () => {
  estado.items.forEach((item) => {
    buscarPlato(item.id).stock += item.cantidad;
  });
  estado.items = [];
};

const esEnteroPositivo = (valor) => Number.isInteger(valor) && valor > 0;

// ---------------------------------------------------------------------------
// Expiración: si se acabó el tiempo, se cierra la reserva y se libera el stock
// ---------------------------------------------------------------------------
export const verificarExpiracion = () => {
  if (estado.fase === 'activa' && Date.now() >= estado.expiraEn) {
    liberarItems();
    estado.fase = 'expirada';
    estado.expiraEn = null;
    return true;
  }
  return false;
};

// Valida que se pueda modificar la reserva (no confirmada ni expirada).
const asegurarModificable = () => {
  verificarExpiracion();
  if (estado.fase === 'expirada') {
    throw new HttpError(410, 'La reserva expiró por tiempo. Inicia una nueva reserva.');
  }
  if (estado.fase === 'confirmada') {
    throw new HttpError(409, 'La reserva ya fue confirmada. Inicia una nueva reserva.');
  }
};

// ---------------------------------------------------------------------------
// Casos de uso (los llaman las rutas)
// ---------------------------------------------------------------------------
export const obtenerMenu = () => menu.map((plato) => ({ ...plato }));

export const obtenerReserva = () => {
  verificarExpiracion();
  const total = calcularTotal();
  const segundosRestantes =
    estado.fase === 'activa' ? Math.max(0, Math.ceil((estado.expiraEn - Date.now()) / 1000)) : 0;

  return {
    saldo: redondear(estado.saldo),
    // Tras confirmar, el saldo ya fue descontado: no se resta el total otra vez.
    saldoDisponible: estado.fase === 'confirmada' ? redondear(estado.saldo) : redondear(estado.saldo - total),
    itemsReservados: estado.items.map((item) => ({ ...item })),
    total,
    estado: estado.fase,
    expiraEn: estado.expiraEn ? new Date(estado.expiraEn).toISOString() : null,
    segundosRestantes,
    duracionSegundos: DURACION_SEG
  };
};

export const agregarPlato = (alimentoId, cantidad) => {
  if (!Number.isInteger(alimentoId) || !esEnteroPositivo(cantidad)) {
    throw new HttpError(400, 'Datos inválidos: alimentoId y cantidad deben ser enteros positivos');
  }
  asegurarModificable();

  const plato = buscarPlato(alimentoId);
  if (!plato) throw new HttpError(404, 'El platillo no existe');
  if (plato.stock < cantidad) throw new HttpError(400, 'Stock insuficiente');

  if (calcularTotal() + plato.precio * cantidad > estado.saldo + 1e-9) {
    throw new HttpError(400, 'Saldo insuficiente para esta cantidad');
  }

  const existente = buscarItem(alimentoId);
  if (existente) existente.cantidad += cantidad;
  else estado.items.push({ id: alimentoId, cantidad });

  plato.stock -= cantidad; // bloqueo temporal del stock

  if (estado.fase === 'vacia') {
    estado.fase = 'activa';
    estado.expiraEn = Date.now() + DURACION_SEG * 1000; // arranca el reloj
  }
  return obtenerReserva();
};

export const actualizarPorciones = (id, nuevaCantidad) => {
  if (!Number.isInteger(id) || !esEnteroPositivo(nuevaCantidad)) {
    throw new HttpError(400, 'La cantidad debe ser un entero mayor o igual a 1');
  }
  asegurarModificable();

  const item = buscarItem(id);
  if (!item) throw new HttpError(404, 'El platillo no está en tu reserva');
  const plato = buscarPlato(id);

  const diferencia = nuevaCantidad - item.cantidad; // >0 sube, <0 baja
  if (diferencia > plato.stock) throw new HttpError(400, 'Stock insuficiente');
  if (diferencia > 0 && calcularTotal() + plato.precio * diferencia > estado.saldo + 1e-9) {
    throw new HttpError(400, 'Saldo insuficiente para esta cantidad');
  }

  item.cantidad = nuevaCantidad;
  plato.stock -= diferencia; // si baja, devuelve unidades al stock
  return obtenerReserva();
};

// Quita un platillo de la reserva y devuelve las porciones al stock.
// Si la reserva ya estaba confirmada, además se REEMBOLSA el dinero al saldo.
export const eliminarPlato = (id) => {
  if (!Number.isInteger(id)) throw new HttpError(400, 'Id inválido');
  verificarExpiracion();
  if (estado.fase === 'expirada') {
    throw new HttpError(410, 'La reserva expiró por tiempo. Inicia una nueva reserva.');
  }

  const posicion = estado.items.findIndex((item) => item.id === id);
  if (posicion === -1) throw new HttpError(404, 'El platillo no está en tu reserva');

  const [removido] = estado.items.splice(posicion, 1);
  const plato = buscarPlato(id);
  plato.stock += removido.cantidad; // devuelve al stock general

  if (estado.fase === 'confirmada') {
    const reembolso = redondear(plato.precio * removido.cantidad);
    estado.saldo = redondear(estado.saldo + reembolso); // reembolso

    const registro = historial.find((r) => r.id === estado.confirmadaId);
    if (registro) {
      if (estado.items.length === 0) {
        // Se quitó el último plato: la reserva queda cancelada (se conserva en el historial)
        registro.items = [{ ...removido }];
        registro.total = reembolso;
        registro.estado = 'cancelada';
        registro.canceladaEn = new Date().toISOString();
      } else {
        registro.items = estado.items.map((item) => ({ ...item }));
        registro.total = calcularTotal();
      }
    }
  }

  if (estado.items.length === 0) {
    estado.fase = 'vacia'; // sin platos no hay reloj corriendo
    estado.expiraEn = null;
    estado.confirmadaId = null;
  }
  return obtenerReserva();
};

export const confirmarReserva = () => {
  asegurarModificable();
  if (estado.items.length === 0) throw new HttpError(400, 'Tu reserva está vacía');

  const total = calcularTotal();
  if (total > estado.saldo + 1e-9) throw new HttpError(400, 'Saldo insuficiente para esta cantidad');

  estado.saldo = redondear(estado.saldo - total);
  estado.fase = 'confirmada';
  estado.expiraEn = null;

  const id = siguienteId++;
  historial.push({
    id,
    items: estado.items.map((item) => ({ ...item })),
    total,
    confirmadaEn: new Date().toISOString(),
    estado: 'confirmada',
    canceladaEn: null
  });
  estado.confirmadaId = id;

  return obtenerReserva(); // el stock queda bloqueado definitivamente
};

// Cancela una reserva ya confirmada (desde "Mis reservas"):
// devuelve el dinero al saldo, regresa las porciones al stock y la marca como cancelada.
export const cancelarReservaConfirmada = (id) => {
  if (!Number.isInteger(id)) throw new HttpError(400, 'Id inválido');
  verificarExpiracion();

  const registro = historial.find((r) => r.id === id);
  if (!registro) throw new HttpError(404, 'La reserva no existe');
  if (registro.estado === 'cancelada') throw new HttpError(409, 'Esta reserva ya fue cancelada');

  registro.items.forEach((item) => {
    buscarPlato(item.id).stock += item.cantidad; // devuelve las porciones al menú
  });
  estado.saldo = redondear(estado.saldo + registro.total); // reembolso completo
  registro.estado = 'cancelada';
  registro.canceladaEn = new Date().toISOString();

  // Si esa reserva seguía mostrándose como confirmada en la bandeja, se vacía.
  if (estado.confirmadaId === id) {
    estado.items = [];
    estado.fase = 'vacia';
    estado.expiraEn = null;
    estado.confirmadaId = null;
  }
  return obtenerReserva();
};

// Empieza una reserva nueva. Si había una activa, libera sus porciones.
export const iniciarReserva = () => {
  verificarExpiracion();
  if (estado.fase === 'activa') liberarItems();
  estado.items = [];
  estado.fase = 'vacia';
  estado.expiraEn = null;
  estado.confirmadaId = null;
  return obtenerReserva();
};

// Historial con el detalle de cada plato (nombre y precio), la más reciente primero.
export const obtenerHistorial = () =>
  historial
    .map((reserva) => ({
      ...reserva,
      items: reserva.items.map((item) => {
        const plato = buscarPlato(item.id);
        return { id: item.id, nombre: plato.nombre, precio: plato.precio, cantidad: item.cantidad };
      })
    }))
    .reverse();
    
