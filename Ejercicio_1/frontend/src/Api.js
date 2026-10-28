const API_URL = 'http://localhost:3000';

const post = (path, body = {}) =>
  fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then((response) =>
      response.json().then((data) => {
        if (!response.ok) {
          throw new Error(data.message || 'Error en el servidor');
        }
        return data;
      })
    )
    .catch((error) => {
      if (error instanceof TypeError) {
        throw new Error('No se pudo conectar con el servidor. ¿Está encendido el backend?');
      }
      throw error;
    });

export const sendGuess = (guess) => post('/guess', { guess });

export const resetGame = () => post('/reset');