import { useState, useCallback } from 'react';
import SudokuGrid from './components/SudokuGrid';
import NumberPad from './components/NumberPad';
import Timer from './components/Timer';
import { fetchPuzzle, verifySolution } from './api';
import styles from './App.module.css';

const EMPTY_GRID = () => Array.from({ length: 9 }, () => Array(9).fill(0));
const EMPTY_ERRORS = () => Array.from({ length: 9 }, () => Array(9).fill(false));

function validateGrid(grid) {
  const errors = EMPTY_ERRORS();

  function hasDuplicate(cells) {
    const seen = new Set();
    for (const val of cells) {
      if (val === 0) continue;
      if (seen.has(val)) return true;
      seen.add(val);
    }
    return false;
  }

  for (let i = 0; i < 9; i++) {
    const row = grid[i];
    const col = grid.map((r) => r[i]);
    const boxRow = Math.floor(i / 3) * 3;
    const boxCol = (i % 3) * 3;
    const box = [];
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        box.push(grid[r][c]);
      }
    }

    if (hasDuplicate(row)) {
      for (let c = 0; c < 9; c++) {
        if (row[c] !== 0) errors[i][c] = true;
      }
    }
    if (hasDuplicate(col)) {
      for (let r = 0; r < 9; r++) {
        if (col[r] !== 0) errors[r][i] = true;
      }
    }
    if (hasDuplicate(box)) {
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          if (grid[r][c] !== 0) errors[r][c] = true;
        }
      }
    }
  }

  return errors;
}

export default function App() {
  const [difficulty, setDifficulty] = useState('medium');
  const [puzzle, setPuzzle] = useState(EMPTY_GRID());
  const [originalGrid, setOriginalGrid] = useState(EMPTY_GRID());
  const [userGrid, setUserGrid] = useState(EMPTY_GRID());
  const [errors, setErrors] = useState(EMPTY_ERRORS());
  const [selectedCell, setSelectedCell] = useState(null);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(false);

  async function startNewGame() {
    setLoading(true);
    setMessage('');
    setStatus('playing');
    try {
      const data = await fetchPuzzle(difficulty);
      const grid = data.puzzle;
      setPuzzle(grid);
      setOriginalGrid(grid.map((row) => [...row]));
      setUserGrid(grid.map((row) => [...row]));
      setErrors(EMPTY_ERRORS());
      setSelectedCell(null);
      setRank(data.rank);
      setTimerRunning(true);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
      setStatus('idle');
    } finally {
      setLoading(false);
    }
  }

  const handleCellChange = useCallback(
    (row, col, val) => {
      if (originalGrid[row][col] !== 0) return;
      const newGrid = userGrid.map((r, ri) => r.map((c, ci) => (ri === row && ci === col ? val : c)));
      setUserGrid(newGrid);
      setErrors(validateGrid(newGrid));
      setMessage('');
    },
    [userGrid, originalGrid]
  );

  const handleCellSelect = useCallback((row, col) => {
    setSelectedCell([row, col]);
  }, []);

  function handleNumberPad(n) {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    handleCellChange(r, c, n);
  }

  function handleErase() {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    handleCellChange(r, c, 0);
  }

  async function handleVerify() {
    setLoading(true);
    try {
      const result = await verifySolution(userGrid);
      setMessage(result.message);
      if (result.solved) {
        setStatus('won');
        setTimerRunning(false);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const isPlaying = status === 'playing';
  const isWon = status === 'won';

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>🔢 Simple Sudoku</h1>
        <div className={styles.timerRow}>
          <Timer running={timerRunning} />
          {rank !== null && (
            <span className={styles.rank}>Rank: {rank}</span>
          )}
        </div>
      </header>

      <div className={styles.controls}>
        <select
          className={styles.select}
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          disabled={isPlaying && !isWon}
          aria-label="Select difficulty"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <button
          className={styles.btnPrimary}
          onClick={startNewGame}
          disabled={loading}
        >
          {loading ? 'Loading…' : 'New Game'}
        </button>

        {isPlaying && !isWon && (
          <button
            className={styles.btnSuccess}
            onClick={handleVerify}
            disabled={loading}
          >
            Check Solution
          </button>
        )}
      </div>

      {message && (
        <div className={`${styles.message} ${isWon ? styles.messageWon : styles.messageInfo}`}>
          {message}
        </div>
      )}

      {status !== 'idle' && (
        <>
          <SudokuGrid
            puzzle={puzzle}
            userGrid={userGrid}
            originalGrid={originalGrid}
            selectedCell={selectedCell}
            errors={errors}
            onCellChange={handleCellChange}
            onCellSelect={handleCellSelect}
          />

          {!isWon && (
            <NumberPad onNumber={handleNumberPad} onErase={handleErase} />
          )}
        </>
      )}

      {status === 'idle' && (
        <div className={styles.welcome}>
          <p>Select a difficulty and press <strong>New Game</strong> to start!</p>
        </div>
      )}
    </div>
  );
}
