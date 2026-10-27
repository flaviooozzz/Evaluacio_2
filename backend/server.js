const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const MIN = 1;
const MAX = 100;

const generateSecretNumber = () => Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;

let secretNumber = generateSecretNumber();

app.post('/guess', (req, res) => {
  const { guess } = req.body ?? {};

  if (!Number.isInteger(guess) || guess < MIN || guess > MAX) {
    return res
      .status(400)
      .json({ message: `Envía un número entero entre ${MIN} y ${MAX}` });
  }

  let result;
  let message;

  if (guess < secretNumber) {
    result = 'mayor';
    message = `El número oculto es mayor que ${guess}`;
  } else if (guess > secretNumber) {
    result = 'menor';
    message = `El número oculto es menor que ${guess}`;
  } else {
    result = 'correcto';
    message = `¡Correcto! El número oculto era ${guess}`;
  }

  res.json({ guess, result, message });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});