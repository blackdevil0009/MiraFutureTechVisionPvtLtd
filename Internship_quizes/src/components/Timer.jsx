import React, { useEffect, useState } from 'react';

const Timer = ({ duration = 60, onTimeUp, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft, onTimeUp]);

  const percentage = (timeLeft / duration) * 100;
  const isLowTime = timeLeft <= 10;

  return (
    <div className="timer-container">
      <div className={`timer-display ${isLowTime ? 'low-time' : ''}`}>
        <span className="timer-number">{timeLeft}s</span>
      </div>
      <div className="timer-bar-background">
        <div
          className={`timer-bar ${isLowTime ? 'low-time-bar' : ''}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Timer;
