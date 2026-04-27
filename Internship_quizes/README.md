# 📚 Student Domain Test Portal

A modern, responsive React quiz application built with Vite. Students can select from 10 different domains and test their knowledge with 10 multiple-choice questions per domain.

## 🚀 Features

- **Domain Selection**: Choose from 10 different tech domains with emoji icons
- **MCQ Quiz System**: 10 questions per domain (100 questions total)
- **Timed Questions**: 60-second timer for each question with visual countdown
- **Instant Feedback**: Immediate right/wrong indicator after answering
- **Comprehensive Results**: Score breakdown with pass/fail status
- **Question Review**: Detailed review of all questions with correct answers
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Theme**: Professional dark blue color scheme with smooth animations
- **Auto-Progression**: Automatic move to next question after 2 seconds

## 📋 Domains Included

1. Full Stack Development
2. Frontend Development
3. Backend Development
4. Java Development
5. Python Development
6. Data Science
7. Artificial Intelligence
8. Machine Learning
9. Cyber Security
10. Cloud Computing

## 🎯 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to `http://localhost:5173/`

## 📁 Project Structure

```
src/
├── components/
│   ├── DomainSelector.jsx    # Domain selection screen
│   ├── QuizCard.jsx          # Quiz question card
│   ├── Timer.jsx             # Timer component
│   ├── ProgressBar.jsx       # Progress indicator
│   └── ResultScreen.jsx      # Results and review
├── data/
│   └── questions.js          # All quiz questions (100 total)
├── App.jsx                   # Main app logic
├── App.css                   # Styling
├── index.css                 # Global styles
└── main.jsx                  # Entry point
```

## 🎮 How to Use

1. **Select Domain**: Click on any domain card from the home screen
2. **Answer Questions**: Read the question and click on one of 4 options
3. **Time Management**: Watch the timer - you have 60 seconds per question
4. **Instant Feedback**: See if your answer is correct or wrong immediately
5. **Review Results**: After all 10 questions, see your score and detailed review
6. **Try Again**: Click "Restart Quiz" to retake the same domain
7. **Switch Domain**: Click "Back to Domains" to choose a different domain

## 🎨 Design Features

- **Color Scheme**: Dark blue (#1a2854) with light blue accents (#4da6ff)
- **Animations**: Smooth fade-ins and slide-up effects
- **Timer Feedback**: Color changes from green to red when time is low
- **Answer Highlighting**: Green for correct, red for wrong answers
- **Visual Feedback**: Icons, gradients, and hover effects

## 📊 Quiz Questions

- **Total Questions**: 100 (10 per domain)
- **Question Type**: Multiple Choice (4 options)
- **Difficulty Level**: Beginner-friendly
- **Timer**: 60 seconds per question
- **Scoring**: 1 point per correct answer

## 🔧 Technical Stack

- **Frontend Framework**: React with Hooks
- **Build Tool**: Vite
- **Styling**: Pure CSS with responsive design
- **State Management**: React useState
- **No Backend**: All data and logic in frontend

## 📱 Responsive Breakpoints

- **Desktop**: 1200px and above
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px

## 🎯 Key Components

### DomainSelector
- Displays 10 domain cards with icons
- Handles domain selection
- Shows welcome heading and subtitle

### QuizCard
- Shows current question
- Displays 4 answer options
- Includes timer and progress bar
- Shows result feedback

### Timer
- 60-second countdown
- Visual progress bar
- Low-time warning animation

### ProgressBar
- Shows current question number
- Visual progress indicator
- Percentage display

### ResultScreen
- Score statistics
- Percentage and pass/fail status
- Question review with details
- Restart and back buttons

## 🚀 Build for Production

```bash
npm run build
npm run preview
```

## 📝 Notes

- Questions are stored in `src/data/questions.js`
- Each domain has exactly 10 questions
- All logic is client-side (no database required)
- Timer automatically moves to next question when time expires
- Unanswered questions count in the review

## 💡 Future Enhancements

- Add more domains
- Implement difficulty levels
- Add question categories within domains
- Create user analytics
- Add social sharing for results

Enjoy testing your knowledge! 🎉
"# Internship_Quiz" 
