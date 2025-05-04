import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuestionType } from '@/enums/question-types';
import { Trash, Plus, Save, X, FileText, CheckSquare } from 'lucide-react';
import { Question } from '@/types/test';
import { useTranslation } from 'react-i18next';

type TestFormProps = {
  onSubmit: (data: {
    title: string;
    minPassPercentage: number;
    questions: Question[];
  }) => Promise<void>;
  onCancel: () => void;
  initialData?: {
    id?: string;
    title: string;
    minPassPercentage: number;
    questions?: Question[];
  };
  isEdit?: boolean;
  lessonId?: string;
};

const TestForm: React.FC<TestFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEdit = false,
}) => {
  const { t } = useTranslation();

  const [title, setTitle] = useState(initialData?.title || '');
  const [minPassPercentage, setMinPassPercentage] = useState(
    initialData?.minPassPercentage || 70,
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData?.questions && initialData.questions.length > 0) {
      setQuestions(initialData.questions);
      setActiveQuestion(0);
    }
  }, [initialData?.questions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const newErrors: Record<string, string> = {};

    if (!title) newErrors.title = t('courses.content.titleRequired');

    if (questions.length === 0) {
      newErrors.questions = t('courses.content.oneQuestionRequired');
    } else {
      questions.forEach((q, idx) => {
        if (!q.question)
          newErrors[`question_${idx}`] = t(
            'courses.content.questionTextRequired',
          );
        if (q.correctAnswers.length === 0)
          newErrors[`answers_${idx}`] = t(
            'courses.content.oneCorrectAnswerRequired',
          );
        if (
          (q.type === QuestionType.MULTIPLE_CHOICE ||
            q.type === QuestionType.SINGLE_CHOICE) &&
          (!q.options || q.options.length < 2)
        ) {
          newErrors[`options_${idx}`] = t(
            'courses.content.twoCorrectAnswersRequired',
          );
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitting(false);
      return;
    }

    try {
      await onSubmit({
        title,
        minPassPercentage,
        questions: questions.map((q, idx) => ({ ...q, questionOrder: idx })),
      });
    } catch (error) {
      console.error(t('courses.content.errorSubmitting'), error);
    } finally {
      setSubmitting(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      testId: '',
      type: QuestionType.SINGLE_CHOICE,
      question: '',
      options: ['', ''],
      correctAnswers: [],
      points: 1,
      questionOrder: questions.length,
    };

    setQuestions([...questions, newQuestion]);
    setActiveQuestion(questions.length);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    if (activeQuestion === index) {
      setActiveQuestion(null);
    } else if (activeQuestion !== null && activeQuestion > index) {
      setActiveQuestion(activeQuestion - 1);
    }
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    const currentOptions = updatedQuestions[questionIndex].options || [];
    updatedQuestions[questionIndex].options = [...currentOptions, ''];
    setQuestions(updatedQuestions);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    const updatedQuestions = [...questions];
    const currentOptions = [...(updatedQuestions[questionIndex].options || [])];
    currentOptions[optionIndex] = value;
    updatedQuestions[questionIndex].options = currentOptions;
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    const currentOptions = [...(updatedQuestions[questionIndex].options || [])];
    updatedQuestions[questionIndex].options = currentOptions.filter(
      (_, i) => i !== optionIndex,
    );

    // Also remove from correct answers if present
    const optionValue = currentOptions[optionIndex];
    const correctAnswers = [...updatedQuestions[questionIndex].correctAnswers];
    updatedQuestions[questionIndex].correctAnswers = correctAnswers.filter(
      (a) => a !== optionValue,
    );

    setQuestions(updatedQuestions);
  };

  const toggleCorrectAnswer = (questionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    const correctAnswers = [...question.correctAnswers];

    // For single choice, replace the answer
    if (question.type === QuestionType.SINGLE_CHOICE) {
      updatedQuestions[questionIndex].correctAnswers = [value];
    } else {
      // For multiple choice, toggle the answer
      const index = correctAnswers.indexOf(value);
      if (index === -1) {
        correctAnswers.push(value);
      } else {
        correctAnswers.splice(index, 1);
      }
      updatedQuestions[questionIndex].correctAnswers = correctAnswers;
    }

    setQuestions(updatedQuestions);
  };

  const renderQuestionOptions = (questionIndex: number) => {
    const question = questions[questionIndex];
    const questionType = question.type;

    switch (questionType) {
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.SINGLE_CHOICE:
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                {t('courses.content.options')}
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addOption(questionIndex)}
              >
                <Plus size={16} className="mr-1" />{' '}
                {t('courses.content.addOption')}
              </Button>
            </div>

            {question.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2">
                <div className="flex-grow">
                  <Input
                    value={option}
                    onChange={(e) =>
                      updateOption(questionIndex, optionIndex, e.target.value)
                    }
                    placeholder={`${t('courses.content.option')} ${optionIndex + 1}`}
                  />
                </div>
                <Button
                  type="button"
                  variant={
                    question.correctAnswers.includes(option)
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => toggleCorrectAnswer(questionIndex, option)}
                  disabled={!option.trim()}
                >
                  {question.correctAnswers.includes(option)
                    ? t('courses.content.correct')
                    : t('courses.content.markCorrect')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(questionIndex, optionIndex)}
                  disabled={question.options?.length <= 2}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
            {errors[`options_${questionIndex}`] && (
              <p className="text-sm text-destructive">
                {errors[`options_${questionIndex}`]}
              </p>
            )}
          </div>
        );

      case QuestionType.CORRECT_INCORRECT:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              {t('courses.content.correctAnswer')}
            </h4>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={
                  question.correctAnswers[0] === 'true' ? 'default' : 'outline'
                }
                onClick={() =>
                  updateQuestion(questionIndex, 'correctAnswers', ['true'])
                }
              >
                <CheckSquare size={16} className="mr-1" />{' '}
                {t('courses.content.true')}
              </Button>
              <Button
                type="button"
                variant={
                  question.correctAnswers[0] === 'false' ? 'default' : 'outline'
                }
                onClick={() =>
                  updateQuestion(questionIndex, 'correctAnswers', ['false'])
                }
              >
                <X size={16} className="mr-1" /> {t('courses.content.false')}
              </Button>
            </div>
          </div>
        );

      case QuestionType.TEXT_MATCH:
        return (
          <div className="space-y-2">
            <Label htmlFor={`correctAnswer-${questionIndex}`}>
              {t('courses.content.correctAnswer')} (text)
            </Label>
            <Input
              id={`correctAnswer-${questionIndex}`}
              value={question.correctAnswers[0] || ''}
              onChange={(e) =>
                updateQuestion(questionIndex, 'correctAnswers', [
                  e.target.value,
                ])
              }
              placeholder={t('courses.content.enterCorrectAnswer')}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">
          {isEdit
            ? t('courses.content.editTest')
            : t('courses.content.createTest')}
        </h2>
        <p className="text-muted-foreground">
          {t('courses.content.createTestSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">{t('courses.content.testTitle')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('courses.content.enterTestTitle')}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between">
              <Label htmlFor="passingGrade">
                {t('courses.content.minimumPass')}: {minPassPercentage}%
              </Label>
            </div>
            <Slider
              id="passingGrade"
              value={[minPassPercentage]}
              onValueChange={(values) => setMinPassPercentage(values[0])}
              min={50}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              {t('courses.content.questions')}
            </h3>
            <Button
              type="button"
              onClick={addQuestion}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus size={16} /> {t('courses.content.addQuestion')}
            </Button>
          </div>

          {errors.questions && (
            <p className="text-sm text-destructive">{errors.questions}</p>
          )}

          {questions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <FileText size={24} />
                  <p>{t('courses.content.noQuestions')}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addQuestion}
                    className="mt-2"
                  >
                    <Plus size={16} className="mr-1" />{' '}
                    {t('courses.content.addFirstQuestion')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[200px_1fr]">
              <aside className="space-y-2">
                {questions.map((question, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant={activeQuestion === index ? 'default' : 'outline'}
                    className="w-full justify-start text-left"
                    onClick={() => setActiveQuestion(index)}
                  >
                    <span className="truncate">
                      {question.question ||
                        `${t('courses.content.question')} ${index + 1}`}
                    </span>
                  </Button>
                ))}
              </aside>

              <div>
                {activeQuestion !== null && (
                  <Card>
                    <CardContent className="space-y-4 p-4">
                      <div className="flex items-start justify-between">
                        <Label htmlFor={`question-${activeQuestion}`}>
                          {t('courses.content.question')} {activeQuestion + 1}
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(activeQuestion)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>

                      <Input
                        id={`question-${activeQuestion}`}
                        value={questions[activeQuestion].question}
                        onChange={(e) =>
                          updateQuestion(
                            activeQuestion,
                            'question',
                            e.target.value,
                          )
                        }
                        placeholder={t('courses.content.enterQuestion')}
                        className={
                          errors[`question_${activeQuestion}`]
                            ? 'border-destructive'
                            : ''
                        }
                      />
                      {errors[`question_${activeQuestion}`] && (
                        <p className="text-sm text-destructive">
                          {errors[`question_${activeQuestion}`]}
                        </p>
                      )}

                      <div>
                        <Label>Question Type</Label>
                        <Tabs
                          value={questions[activeQuestion].type}
                          onValueChange={(value) =>
                            updateQuestion(activeQuestion, 'type', value)
                          }
                          className="mt-2"
                        >
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value={QuestionType.SINGLE_CHOICE}>
                              {t('courses.content.singleChoice')}
                            </TabsTrigger>
                            <TabsTrigger value={QuestionType.MULTIPLE_CHOICE}>
                              {t('courses.content.multipleChoice')}
                            </TabsTrigger>
                            <TabsTrigger value={QuestionType.CORRECT_INCORRECT}>
                              {t('courses.content.trueFalse')}
                            </TabsTrigger>
                            <TabsTrigger value={QuestionType.TEXT_MATCH}>
                              {t('courses.content.textMatch')}
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent
                            value={questions[activeQuestion].type}
                            className="mt-4"
                          >
                            {renderQuestionOptions(activeQuestion)}
                          </TabsContent>
                        </Tabs>
                      </div>

                      <div>
                        <Label htmlFor={`points-${activeQuestion}`}>
                          {t('courses.content.points')}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`points-${activeQuestion}`}
                            type="number"
                            min="1"
                            value={questions[activeQuestion].points}
                            onChange={(e) =>
                              updateQuestion(
                                activeQuestion,
                                'points',
                                parseInt(e.target.value) || 1,
                              )
                            }
                            className="w-24"
                          />
                          <span className="text-sm text-muted-foreground">
                            {t('courses.content.pointsForQuestion')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('courses.content.cancel')}
          </Button>
          <Button type="submit" disabled={submitting}>
            <Save size={16} className="mr-1" />
            {isEdit
              ? t('courses.content.updateTest')
              : t('courses.content.createTest')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TestForm;
