# 🧩 Solucionador de Sudoku (HTML/CSS/JS puro)

Proyecto minimalista sin dependencias. Incluye:

- `index.html`: estructura y pestañas (Resolver, Reglas)
- `style.css`: estilos (tema oscuro, tablero responsive, tabs)
- `main.js`: render de tablero, validación y resolución por backtracking para 6x6, 9x9, 16x16

## 🚀 Cómo ejecutar

- Abre el archivo `index.html` en tu navegador (doble clic o arrástralo al navegador).
- No requiere servidor ni instalación.

## ✨ Funcionalidades

- Selector de tamaño: 6x6, 9x9, 16x16.
- Entrada manual de celdas (se aceptan solo símbolos válidos por tamaño).
- Botones:
  - **Validar**: marca conflictos en filas, columnas o subcuadrículas.
  - **Resolver**: intenta completar el tablero (si es válido) con backtracking.
  - **Limpiar**: borra el tablero.
- Pestaña "Reglas" con un resumen de las normas del Sudoku.

## 📜 Reglas por tamaño

- **6x6**: símbolos 1–6, subcuadrículas 2x3.
- **9x9**: símbolos 1–9, subcuadrículas 3x3.
- **16x16**: símbolos 0–9 y A–F, subcuadrículas 4x4.

## 💡 Consejos de uso

1. Elige el tamaño del tablero.
2. Transcribe las pistas de tu Sudoku (periódico, app, etc.).
3. Pulsa "Validar" para detectar errores tempranos.
4. Si no hay conflictos, pulsa "Resolver".

## 📌 Notas

- El algoritmo de backtracking puede tardar más en tableros 16x16 difíciles.
- Solo hay interfaz local, no se almacenan datos ni hay backend.
- Para extender: podrías añadir generación de puzzles, pistas, deshacer/rehacer, o importación desde texto.

---
Hecho para practicar lógica y algoritmos con una interfaz sencilla.
