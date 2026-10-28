import { useState, useRef, useEffect } from 'react';
import { Form, InputGroup, Input, Button } from 'reactstrap';

const MENSAJE_ENTEROS = 'Solo se permiten números enteros';
const MENSAJE_RANGO = 'El valor debe estar entre 1 y 100';
const TECLAS_PERMITIDAS = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];

const fueraDeRango = (texto) => {
  const numero = Number(texto);
  return numero < 1 || numero > 100;
};

function GuessForm({ onGuess, disabled }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  const globoTimer = useRef(null);

  // Cada vez que el input se vuelve a habilitar, recupera el foco
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  useEffect(() => () => clearTimeout(globoTimer.current), []);

  const limpiarGlobo = () => {
    clearTimeout(globoTimer.current);
    inputRef.current?.setCustomValidity('');
  };

  const mostrarGlobo = (mensaje) => {
    const input = inputRef.current;
    if (!input) return;
    clearTimeout(globoTimer.current);
    input.setCustomValidity(mensaje);
    input.reportValidity();
    globoTimer.current = setTimeout(() => input.setCustomValidity(''), 3000);
  };

  const handleChange = (event) => {
    const texto = event.target.value;
    const soloDigitos = texto.replace(/\D/g, '');
    setValue(soloDigitos);

    if (soloDigitos !== texto) {
      mostrarGlobo(MENSAJE_ENTEROS);
    } else if (soloDigitos !== '' && fueraDeRango(soloDigitos)) {
      mostrarGlobo(MENSAJE_RANGO);
    } else {
      limpiarGlobo();
    }
  };

  const handleKeyDown = (event) => {
    const esDigito = /^\d$/.test(event.key);
    const esAtajo = event.ctrlKey || event.metaKey;
    if (!esDigito && !esAtajo && !TECLAS_PERMITIDAS.includes(event.key)) {
      event.preventDefault();
      mostrarGlobo(MENSAJE_ENTEROS);
    }
  };

  const handlePaste = (event) => {
    const texto = event.clipboardData.getData('text');
    if (!/^\d+$/.test(texto)) {
      event.preventDefault();
      mostrarGlobo(MENSAJE_ENTEROS);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (value === '') return;
    if (!/^\d+$/.test(value)) {
      mostrarGlobo(MENSAJE_ENTEROS);
      return;
    }
    if (fueraDeRango(value)) {
      mostrarGlobo(MENSAJE_RANGO);
      return;
    }
    limpiarGlobo();
    onGuess(Number(value));
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <InputGroup size="lg">
        <Input
          innerRef={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="🔢 Tu número (1 a 100)"
          className="guess-input"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          disabled={disabled}
        />
        <Button className="btn-probar" type="submit" disabled={disabled || value === ''}>
          🚀 Probar
        </Button>
      </InputGroup>
    </Form>
  );
}

export default GuessForm;