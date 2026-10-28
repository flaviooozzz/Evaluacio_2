import { useState } from 'react';
import {
  Container,
  Card,
  CardBody,
  Alert,
  Badge,
  Button,
  ListGroup,
  ListGroupItem,
} from 'reactstrap';
import GuessForm from './components/GuessForm';
import { sendGuess, resetGame } from './Api';

const INITIAL_MESSAGE = 'Adivina el número oculto entre 1 y 100';

const RESULT_COLORS = {
  mayor: 'info',
  menor: 'warning',
  correcto: 'success',
};

function App() {
  const [history, setHistory] = useState([]);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [message, setMessage] = useState(INITIAL_MESSAGE);
  const [won, setWon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGuess = async (number) => {
    if (history.some((attempt) => attempt.number === number)) {
      setError(`Ya probaste el ${number}. Intenta con otro número.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await sendGuess(number);

      setHistory((previous) => [...previous, { number, result: data.result }]);
      setMessage(data.message);

      if (data.result === 'correcto') {
        setWon(true);
      } else {
        setFailedAttempts((previous) => previous + 1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    setError('');

    try {
      await resetGame();
      setHistory([]);
      setFailedAttempts(0);
      setWon(false);
      setMessage(INITIAL_MESSAGE);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const lastResult = history.length > 0 ? history[history.length - 1].result : null;
  const messageColor = won ? 'success' : RESULT_COLORS[lastResult] || 'primary';

  return (
    <Container className="app-container py-5">
      <header className="text-center mb-4">
        <h1 className="display-4 fw-bold title-glow">🎯 Adivina el número</h1>
        <p className="text-white fs-5 mb-0">
          Fallos: <Badge color="warning" className="text-dark" pill>{failedAttempts}</Badge>
        </p>
      </header>

      <Card className="game-card border-0 shadow-lg">
        <CardBody>
          <Alert color={messageColor} className="text-center fs-5 fw-semibold">
            {won && '🎉 '}
            {message}
          </Alert>

          {error && (
            <Alert color="danger" toggle={() => setError('')}>
              {error}
            </Alert>
          )}

          <GuessForm onGuess={handleGuess} disabled={loading || won} />

          {won && (
            <div className="text-center mt-4">
              <p className="mb-3 fs-5">
                🏆 Lo lograste en {history.length}{' '}
                {history.length === 1 ? 'intento' : 'intentos'}.
              </p>
              <Button color="success" size="lg" onClick={handleReset} disabled={loading}>
                Jugar de nuevo
              </Button>
            </div>
          )}

          {!won && history.length > 0 && (
            <div className="text-center mt-4">
              <Button color="warning" outline onClick={handleReset} disabled={loading}>
                🔄 Reiniciar con un número nuevo
              </Button>
            </div>
          )}

          <h5 className="mt-4 mb-3">📜 Historial de intentos</h5>
          {history.length === 0 ? (
            <p className="text-muted text-center mb-0">
              Aún no has intentado ningún número.
            </p>
          ) : (
            <ListGroup className="history-list">
              {history.map((attempt, index) => (
                <ListGroupItem
                  key={attempt.number}
                  className="d-flex justify-content-between align-items-center"
                >
                  <span>
                    Intento #{index + 1}: <strong>{attempt.number}</strong>
                  </span>
                  <Badge color={RESULT_COLORS[attempt.result] || 'secondary'} pill>
                    {attempt.result}
                  </Badge>
                </ListGroupItem>
              ))}
            </ListGroup>
          )}
        </CardBody>
      </Card>
    </Container>
  );
}

export default App;