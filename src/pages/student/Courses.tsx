import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { CourseWithDetails } from '@/types/course';
import {
  getCoursesByStudent,
  getAllCourses,
  getCourseWithDetails,
} from '@/api/course';
import { enrollStudent } from '@/api/course';
import { toast } from '@/components/ui/use-toast';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';

const Courses = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithDetails[]>(
    [],
  );
  const [availableCourses, setAvailableCourses] = useState<CourseWithDetails[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true);
      try {
        if (!user) return;

        const { courses: studentCourses } = await getCoursesByStudent(user.id);

        const coursesWithDetails: CourseWithDetails[] = [];
        for (const course of studentCourses) {
          const { course: courseDetails } = await getCourseWithDetails(
            course.id,
            user.id,
          );
          if (courseDetails) {
            coursesWithDetails.push(courseDetails);
          }
        }
        setEnrolledCourses(coursesWithDetails);

        const { courses: allCourses } = await getAllCourses();

        const enrolledIds = new Set(studentCourses.map((course) => course.id));
        const availableWithDetails: CourseWithDetails[] = [];

        for (const course of allCourses.filter((c) => !enrolledIds.has(c.id))) {
          const { course: courseDetails } = await getCourseWithDetails(
            course.id,
          );
          if (courseDetails) {
            availableWithDetails.push(courseDetails);
          }
        }
        setAvailableCourses(availableWithDetails);
      } catch (error) {
        console.error('Error loading courses:', error);
        toast({
          title: 'Error',
          description: 'Failed to load courses. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, [user]);

  const handleEnroll = async (courseId: string) => {
    if (!user) return;

    setEnrollingCourseId(courseId);
    try {
      const { enrollment, error } = await enrollStudent(courseId, user.id);

      if (error) throw error;

      if (enrollment) {
        toast({
          title: t('actions.success'),
          description: t('actions.youHaveBeenEnrolled'),
        });

        const { course: newEnrolledCourse } = await getCourseWithDetails(
          courseId,
          user.id,
        );

        if (newEnrolledCourse) {
          setEnrolledCourses((prev) => [...prev, newEnrolledCourse]);
          setAvailableCourses((prev) =>
            prev.filter((course) => course.id !== courseId),
          );
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: t('student.courses.enrollmentError'),
        variant: 'destructive',
      });
      console.error('Error enrolling in course:', error);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const renderCourseCard = (course: CourseWithDetails, isEnrolled: boolean) => (
    <Card key={course.id} className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="truncate">{course.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {course.description}
        </p>
        <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground">
          <BookOpen size={16} />
          <span>
            {t('student.courses.lessonCount', { count: course.lessonCount })}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        {isEnrolled ? (
          <Button
            className="w-full"
            onClick={() => navigate(`/student/courses/${course.id}`)}
          >
            {t('student.courses.continueLearning')}{' '}
            <ArrowRight className="ml-2" size={16} />
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={() => handleEnroll(course.id)}
            disabled={enrollingCourseId === course.id}
          >
            {enrollingCourseId === course.id
              ? t('student.courses.enrolling')
              : t('student.courses.enrollNow')}
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  const renderSkeletonCard = () => (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="flex-grow">
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-5/6" />
        <Skeleton className="mb-4 h-4 w-4/6" />
        <div className="mt-4 flex items-center gap-1">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">
          {t('student.courses.title')}
        </h1>

        <Tabs defaultValue="enrolled">
          <TabsContent value="enrolled">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index}>{renderSkeletonCard()}</div>
                ))}
              </div>
            ) : enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses.map((course) =>
                  renderCourseCard(course, true),
                )}
              </div>
            ) : (
              <div className="py-12 text-center">
                <h3 className="mb-2 text-xl font-medium">
                  {t('student.courses.notEnrolledTitle')}
                </h3>
                <p className="mb-4 text-muted-foreground">
                  {t('student.courses.notEnrolledDescription')}
                </p>
                <Button
                  onClick={() => {
                    const browseTab = document.querySelector(
                      '[data-value="browse"]',
                    );
                    if (browseTab instanceof HTMLElement) {
                      browseTab.click();
                    }
                  }}
                >
                  {t('student.courses.browseCoursesButton')}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="browse">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index}>{renderSkeletonCard()}</div>
                ))}
              </div>
            ) : availableCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {availableCourses.map((course) =>
                  renderCourseCard(course, false),
                )}
              </div>
            ) : (
              <div className="py-12 text-center">
                <h3 className="mb-2 text-xl font-medium">
                  {t('student.courses.noAvailableTitle')}
                </h3>
                <p className="text-muted-foreground">
                  {t('student.courses.noAvailableDescription')}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Courses;
