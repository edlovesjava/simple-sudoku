import SudokuCell from './SudokuCell';
import styles from './SudokuGrid.module.css';

export default function SudokuGrid({ puzzle, userGrid, originalGrid, selectedCell, errors, onCellChange, onCellSelect }) {
  return (
    <div className={styles.grid} role="grid" aria-label="Sudoku puzzle grid">
      {puzzle.map((row, r) =>
        row.map((_, c) => (
          <SudokuCell
            key={`${r}-${c}`}
            row={r}
            col={c}
            value={userGrid[r][c]}
            original={originalGrid[r][c] !== 0}
            selected={selectedCell && selectedCell[0] === r && selectedCell[1] === c}
            error={errors[r][c]}
            onChange={(val) => onCellChange(r, c, val)}
            onSelect={onCellSelect}
          />
        ))
      )}
    </div>
  );
}
