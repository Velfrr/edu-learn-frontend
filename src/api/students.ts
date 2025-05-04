import axios from 'axios';
import { User } from '../types/user';
import { LessonCompletion } from '../types/lesson';
import { TestAttempt } from '../types/test';
import { UserRole } from '@/enums/roles';
import { TFunction } from 'i18next';

export const getStudentsByCourse = async (
  courseId: string,
): Promise<{ students: User[]; error: Error | null }> => {
  try {
    const { data: enrollments } = await axios.get(
      `/api/courses/${courseId}/enrollments`,
    );

    if (!enrollments.length) return { students: [], error: null };

    const userIds = enrollments.map((e: any) => e.user_id);
    const { data: profiles } = await axios.post('/api/users/batch', {
      ids: userIds,
    });

    const students: User[] = profiles.map((profile: any) => ({
      id: profile.id,
      email: '',
      fullName: profile.full_name,
      role: profile.role,
      createdAt: profile.created_at,
      lastActive: profile.last_active || undefined,
    }));

    return { students, error: null };
  } catch (error) {
    return { students: [], error: error as Error };
  }
};

export const getStudentProgress = async (
  courseId: string,
  studentId: string,
): Promise<{
  lessonCompletions: LessonCompletion[];
  testAttempts: TestAttempt[];
  error: Error | null;
}> => {
  try {
    const { data: lessonCompletions } = await axios.get(
      '/api/lesson-completions',
      {
        params: { user_id: studentId, course_id: courseId },
      },
    );

    const { data: testAttempts } = await axios.get('/api/test-attempts', {
      params: { user_id: studentId, course_id: courseId },
    });

    return {
      lessonCompletions: lessonCompletions.map((lc: any) => ({
        id: lc.id,
        lessonId: lc.lesson_id,
        userId: studentId,
        completedAt: lc.completed_at,
      })),
      testAttempts: testAttempts.map((ta: any) => ({
        id: ta.id,
        testId: ta.test_id,
        userId: studentId,
        score: ta.score,
        maxScore: ta.max_score,
        isPassed: ta.is_passed,
        completedAt: ta.completed_at,
      })),
      error: null,
    };
  } catch (error) {
    return {
      lessonCompletions: [],
      testAttempts: [],
      error: error as Error,
    };
  }
};

export const getTeacherStudents = async (
  teacherId: string,
): Promise<{
  students: { user: User; enrolledCourses: number }[];
  error: Error | null;
}> => {
  try {
    const { data: courses } = await axios.get(
      `/api/teachers/${teacherId}/courses`,
    );
    if (!courses.length) return { students: [], error: null };

    const { data: enrollments } = await axios.post(
      '/api/courses/enrollments/batch',
      {
        courseIds: courses.map((c: any) => c.id),
      },
    );

    if (!enrollments.length) return { students: [], error: null };

    const enrollmentMap = enrollments.reduce((acc: any, curr: any) => {
      acc[curr.user_id] = (acc[curr.user_id] || 0) + 1;
      return acc;
    }, {});

    const studentIds = Object.keys(enrollmentMap);
    const { data: profiles } = await axios.post('/api/users/batch', {
      ids: studentIds,
    });

    const students = profiles.map((profile: any) => ({
      user: {
        id: profile.id,
        email: '',
        fullName: profile.full_name,
        role: profile.role,
        createdAt: profile.created_at,
        lastActive: profile.last_active || undefined,
      },
      enrolledCourses: enrollmentMap[profile.id],
    }));

    return { students, error: null };
  } catch (error) {
    return { students: [], error: error as Error };
  }
};

export const enrollStudentByEmail = async (
  courseId: string,
  email: string,
  t: TFunction,
): Promise<{
  enrollment: { id: string } | null;
  error: Error | null;
}> => {
  try {
    const { data: userData } = await axios.get('/api/users/by-email', {
      params: { email },
    });

    if (!userData || !userData.id) {
      throw new Error(t('enrollErrors.userNotFound'));
    }

    const { data: profileData } = await axios.get(
      `/api/users/${userData.id}/profile`,
    );

    if (profileData.role !== UserRole.STUDENT) {
      throw new Error(t('enrollErrors.onlyStudentsCanEnroll'));
    }

    const { data: enrollment } = await axios.post('/api/enroll', {
      course_id: courseId,
      user_id: userData.id,
    });

    return { enrollment, error: null };
  } catch (error: any) {
    const isDuplicate = error?.response?.data?.code === '23505';
    return {
      enrollment: null,
      error: new Error(
        isDuplicate
          ? t('enrollErrors.alreadyEnrolled')
          : error.message || t('enrollErrors.userNotFound'),
      ),
    };
  }
};

export const unenrollStudent = async (
  courseId: string,
  studentId: string,
): Promise<{ error: Error | null }> => {
  try {
    await axios.delete('/api/enroll', {
      data: { course_id: courseId, user_id: studentId },
    });
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};
