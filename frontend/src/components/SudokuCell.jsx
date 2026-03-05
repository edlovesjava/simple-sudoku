import styles from './SudokuCell.module.css';

export default function SudokuCell({ value, original, selected, error, row, col, onChange, onSelect }) {
  const isBoxBorderRight = col === 2 || col === 5;
  const isBoxBorderBottom = row === 2 || row === 5;

  const classNames = [
    styles.cell,
    original ? styles.original : styles.editable,
    selected ? styles.selected : '',
    error ? styles.error : '',
    isBoxBorderRight ? styles.boxBorderRight : '',
    isBoxBorderBottom ? styles.boxBorderBottom : '',
  ]
    .filter(Boolean)
    .join(' ');

  function handleChange(e) {
    const raw = e.target.value;
    const digit = raw.replace(/[^1-9]/g, '').slice(-1);
    onChange(digit ? parseInt(digit, 10) : 0);
  }

  function handleKeyDown(e) {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      onChange(0);
    }
    if (e.key >= '1' && e.key <= '9') {
      onChange(parseInt(e.key, 10));
    }
    if (e.key === '0') {
      onChange(0);
    }
  }

  if (original) {
    return (
      <div className={classNames} onClick={() => onSelect(row, col)}>
        {value !== 0 ? value : ''}
      </div>
    );
  }

  return (
    <input
      className={classNames}
      type="text"
      inputMode="numeric"
      value={value !== 0 ? value : ''}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={() => onSelect(row, col)}
      maxLength={1}
      aria-label={`Row ${row + 1}, Column ${col + 1}`}
    />
  );
}
