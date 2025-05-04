import axios from 'axios';
import { Feedback } from '../types/feedback';
import { FeedbackStatus, FeedbackType } from '../enums/feedback-types';

export const submitFeedback = async (
  userId: string,
  subject: string,
  type: FeedbackType,
  message: string,
): Promise<{ feedback: Feedback | null; error: Error | null }> => {
  try {
    const now = new Date().toISOString();
    const { data } = await axios.post('/api/feedback', {
      user_id: userId,
      subject,
      type,
      message,
      status: FeedbackStatus.PENDING,
      created_at: now,
    });

    return {
      feedback: {
        id: data.id,
        userId: data.user_id,
        subject: data.subject,
        type: data.type,
        message: data.message,
        status: data.status,
        createdAt: data.created_at,
        response: data.response || undefined,
        updatedAt: data.updated_at || undefined,
      },
      error: null,
    };
  } catch (error) {
    return { feedback: null, error: error as Error };
  }
};

export const updateFeedbackStatus = async (
  feedbackId: string,
  status: FeedbackStatus,
  response?: string,
): Promise<{ feedback: Feedback | null; error: Error | null }> => {
  try {
    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (response) {
      updates.response = response;
    }

    const { data } = await axios.patch(`/api/feedback/${feedbackId}`, updates);

    return {
      feedback: {
        id: data.id,
        userId: data.user_id,
        subject: data.subject,
        type: data.type,
        message: data.message,
        status: data.status,
        createdAt: data.created_at,
        response: data.response || undefined,
        updatedAt: data.updated_at || undefined,
      },
      error: null,
    };
  } catch (error) {
    return { feedback: null, error: error as Error };
  }
};

export const getAllFeedback = async (): Promise<{
  feedback: Feedback[];
  error: Error | null;
}> => {
  try {
    const { data } = await axios.get('/api/feedback');

    const feedback: Feedback[] = data.map((f: any) => ({
      id: f.id,
      userId: f.user_id,
      subject: f.subject,
      type: f.type,
      message: f.message,
      status: f.status,
      createdAt: f.created_at,
      response: f.response || undefined,
      updatedAt: f.updated_at || undefined,
    }));

    return { feedback, error: null };
  } catch (error) {
    return { feedback: [], error: error as Error };
  }
};

export const getFeedbackById = async (
  feedbackId: string,
): Promise<{ feedback: Feedback | null; error: Error | null }> => {
  try {
    const { data } = await axios.get(`/api/feedback/${feedbackId}`);

    return {
      feedback: {
        id: data.id,
        userId: data.user_id,
        subject: data.subject,
        type: data.type,
        message: data.message,
        status: data.status,
        createdAt: data.created_at,
        response: data.response || undefined,
        updatedAt: data.updated_at || undefined,
      },
      error: null,
    };
  } catch (error) {
    return { feedback: null, error: error as Error };
  }
};

export const getFeedbackByUser = async (
  userId: string,
): Promise<{ feedback: Feedback[]; error: Error | null }> => {
  try {
    const { data } = await axios.get('/api/feedback', {
      params: { user_id: userId },
    });

    const feedback: Feedback[] = data.map((f: any) => ({
      id: f.id,
      userId: f.user_id,
      subject: f.subject,
      type: f.type,
      message: f.message,
      status: f.status,
      createdAt: f.created_at,
      response: f.response || undefined,
      updatedAt: f.updated_at || undefined,
    }));

    return { feedback, error: null };
  } catch (error) {
    return { feedback: [], error: error as Error };
  }
};
