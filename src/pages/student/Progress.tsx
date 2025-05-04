import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getCoursesByStudent } from '@/api/course';
import { getStudentProgress } from '@/api/students';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import MainLayout from '@/components/layout/MainLayout';
import { useTranslation } from 'react-i18next';

const MyProgress = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [aggregateStats, setAggregateStats] = React.useState({
    totalLessonsCompleted: 0,
    totalTests: 0,
    totalTestsPassed: 0,
    totalScoreSum: 0,
    totalScoreMax: 0,
  });

  const {
    data: coursesData,
    isLoading: loadingCourses,
    error: coursesError,
  } = useQuery({
    queryKey: ['my-courses', user?.id],
    queryFn: () =>
      user
        ? getCoursesByStudent(user.id)
        : Promise.resolve({ courses: [], error: null }),
    enabled: !!user,
  });

  const courseProgressQueries = React.useMemo(() => {
    if (!user || !coursesData?.courses) return [];

    return coursesData.courses.map((course) => ({
      courseId: course.id,
      courseTitle: course.title,
      courseDescription: course.description,
    }));
  }, [user, coursesData?.courses]);

  const updateAggregateStats = (courseStats) => {
    setAggregateStats((prevStats) => ({
      totalLessonsCompleted:
        prevStats.totalLessonsCompleted + courseStats.lessonCompletions.length,
      totalTests: prevStats.totalTests + courseStats.testAttempts.length,
      totalTestsPassed:
        prevStats.totalTestsPassed + courseStats.testsPassedCount,
      totalScoreSum: prevStats.totalScoreSum + courseStats.totalScoreSum,
      totalScoreMax: prevStats.totalScoreMax + courseStats.totalScoreMax,
    }));
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">
          {t('student.progress.title')}
        </h1>
        {loadingCourses ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('student.progress.loading.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-3 h-4 w-2/3" />
              <Skeleton className="mb-3 h-4 w-1/2" />
              <Skeleton className="h-28 w-full" />
            </CardContent>
          </Card>
        ) : coursesError ? (
          <Card>
            <CardContent className="text-center text-red-500">
              {t('student.progress.error.title')}
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{t('student.progress.overallSummary')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>{t('student.progress.lessonsCompleted')}</span>
                    <span>{aggregateStats.totalLessonsCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('student.progress.testsAttempted')}</span>
                    <span>{aggregateStats.totalTests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('student.progress.testsPassed')}</span>
                    <span>
                      {aggregateStats.totalTestsPassed} /{' '}
                      {aggregateStats.totalTests}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('student.progress.averageTestScore')}</span>
                    <span>
                      {aggregateStats.totalScoreMax > 0
                        ? Math.round(
                            (aggregateStats.totalScoreSum /
                              aggregateStats.totalScoreMax) *
                              100 *
                              100,
                          ) / 100
                        : 0}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      aggregateStats.totalScoreMax > 0
                        ? (aggregateStats.totalScoreSum /
                            aggregateStats.totalScoreMax) *
                          100
                        : 0
                    }
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="my-8" />
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{t('student.progress.progressByCourse')}</CardTitle>
              </CardHeader>
              <CardContent>
                {courseProgressQueries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('student.progress.notEnrolled')}
                  </p>
                ) : (
                  <Accordion type="multiple">
                    {courseProgressQueries.map((course) => (
                      <CourseProgressItem
                        key={course.courseId}
                        courseId={course.courseId}
                        courseTitle={course.courseTitle}
                        courseDescription={course.courseDescription}
                        userId={user?.id || ''}
                        onProgressLoaded={updateAggregateStats}
                      />
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
};

const CourseProgressItem = ({
  courseId,
  courseTitle,
  courseDescription,
  userId,
  onProgressLoaded,
}) => {
  const { t } = useTranslation();
  const {
    data: progress,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['my-progress', userId, courseId],
    queryFn: () => getStudentProgress(courseId, userId),
    enabled: !!userId && !!courseId,
  });

  const courseStats = React.useMemo(() => {
    if (!progress)
      return {
        lessonCompletions: [],
        testAttempts: [],
        testsPassedCount: 0,
        averageScore: 0,
        totalScoreSum: 0,
        totalScoreMax: 0,
      };

    const { lessonCompletions = [], testAttempts = [] } = progress;
    const testsPassedCount = testAttempts.filter((t) => t.isPassed).length;

    const totalScoreSum = testAttempts.reduce((acc, t) => acc + t.score, 0);
    const totalScoreMax = testAttempts.reduce((acc, t) => acc + t.maxScore, 0);

    const averageScore =
      testAttempts.length > 0 ? (totalScoreSum / totalScoreMax) * 100 : 0;

    return {
      lessonCompletions,
      testAttempts,
      testsPassedCount,
      averageScore,
      totalScoreSum,
      totalScoreMax,
    };
  }, [progress]);

  React.useEffect(() => {
    if (courseStats) {
      onProgressLoaded(courseStats);
    }
  }, [JSON.stringify(courseStats)]);

  return (
    <AccordionItem value={courseId}>
      <AccordionTrigger>
        <div className="flex flex-col gap-1">
          <span className="font-medium">{courseTitle}</span>
          <span className="text-xs text-gray-400">{courseDescription}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {isLoading ? (
          <Skeleton className="mb-2 h-4 w-1/2" />
        ) : error ? (
          <span className="text-xs text-red-500">
            {t('student.progress.error.title')}
          </span>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{t('student.progress.lessonsCompleted')}</span>
              <span>{courseStats.lessonCompletions.length}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('student.progress.testsAttempted')}</span>
              <span>{courseStats.testAttempts.length}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('student.progress.testsPassed')}</span>
              <span>
                {courseStats.testsPassedCount} /{' '}
                {courseStats.testAttempts.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t('student.progress.averageTestScore')}</span>
              <span>{Math.round(courseStats.averageScore * 100) / 100}%</span>
            </div>
            <Progress value={courseStats.averageScore} className="h-2" />
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default MyProgress;
