// Solucionador de Sudoku - soporte 6x6, 9x9, 16x16
// UI mínima: tabs, selector de tamaño, tablero editable, Validar/Resolver/Limpiar

(function () {
  // DOM refs
  const boardEl = document.getElementById('board');
  const sizeSelect = document.getElementById('size-select');
  const btnValidate = document.getElementById('btn-validate');
  const btnSolve = document.getElementById('btn-solve');
  const btnClear = document.getElementById('btn-clear');
  const messageEl = document.getElementById('message');
  const tabButtons = Array.from(document.querySelectorAll('.tab-button'));
  const tabResolver = document.getElementById('tab-resolver');
  const tabReglas = document.getElementById('tab-reglas');
  const themeToggleBtn = document.getElementById('theme-toggle');

  /** Config por tamaño */
  const CONFIGS = {
    6: { n: 6, subR: 2, subC: 3, symbols: ['1','2','3','4','5','6'] },
    9: { n: 9, subR: 3, subC: 3, symbols: ['1','2','3','4','5','6','7','8','9'] },
    16: { n: 16, subR: 4, subC: 4, symbols: ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'] },
  };

  function getConfig() {
    const n = parseInt(sizeSelect.value, 10);
    return CONFIGS[n];
  }

  // Tema claro/oscuro
  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      if (themeToggleBtn) {
        themeToggleBtn.textContent = '🌞';
        themeToggleBtn.title = 'Cambiar a modo oscuro';
        themeToggleBtn.setAttribute('aria-label', 'Cambiar a modo oscuro');
      }
    } else {
      root.setAttribute('data-theme', 'dark');
      if (themeToggleBtn) {
        themeToggleBtn.textContent = '🌙';
        themeToggleBtn.title = 'Cambiar a modo claro';
        themeToggleBtn.setAttribute('aria-label', 'Cambiar a modo claro');
      }
    }
  }

  function getInitialTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    // por defecto, sigue la preferencia del sistema
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  }

  function initTheme() {
    const theme = getInitialTheme();
    applyTheme(theme);
  }

  function toggleTheme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const next = isLight ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('theme', next);
  }

  // Renderizar tablero
  function renderBoard() {
    clearMessage();
    const { n, subR, subC } = getConfig();
    boardEl.innerHTML = '';

    // Ajustar estilos CSS variables y clase
    boardEl.style.setProperty('--n', n);
    boardEl.style.setProperty('--sub-r', subR);
    boardEl.style.setProperty('--sub-c', subC);
    boardEl.classList.toggle('size-16', n === 16);

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r % getConfig().subR === 0 ? '0' : '';
        cell.dataset.col = c % getConfig().subC === 0 ? '0' : '';
        if (c % getConfig().subC === 0 && c !== 0) cell.dataset.colMulti = 'true';
        if (r % getConfig().subR === 0 && r !== 0) cell.dataset.rowMulti = 'true';

        const input = document.createElement('input');
        // Para 6x6 y 9x9 acepta solo numérico; para 16x16 permite texto (letras A-F)
        input.setAttribute('inputmode', getConfig().n === 16 ? 'text' : 'numeric');
        input.setAttribute('maxlength', '1');
        input.autocomplete = 'off';
        input.spellcheck = false;
        input.addEventListener('input', onCellInput);

        cell.appendChild(input);
        cell.dataset.r = String(r);
        cell.dataset.c = String(c);
        boardEl.appendChild(cell);
      }
    }
  }

  function onCellInput(e) {
    const { symbols } = getConfig();
    const input = e.target;
    let v = input.value.toUpperCase();
    // Aceptar solo símbolos válidos
    if (!symbols.includes(v)) {
      // Permitir borrar
      if (v.length === 0) return;
      // Si el usuario pegó más de 1 caracter, intenta tomar el primero válido
      const first = v.split('').find((ch) => symbols.includes(ch));
      input.value = first || '';
    } else {
      input.value = v;
    }
  }

  // Leer tablero a matriz
  function readBoard() {
    const { n } = getConfig();
    const grid = Array.from({ length: n }, () => Array(n).fill(''));
    const cells = boardEl.querySelectorAll('.cell');
    cells.forEach((cell) => {
      const r = parseInt(cell.dataset.r, 10);
      const c = parseInt(cell.dataset.c, 10);
      const v = cell.querySelector('input').value.trim().toUpperCase();
      grid[r][c] = v || '';
    });
    return grid;
  }

  // Escribir matriz al tablero
  function writeBoard(grid) {
    const cells = boardEl.querySelectorAll('.cell');
    cells.forEach((cell) => {
      const r = parseInt(cell.dataset.r, 10);
      const c = parseInt(cell.dataset.c, 10);
      const input = cell.querySelector('input');
      input.value = grid[r][c] || '';
    });
  }

  // Validación
  function validateBoard(grid) {
    const { n, subR, subC, symbols } = getConfig();
    // Reset estados
    boardEl.querySelectorAll('.cell').forEach((cell) => cell.classList.remove('error', 'valid'));

    let ok = true;

    // helpers
    const markError = (r, c) => {
      const selector = `.cell[data-r="${r}"][data-c="${c}"]`;
      const cell = boardEl.querySelector(selector);
      if (cell) cell.classList.add('error');
    };

    // filas
    for (let r = 0; r < n; r++) {
      const seen = new Set();
      for (let c = 0; c < n; c++) {
        const v = grid[r][c];
        if (v === '') continue;
        if (!symbols.includes(v) || seen.has(v)) {
          ok = false; markError(r, c);
        } else seen.add(v);
      }
    }

    // columnas
    for (let c = 0; c < n; c++) {
      const seen = new Set();
      for (let r = 0; r < n; r++) {
        const v = grid[r][c];
        if (v === '') continue;
        if (!symbols.includes(v) || seen.has(v)) {
          ok = false; markError(r, c);
        } else seen.add(v);
      }
    }

    // subcuadrículas
    for (let br = 0; br < n; br += subR) {
      for (let bc = 0; bc < n; bc += subC) {
        const seen = new Set();
        for (let r = 0; r < subR; r++) {
          for (let c = 0; c < subC; c++) {
            const rr = br + r, cc = bc + c;
            const v = grid[rr][cc];
            if (v === '') continue;
            if (!symbols.includes(v) || seen.has(v)) {
              ok = false; markError(rr, cc);
            } else seen.add(v);
          }
        }
      }
    }

    return ok;
  }

  // Solver (backtracking)
  function solve(grid) {
    const { n, subR, subC, symbols } = getConfig();

    function findEmpty() {
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (grid[r][c] === '') return [r, c];
        }
      }
      return null;
    }

    function isSafe(r, c, val) {
      // fila
      for (let x = 0; x < n; x++) if (grid[r][x] === val) return false;
      // columna
      for (let x = 0; x < n; x++) if (grid[x][c] === val) return false;
      // subgrid
      const br = Math.floor(r / subR) * subR;
      const bc = Math.floor(c / subC) * subC;
      for (let i = 0; i < subR; i++) {
        for (let j = 0; j < subC; j++) {
          if (grid[br + i][bc + j] === val) return false;
        }
      }
      return true;
    }

    function backtrack() {
      const empty = findEmpty();
      if (!empty) return true;
      const [r, c] = empty;
      for (const val of symbols) {
        if (isSafe(r, c, val)) {
          grid[r][c] = val;
          if (backtrack()) return true;
          grid[r][c] = '';
        }
      }
      return false;
    }

    return backtrack();
  }

  // Mensajes
  function setMessage(text, type = '') {
    messageEl.className = 'message';
    if (type) messageEl.classList.add(type);
    messageEl.textContent = text;
  }
  function clearMessage() { setMessage(''); }

  // Eventos UI
  sizeSelect.addEventListener('change', renderBoard);
  btnClear.addEventListener('click', () => {
    boardEl.querySelectorAll('input').forEach((i) => (i.value = ''));
    boardEl.querySelectorAll('.cell').forEach((cell) => cell.classList.remove('error', 'valid'));
    clearMessage();
  });

  btnValidate.addEventListener('click', () => {
    const grid = readBoard();
    const ok = validateBoard(grid);
    setMessage(ok ? 'Tablero válido.' : 'Hay conflictos en el tablero.', ok ? 'ok' : 'bad');
  });

  btnSolve.addEventListener('click', () => {
    const grid = readBoard();
    // Primero validar entradas actuales
    if (!validateBoard(grid)) {
      setMessage('Corrige los conflictos antes de resolver.', 'bad');
      return;
    }
    const copy = grid.map((row) => row.slice());
    const solved = solve(copy);
    if (solved) {
      writeBoard(copy);
      boardEl.querySelectorAll('.cell').forEach((cell) => cell.classList.remove('error'));
      setMessage('Solución encontrada.', 'ok');
    } else {
      setMessage('No se encontró solución para esta configuración.', 'bad');
    }
  });

  // Tabs
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      if (tab === 'resolver') {
        tabResolver.classList.add('active');
        tabReglas.classList.remove('active');
      } else {
        tabReglas.classList.add('active');
        tabResolver.classList.remove('active');
      }
    });
  });

  // Init
  initTheme();
  if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
  renderBoard();
})();

