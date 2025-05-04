import axios from 'axios';
import { Lesson, LessonCompletion } from '../types/lesson';

export const createLesson = async (
  courseId: string,
  title: string,
  content: string,
  lessonOrder: number,
): Promise<{ lesson: Lesson | null; error: Error | null }> => {
  try {
    const now = new Date().toISOString();
    const { data } = await axios.post('/api/lessons', {
      course_id: courseId,
      title,
      content,
      lesson_order: lessonOrder,
      created_at: now,
      updated_at: now,
    });

    return {
      lesson: {
        id: data.id,
        courseId: data.course_id,
        title: data.title,
        content: data.content,
        lessonOrder: data.lesson_order,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
      error: null,
    };
  } catch (error) {
    return { lesson: null, error: error as Error };
  }
};

export const updateLesson = async (
  lessonId: string,
  updates: Partial<Lesson>,
): Promise<{ lesson: Lesson | null; error: Error | null }> => {
  try {
    const { data } = await axios.patch(`/api/lessons/${lessonId}`, {
      title: updates.title,
      content: updates.content,
      lesson_order: updates.lessonOrder,
      updated_at: new Date().toISOString(),
    });

    return {
      lesson: {
        id: data.id,
        courseId: data.course_id,
        title: data.title,
        content: data.content,
        lessonOrder: data.lesson_order,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
      error: null,
    };
  } catch (error) {
    return { lesson: null, error: error as Error };
  }
};

export const deleteLesson = async (
  lessonId: string,
): Promise<{ error: Error | null }> => {
  try {
    await axios.delete(`/api/lessons/${lessonId}`);
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

export const getLessonById = async (
  lessonId: string,
): Promise<{ lesson: Lesson | null; error: Error | null }> => {
  try {
    const { data } = await axios.get(`/api/lessons/${lessonId}`);

    return {
      lesson: {
        id: data.id,
        courseId: data.course_id,
        title: data.title,
        content: data.content,
        lessonOrder: data.lesson_order,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
      error: null,
    };
  } catch (error) {
    return { lesson: null, error: error as Error };
  }
};

export const getLessonsByCourse = async (
  courseId: string,
): Promise<{ lessons: Lesson[]; error: Error | null }> => {
  try {
    const { data } = await axios.get(`/api/courses/${courseId}/lessons`);

    const lessons: Lesson[] = data.map((lesson: any) => ({
      id: lesson.id,
      courseId: lesson.course_id,
      title: lesson.title,
      content: lesson.content,
      lessonOrder: lesson.lesson_order,
      createdAt: lesson.created_at,
      updatedAt: lesson.updated_at,
    }));

    return { lessons, error: null };
  } catch (error) {
    return { lessons: [], error: error as Error };
  }
};

export const completeLesson = async (
  lessonId: string,
  userId: string,
): Promise<{ completion: LessonCompletion | null; error: Error | null }> => {
  try {
    const { data: existing } = await axios.get('/api/lesson-completions', {
      params: { lesson_id: lessonId, user_id: userId },
    });

    if (existing?.id) {
      return {
        completion: {
          id: existing.id,
          lessonId: existing.lesson_id,
          userId: existing.user_id,
          completedAt: existing.completed_at,
        },
        error: null,
      };
    }

    const completedAt = new Date().toISOString();
    const { data } = await axios.post('/api/lesson-completions', {
      lesson_id: lessonId,
      user_id: userId,
      completed_at: completedAt,
    });

    return {
      completion: {
        id: data.id,
        lessonId: data.lesson_id,
        userId: data.user_id,
        completedAt: data.completed_at,
      },
      error: null,
    };
  } catch (error) {
    return { completion: null, error: error as Error };
  }
};

export const getLessonCompletionStatus = async (
  lessonId: string,
  userId: string,
): Promise<{
  isCompleted: boolean;
  completedAt?: string;
  error: Error | null;
}> => {
  try {
    const { data } = await axios.get('/api/lesson-completions', {
      params: { lesson_id: lessonId, user_id: userId },
    });

    return {
      isCompleted: !!data,
      completedAt: data?.completed_at,
      error: null,
    };
  } catch (error) {
    return { isCompleted: false, error: error as Error };
  }
};

export const getLessonCompletionsByCourse = async (
  courseId: string,
  userId: string,
): Promise<{ completions: Record<string, boolean>; error: Error | null }> => {
  try {
    const { data: lessons } = await axios.get(
      `/api/courses/${courseId}/lessons`,
    );

    if (!lessons.length) return { completions: {}, error: null };

    const { data: completions } = await axios.get('/api/lesson-completions', {
      params: {
        user_id: userId,
        lesson_ids: lessons.map((l: any) => l.id),
      },
    });

    const completionMap: Record<string, boolean> = {};
    lessons.forEach((lesson: any) => {
      completionMap[lesson.id] = completions.some(
        (c: any) => c.lesson_id === lesson.id,
      );
    });

    return { completions: completionMap, error: null };
  } catch (error) {
    return { completions: {}, error: error as Error };
  }
};
