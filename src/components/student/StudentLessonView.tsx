import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { getLessonById } from '@/api/lesson';
import { Lesson } from '@/types/lesson';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StudentLessonViewProps {
  lessonId: string;
  isCompleted: boolean;
  onComplete: () => void;
  onMoveNext: () => void;
  showNextButton?: boolean;
}

const StudentLessonView = ({
  lessonId,
  isCompleted,
  onComplete,
  onMoveNext,
  showNextButton,
}: StudentLessonViewProps) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const loadLesson = async () => {
      setIsLoading(true);
      try {
        const { lesson: lessonData, error } = await getLessonById(lessonId);

        if (error) throw error;
        if (lessonData) {
          setLesson(lessonData);
        }
      } catch (error) {
        console.error('Error loading lesson:', error);
        toast({
          title: t('common.error'),
          description: t('studentLesson.loadingError'),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadLesson();
  }, [lessonId, toast, t]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="mb-4 h-8 w-2/3" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-4/5" />
        <Skeleton className="mb-2 h-4 w-3/4" />
        <Skeleton className="mb-2 h-4 w-full" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="py-8 text-center">
        <p className="text-lg font-medium">
          {t('studentLesson.lessonNotFound')}
        </p>
        <p className="text-muted-foreground">
          {t('studentLesson.lessonNotFoundDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
      </div>

      <div className="flex flex-col items-center justify-between border-t pt-4 sm:flex-row">
        <div>
          {isCompleted && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={18} />
              <span className="font-medium">
                {t('studentLesson.lessonCompleted')}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2 sm:mt-0">
          {!isCompleted && (
            <Button onClick={onComplete}>
              {t('studentLesson.markComplete')}
            </Button>
          )}
          {showNextButton && (
            <Button
              variant={isCompleted ? 'default' : 'outline'}
              className="flex items-center gap-1"
              onClick={onMoveNext}
            >
              {t('studentLesson.next')} <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentLessonView;
