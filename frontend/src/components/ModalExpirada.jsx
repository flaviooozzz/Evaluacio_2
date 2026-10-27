import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

// Se muestra cuando el backend cerró la reserva por tiempo.
function ModalExpirada({ abierto, cargando, onReiniciar }) {
  return (
    <Modal isOpen={abierto} centered backdrop="static" keyboard={false} contentClassName="mc-modal">
      <ModalHeader>⏰ ¡Se acabó el tiempo!</ModalHeader>
      <ModalBody>
        Tu reserva se cerró porque no la completaste a tiempo. Los platos que tenías apartados volvieron al
        menú. ¿Quieres iniciarla nuevamente?
      </ModalBody>
      <ModalFooter className="border-0">
        <Button color="primary" onClick={onReiniciar} disabled={cargando}>
          Iniciar nueva reserva
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ModalExpirada;
