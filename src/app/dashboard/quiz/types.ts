export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number; // index
  category: string;
  difficulty: Difficulty;
}

export interface QuizSettings {
  difficulty: Difficulty;
  questionCount: number;
  selectedTopics: string[];
  timerEnabled: boolean;
}

export interface UserAnswer {
  questionId: number;
  selectedOption: number; // index
  isMarked: boolean;
}

export interface QuizResult {
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  score: number;
  accuracy: number;
  timeTaken: string;
  passed: boolean;
}
