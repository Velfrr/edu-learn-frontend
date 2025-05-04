import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCoursesByTeacher, deleteCourse } from '@/api/course';
import { useAuth } from '@/contexts/AuthContext';
import { Course } from '@/types/course';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import MainLayout from '@/components/layout/MainLayout';
import { useTranslation } from 'react-i18next';

const CoursesList = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teacherCourses', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const response = await getCoursesByTeacher(user.id);
      if (response.error) throw response.error;
      return response.courses;
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const result = await deleteCourse(courseId);
      if (result.error) throw result.error;
      return courseId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacherCourses', user?.id] });
      toast({
        title: t('common.courseDeleted'),
        description: t('courses.courseDetail.courseDeletedSuccess'),
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('common.error'),
        variant: 'destructive',
      });
    },
  });

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      deleteMutation.mutate(courseToDelete.id);
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setCourseToDelete(null);
  };

  const renderNoCoursesContent = () => (
    <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/10 py-16 text-center">
      <h3 className="mb-2 text-lg font-medium">
        {t('courses.courseList.noCoursesFound')}
      </h3>
      <p className="mb-6 text-muted-foreground">
        {t('courses.courseList.noCoursesDescription')}
      </p>
      <Button
        onClick={() => navigate('/teacher/courses/new')}
        className="flex items-center gap-2"
      >
        <Plus size={16} />
        {t('courses.courseList.createFirstCourse')}
      </Button>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          {[1, 2, 3].map((_, index) => (
            <Skeleton key={index} className="h-48 w-full" />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="py-8 text-center text-destructive">
          <p className="mb-2">{t('courses.courseList.errorLoading')}</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : t('common.error')}
          </p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            {t('common.tryAgain')}
          </Button>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return renderNoCoursesContent();
    }

    return data.map(renderCourseCard);
  };

  const renderCourseCard = (course: Course) => (
    <Card key={course.id} className="mb-6 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{course.title}</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="line-clamp-3 text-muted-foreground">
          {course.description}
        </p>
      </CardContent>

      <CardFooter className="flex flex-wrap justify-between gap-2 border-t pt-2">
        <div className="text-xs text-muted-foreground">
          {t('courses.courseList.createdOn', {
            date: new Date(course.createdAt).toLocaleDateString(),
          })}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => navigate(`/teacher/courses/${course.id}`)}
          >
            <Eye size={16} /> {t('common.view')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => navigate(`/teacher/courses/${course.id}?edit=true`)}
          >
            <Pencil size={16} /> {t('common.edit')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-destructive hover:bg-destructive/10"
            onClick={() => handleDeleteClick(course)}
          >
            <Trash2 size={16} /> {t('common.delete')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <MainLayout>
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {t('courses.courseList.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('courses.courseList.subtitle')}
            </p>
          </div>

          <Button
            onClick={() => navigate('/teacher/courses/new')}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            {t('courses.create')}
          </Button>
        </div>

        {renderContent()}

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t('courses.courseDetail.deleteConfirm.title')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t('courses.courseDetail.deleteConfirm.description', {
                  title: courseToDelete?.title,
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDelete}>
                {t('common.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t('common.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default CoursesList;
