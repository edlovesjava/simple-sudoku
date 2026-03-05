import styles from './NumberPad.module.css';

export default function NumberPad({ onNumber, onErase }) {
  return (
    <div className={styles.pad}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <button key={n} className={styles.numBtn} onClick={() => onNumber(n)} aria-label={`Enter ${n}`}>
          {n}
        </button>
      ))}
      <button className={`${styles.numBtn} ${styles.eraseBtn}`} onClick={onErase} aria-label="Erase cell">
        ✕
      </button>
    </div>
  );
}
