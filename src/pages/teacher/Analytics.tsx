import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/components/layout/MainLayout';
import EnrollmentCard from '@/components/teacher/analytics/EnrollmentCard';
import CompletionCard from '@/components/teacher/analytics/CompletionCard';
import LessonPerformanceCard from '@/components/teacher/analytics/LessonPerformanceCard';
import { getCourseAnalytics } from '@/api/analytics';

const TeacherAnalytics = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [completionData, setCompletionData] = useState([]);
  const [lessonData, setLessonData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user) return;

      try {
        const analytics = await getCourseAnalytics(user.id);
        setEnrollmentData(analytics.enrollments);
        setCompletionData(analytics.completions);
        setLessonData(analytics.lessonPerformance);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [user]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Add loading skeletons here if needed */}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto space-y-6 py-6">
        <h1 className="text-3xl font-bold">{t('analytics.title')}</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <EnrollmentCard data={enrollmentData} />
          <CompletionCard data={completionData} />
          <LessonPerformanceCard data={lessonData} />
        </div>
      </div>
    </MainLayout>
  );
};

export default TeacherAnalytics;
