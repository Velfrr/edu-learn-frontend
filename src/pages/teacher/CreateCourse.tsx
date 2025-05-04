import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { createCourse } from '@/api/course';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

interface CourseFormData {
  title: string;
  description: string;
  imageUrl?: string;
}

const CreateCourse = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const form = useForm<CourseFormData>({
    defaultValues: {
      title: '',
      description: '',
      imageUrl: '',
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const onSubmit = async (data: CourseFormData) => {
    if (!user) {
      toast({
        title: t('common.error'),
        description: t('auth.loginDescription'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { course, error } = await createCourse(
        data.title,
        data.description,
        user.id,
        data.imageUrl,
      );

      if (error) {
        throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['teacherCourses', user?.id] });

      toast({
        title: t('courses.createCourse.courseCreated'),
        description: t('courses.createCourse.courseCreatedDesc', {
          title: course?.title,
        }),
      });

      navigate('/teacher/courses');
    } catch (error) {
      toast({
        title: t('courses.createCourse.error'),
        description: error instanceof Error ? error.message : t('common.error'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchImageUrl = form.watch('imageUrl');
  React.useEffect(() => {
    setPreviewUrl(watchImageUrl || '');
  }, [watchImageUrl]);

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

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {t('courses.createCourse.pageTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="title"
                  rules={{
                    required: t('courses.validation.titleRequired'),
                    minLength: {
                      value: 3,
                      message: t('courses.validation.titleMinLength'),
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('courses.courseTitle')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t(
                            'courses.createCourse.titlePlaceholder',
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  rules={{
                    required: t('courses.validation.descriptionRequired'),
                    minLength: {
                      value: 10,
                      message: t('courses.validation.descriptionMinLength'),
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('courses.courseDescription')}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t(
                            'courses.createCourse.descriptionPlaceholder',
                          )}
                          className="min-h-32"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('courses.createCourse.imageUrlLabel')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t(
                            'courses.createCourse.imageUrlPlaceholder',
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                      {previewUrl && (
                        <div className="mt-2 max-h-48 w-full overflow-hidden rounded-md bg-muted">
                          <img
                            src={previewUrl}
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
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/teacher/courses')}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    className="flex items-center gap-1"
                    disabled={isSubmitting}
                  >
                    <Save size={16} />
                    {t('courses.createCourse.createCourseButton')}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CreateCourse;
