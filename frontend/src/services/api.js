// Capa de acceso al backend. Todas las funciones devuelven Promesas.
const BASE = '/api';

// Envuelve fetch: si el servidor responde con error (400, 404, 410...) lanza un
// Error con el mensaje que mandó Express, para mostrarlo en la interfaz.
const solicitar = (ruta, opciones = {}) =>
  fetch(`${BASE}${ruta}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones
  })
    .then((respuesta) =>
      respuesta
        .json()
        .catch(() => ({}))
        .then((datos) => {
          if (!respuesta.ok) {
            const error = new Error(datos.mensaje || 'Ocurrió un error inesperado');
            error.status = respuesta.status;
            throw error;
          }
          return datos;
        })
    )
    .catch((error) => {
      // fetch falla (TypeError) cuando el servidor está apagado
      if (error instanceof TypeError) {
        throw new Error('No se pudo conectar con el servidor. ¿Está encendido el backend?');
      }
      throw error;
    });

// Endpoint 1
export const obtenerMenu = () => solicitar('/menu');

// Endpoint 2
export const obtenerReserva = () => solicitar('/reserva');

// Endpoint 3
export const agregarPlato = (alimentoId, cantidad = 1) =>
  solicitar('/reserva/agregar', {
    method: 'POST',
    body: JSON.stringify({ alimentoId, cantidad })
  });

// Endpoint 4
export const actualizarPorciones = (id, cantidad) =>
  solicitar(`/reserva/actualizar-porciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ cantidad })
  });

// Endpoint 5
export const eliminarPlato = (id) => solicitar(`/reserva/eliminar/${id}`, { method: 'DELETE' });

// Extras
export const confirmarReserva = () => solicitar('/reserva/confirmar', { method: 'POST' });
export const iniciarReserva = () => solicitar('/reserva/iniciar', { method: 'POST' });

// Mis reservas
export const obtenerHistorial = () => solicitar('/reserva/historial');
export const cancelarReservaConfirmada = (id) =>
  solicitar(`/reserva/historial/${id}/cancelar`, { method: 'POST' });
