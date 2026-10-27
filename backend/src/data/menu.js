// Inventario inicial del restaurante (se maneja en memoria).
// Cada plato: { id: number, nombre: string, precio: number, stock: number, categoria: string }
export const crearMenuInicial = () => [
  { id: 101, nombre: 'Menú Ejecutivo (Pollo)', precio: 5.5, stock: 12, categoria: 'Fuerte' },
  { id: 102, nombre: 'Pasta Alfredo', precio: 4.75, stock: 8, categoria: 'Fuerte' },
  { id: 103, nombre: 'Pupusas Revueltas (x3)', precio: 3.0, stock: 20, categoria: 'Fuerte' },
  { id: 104, nombre: 'Ensalada César', precio: 3.5, stock: 6, categoria: 'Entrada' },
  { id: 105, nombre: 'Sopa de Pollo', precio: 2.75, stock: 10, categoria: 'Entrada' },
  { id: 106, nombre: 'Tres Leches', precio: 2.25, stock: 5, categoria: 'Postre' },
  { id: 107, nombre: 'Gelatina de Frutas', precio: 1.25, stock: 0, categoria: 'Postre' },
  { id: 108, nombre: 'Refresco de Cebada', precio: 1.0, stock: 15, categoria: 'Bebida' },
  { id: 109, nombre: 'Café Pasado', precio: 0.75, stock: 25, categoria: 'Bebida' }
];

export const SALDO_INICIAL = 25.0;
