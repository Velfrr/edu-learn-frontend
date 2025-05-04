import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTeacherStudents } from '@/api/students';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';
import StudentsList from '@/components/students/StudentsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

const Students = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['teacher-students', user?.id],
    queryFn: () => getTeacherStudents(user?.id || ''),
    enabled: !!user?.id,
  });

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('students.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>{t('common.loading')}</div>
            ) : error ? (
              <div>{t('common.error')}</div>
            ) : (
              <StudentsList students={data?.students || []} showEnrollments />
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Students;
