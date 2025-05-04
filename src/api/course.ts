import axios from 'axios';
import { Course, CourseEnrollment, CourseWithDetails } from '../types/course';

export const createCourse = async (
  title: string,
  description: string,
  createdBy: string,
  imageUrl?: string,
): Promise<{ course: Course | null; error: Error | null }> => {
  try {
    const now = new Date().toISOString();

    const { data } = await axios.post('/api/courses', {
      title,
      description,
      image_url: imageUrl,
      created_by: createdBy,
      created_at: now,
      updated_at: now,
    });

    return {
      course: {
        id: data.id,
        title: data.title,
        description: data.description,
        imageUrl: data.image_url || undefined,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
      error: null,
    };
  } catch (error) {
    return { course: null, error: error as Error };
  }
};

export const updateCourse = async (
  courseId: string,
  updates: Partial<Course>,
): Promise<{ course: Course | null; error: Error | null }> => {
  try {
    const { data } = await axios.patch(`/api/courses/${courseId}`, {
      title: updates.title,
      description: updates.description,
      image_url: updates.imageUrl,
      updated_at: new Date().toISOString(),
    });

    return {
      course: {
        id: data.id,
        title: data.title,
        description: data.description,
        imageUrl: data.image_url || undefined,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
      error: null,
    };
  } catch (error) {
    return { course: null, error: error as Error };
  }
};

export const deleteCourse = async (
  courseId: string,
): Promise<{ error: Error | null }> => {
  try {
    await axios.delete(`/api/courses/${courseId}`);
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

export const getCourseById = async (
  courseId: string,
): Promise<{ course: Course | null; error: Error | null }> => {
  try {
    const { data } = await axios.get(`/api/courses/${courseId}`);

    return {
      course: {
        id: data.id,
        title: data.title,
        description: data.description,
        imageUrl: data.image_url || undefined,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
      error: null,
    };
  } catch (error) {
    return { course: null, error: error as Error };
  }
};

export const getCoursesByTeacher = async (
  teacherId: string,
): Promise<{ courses: Course[]; error: Error | null }> => {
  try {
    const { data } = await axios.get('/api/courses', {
      params: { created_by: teacherId },
    });

    const courses: Course[] = data.map((course: any) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      imageUrl: course.image_url || undefined,
      createdBy: course.created_by,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
    }));

    return { courses, error: null };
  } catch (error) {
    return { courses: [], error: error as Error };
  }
};

export const getAllCourses = async (): Promise<{
  courses: Course[];
  error: Error | null;
}> => {
  try {
    const { data } = await axios.get('/api/courses');

    const courses: Course[] = data.map((course: any) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      imageUrl: course.image_url || undefined,
      createdBy: course.created_by,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
    }));

    return { courses, error: null };
  } catch (error) {
    return { courses: [], error: error as Error };
  }
};

export const getCoursesByStudent = async (
  studentId: string,
): Promise<{ courses: Course[]; error: Error | null }> => {
  try {
    const { data: enrollments } = await axios.get('/api/course_enrollments', {
      params: { user_id: studentId },
    });

    if (!enrollments || enrollments.length === 0) {
      return { courses: [], error: null };
    }

    const courseIds = enrollments.map((e: any) => e.course_id);

    const { data: coursesData } = await axios.post('/api/courses/bulk', {
      ids: courseIds,
    });

    const courses: Course[] = coursesData.map((course: any) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      imageUrl: course.image_url || undefined,
      createdBy: course.created_by,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
    }));

    return { courses, error: null };
  } catch (error) {
    return { courses: [], error: error as Error };
  }
};

export const enrollStudent = async (
  courseId: string,
  studentId: string,
): Promise<{ enrollment: CourseEnrollment | null; error: Error | null }> => {
  try {
    const { data: existingEnrollment } = await axios.get(
      '/api/course_enrollments',
      {
        params: { course_id: courseId, user_id: studentId },
      },
    );

    if (existingEnrollment) {
      return {
        enrollment: {
          id: existingEnrollment.id,
          courseId: existingEnrollment.course_id,
          userId: existingEnrollment.user_id,
          enrolledAt: existingEnrollment.enrolled_at,
        },
        error: null,
      };
    }

    const enrolledAt = new Date().toISOString();

    const { data } = await axios.post('/api/course_enrollments', {
      course_id: courseId,
      user_id: studentId,
      enrolled_at: enrolledAt,
    });

    return {
      enrollment: {
        id: data.id,
        courseId: data.course_id,
        userId: data.user_id,
        enrolledAt: data.enrolled_at,
      },
      error: null,
    };
  } catch (error) {
    return { enrollment: null, error: error as Error };
  }
};

export const unenrollStudent = async (
  courseId: string,
  studentId: string,
): Promise<{ error: Error | null }> => {
  try {
    await axios.delete(`/api/course_enrollments`, {
      data: { courseId, userId: studentId },
    });

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

export const getEnrolledStudentsByCourse = async (
  courseId: string,
): Promise<{ studentIds: string[]; error: Error | null }> => {
  try {
    const { data } = await axios.get('/api/course_enrollments', {
      params: { course_id: courseId },
    });

    const studentIds = data.map((enrollment: any) => enrollment.user_id);

    return { studentIds, error: null };
  } catch (error) {
    return { studentIds: [], error: error as Error };
  }
};

export const getCourseWithDetails = async (
  courseId: string,
  userId?: string,
): Promise<{ course: CourseWithDetails | null; error: Error | null }> => {
  try {
    const { course, error: courseError } = await getCourseById(courseId);
    if (courseError) throw courseError;
    if (!course) throw new Error('Course not found');

    const { data: lessonCount } = await axios.get('/api/lessons/count', {
      params: { courseId },
    });

    const { data: studentCount } = await axios.get(
      '/api/course_enrollments/count',
      {
        params: { courseId },
      },
    );

    let completionPercentage;
    if (userId) {
      const { data: allLessonsData } = await axios.get('/api/lessons', {
        params: { course_id: courseId },
      });
      const totalLessons = allLessonsData.length;

      if (totalLessons > 0) {
        const { data: completedLessonsData } = await axios.get(
          '/api/lesson_completions',
          {
            params: {
              user_id: userId,
              lesson_ids: allLessonsData.map((l: any) => l.id),
            },
          },
        );
        const completedLessons = completedLessonsData.length;
        completionPercentage = (completedLessons / totalLessons) * 100;
      }
    }

    return {
      course: {
        ...course,
        lessonCount,
        studentCount,
        completionPercentage,
      },
      error: null,
    };
  } catch (error) {
    return { course: null, error: error as Error };
  }
};
