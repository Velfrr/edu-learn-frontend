export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseWithDetails extends Course {
  lessonCount: number;
  studentCount: number;
  completionPercentage?: number;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  userId: string;
  enrolledAt: string;
}
