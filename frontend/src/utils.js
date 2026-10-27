export const formatearDinero = (valor) => `$${Number(valor).toFixed(2)}`;

export const formatearTiempo = (segundos) => {
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return `${String(minutos).padStart(2, '0')}:${String(resto).padStart(2, '0')}`;
};

// Emoji por plato (y de respaldo por categoría) para ilustrar el menú sin imágenes externas.
const EMOJI_POR_ID = { 101: '🍗', 102: '🍝', 103: '🫓', 104: '🥗', 105: '🍲', 106: '🍰', 107: '🍮', 108: '🥤', 109: '☕' };
const EMOJI_POR_CATEGORIA = { Todas: '🍽️', Entrada: '🥗', Fuerte: '🍔', Postre: '🍰', Bebida: '🥤' };

export const emojiDePlato = (plato) => EMOJI_POR_ID[plato.id] ?? EMOJI_POR_CATEGORIA[plato.categoria] ?? '🍽️';
export const emojiDeCategoria = (categoria) => EMOJI_POR_CATEGORIA[categoria] ?? '🍽️';