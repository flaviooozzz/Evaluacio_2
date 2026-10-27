import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, CardText, Button, Badge } from 'reactstrap';
import './App.css';

function App() {
  const [menu, setMenu] = useState([
    { id: 1, nombre: 'Hamburguesa Sencilla', precio: 5.50, stock: 5 },
    { id: 2, nombre: 'Pizza de Pepperoni', precio: 8.99, stock: 0 },
    { id: 3, nombre: 'Ensalada César', precio: 4.25, stock: 3 }
  ]);
  const [saldo, setSaldo] = useState(50.00);
  const [gasto, setGasto] = useState(0.00);

  // PREPARACIÓN PARA EL BACKEND (Cuando esté listo el servidor, solo hay que quitar los comentarios /* */)
  /*
  useEffect(() => {
    fetch('http://localhost:3000/api/menu')
      .then(res => res.json())
      .then(data => setMenu(data))
      .catch(err => console.error("Error al cargar menú:", err));
  }, []);
  */

  return (
    <Container className="py-4">
      <h2 className="text-center mb-4 text-primary fw-bold">Food DEI S.A.</h2>

      <div className="d-flex justify-content-between align-items-center bg-light p-3 mb-4 rounded shadow-sm border">
        <h5 className="text-success mb-0">Saldo Disponible: ${saldo.toFixed(2)}</h5>
        <h5 className="text-danger mb-0">Gasto Actual: ${gasto.toFixed(2)}</h5>
      </div>

      <Row>
        {/* COLUMNA IZQUIERDA: Tu Catálogo */}
        <Col md="8">
          <h4>Menú del Día</h4>
          <Row className="mt-3">
            {menu.map((plato) => (
              <Col md="6" className="mb-4" key={plato.id}>
                <Card className="h-100 shadow-sm">
                  <CardBody className="d-flex flex-column">
                    <CardTitle tag="h5" className="text-dark">{plato.nombre}</CardTitle>
                    <CardText className="mb-4">
                      Precio: <strong>${plato.precio.toFixed(2)}</strong> <br />
                      Stock Disponible: <Badge color={plato.stock > 0 ? "info" : "danger"}>{plato.stock}</Badge>
                    </CardText>
                    <Button 
                      color={plato.stock > 0 ? "primary" : "secondary"} 
                      className="mt-auto fw-bold"
                      disabled={plato.stock === 0}
                    >
                      {plato.stock > 0 ? "+ Añadir al Carrito" : "Agotado"}
                    </Button>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        {/* COLUMNA DERECHA: El espacio reservado para tu compañero */}
        <Col md="4">
          <div className="p-3 bg-light rounded border h-100">
            <h4 className="text-center">🛒 Mi Carrito</h4>
            <p className="text-muted text-center mt-4">
              (Aquí programará tu compañero)
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
