import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { CourseWithDetails } from '@/types/course';
import { Lesson } from '@/types/lesson';
import { Test } from '@/types/test';
import { getCourseWithDetails } from '@/api/course';
import {
  getLessonsByCourse,
  completeLesson,
  getLessonCompletionStatus,
} from '@/api/lesson';
import { getTestsByCourse, hasPassedTest } from '@/api/test';
import { BookOpen, CheckCircle, Star, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import StudentLessonView from '@/components/student/StudentLessonView';
import StudentTestView from '@/components/student/StudentTestView';

type ContentItem = {
  id: string;
  title: string;
  type: 'lesson' | 'test';
  order: number;
  completed: boolean;
  passedTest?: boolean;
};

const CourseDetail = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState<CourseWithDetails | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeContent, setActiveContent] = useState<ContentItem | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!id || !user) return;

    const loadCourseData = async () => {
      setIsLoading(true);
      try {
        const { course: courseData } = await getCourseWithDetails(id, user.id);
        if (!courseData) {
          toast({
            title: 'Error',
            description: 'Course not found',
            variant: 'destructive',
          });
          navigate('/student/courses');
          return;
        }
        setCourse(courseData);

        const { lessons: lessonsData } = await getLessonsByCourse(id);
        setLessons(lessonsData);

        const { tests: testsData } = await getTestsByCourse(id);
        setTests(testsData);

        const allContentItems: ContentItem[] = [];

        for (const lesson of lessonsData) {
          const { isCompleted } = await getLessonCompletionStatus(
            lesson.id,
            user.id,
          );
          allContentItems.push({
            id: lesson.id,
            title: lesson.title,
            type: 'lesson',
            order: lesson.lessonOrder,
            completed: isCompleted,
          });
        }

        for (const test of testsData) {
          const { hasPassed } = await hasPassedTest(user.id, test.id);
          allContentItems.push({
            id: test.id,
            title: test.title,
            type: 'test',
            order: test.testOrder,
            completed: hasPassed,
            passedTest: hasPassed,
          });
        }

        allContentItems.sort((a, b) => a.order - b.order);
        setContentItems(allContentItems);

        if (allContentItems.length > 0 && activeTab === 'content') {
          setActiveContent(allContentItems[0]);
        }
      } catch (error) {
        console.error('Error loading course data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load course data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCourseData();
  }, [id, user, navigate, toast]);

  const handleCompleteLesson = async (lessonId: string) => {
    if (!user) return;

    try {
      const { completion } = await completeLesson(lessonId, user.id);

      if (completion) {
        setContentItems((prevItems) =>
          prevItems.map((item) =>
            item.id === lessonId ? { ...item, completed: true } : item,
          ),
        );
        setActiveContent({ ...activeContent, completed: true });

        if (id) {
          const { course: updatedCourse } = await getCourseWithDetails(
            id,
            user.id,
          );
          if (updatedCourse) {
            setCourse(updatedCourse);
          }
        }

        toast({
          title: t('completion.success'),
          description: t('completion.lessonMarkedAsCompleted'),
        });
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark lesson as complete',
        variant: 'destructive',
      });
    }
  };

  const handleTestCompleted = async (testId: string, passed: boolean) => {
    setContentItems((prevItems) =>
      prevItems.map((item) =>
        item.id === testId
          ? { ...item, completed: passed, passedTest: passed }
          : item,
      ),
    );
    setActiveContent({
      ...activeContent,
      completed: passed,
      passedTest: passed,
    });

    if (id && user) {
      const { course: updatedCourse } = await getCourseWithDetails(id, user.id);
      if (updatedCourse) {
        setCourse(updatedCourse);
      }
    }
  };

  const findNextContent = () => {
    if (!activeContent || contentItems.length === 0) return null;

    const currentIndex = contentItems.findIndex(
      (item) => item.id === activeContent.id,
    );
    if (currentIndex === -1 || currentIndex === contentItems.length - 1)
      return null;

    return contentItems[currentIndex + 1];
  };

  const handleMoveToNext = () => {
    const nextContent = findNextContent();
    if (nextContent) {
      setActiveContent(nextContent);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Skeleton className="mb-2 h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Skeleton className="mb-4 h-64 w-full" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="mb-2 h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
            <div>
              <Skeleton className="mb-4 h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="py-12 text-center">
            <h2 className="mb-2 text-2xl font-bold">
              {t('courseDetail.errors.notFound.title')}
            </h2>
            <p className="mb-4 text-muted-foreground">
              {t('courseDetail.errors.notFound.description')}
            </p>
            <Button onClick={() => navigate('/student/courses')}>
              {t('courseDetail.errors.notFound.action')}
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const completedItems = contentItems.filter((item) => item.completed).length;
  const completionPercentage =
    contentItems.length > 0
      ? Math.round((completedItems / contentItems.length) * 100)
      : 0;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <div className="mt-1 flex items-center gap-2">
              <BookOpen size={16} />
              <span className="text-sm text-muted-foreground">
                {t('courseDetail.overview.lessonCount', {
                  count: course.lessonCount,
                })}{' '}
                ·{' '}
                {t('courseDetail.overview.testCount', { count: tests.length })}
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-center md:mt-0">
            <Badge
              variant={completionPercentage === 100 ? 'secondary' : 'outline'}
              className={
                completionPercentage === 100
                  ? 'bg-green-100 text-green-800'
                  : ''
              }
            >
              {t('courseDetail.progress.complete', {
                percentage: completionPercentage,
              })}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => navigate('/student/courses')}
            >
              {t('courseDetail.actions.backToCourses')}
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="overview">
              {t('courseDetail.overview.title')}
            </TabsTrigger>
            <TabsTrigger value="content">
              {t('courseDetail.content.title')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('courseDetail.overview.title')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{course.description}</p>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>{t('courseDetail.content.title')}</CardTitle>
                    <CardDescription>
                      {contentItems.length}{' '}
                      {contentItems.length === 1
                        ? t('courseDetail.overview.lessons')
                        : t('courseDetail.overview.tests')}{' '}
                      ·{' '}
                      {t('courseDetail.overview.lessonCount', {
                        count: lessons.length,
                      })}{' '}
                      ·{' '}
                      {t('courseDetail.overview.testCount', {
                        count: tests.length,
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => {
                        setActiveTab('content');
                        setActiveContent(contentItems[0] || null);
                      }}
                    >
                      {t('courseDetail.actions.startLearning')}{' '}
                      <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('courseDetail.progress.title')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          {t('courseDetail.progress.complete', {
                            percentage: completionPercentage,
                          })}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {t('courseDetail.progress.items', {
                            completed: completedItems,
                            total: contentItems.length,
                          })}
                        </span>
                      </div>
                      <Progress value={completionPercentage} className="h-2" />
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => {
                        const incompleteItem = contentItems.find(
                          (item) => !item.completed,
                        );
                        setActiveTab('content');
                        setActiveContent(
                          incompleteItem || contentItems[0] || null,
                        );
                      }}
                    >
                      {completionPercentage === 100
                        ? t('courseDetail.progress.reviewCourse')
                        : t('courseDetail.progress.continueLearning')}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('courseDetail.courseStats.title')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} />
                        <span>{t('courseDetail.courseStats.lessons')}</span>
                      </div>
                      <span>{lessons.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star size={16} />
                        <span>{t('courseDetail.courseStats.tests')}</span>
                      </div>
                      <span>{tests.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} />
                        <span>
                          {t('courseDetail.courseStats.completedItems')}
                        </span>
                      </div>
                      <span>
                        {completedItems}/{contentItems.length}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('courseDetail.content.title')}</CardTitle>
                    <CardDescription>
                      {completedItems}/{contentItems.length}{' '}
                      {t('courseDetail.progress.complete', {
                        percentage: completionPercentage,
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[500px] overflow-y-auto">
                      {contentItems.map((item, index) => (
                        <div
                          key={item.id}
                          className={`cursor-pointer border-b p-4 transition-colors last:border-b-0 hover:bg-accent/50 ${
                            activeContent?.id === item.id ? 'bg-accent' : ''
                          }`}
                          onClick={() => setActiveContent(item)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm">
                                  {index + 1}
                                </span>
                                <div>
                                  <p className="font-medium">{item.title}</p>
                                  <p className="text-xs capitalize text-muted-foreground">
                                    {t(
                                      `courseDetail.content.type.${item.type}`,
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                            {item.completed && (
                              <CheckCircle
                                size={16}
                                className="text-green-500"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-3">
                {activeContent ? (
                  <Card>
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <CardTitle>{activeContent.title}</CardTitle>
                        <Badge
                          variant={
                            activeContent.completed ? 'secondary' : 'outline'
                          }
                          className={
                            activeContent.completed
                              ? 'bg-green-100 text-green-800'
                              : ''
                          }
                        >
                          {activeContent.completed
                            ? t('courseDetail.content.status.completed')
                            : t('courseDetail.content.status.incomplete')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {activeContent.type === 'lesson' ? (
                        <StudentLessonView
                          lessonId={activeContent.id}
                          isCompleted={activeContent.completed}
                          onComplete={() =>
                            handleCompleteLesson(activeContent.id)
                          }
                          onMoveNext={handleMoveToNext}
                          showNextButton={
                            activeContent.id !==
                            contentItems[contentItems.length - 1].id
                          }
                        />
                      ) : (
                        <StudentTestView
                          testId={activeContent.id}
                          isPassed={activeContent.passedTest || false}
                          onTestComplete={(passed) =>
                            handleTestCompleted(activeContent.id, passed)
                          }
                          onMoveNext={handleMoveToNext}
                          showNextButton={
                            activeContent.id !==
                            contentItems[contentItems.length - 1].id
                          }
                        />
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-lg border">
                    <div className="text-center">
                      <p className="mb-2 text-lg font-medium">
                        {t('courseDetail.content.noContent')}
                      </p>
                      <p className="text-muted-foreground">
                        {t('courseDetail.content.noContentDescription')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default CourseDetail;
