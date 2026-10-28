import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, Button, UncontrolledAlert } from 'reactstrap';
import { formatearDinero } from '../utils.js';

const formatearFecha = (iso) =>
  new Date(iso).toLocaleString('es-SV', { dateStyle: 'medium', timeStyle: 'short' });

// Modal con todas las reservas confirmadas: detalle de platos, total y botón para cancelar.
function MisReservas({ abierto, historial, saldo, cargando, aviso, error, onCerrar, onCancelar }) {
  const [confirmandoId, setConfirmandoId] = useState(null); // reserva pendiente de confirmar cancelación

  const cancelar = async (id) => {
    await onCancelar(id);
    setConfirmandoId(null);
  };

  return (
    <Modal isOpen={abierto} toggle={onCerrar} centered scrollable size="lg" contentClassName="mc-modal">
      <ModalHeader toggle={onCerrar}>
        Mis reservas · Saldo: {formatearDinero(saldo)}
      </ModalHeader>
      <ModalBody>
        {aviso && (
          <UncontrolledAlert color="success" key={aviso.id}>
            {aviso.mensaje}
          </UncontrolledAlert>
        )}
        {error && (
          <UncontrolledAlert color="warning" key={error.id}>
            {error.mensaje}
          </UncontrolledAlert>
        )}

        {historial.length === 0 && (
          <p className="text-muted mb-0">Aún no tienes reservas confirmadas.</p>
        )}

        {historial.map((reserva) => {
          const activa = reserva.estado === 'confirmada';
          return (
            <div key={reserva.id} className="mc-ticket mb-3" style={{ opacity: activa ? 1 : 0.6 }}>
              <div className="mc-ticket-head d-flex justify-content-between align-items-center">
                <span>Reserva #{reserva.id}</span>
                <span className={`badge ${activa ? 'bg-success' : 'bg-dark'}`}>
                  {activa ? 'Confirmada' : 'Cancelada'}
                </span>
              </div>

              <div className="p-3">
                <p className="text-muted small mb-2">
                  {activa
                    ? `Confirmada el ${formatearFecha(reserva.confirmadaEn)}`
                    : `Cancelada el ${formatearFecha(reserva.canceladaEn)}`}
                </p>

                <ul className="list-group mb-3">
                  {reserva.items.map((item) => (
                    <li key={item.id} className="list-group-item d-flex justify-content-between">
                      <span>
                        {item.cantidad} × {item.nombre}
                      </span>
                      <span>{formatearDinero(item.precio * item.cantidad)}</span>
                    </li>
                  ))}
                </ul>

                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <strong>
                    {activa ? 'Total' : 'Total devuelto'}: {formatearDinero(reserva.total)}
                  </strong>

                  {activa && confirmandoId !== reserva.id && (
                    <Button
                      color="danger"
                      outline
                      size="sm"
                      disabled={cargando}
                      onClick={() => setConfirmandoId(reserva.id)}
                    >
                      Cancelar reserva
                    </Button>
                  )}

                  {activa && confirmandoId === reserva.id && (
                    <span className="d-flex align-items-center gap-2">
                      <small>
                        ¿Cancelar y recuperar {formatearDinero(reserva.total)}?
                      </small>
                      <Button color="danger" size="sm" disabled={cargando} onClick={() => cancelar(reserva.id)}>
                        Sí, cancelar
                      </Button>
                      <Button
                        color="secondary"
                        outline
                        size="sm"
                        disabled={cargando}
                        onClick={() => setConfirmandoId(null)}
                      >
                        No
                      </Button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </ModalBody>
    </Modal>
  );
}

export default MisReservas;


