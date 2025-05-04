import { FeedbackStatus, FeedbackType } from '../enums/feedback-types';

export interface Feedback {
  id: string;
  userId: string;
  subject: string;
  type: FeedbackType;
  message: string;
  status: FeedbackStatus;
  createdAt: string;
  response?: string;
  updatedAt?: string;
}
