import React from 'react';

const ProgressBar = ({ currentQuestion, totalQuestions }) => {
  const percentage = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="progress-container">
      <div className="progress-text">
        Question <span className="current-q">{currentQuestion}</span> of <span className="total-q">{totalQuestions}</span>
      </div>
      <div className="progress-bar-background">
        <div
          className="progress-bar"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="progress-percentage">{Math.round(percentage)}%</div>
    </div>
  );
};

export default ProgressBar;
