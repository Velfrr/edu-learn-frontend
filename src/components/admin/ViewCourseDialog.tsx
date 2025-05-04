import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartBarBig,
  BookOpen,
  TestTube2,
  Users,
  CalendarDays,
} from 'lucide-react';
import { Course } from '@/types/course';
import { useTranslation } from 'react-i18next';

interface ViewCourseDialogProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ViewCourseDialog = ({
  course,
  open,
  onOpenChange,
}: ViewCourseDialogProps) => {
  const { t } = useTranslation();

  const { data: courseDetails, isLoading } = useQuery({
    queryKey: ['course-details', course?.id],
    queryFn: async () => {
      if (!course) return null;

      const courseId = course.id;

      const [
        { data: lessonCount },
        { data: testCount },
        { data: studentCount },
        { data: teacherData },
        { data: latestActivity },
        { data: testAttempts },
        { data: popularLessonIdData },
        popularLessonDataRes,
      ] = await Promise.all([
        axios.get(`/api/lessons/count`, { params: { courseId } }),
        axios.get(`/api/tests/count`, { params: { courseId } }),
        axios.get(`/api/enrollments/count`, { params: { courseId } }),
        axios.get(`/api/users/${course.createdBy}`),
        axios.get(`/api/activity/latest`, { params: { courseId } }),
        axios.get(`/api/tests/attempts`, { params: { courseId } }),
        axios.get(`/api/lessons/popular`, { params: { courseId } }),
        axios.get(`/api/lessons/title`, { params: { courseId } }),
      ]);

      const averageScore =
        testAttempts && testAttempts.length > 0
          ? Math.round(
              (testAttempts.reduce(
                (sum: number, attempt: any) =>
                  sum + attempt.score / attempt.max_score,
                0,
              ) /
                testAttempts.length) *
                100,
            )
          : null;

      return {
        lessonCount: lessonCount.count || 0,
        testCount: testCount.count || 0,
        studentCount: studentCount.count || 0,
        teacher: teacherData,
        latestActivity: latestActivity?.completed_at,
        averageScore,
        popularLesson: popularLessonDataRes?.data?.title || 'N/A',
      };
    },
    enabled: !!course && open,
  });

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{course.title}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div>
            <h4 className="mb-2 font-medium">
              {t('courses.viewCourseDialog.description')}
            </h4>
            <p className="text-sm text-muted-foreground">
              {course.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card className="bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                <BookOpen className="mb-2 h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-bold">
                  {isLoading ? (
                    <Skeleton className="mx-auto h-7 w-12" />
                  ) : (
                    courseDetails?.lessonCount || 0
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {t('courses.viewCourseDialog.lessons')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                <TestTube2 className="mb-2 h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-bold">
                  {isLoading ? (
                    <Skeleton className="mx-auto h-7 w-12" />
                  ) : (
                    courseDetails?.testCount || 0
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {t('courses.viewCourseDialog.tests')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                <Users className="mb-2 h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-bold">
                  {isLoading ? (
                    <Skeleton className="mx-auto h-7 w-12" />
                  ) : (
                    courseDetails?.studentCount || 0
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {t('courses.viewCourseDialog.students')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                <ChartBarBig className="mb-2 h-8 w-8 text-primary" />
                <CardTitle className="text-xl font-bold">
                  {isLoading ? (
                    <Skeleton className="mx-auto h-7 w-12" />
                  ) : courseDetails?.averageScore !== null ? (
                    `${courseDetails?.averageScore}%`
                  ) : (
                    'N/A'
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {t('courses.viewCourseDialog.avgScore')}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium">
                {t('courses.viewCourseDialog.teacherInformation')}
              </h4>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                </div>
              ) : (
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>
                    <span className="font-medium">
                      {t('courses.viewCourseDialog.name')}:
                    </span>{' '}
                    {courseDetails?.teacher?.full_name || 'N/A'}
                  </li>
                  <li>
                    <span className="font-medium">
                      {t('courses.viewCourseDialog.email')}:
                    </span>{' '}
                    {courseDetails?.teacher?.email || 'N/A'}
                  </li>
                </ul>
              )}
            </div>

            <div>
              <h4 className="mb-2 font-medium">
                {t('courses.viewCourseDialog.courseActivity')}
              </h4>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                </div>
              ) : (
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>
                    <span className="font-medium">
                      {t('courses.viewCourseDialog.latestActivity')}:
                    </span>{' '}
                    {courseDetails?.latestActivity
                      ? new Date(
                          courseDetails.latestActivity,
                        ).toLocaleDateString()
                      : 'No activity yet'}
                  </li>
                  <li>
                    <span className="font-medium">
                      {t('courses.viewCourseDialog.mostPopularLesson')}:
                    </span>{' '}
                    {courseDetails?.popularLesson || 'N/A'}
                  </li>
                </ul>
              )}
            </div>
          </div>

          {course.imageUrl && (
            <div>
              <h4 className="mb-2 font-medium">
                {t('courses.viewCourseDialog.courseImage')}
              </h4>
              <img
                src={course.imageUrl}
                alt={course.title}
                className="h-48 w-full rounded-md object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              <span>
                {t('courses.viewCourseDialog.created')}:{' '}
                {new Date(course.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              <span>
                {t('courses.viewCourseDialog.updated')}:{' '}
                {new Date(course.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewCourseDialog;
