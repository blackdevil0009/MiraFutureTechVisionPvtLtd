import React, { useState, useCallback } from 'react';
import UserForm from './components/UserForm';
import DomainSelector from './components/DomainSelector';
import QuizCard from './components/QuizCard';
import ResultScreen from './components/ResultScreen';
import { questions } from './data/questions';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('userForm'); // 'userForm', 'domain', 'quiz', 'result'
  const [userInfo, setUserInfo] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState([]);

  const domains = Object.keys(questions);
  const domainQuestions = selectedDomain ? questions[selectedDomain] : [];
  const currentQuestion = domainQuestions[currentQuestionIndex];

  const handleUserFormSubmit = (formData) => {
    setUserInfo(formData);
    setCurrentScreen('domain');
  };

  const handleSelectDomain = (domain) => {
    setSelectedDomain(domain);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowResult(false);
    setQuizAnswers([]);
    setCurrentScreen('quiz');
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setQuizAnswers([...quizAnswers, answerIndex]);
    setIsAnswered(true);
    setShowResult(true);
  };

  const handleTimeUp = useCallback(() => {
    if (!isAnswered) {
      setQuizAnswers([...quizAnswers, undefined]);
      setIsAnswered(true);
      setShowResult(true);
    }
  }, [isAnswered, quizAnswers]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < domainQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowResult(false);
    } else {
      calculateResults();
    }
  }, [currentQuestionIndex, domainQuestions.length]);

  const calculateResults = () => {
    const results = {
      correct: 0,
      wrong: 0,
      unanswered: 0,
      answers: quizAnswers,
      questions: domainQuestions
    };

    quizAnswers.forEach((answer, index) => {
      if (answer === undefined) {
        results.unanswered++;
      } else if (answer === domainQuestions[index].correctAnswer) {
        results.correct++;
      } else {
        results.wrong++;
      }
    });

    setAnswers(results);
    setCurrentScreen('result');
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowResult(false);
    setQuizAnswers([]);
    setCurrentScreen('quiz');
  };

  const handleBackToDomains = () => {
    setCurrentScreen('domain');
    setSelectedDomain(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowResult(false);
    setQuizAnswers([]);
    setAnswers([]);
  };

  // Auto move to next question after 2 seconds when answered
  React.useEffect(() => {
    if (showResult && isAnswered) {
      const timer = setTimeout(handleNextQuestion, 2000);
      return () => clearTimeout(timer);
    }
  }, [showResult, isAnswered, handleNextQuestion]);

  return (
    <div className="app-container">
      {currentScreen === 'userForm' && (
        <UserForm onSubmit={handleUserFormSubmit} />
      )}

      {currentScreen === 'domain' && (
        <DomainSelector domains={domains} onSelectDomain={handleSelectDomain} userInfo={userInfo} />
      )}

      {currentScreen === 'quiz' && currentQuestion && (
        <QuizCard
          question={currentQuestion}
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={domainQuestions.length}
          onAnswerSelect={handleAnswerSelect}
          onTimeUp={handleTimeUp}
          answered={isAnswered}
          selectedAnswer={selectedAnswer}
          isAnswered={isAnswered}
          showResult={showResult}
          userInfo={userInfo}
          domain={selectedDomain}
        />
      )}

      {currentScreen === 'result' && (
        <ResultScreen
          domain={selectedDomain}
          results={answers}
          onRestart={handleRestart}
          onBackToDomains={handleBackToDomains}
          userInfo={userInfo}
        />
      )}
    </div>
  );
}

export default App;
