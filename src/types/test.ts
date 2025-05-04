import { QuestionType } from '../enums/question-types';

export interface Test {
  id: string;
  courseId: string;
  title: string;
  minPassPercentage: number;
  testOrder: number;
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
}

export interface Question {
  id: string;
  testId: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswers: string[];
  points: number;
  questionOrder: number;
}

export interface TestAttempt {
  id: string;
  testId: string;
  userId: string;
  score: number;
  maxScore: number;
  isPassed: boolean;
  completedAt: string;
}

export interface QuestionAnswer {
  questionId: string;
  answers: string[];
  isCorrect: boolean;
  pointsEarned: number;
}
