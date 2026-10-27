import { ListGroup, ListGroupItem, ButtonGroup, Button, Alert } from 'reactstrap';
import { formatearDinero, emojiDePlato } from '../utils.js';

// Bandeja lateral (ticket): lista la reserva, sube/baja porciones, quita platos y confirma.
function BandejaReserva({ reserva, menu, cargando, onCambiarPorciones, onQuitar, onConfirmar, onNueva }) {
  const confirmada = reserva.estado === 'confirmada';

  // Une cada item de la reserva ({id, cantidad}) con los datos del menú (nombre, precio)
  const lineas = reserva.itemsReservados
    .map((item) => ({ ...item, plato: menu.find((plato) => plato.id === item.id) }))
    .filter((linea) => linea.plato !== undefined);

  return (
    <div className="mc-ticket bandeja-sticky">
      <div className="mc-ticket-head">🧾 Tu Bandeja de Reserva</div>

      <div className="p-3">
        {confirmada && (
          <Alert color="success" className="small">
            ¡Reserva confirmada! Se descontaron {formatearDinero(reserva.total)}. Si quitas un plato, su dinero
            vuelve a tu saldo.
          </Alert>
        )}

        {lineas.length === 0 ? (
          <p className="text-muted mb-3">
            {confirmada
              ? 'Cancelaste todos los platos. Tu dinero ya volvió al saldo.'
              : 'Aún no has agregado platos. Al añadir el primero empezará a correr el tiempo de tu reserva.'}
          </p>
        ) : (
          <ListGroup flush className="mb-3">
            {lineas.map(({ id, cantidad, plato }) => (
              <ListGroupItem key={id} className="px-0">
                <div className="d-flex justify-content-between align-items-start">
                  <span className="fw-bold">
                    {emojiDePlato(plato)} {plato.nombre}
                  </span>
                  <span className="fw-bold">{formatearDinero(plato.precio * cantidad)}</span>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-2">
                  <ButtonGroup size="sm">
                    <Button
                      outline
                      color="secondary"
                      disabled={cargando || confirmada || cantidad <= 1}
                      onClick={() => onCambiarPorciones(id, cantidad - 1)}
                    >
                      -
                    </Button>
                    <Button outline color="secondary" disabled className="px-3 fw-bold">
                      {cantidad}
                    </Button>
                    <Button
                      outline
                      color="secondary"
                      disabled={cargando || confirmada}
                      onClick={() => onCambiarPorciones(id, cantidad + 1)}
                    >
                      +
                    </Button>
                  </ButtonGroup>

                  <Button color="danger" outline size="sm" disabled={cargando} onClick={() => onQuitar(id)}>
                    Quitar
                  </Button>
                </div>
              </ListGroupItem>
            ))}
          </ListGroup>
        )}

        <div className="d-flex justify-content-between mb-3 mc-ticket-total">
          <span>TOTAL</span>
          <span>{formatearDinero(reserva.total)}</span>
        </div>

        {confirmada ? (
          <Button color="primary" className="w-100" onClick={onNueva} disabled={cargando}>
            Iniciar nueva reserva
          </Button>
        ) : (
          <Button color="success" className="w-100 py-2" disabled={cargando || lineas.length === 0} onClick={onConfirmar}>
            Confirmar reserva
          </Button>
        )}
      </div>
    </div>
  );
}

export default BandejaReserva;
