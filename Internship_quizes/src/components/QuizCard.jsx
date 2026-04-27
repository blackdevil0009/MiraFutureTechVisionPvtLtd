import React from 'react';
import Timer from './Timer';
import ProgressBar from './ProgressBar';

const QuizCard = ({ question, currentQuestion, totalQuestions, onAnswerSelect, onTimeUp, answered, selectedAnswer, isAnswered, showResult, userInfo, domain }) => {
  return (
    <div className="quiz-card-container">
      {userInfo && (
        <div className="quiz-user-info">
          <span className="quiz-user-name">👤 {userInfo.name}</span>
          <span className="quiz-domain-badge">📌 {domain}</span>
        </div>
      )}

      <div className="quiz-header">
        <ProgressBar currentQuestion={currentQuestion} totalQuestions={totalQuestions} />
        <div className="timer-section">
          <Timer duration={60} onTimeUp={onTimeUp} isActive={!isAnswered} />
        </div>
      </div>

      <div className="question-section">
        <h2 className="question-text">{question.question}</h2>
      </div>

      <div className="options-section">
        {question.options.map((option, index) => {
          let optionClass = 'option-button';
          
          if (isAnswered || answered) {
            optionClass += ' disabled';
            
            if (index === question.correctAnswer) {
              optionClass += ' correct';
            } else if (index === selectedAnswer && selectedAnswer !== question.correctAnswer) {
              optionClass += ' wrong';
            }
          } else if (selectedAnswer === index) {
            optionClass += ' selected';
          }

          return (
            <button
              key={index}
              className={optionClass}
              onClick={() => !answered && !isAnswered && onAnswerSelect(index)}
              disabled={answered || isAnswered}
            >
              <span className="option-index">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
              {isAnswered && index === question.correctAnswer && <span className="check-mark">✓</span>}
              {isAnswered && index === selectedAnswer && selectedAnswer !== question.correctAnswer && <span className="cross-mark">✗</span>}
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className={`result-message ${selectedAnswer === question.correctAnswer ? 'correct-result' : 'wrong-result'}`}>
          {selectedAnswer === question.correctAnswer ? '✓ Correct!' : selectedAnswer === undefined ? '⊘ Unanswered' : '✗ Wrong!'}
        </div>
      )}
    </div>
  );
};

export default QuizCard;
