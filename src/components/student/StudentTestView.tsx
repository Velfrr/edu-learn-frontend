import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import {
  getTestById,
  submitTestAttempt,
  getTestAttemptsByUser,
} from '@/api/test';
import { Test, Question, TestAttempt } from '@/types/test';
import { QuestionType } from '@/enums/question-types';
import { CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface StudentTestViewProps {
  testId: string;
  isPassed: boolean;
  onTestComplete: (passed: boolean) => void;
  onMoveNext: () => void;
  showNextButton?: boolean;
}

const StudentTestView = ({
  testId,
  isPassed,
  onTestComplete,
  onMoveNext,
  showNextButton,
}: StudentTestViewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [test, setTest] = useState<Test | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string[] }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<TestAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTest = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const { test: testData, error } = await getTestById(testId);
        if (error) throw error;

        if (testData) {
          setTest(testData);

          const initialAnswers: { [key: string]: string[] } = {};
          testData.questions?.forEach((q) => {
            initialAnswers[q.id] = [];
          });
          setAnswers(initialAnswers);

          const { attempts } = await getTestAttemptsByUser(user.id, testId);
          if (attempts.length > 0) {
            const sortedAttempts = [...attempts].sort(
              (a, b) =>
                new Date(b.completedAt).getTime() -
                new Date(a.completedAt).getTime(),
            );
            setLastAttempt(sortedAttempts[0]);
          }
        }
      } catch (error) {
        console.error('Error loading test:', error);
        toast({
          title: t('common.error'),
          description: t('studentTest.loadingError'),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTest();
  }, [testId, user, toast, t]);

  const handleAnswerChange = (
    questionId: string,
    value: string,
    isChecked?: boolean,
  ) => {
    if (isChecked === undefined) {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: [value],
      }));
    } else {
      setAnswers((prev) => {
        const currentAnswers = [...(prev[questionId] || [])];

        if (isChecked) {
          if (!currentAnswers.includes(value)) {
            return {
              ...prev,
              [questionId]: [...currentAnswers, value],
            };
          }
        } else {
          return {
            ...prev,
            [questionId]: currentAnswers.filter((ans) => ans !== value),
          };
        }

        return prev;
      });
    }
  };

  const handleSubmit = async () => {
    if (!user || !test || !test.questions) return;

    setIsSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, selectedAnswers]) => ({
          questionId,
          answers: selectedAnswers,
        }),
      );

      const { attempt, error } = await submitTestAttempt(
        test.id,
        user.id,
        formattedAnswers,
      );

      if (error) {
        throw error;
      }

      if (attempt) {
        setLastAttempt(attempt);

        if (attempt.isPassed) {
          toast({
            title: t('studentTest.testResults.success'),
            description: t('studentTest.testResults.congratulations', {
              score: attempt.score,
              maxScore: attempt.maxScore,
            }),
          });
          onTestComplete(true);
        } else {
          toast({
            title: t('studentTest.testResults.failed'),
            description: t('studentTest.testResults.failedDesc', {
              score: attempt.score,
              maxScore: attempt.maxScore,
              minPercentage: test.minPassPercentage,
            }),
            variant: 'default',
          });
        }
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      toast({
        title: t('common.error'),
        description: t('studentTest.loadingError'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAnswered = (questionId: string) => {
    return answers[questionId] && answers[questionId].length > 0;
  };

  const allQuestionsAnswered = () => {
    if (!test || !test.questions) return false;

    return test.questions.every((q) => isAnswered(q.id));
  };

  const renderQuestion = (question: Question, index: number) => {
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <div>
            <p className="mb-2 font-medium">{question.question}</p>
            <div className="space-y-2">
              {question.options?.map((option, optIdx) => (
                <div key={optIdx} className="flex items-center space-x-2">
                  <Checkbox
                    id={`q${index}-option${optIdx}`}
                    checked={answers[question.id]?.includes(option)}
                    onCheckedChange={(checked) =>
                      handleAnswerChange(question.id, option, checked === true)
                    }
                  />
                  <Label htmlFor={`q${index}-option${optIdx}`}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      case QuestionType.SINGLE_CHOICE:
        return (
          <div>
            <p className="mb-2 font-medium">{question.question}</p>
            <RadioGroup
              value={answers[question.id]?.[0]}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              {question.options?.map((option, optIdx) => (
                <div key={optIdx} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option}
                    id={`q${index}-option${optIdx}`}
                  />
                  <Label htmlFor={`q${index}-option${optIdx}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case QuestionType.CORRECT_INCORRECT:
        return (
          <div>
            <p className="mb-2 font-medium">{question.question}</p>
            <RadioGroup
              value={answers[question.id]?.[0]}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id={`q${index}-true`} />
                <Label htmlFor={`q${index}-true`}>{t('completion.true')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id={`q${index}-false`} />
                <Label htmlFor={`q${index}-false`}>
                  {t('completion.false')}
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      case QuestionType.TEXT_MATCH:
        return (
          <div>
            <p className="mb-2 font-medium">{question.question}</p>
            <Input
              type="text"
              value={answers[question.id]?.[0] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={t('completion.typeAnswer')}
            />
          </div>
        );

      default:
        return <p>Unsupported question type</p>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="mb-4 h-8 w-2/3" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-6 h-4 w-4/5" />

        <div className="space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="mb-2 h-5 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="py-8 text-center">
        <p className="text-lg font-medium">{t('studentTest.testNotFound')}</p>
        <p className="text-muted-foreground">
          {t('studentTest.testNotFoundDesc')}
        </p>
      </div>
    );
  }

  if (isPassed) {
    return (
      <div className="space-y-6">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <AlertTitle>{t('completion.testPassedSuccess')}</AlertTitle>
          <AlertDescription>
            {t('completion.alreadyCompletedTest')}
            {lastAttempt && (
              <>
                <br />
                {t('completion.score')} {lastAttempt.score}/
                {lastAttempt.maxScore} (
                {Math.round((lastAttempt.score / lastAttempt.maxScore) * 100)}%)
              </>
            )}
          </AlertDescription>
        </Alert>

        <div className="flex justify-end">
          {showNextButton && (
            <Button onClick={onMoveNext} className="flex items-center gap-1">
              {t('completion.next')} <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (lastAttempt && !lastAttempt.isPassed) {
    const attemptScore = Math.round(
      (lastAttempt.score / lastAttempt.maxScore) * 100,
    );
    return (
      <div className="space-y-6">
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <AlertTitle>{t('completion.prevAttempt')}</AlertTitle>
          <AlertDescription>
            {t('completion.scored')} {lastAttempt.score}/{lastAttempt.maxScore}{' '}
            ({attemptScore}%). {t('completion.need')} {test.minPassPercentage}%{' '}
            {t('completion.tryAgain')}
          </AlertDescription>
        </Alert>

        <h2 className="mb-2 text-xl font-bold">{test.title}</h2>
        <p className="mb-4 text-muted-foreground">
          {t('completion.answerAllQuestions')} {test.minPassPercentage}%
        </p>

        <div className="space-y-8">
          {test.questions?.map((question, index) => (
            <Card key={question.id} className="p-4">
              <p className="mb-1 text-sm text-muted-foreground">
                {t('completion.question')} {index + 1} ({question.points}{' '}
                {t('completion.points')})
              </p>
              {renderQuestion(question, index)}
            </Card>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center justify-between border-t pt-4 sm:flex-row">
          <div className="mb-4 flex items-center gap-3 sm:mb-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">
                {Object.values(answers).filter((a) => a.length > 0).length}
              </span>
              <span className="text-sm text-muted-foreground">
                /{test.questions?.length || 0}{' '}
                {t('studentTest.answeredQuestions')}
              </span>
            </div>
            <Progress
              value={
                (Object.values(answers).filter((a) => a.length > 0).length /
                  (test.questions?.length || 1)) *
                100
              }
              className="h-2 w-20"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!allQuestionsAnswered() || isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting
              ? t('completion.submitting')
              : t('completion.submitTest')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="mb-2 text-xl font-bold">{test.title}</h2>
      <p className="mb-4 text-muted-foreground">
        {t('completion.answerAllQuestions')} {test.minPassPercentage}%
      </p>

      <div className="space-y-8">
        {test.questions?.map((question, index) => (
          <Card key={question.id} className="p-4">
            <p className="mb-1 text-sm text-muted-foreground">
              Question {index + 1} ({question.points} points)
            </p>
            {renderQuestion(question, index)}
          </Card>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-center justify-between border-t pt-4 sm:flex-row">
        <div className="mb-4 flex items-center gap-3 sm:mb-0">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">
              {Object.values(answers).filter((a) => a.length > 0).length}
            </span>
            <span className="text-sm text-muted-foreground">
              /{test.questions?.length || 0}{' '}
              {t('studentTest.answeredQuestions')}
            </span>
          </div>
          <Progress
            value={
              (Object.values(answers).filter((a) => a.length > 0).length /
                (test.questions?.length || 1)) *
              100
            }
            className="h-2 w-20"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!allQuestionsAnswered() || isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting
            ? t('completion.submitting')
            : t('completion.submitTest')}
        </Button>
      </div>
    </div>
  );
};

export default StudentTestView;
