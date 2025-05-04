import axios from 'axios';

interface EnrollmentData {
  courseName: string;
  enrollments: number;
}

interface CompletionData {
  courseId: string;
  courseName: string;
  completionRate: number;
}

interface LessonPerformanceData {
  lessonName: string;
  completionRate: number;
  averageScore: number;
}

interface CourseAnalytics {
  enrollments: EnrollmentData[];
  completions: CompletionData[];
  lessonPerformance: LessonPerformanceData[];
}

export const getCourseAnalytics = async (
  teacherId: string,
): Promise<CourseAnalytics> => {
  try {
    const { data: courses } = await axios.get('/api/courses/by-teacher', {
      params: { teacherId },
    });

    const courseIds = courses.map((course: any) => course.id);

    const { data: enrollments } = await axios.post(
      '/api/enrollments/by-courses',
      {
        courseIds,
      },
    );

    const enrollmentData: EnrollmentData[] = courses.map((course: any) => ({
      courseName: course.title,
      enrollments: enrollments.filter((e: any) => e.course_id === course.id)
        .length,
    }));

    const { data: lessonCompletions } = await axios.post(
      '/api/lesson-completions/by-courses',
      {
        courseIds,
      },
    );

    const { data: testAttempts } = await axios.post(
      '/api/test-attempts/by-courses',
      {
        courseIds,
      },
    );

    const completionData: CompletionData[] = courses.map((course: any) => {
      const courseCompletions = lessonCompletions.filter(
        (lc: any) => lc.course_id === course.id,
      );
      const completionRate =
        courseCompletions.length > 0 && enrollments.length > 0
          ? (courseCompletions.length / enrollments.length) * 100
          : 0;

      return {
        courseId: course.id,
        courseName: course.title,
        completionRate,
      };
    });

    const { data: lessons } = await axios.post('/api/lessons/by-courses', {
      courseIds,
    });

    const lessonPerformanceData: LessonPerformanceData[] = lessons.map(
      (lesson: any) => {
        const lessonCompletionCount = lessonCompletions.filter(
          (lc: any) => lc.lesson_id === lesson.id,
        ).length;
        const completionRate =
          enrollments.length > 0
            ? (lessonCompletionCount / enrollments.length) * 100
            : 0;

        const lessonTests = testAttempts.filter(
          (ta: any) => ta.course_id === lesson.course_id,
        );
        const averageScore =
          lessonTests.length > 0
            ? lessonTests.reduce(
                (acc: number, curr: any) =>
                  acc + (curr.score / curr.max_score) * 100,
                0,
              ) / lessonTests.length
            : 0;

        return {
          lessonName: lesson.title,
          completionRate,
          averageScore,
        };
      },
    );

    return {
      enrollments: enrollmentData,
      completions: completionData,
      lessonPerformance: lessonPerformanceData,
    };
  } catch (error) {
    console.error('Error fetching course analytics:', error);
    throw error;
  }
};
