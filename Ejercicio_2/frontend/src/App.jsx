import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Spinner, Alert, Button } from 'reactstrap';
import * as api from './services/api.js';
import PanelUsuario from './components/PanelUsuario.jsx';
import MenuDelDia from './components/MenuDelDia.jsx';
import BandejaReserva from './components/BandejaReserva.jsx';
import ModalExpirada from './components/ModalExpirada.jsx';
import MisReservas from './components/MisReservas.jsx';
import { formatearDinero } from './utils.js';

function App() {
  const [menu, setMenu] = useState([]); // arreglo de platos
  const [reserva, setReserva] = useState(null); // objeto con la reserva y el saldo
  const [historial, setHistorial] = useState([]); // reservas confirmadas / canceladas
  const [verReservas, setVerReservas] = useState(false); // modal "Mis reservas" abierto
  const [segundos, setSegundos] = useState(0); // cuenta regresiva
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [cargando, setCargando] = useState(false); // hay una petición en curso
  const [error, setError] = useState(null); // { id, mensaje }
  const [aviso, setAviso] = useState(null); // { id, mensaje } confirmación de éxito

  const mostrarError = (err) => {
    setAviso(null);
    setError({ id: Date.now(), mensaje: err.message });
  };

  // Pide menú, reserva e historial al mismo tiempo y sincroniza el estado de React.
  const refrescar = useCallback(
    () =>
      Promise.all([api.obtenerMenu(), api.obtenerReserva(), api.obtenerHistorial()]).then(
        ([menuActual, reservaActual, historialActual]) => {
          setMenu(menuActual);
          setReserva(reservaActual);
          setHistorial(historialActual);
        }
      ),
    []
  );

  // Carga inicial al montar el componente
  useEffect(() => {
    refrescar()
      .catch(mostrarError)
      .finally(() => setCargandoInicial(false));
  }, [refrescar]);

  // Cuenta regresiva: se reinicia cada vez que cambia la hora de expiración.
  const expiraEn = reserva?.expiraEn ?? null;
  const segundosIniciales = reserva?.segundosRestantes ?? 0;
  useEffect(() => {
    if (!expiraEn) {
      setSegundos(0);
      return undefined;
    }
    const limite = Date.now() + segundosIniciales * 1000;
    setSegundos(segundosIniciales);

    const intervalo = setInterval(() => {
      const restante = Math.max(0, Math.ceil((limite - Date.now()) / 1000));
      setSegundos(restante);
      if (restante === 0) {
        clearInterval(intervalo);
        refrescar().catch(mostrarError); // el backend ya cerró la reserva
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, [expiraEn]); // eslint-disable-line react-hooks/exhaustive-deps

  // El aviso de éxito desaparece solo después de 15 segundos
  useEffect(() => {
    if (!aviso) return undefined;
    const timer = setTimeout(() => setAviso(null), 15000);
    return () => clearTimeout(timer);
  }, [aviso]);

  // El error desaparece solo después de 15 segundos 
  useEffect(() => {
    if (!error) return undefined;
    const timer = setTimeout(() => setError(null), 15000);
    return () => clearTimeout(timer);
  }, [error]);

  // Ejecuta una acción del API, refresca los datos y captura los errores de negocio.
  const ejecutar = async (accion, mensajeExito = null) => {
    setCargando(true);
    try {
      await accion();
      setError(null);
      if (mensajeExito) setAviso({ id: Date.now(), mensaje: mensajeExito });
    } catch (err) {
      mostrarError(err); // ej. "Stock insuficiente", "Saldo insuficiente para esta cantidad"
    }
    try {
      await refrescar(); // refleja también lo que pasó en el servidor (ej. expiración)
    } catch (err) {
      mostrarError(err);
    } finally {
      setCargando(false);
    }
  };

  const handleAgregar = (id) => ejecutar(() => api.agregarPlato(id, 1));
  const handleCambiarPorciones = (id, cantidad) => ejecutar(() => api.actualizarPorciones(id, cantidad));
  const handleQuitar = (id) => {
    const linea = reserva.itemsReservados.find((item) => item.id === id);
    const plato = menu.find((p) => p.id === id);
    const monto = linea && plato ? formatearDinero(plato.precio * linea.cantidad) : '';
    const mensaje = plato
      ? reserva.estado === 'confirmada'
        ? `Quitaste ${plato.nombre}. Se devolvieron ${monto} a tu saldo.`
        : `Quitaste ${plato.nombre}. Las porciones volvieron al menú y se liberaron ${monto}.`
      : null;
    return ejecutar(() => api.eliminarPlato(id), mensaje);
  };
  const handleConfirmar = () => ejecutar(() => api.confirmarReserva());
  const handleNueva = () => ejecutar(() => api.iniciarReserva());

  // --- Mis reservas ---
  const abrirReservas = () => {
    setAviso(null);
    setError(null);
    setVerReservas(true);
  };
  const handleCancelarReserva = (id) => {
    const registro = historial.find((r) => r.id === id);
    const monto = registro ? formatearDinero(registro.total) : '';
    return ejecutar(
      () => api.cancelarReservaConfirmada(id),
      `Reserva #${id} cancelada. Se devolvieron ${monto} a tu saldo.`
    );
  };

  if (cargandoInicial) {
    return (
      <div className="text-center mt-5">
        <Spinner color="primary" />
        <p className="mt-2">Cargando...</p>
      </div>
    );
  }

  if (!reserva) {
    return (
      <Container className="mt-4">
        {error && (
          <Alert color="warning" toggle={() => setError(null)} key={error.id}>
            {error.mensaje}
          </Alert>
        )}
      </Container>
    );
  }

  const bloqueado = cargando || reserva.estado === 'confirmada' || reserva.estado === 'expirada';
  const reservasConfirmadas = historial.filter((r) => r.estado === 'confirmada').length;

  return (
    <>
      <PanelUsuario reserva={reserva} segundos={segundos} cargando={cargando} />

      <section className="mc-hero">
        <Container className="d-flex flex-wrap align-items-end justify-content-between gap-3">
          <div>
            <h1>¡Arma tu almuerzo!</h1>
            <p>Porciones limitadas para evitar el desperdicio. Completa tu reserva antes de que se acabe el tiempo.</p>
          </div>
          <Button color="primary" onClick={abrirReservas}>
            📋 Mis reservas{reservasConfirmadas > 0 ? ` (${reservasConfirmadas})` : ''}
          </Button>
        </Container>
      </section>

      <Container className="py-4">
        {aviso && (
          <Alert color="success" toggle={() => setAviso(null)} key={aviso.id}>
            {aviso.mensaje}
          </Alert>
        )}
        {error && (
          <Alert color="warning" toggle={() => setError(null)} key={error.id}>
            {error.mensaje}
          </Alert>
        )}

        <Row>
          <Col lg="8" className="mb-4">
            <MenuDelDia menu={menu} deshabilitar={bloqueado} onAgregar={handleAgregar} />
          </Col>
          <Col lg="4">
            <BandejaReserva
              reserva={reserva}
              menu={menu}
              cargando={cargando}
              onCambiarPorciones={handleCambiarPorciones}
              onQuitar={handleQuitar}
              onConfirmar={handleConfirmar}
              onNueva={handleNueva}
            />
          </Col>
        </Row>
      </Container>

      <footer className="mc-footer">Food DEI S.A. de R.L. · Reserva hoy, sin desperdicio 🍟</footer>

      <ModalExpirada abierto={reserva.estado === 'expirada'} cargando={cargando} onReiniciar={handleNueva} />

      <MisReservas
        abierto={verReservas}
        historial={historial}
        saldo={reserva.saldo}
        cargando={cargando}
        aviso={aviso}
        error={error}
        onCerrar={() => setVerReservas(false)}
        onCancelar={handleCancelarReserva}
      />
    </>
  );
}

export default App;