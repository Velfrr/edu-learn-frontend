import { Question, QuestionAnswer, Test, TestAttempt } from '../types/test';
import { QuestionType } from '../enums/question-types';

export const createTest = async (
  courseId: string,
  title: string,
  minPassPercentage: number,
  testOrder: number,
  questions?: any[],
): Promise<{ test: Test | null; error: Error | null }> => {
  try {
    const res = await fetch('/api/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, title, minPassPercentage, testOrder }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create test');

    const test: Test = {
      id: data.id,
      courseId: data.courseId,
      title: data.title,
      minPassPercentage: data.minPassPercentage,
      testOrder: data.testOrder,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    if (questions && questions.length > 0) {
      const results = await Promise.all(
        questions.map((q: any, index: number) =>
          addQuestion(
            test.id,
            q.type,
            q.question,
            q.options,
            q.correctAnswers,
            q.points,
            index,
          ),
        ),
      );
      test.questions = results.map((r) => r.question!).filter(Boolean);
    }

    return { test, error: null };
  } catch (error) {
    return { test: null, error: error as Error };
  }
};

export const updateTest = async (
  testId: string,
  updates: Partial<Test> & { questions?: any[] },
): Promise<{ test: Test | null; error: Error | null }> => {
  try {
    const res = await fetch(`/api/tests/${testId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update test');

    const test: Test = {
      id: data.id,
      courseId: data.courseId,
      title: data.title,
      minPassPercentage: data.minPassPercentage,
      testOrder: data.testOrder,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    if (updates.questions && updates.questions.length > 0) {
      await fetch(`/api/tests/${testId}/questions`, {
        method: 'DELETE',
      });

      const results = await Promise.all(
        updates.questions.map((q: any, index: number) =>
          addQuestion(
            testId,
            q.type,
            q.question,
            q.options,
            q.correctAnswers,
            q.points || 1,
            index,
          ),
        ),
      );
      test.questions = results.map((r) => r.question!).filter(Boolean);
    }

    return { test, error: null };
  } catch (error) {
    return { test: null, error: error as Error };
  }
};

export const deleteTest = async (
  testId: string,
): Promise<{ error: Error | null }> => {
  try {
    const res = await fetch(`/api/tests/${testId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete test');
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

export const getTestById = async (
  testId: string,
): Promise<{ test: Test | null; error: Error | null }> => {
  try {
    const res = await fetch(`/api/tests/${testId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Test not found');

    const { questions } = await getQuestionsByTest(testId);

    return {
      test: { ...data, questions },
      error: null,
    };
  } catch (error) {
    return { test: null, error: error as Error };
  }
};

export const getTestsByCourse = async (
  courseId: string,
): Promise<{ tests: Test[]; error: Error | null }> => {
  try {
    const res = await fetch(`/api/courses/${courseId}/tests`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch tests');

    const tests: Test[] = await Promise.all(
      data.map(async (test: any) => {
        const { questions } = await getQuestionsByTest(test.id);
        return { ...test, questions };
      }),
    );

    return { tests, error: null };
  } catch (error) {
    return { tests: [], error: error as Error };
  }
};

export const addQuestion = async (
  testId: string,
  type: QuestionType,
  question: string,
  options: string[] | null,
  correctAnswers: string[],
  points: number,
  questionOrder: number,
): Promise<{ question: Question | null; error: Error | null }> => {
  try {
    const res = await fetch(`/api/tests/${testId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        question,
        options,
        correctAnswers,
        points,
        questionOrder,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add question');

    return { question: data, error: null };
  } catch (error) {
    return { question: null, error: error as Error };
  }
};

export const getQuestionsByTest = async (
  testId: string,
): Promise<{ questions: Question[]; error: Error | null }> => {
  try {
    const res = await fetch(`/api/tests/${testId}/questions`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch questions');
    return { questions: data, error: null };
  } catch (error) {
    return { questions: [], error: error as Error };
  }
};

export const submitTestAttempt = async (
  testId: string,
  userId: string,
  answers: { questionId: string; answers: string[] }[],
): Promise<{ attempt: TestAttempt | null; error: Error | null }> => {
  try {
    const res = await fetch(`/api/tests/${testId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, answers }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to submit attempt');

    return { attempt: data, error: null };
  } catch (error) {
    return { attempt: null, error: error as Error };
  }
};

export const getTestAttemptsByUser = async (
  userId: string,
  testId?: string,
): Promise<{ attempts: TestAttempt[]; error: Error | null }> => {
  try {
    const url = testId
      ? `/api/users/${userId}/test-attempts?testId=${testId}`
      : `/api/users/${userId}/test-attempts`;

    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch attempts');

    return { attempts: data, error: null };
  } catch (error) {
    return { attempts: [], error: error as Error };
  }
};

export const hasPassedTest = async (
  userId: string,
  testId: string,
): Promise<{ hasPassed: boolean; error: Error | null }> => {
  try {
    const res = await fetch(`/api/tests/${testId}/has-passed?userId=${userId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to check pass status');

    return { hasPassed: data.hasPassed, error: null };
  } catch (error) {
    return { hasPassed: false, error: error as Error };
  }
};
