export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: Difficulty;
  explanation: string;
}

export interface QuizSettings {
  difficulty: 'All' | Difficulty;
  questionCount: number;
  selectedTopics: string[];
  timerEnabled: boolean;
}

export interface UserAnswer {
  questionId: number;
  selectedOption: number;
  isMarked: boolean;
}

export interface SavedQuizResult {
  date: string;
  score: number;
  correct: number;
  total: number;
  timeTaken: string;
  passed: boolean;
  subject: 'os' | 'aiml';
}
