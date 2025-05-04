import { useQuery } from '@tanstack/react-query';
import { getStudentProgress } from '@/api/students';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/utils/date';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, CheckSquare, CheckCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StudentProgressProps {
  courseId: string;
  studentId: string;
  studentName: string;
}

const StudentProgress = ({
  courseId,
  studentId,
  studentName,
}: StudentProgressProps) => {
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery({
    queryKey: ['student-progress', courseId, studentId],
    queryFn: () => getStudentProgress(courseId, studentId),
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">
            {t('students.loadingStudentProgress')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <CardContent className="py-6 text-center text-destructive">
          <p>{t('students.errorLoadingProgress')}</p>
        </CardContent>
      </Card>
    );
  }

  const { lessonCompletions = [], testAttempts = [] } = data || {};

  const averageTestScore =
    testAttempts.length > 0
      ? Math.round(
          (testAttempts.reduce(
            (acc, curr) => acc + (curr.score / curr.maxScore) * 100,
            0,
          ) /
            testAttempts.length) *
            100,
        ) / 100
      : 0;

  const passedTests = testAttempts.filter((t) => t.isPassed).length;
  const totalTests = testAttempts.length;

  const sortedLessonCompletions = [...lessonCompletions].sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );

  const sortedTestAttempts = [...testAttempts].sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">
            {studentName}: {t('students.progress')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium">
                  {t('students.completedLessons')}
                </span>
                <span className="text-muted-foreground">
                  {lessonCompletions.length}
                </span>
              </div>
              <Progress
                value={lessonCompletions.length > 0 ? 100 : 0}
                className="h-2"
              />
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium">
                  {t('students.averageScore')}
                </span>
                <span className="text-muted-foreground">
                  {averageTestScore}%
                </span>
              </div>
              <Progress value={averageTestScore} className="h-2" />
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium">{t('students.testsPassed')}</span>
                <span className="text-muted-foreground">
                  {passedTests} / {totalTests}
                </span>
              </div>
              <Progress
                value={(passedTests / Math.max(totalTests, 1)) * 100}
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> {t('students.lessonsCompleted')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedLessonCompletions.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="lessons">
                  <AccordionTrigger>
                    {sortedLessonCompletions.length}{' '}
                    {t('students.lessonsCompleted')}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-3">
                      {sortedLessonCompletions.map((completion) => (
                        <li
                          key={completion.id}
                          className="flex items-center justify-between rounded-md border p-3 text-sm"
                        >
                          <span className="flex items-center">
                            <CheckCheck className="mr-2 h-4 w-4 text-green-500" />
                            {t('students.lesson')}{' '}
                            {completion.lessonId.substring(0, 5)}...
                          </span>
                          <span className="text-muted-foreground">
                            {formatDate(completion.completedAt)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <p className="py-2 text-sm text-muted-foreground">
                {t('students.noLessonsCompleted')}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" /> {t('students.testResults')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedTestAttempts.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="tests">
                  <AccordionTrigger>
                    {sortedTestAttempts.length} {t('students.testAttempts')}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-3">
                      {sortedTestAttempts.map((attempt) => (
                        <li
                          key={attempt.id}
                          className={`flex flex-col rounded-md border p-3 text-sm ${
                            attempt.isPassed
                              ? 'border-green-100 bg-green-50'
                              : 'border-red-100 bg-red-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {t('students.test')}{' '}
                              {attempt.testId.substring(0, 5)}...
                            </span>
                            <span
                              className={
                                attempt.isPassed
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }
                            >
                              {attempt.isPassed
                                ? t('analytics.testResults.passed')
                                : t('analytics.testResults.failed')}
                            </span>
                          </div>
                          <div className="mt-2 flex justify-between">
                            <span className="text-muted-foreground">
                              {t('students.score')}: {attempt.score}/
                              {attempt.maxScore} (
                              {Math.round(
                                (attempt.score / attempt.maxScore) * 100,
                              )}
                              %)
                            </span>
                            <span className="text-muted-foreground">
                              {formatDate(attempt.completedAt)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <p className="py-2 text-sm text-muted-foreground">
                {t('students.noTestsAttempted')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentProgress;
