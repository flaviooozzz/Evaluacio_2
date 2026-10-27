import { useState } from 'react';
import { Row, Col, Button } from 'reactstrap';
import PlatoCard from './PlatoCard.jsx';
import { emojiDeCategoria } from '../utils.js';

// Cuadrícula del menú con filtro por categoría.
function MenuDelDia({ menu, deshabilitar, onAgregar }) {
  const [categoria, setCategoria] = useState('Todas');

  // Arreglo de categorías únicas derivado del menú
  const categorias = ['Todas', ...new Set(menu.map((plato) => plato.categoria))];
  const platosVisibles = categoria === 'Todas' ? menu : menu.filter((plato) => plato.categoria === categoria);

  return (
    <section>
      <h3 className="mb-3">Menú del día</h3>
      <div className="d-flex flex-wrap gap-2 mb-4">
        {categorias.map((nombre) => (
          <Button
            key={nombre}
            size="sm"
            className={`mc-pill ${categoria === nombre ? 'active' : ''}`}
            onClick={() => setCategoria(nombre)}
          >
            {emojiDeCategoria(nombre)} {nombre}
          </Button>
        ))}
      </div>

      <Row>
        {platosVisibles.map((plato) => (
          <Col xs="12" md="4" key={plato.id}>
            <PlatoCard plato={plato} deshabilitar={deshabilitar} onAgregar={onAgregar} />
          </Col>
        ))}
      </Row>
    </section>
  );
}

export default MenuDelDia;
