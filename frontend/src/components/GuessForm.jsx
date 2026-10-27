import { useState, useRef, useEffect } from 'react';
import { Form, InputGroup, Input, Button } from 'reactstrap';

function GuessForm({ onGuess, disabled }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  // Cada vez que el input se vuelve a habilitar, recupera el foco
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (value === '') return;
    onGuess(Number(value));
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <InputGroup size="lg">
        <Input
          innerRef={inputRef}
          type="number"
          min="1"
          max="100"
          step="1"
          placeholder="🔢 Tu número (1 a 100)"
          className="guess-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
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