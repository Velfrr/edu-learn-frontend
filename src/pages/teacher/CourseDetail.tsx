import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourseById, updateCourse } from '@/api/course';
import {
  getLessonsByCourse,
  createLesson,
  updateLesson,
  deleteLesson,
} from '@/api/lesson';
import {
  createTest,
  deleteTest,
  getTestsByCourse,
  updateTest,
} from '@/api/test';
import { updateContentOrder } from '@/api/content';
import { getStudentsByCourse } from '@/api/students';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft,
  Save,
  Plus,
  FileText,
  Users,
  CheckSquare,
} from 'lucide-react';
import LessonForm from '@/components/lessons/LessonForm';
import TestForm from '@/components/tests/TestForm';
import ContentList from '@/components/content/ContentList';
import StudentsList from '@/components/students/StudentsList';
import StudentProgress from '@/components/students/StudentProgress';
import { ContentItem } from '@/types/content';
import { Lesson } from '@/types/lesson';
import { Test } from '@/types/test';
import MainLayout from '@/components/layout/MainLayout';
import { useTranslation } from 'react-i18next';

const CourseDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [activeForm, setActiveForm] = useState<'lesson' | 'test' | null>(null);
  const [contentToEdit, setContentToEdit] = useState<ContentItem | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<string>(
    isEditMode ? 'edit' : 'overview',
  );

  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);

  const {
    data: course,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      if (!id) throw new Error('Course ID is required');
      const response = await getCourseById(id);
      if (response.error) throw response.error;
      return response.course;
    },
    enabled: !!id,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', id],
    queryFn: async () => {
      if (!id) return [];
      const response = await getLessonsByCourse(id);
      if (response.error) throw response.error;
      return response.lessons;
    },
    enabled: !!id,
  });

  const { data: tests = [] } = useQuery({
    queryKey: ['tests', id],
    queryFn: async () => {
      if (!id) return [];
      const response = await getTestsByCourse(id);
      if (response.error) throw response.error;
      return response.tests;
    },
    enabled: !!id,
  });

  const { data: studentsData, isLoading: loadingStudents } = useQuery({
    queryKey: ['course-students', id],
    queryFn: async () => {
      if (!id) return { students: [] };
      return await getStudentsByCourse(id);
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description);
      setImageUrl(course.imageUrl || '');
    }
  }, [course]);

  useEffect(() => {
    if (isEditMode) {
      setActiveTab('edit');
    }
  }, [isEditMode]);

  useEffect(() => {
    if (lessons.length || tests.length) {
      const items: ContentItem[] = [
        ...lessons.map((lesson: Lesson) => ({
          id: lesson.id,
          type: 'LESSON' as const,
          order: lesson.lessonOrder,
          data: lesson,
        })),
        ...tests.map((test: Test) => ({
          id: test.id,
          type: 'TEST' as const,
          order: test.testOrder,
          data: test,
        })),
      ].sort((a, b) => a.order - b.order);

      setContentItems(items);
    }
  }, [lessons, tests]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Course ID is required');
      const result = await updateCourse(id, {
        title,
        description,
        imageUrl: imageUrl || undefined,
      });
      if (result.error) throw result.error;
      return result.course;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      queryClient.invalidateQueries({ queryKey: ['teacherCourses', user?.id] });
      toast({
        title: t('courses.courseDetail.courseUpdated'),
        description: t('courses.courseDetail.courseUpdateSuccess'),
      });
      setActiveTab('overview');
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      if (!id) throw new Error('Course ID is required');
      const response = await createLesson(
        id,
        data.title,
        data.content,
        contentItems.length,
      );
      if (response.error) throw response.error;
      return response.lesson;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', id] });
      setActiveForm(null);
      toast({
        title: t('courses.lessons'),
        description: t('courses.addLesson'),
      });
    },
    onError: (error) => {
      console.error('Error creating lesson:', error);
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('common.error'),
        variant: 'destructive',
      });
    },
  });

  const createTestMutation = useMutation({
    mutationFn: async ({
      title,
      minPassPercentage,
      questions,
    }: {
      title: string;
      minPassPercentage: number;
      questions: any[];
    }) => {
      if (!id) throw new Error('Course ID is required');
      const response = await createTest(
        id,
        title,
        minPassPercentage,
        contentItems.length,
        questions,
      );
      if (response.error) throw response.error;
      return response.test;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests', id] });
      setActiveForm(null);
      toast({
        title: t('common.create'),
        description: t('coureses.test'),
      });
    },
    onError: (error) => {
      console.error('Error creating test:', error);
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('common.error'),
        variant: 'destructive',
      });
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (item: ContentItem) => {
      const response = await (item.type === 'LESSON'
        ? deleteLesson(item.id)
        : deleteTest(item.id));
      if (response.error) throw response.error;
      return response;
    },
    onSuccess: (_, item) => {
      queryClient.invalidateQueries({
        queryKey: [item.type === 'LESSON' ? 'lessons' : 'tests'],
      });
      toast({
        title: t('common.delete'),
        description:
          item.type === 'LESSON' ? t('courses.lesson') : t('courses.test'),
      });
    },
  });

  const updateContentOrderMutation = useMutation({
    mutationFn: async (
      updates: { id: string; type: 'LESSON' | 'TEST'; order: number }[],
    ) => {
      const response = await updateContentOrder(id!, updates);
      if (response.error) throw response.error;
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', id] });
      queryClient.invalidateQueries({ queryKey: ['tests', id] });
    },
  });

  const addStudentMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!id) throw new Error('Course ID is required');
      const { enrollStudentByEmail } = await import('@/api/students');
      const response = await enrollStudentByEmail(id, email, t);
      if (response.error) throw response.error;
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-students', id] });
      queryClient.invalidateQueries({
        queryKey: ['teacher-students', user.id],
      });
      setNewStudentEmail('');
      setAddingStudent(false);
      toast({
        title: t('courses.students.studentAdded'),
        description: t('courses.students.studentAddedDesc'),
      });
    },
    onError: (error) => {
      toast({
        title: t('courses.students.errorAdding'),
        description: error instanceof Error ? error.message : t('common.error'),
        variant: 'destructive',
      });
    },
  });

  const removeStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      if (!id) throw new Error('Course ID is required');
      // Import at the top of the file if not present
      const { unenrollStudent } = await import('@/api/students');
      const response = await unenrollStudent(id, studentId);
      if (response.error) throw response.error;
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-students', id] });
      queryClient.invalidateQueries({
        queryKey: ['teacher-students', user?.id],
      });
      toast({
        title: t('courses.students.studentRemoved'),
        description: t('courses.students.studentRemovedDesc'),
      });
    },
  });

  const handleMoveContent = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= contentItems.length) return;

    const newItems = [...contentItems];
    [newItems[index], newItems[newIndex]] = [
      newItems[newIndex],
      newItems[index],
    ];

    const updates = newItems.map((item, idx) => ({
      id: item.id,
      type: item.type,
      order: idx,
    }));

    updateContentOrderMutation.mutate(updates);
  };

  const renderViewMode = () => (
    <div className="space-y-6">
      {course.imageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <img
            src={course.imageUrl}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div>
        <h2 className="mb-4 text-3xl font-bold">{course.title}</h2>
        <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText size={16} />
            {t('courses.courseDetail.courseStats.lessons', {
              count: lessons.length,
            })}
          </span>
          <span className="flex items-center gap-1">
            <Users size={16} />
            {t('courses.courseDetail.courseStats.students', {
              count: studentsData?.students?.length || 0,
            })}
          </span>
          <span className="flex items-center gap-1">
            <CheckSquare size={16} />
            {t('courses.courseDetail.courseStats.tests', {
              count: tests.length,
            })}
          </span>
        </div>
        <p className="whitespace-pre-line text-lg">{course.description}</p>
      </div>

      <div className="pt-6">
        <Button onClick={() => setActiveTab('edit')} className="mr-2">
          {t('common.edit')} {t('common.courses')}
        </Button>
        <Button variant="outline" onClick={() => navigate('/teacher/courses')}>
          {t('courses.backToCourses')}
        </Button>
      </div>
    </div>
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const renderEditMode = () => (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium">
          {t('courses.courseTitle')}
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('courses.createCourse.titlePlaceholder')}
          required
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          {t('courses.courseDescription')}
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('courses.createCourse.descriptionPlaceholder')}
          required
          className="min-h-32"
        />
      </div>

      <div>
        <label htmlFor="imageUrl" className="mb-1 block text-sm font-medium">
          {t('courses.createCourse.imageUrlLabel')}
        </label>
        <Input
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder={t('courses.createCourse.imageUrlPlaceholder')}
        />
        {imageUrl && (
          <div className="mt-2 max-h-48 w-full overflow-hidden rounded-md bg-muted">
            <img
              src={imageUrl}
              alt="Course preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  'https://placehold.co/600x400?text=Image+Not+Found';
              }}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setActiveTab('overview')}
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          className="flex items-center gap-1"
          disabled={updateMutation.isPending}
        >
          <Save size={16} /> {t('courses.courseDetail.saveChanges')}
        </Button>
      </div>
    </form>
  );

  const renderContentTab = () => (
    <div className="space-y-6">
      {!activeForm && !contentToEdit && (
        <div className="flex justify-end gap-2">
          <Button onClick={() => setActiveForm('lesson')}>
            <Plus className="mr-2 h-4 w-4" />
            {t('courses.content.addLesson')}
          </Button>
          <Button onClick={() => setActiveForm('test')}>
            <Plus className="mr-2 h-4 w-4" />
            {t('courses.content.addTest')}
          </Button>
        </div>
      )}

      {activeForm === 'lesson' && (
        <Card>
          <CardContent className="pt-6">
            <LessonForm
              onSubmit={async (data) => {
                await createLessonMutation.mutateAsync(data);
              }}
              onCancel={() => setActiveForm(null)}
            />
          </CardContent>
        </Card>
      )}

      {activeForm === 'test' && (
        <Card>
          <CardContent className="pt-6">
            <TestForm
              onSubmit={async (data) => {
                await createTestMutation.mutateAsync(data);
              }}
              onCancel={() => setActiveForm(null)}
              lessonId=""
            />
          </CardContent>
        </Card>
      )}

      {contentToEdit && (
        <Card>
          <CardContent className="pt-6">
            {contentToEdit.type === 'LESSON' ? (
              <LessonForm
                initialData={contentToEdit.data as Lesson}
                isEdit
                onSubmit={async (data) => {
                  await updateLesson(contentToEdit.id, data);
                  setContentToEdit(null);
                  queryClient.invalidateQueries({ queryKey: ['lessons', id] });
                }}
                onCancel={() => setContentToEdit(null)}
              />
            ) : (
              <TestForm
                initialData={contentToEdit.data as Test}
                isEdit
                onSubmit={async (data) => {
                  await updateTest(contentToEdit.id, data);
                  setContentToEdit(null);
                  queryClient.invalidateQueries({ queryKey: ['tests', id] });
                }}
                onCancel={() => setContentToEdit(null)}
                lessonId=""
              />
            )}
          </CardContent>
        </Card>
      )}

      {!activeForm && !contentToEdit && contentItems.length > 0 && (
        <ContentList
          items={contentItems}
          onMoveUp={(index) => handleMoveContent(index, 'up')}
          onMoveDown={(index) => handleMoveContent(index, 'down')}
          onEdit={(item) => {
            setContentToEdit(item);
            setActiveForm(null);
          }}
          onDelete={(item) => deleteContentMutation.mutate(item)}
        />
      )}

      {!activeForm && !contentToEdit && contentItems.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <FileText className="mb-2 h-10 w-10" />
            <h3 className="mb-1 text-lg font-medium">
              {t('courses.content.noContent')}
            </h3>
            <p className="mb-4">{t('courses.content.noContentDescription')}</p>
            <div className="flex gap-2">
              <Button onClick={() => setActiveForm('lesson')} size="sm">
                <Plus className="mr-1 h-4 w-4" />
                {t('courses.content.addLesson')}
              </Button>
              <Button onClick={() => setActiveForm('test')} size="sm">
                <Plus className="mr-1 h-4 w-4" />
                {t('courses.content.addTest')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStudentsTab = () => (
    <div className="space-y-6">
      {selectedStudentId ? (
        <div>
          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() => setSelectedStudentId(null)}
              className="mb-4"
            >
              <ChevronLeft size={16} className="mr-2" />{' '}
              {t('courses.students.backToList')}
            </Button>
          </div>
          <StudentProgress
            courseId={id!}
            studentId={selectedStudentId}
            studentName={
              studentsData?.students.find((s) => s.id === selectedStudentId)
                ?.fullName || t('common.students')
            }
          />
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">
              {t('courses.students.enrollments')}
            </h3>
            <Button
              onClick={() => setAddingStudent(true)}
              disabled={addingStudent}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('courses.students.addStudent')}
            </Button>
          </div>

          {addingStudent && (
            <div className="mb-6 rounded-lg border bg-muted/10 p-4">
              <h4 className="mb-2 font-medium">
                {t('courses.students.addStudent')}
              </h4>
              <div className="flex gap-2">
                <Input
                  placeholder={t('courses.students.emailPlaceholder')}
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => addStudentMutation.mutate(newStudentEmail)}
                  disabled={
                    !newStudentEmail.trim() || addStudentMutation.isPending
                  }
                >
                  {t('courses.students.add')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddingStudent(false);
                    setNewStudentEmail('');
                  }}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          )}

          {loadingStudents ? (
            <div className="p-6 text-center">
              <Skeleton className="mx-auto mb-2 h-4 w-1/3" />
              <Skeleton className="mb-2 h-10 w-full" />
              <Skeleton className="mb-2 h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : studentsData?.students && studentsData.students.length > 0 ? (
            <StudentsList
              students={studentsData.students.map((student) => ({
                user: student,
                enrolledCourses: 1,
              }))}
              onViewProgress={setSelectedStudentId}
              onRemoveStudent={(studentId) => {
                if (confirm(t('courses.students.confirmRemove'))) {
                  removeStudentMutation.mutate(studentId);
                }
              }}
              showViewProgress
              showRemoveAction
            />
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Users size={24} />
                  <p>{t('courses.students.noStudents')}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex">
          <Button
            variant="ghost"
            className="mr-4 flex items-center"
            onClick={() => navigate('/teacher/courses')}
          >
            <ChevronLeft size={16} className="mr-1" /> {t('common.back')}
          </Button>
          <Skeleton className="h-10 w-1/3" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex">
          <Button
            variant="ghost"
            className="flex items-center"
            onClick={() => navigate('/teacher/courses')}
          >
            <ChevronLeft size={16} className="mr-1" />{' '}
            {t('courses.backToCourses')}
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="py-8 text-center text-destructive">
              <p className="mb-2">{t('common.error')}</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : t('courses.noCourses')}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ['course', id] })
                }
              >
                {t('common.tryAgain')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex">
          <Button
            variant="ghost"
            className="flex items-center"
            onClick={() => navigate('/teacher/courses')}
          >
            <ChevronLeft size={16} className="mr-1" />{' '}
            {t('courses.backToCourses')}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">
              {t('courses.courseDetail.overview')}
            </TabsTrigger>
            <TabsTrigger value="edit">
              {t('courses.courseDetail.edit')}
            </TabsTrigger>
            <TabsTrigger value="content">
              {t('courses.courseDetail.content')}
            </TabsTrigger>
            <TabsTrigger value="students">
              {t('courses.courseDetail.students')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardContent className="pt-6">{renderViewMode()}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="edit">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('courses.courseDetail.editCourseTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>{renderEditMode()}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-0">
            <Card>
              <CardContent className="pt-6">{renderContentTab()}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="mt-0">
            <Card>
              <CardContent className="pt-6">{renderStudentsTab()}</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default CourseDetail;
