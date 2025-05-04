export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  lessonOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface LessonCompletion {
  id: string;
  lessonId: string;
  userId: string;
  completedAt: string;
}
