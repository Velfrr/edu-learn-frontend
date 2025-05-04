
import { z } from 'zod';
import { FeedbackType } from '@/enums/feedback-types';

export const feedbackSchema = z.object({
  type: z.nativeEnum(FeedbackType),
  subject: z.string().min(3).max(100),
  message: z.string().min(10).max(1000),
});

export type FeedbackFormValues = z.infer<typeof feedbackSchema>;
