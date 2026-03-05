import { useState, useEffect, useRef } from 'react';
import styles from './Timer.module.css';

export default function Timer({ running, onTick }) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);
  const secondsRef = useRef(0);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (!running) return;

    secondsRef.current = 0;
    setSeconds(0);
    intervalRef.current = setInterval(() => {
      secondsRef.current += 1;
      setSeconds(secondsRef.current);
      if (onTick) onTick(secondsRef.current);
    }, 1000);

    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return <span className={styles.timer}>{display}</span>;
}
