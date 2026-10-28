import { Navbar, NavbarBrand, Badge, Spinner, Progress } from 'reactstrap';
import { formatearDinero, formatearTiempo } from '../utils.js';

// Encabezado fijo: saldo, total de la reserva y tiempo restante (con barra de progreso).
function PanelUsuario({ reserva, segundos, cargando }) {
  const reservaActiva = reserva.estado === 'activa';
  const porcentaje = reserva.duracionSegundos > 0 ? (segundos / reserva.duracionSegundos) * 100 : 0;

  return (
    <header className="mc-header-wrap">
      <Navbar dark expand="md" className="mc-header flex-wrap">
        <NavbarBrand href="/" className="mc-brand m-0">
          <span className="mc-brand-logo">🍔</span>
          Food DEI
        </NavbarBrand>

        <div className="d-flex align-items-center flex-wrap gap-2">
          {cargando && (
            <span className="text-white small fw-bold">
              <Spinner size="sm" className="me-1" />
              Cargando...
            </span>
          )}

          <span className="mc-chip mc-chip-saldo">
            Tu saldo actual: <strong>{formatearDinero(reserva.saldoDisponible)}</strong>
          </span>

          <span className="mc-chip mc-chip-total">
            Total de tu Reserva:
            <Badge color="dark" pill className="fs-6">
              {formatearDinero(reserva.total)}
            </Badge>
          </span>

          {reservaActiva && (
            <span className={`mc-chip mc-chip-tiempo ${segundos <= 60 ? 'urgente' : ''}`}>
              ⏱ {formatearTiempo(segundos)}
            </span>
          )}
        </div>
      </Navbar>

      {reservaActiva && <Progress value={porcentaje} className="mc-progress" />}
    </header>
  );
}

export default PanelUsuario;
