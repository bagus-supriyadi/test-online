export interface ExamPackage {
  id: string;
  name: string;
  category: string;
  description: string;
  totalDurationMinutes: number;
  totalQuestions: number;
  subExams: string[];
  subExamsConfig?: {
    [subtestName: string]: {
      durationMinutes: number;
      questionCount: number;
    }
  };
  isPremium?: boolean;
}

export interface Question {
  id: string;
  examId: string;
  subExamName: string;
  questionText: string;
  questionImage?: string;
  questionImagePosition?: string;
  options: {
    [key: string]: string; // A, B, C, D, E keys
  };
  optionImages?: {
    [key: string]: string;
  };
  optionImagePositions?: {
    [key: string]: string;
  };
  correctOption: string; // 'A', 'B', 'C', 'D', 'E'
  explanation: string;
  isPublished?: boolean;
}

export interface StudentAttempt {
  id: string;
  userId: string;
  examId: string;
  status: 'ON_PROGRESS' | 'SUBMITTED';
  startTime: string; // ISO String
  endTime?: string; // ISO String
  answers: {
    [questionId: string]: string; // Chosen option
  };
  doubtfulAnswers?: {
    [questionId: string]: boolean; // True if flagged "ragu-ragu"
  };
  tabSwitchViolations: number;
  finalScore?: number;
  correctCount?: number;
  incorrectCount?: number;
  emptyCount?: number;
}

export interface UserRegistry {
  id: string;
  email: string;
  fullname: string;
  role: 'admin' | 'student';
  categoryInterest?: string;
  password?: string;
  photoUrl?: string;
  phone?: string;
  school?: string;
}

export interface LockState {
  id: string;
  locks: {
    [packageId: string]: boolean; // True if locked/premium, false if unlocked
  };
}
