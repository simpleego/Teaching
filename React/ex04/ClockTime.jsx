import React, { useState, useEffect } from 'react';
import styles from './Clock.module.css';

function ClockTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // 컴포넌트 언마운트 시 타이머 정리
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.clockContainer}>
      <h1>안녕, 리액트!</h1>
      <h2>현재 시간:</h2>
      <span className={styles.timeText}>{time.toLocaleTimeString()}</span>
    </div>
  );
}

export default ClockTime;