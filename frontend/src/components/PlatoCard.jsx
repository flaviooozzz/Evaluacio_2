import { Card, CardBody, CardTitle, CardSubtitle, Badge, Button } from 'reactstrap';
import { formatearDinero, emojiDePlato } from '../utils.js';

function PlatoCard({ plato, deshabilitar, onAgregar }) {
  const agotado = plato.stock === 0;
  const pocasUnidades = !agotado && plato.stock <= 3;

  return (
    <Card className={`mc-card mb-3 h-100 ${agotado ? 'plato-agotado' : ''}`}>
      <div className="mc-card-art">
        <span className="mc-emoji">{emojiDePlato(plato)}</span>
        {agotado && <span className="mc-ribbon">Agotado</span>}
        {pocasUnidades && <span className="mc-ribbon mc-ribbon-red">¡Últimas {plato.stock}!</span>}
      </div>

      <CardBody className="d-flex flex-column">
        <CardTitle tag="h5" className="mb-0">
          {plato.nombre}
        </CardTitle>
        <CardSubtitle className="mb-2 text-muted small text-uppercase fw-bold">{plato.categoria}</CardSubtitle>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <Badge color="success" className="mc-precio">
            {formatearDinero(plato.precio)}
          </Badge>
          <span className="small">
            Stock: <strong>{plato.stock}</strong>
          </span>
        </div>

        {agotado ? (
          <Button color="secondary" disabled className="mt-auto">
            Agotado
          </Button>
        ) : (
          <Button color="primary" className="mt-auto" disabled={deshabilitar} onClick={() => onAgregar(plato.id)}>
            Añadir a la Reserva
          </Button>
        )}
      </CardBody>
    </Card>
  );
}

export default PlatoCard;
