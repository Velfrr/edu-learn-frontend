import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/enums/roles';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { BookOpen, Users, BarChart3 } from 'lucide-react';
import { Course } from '@/types/course';
import { getCoursesByStudent, getCoursesByTeacher } from '@/api/course';
import { getUsersByRole } from '@/api/user';
import { User } from '@/types/user';
import FeedbackForm from '@/components/feedback/FeedbackForm';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

        if (!user) return;

        let coursesData: Course[] = [];

        switch (user.role) {
          case UserRole.ADMIN:
            const { users: allStudents } = await getUsersByRole(
              UserRole.STUDENT,
            );
            const { users: allTeachers } = await getUsersByRole(
              UserRole.TEACHER,
            );

            setStudents(allStudents);
            setTeachers(allTeachers);
            break;

          case UserRole.TEACHER:
            const { courses: teacherCourses } = await getCoursesByTeacher(
              user.id,
            );
            coursesData = teacherCourses;
            break;

          case UserRole.STUDENT:
            const { courses: studentCourses } = await getCoursesByStudent(
              user.id,
            );
            coursesData = studentCourses;
            break;
        }

        setCourses(coursesData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
          <p>Please log in to view your dashboard.</p>
        </div>
      </MainLayout>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case UserRole.ADMIN:
        return renderAdminDashboard();
      case UserRole.TEACHER:
        return renderTeacherDashboard();
      case UserRole.STUDENT:
        return renderStudentDashboard();
      default:
        return <div>Unknown user role</div>;
    }
  };

  const renderAdminDashboard = () => (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title={t('dashboard.usersManagement')}
          icon={<Users size={24} />}
          link="/admin/users"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t('dashboard.totalStudents')}:
              </span>
              {isLoading ? (
                <Skeleton className="h-4 w-10" />
              ) : (
                <span>{students.length}</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t('dashboard.totalTeachers')}:
              </span>
              {isLoading ? (
                <Skeleton className="h-4 w-10" />
              ) : (
                <span>{teachers.length}</span>
              )}
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          title={t('dashboard.coursesOverview')}
          icon={<BookOpen size={24} />}
          link="/admin/courses"
        >
          <p className="text-sm text-muted-foreground">
            {t('dashboard.manageCourses')}
          </p>
        </DashboardCard>

        <DashboardCard
          title={t('dashboard.platformStats')}
          icon={<BarChart3 size={24} />}
          link="/admin/statistics"
        >
          <p className="text-sm text-muted-foreground">
            {t('dashboard.viewStats')}
          </p>
        </DashboardCard>
      </div>
    </>
  );

  const renderTeacherDashboard = () => (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title={t('dashboard.myCourses.title')}
          icon={<BookOpen size={24} />}
          link="/teacher/courses"
        >
          <div className="space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <p>
                {t('dashboard.myCourses.created', { count: courses.length })}
              </p>
            )}
          </div>
        </DashboardCard>

        <DashboardCard
          title={t('dashboard.students.title')}
          icon={<Users size={24} />}
          link="/teacher/students"
        >
          <p className="text-sm text-muted-foreground">
            {t('dashboard.students.manage')}
          </p>
        </DashboardCard>

        <DashboardCard
          title={t('dashboard.analytics.title')}
          icon={<BarChart3 size={24} />}
          link="/teacher/analytics"
        >
          <p className="text-sm text-muted-foreground">
            {t('dashboard.analytics.view')}
          </p>
        </DashboardCard>
      </div>

      <div className="mt-6">
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-medium">
            {t('dashboard.quickActions.title')}
          </h3>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/teacher/courses/new')}
            >
              {t('dashboard.quickActions.createCourse')}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/teacher/students')}
            >
              {t('dashboard.quickActions.manageStudents')}
            </Button>
            <FeedbackForm />
          </div>
        </Card>
      </div>
    </>
  );

  const renderStudentDashboard = () => (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title={t('dashboard.myCourses.title')}
          icon={<BookOpen size={24} />}
          link="/student/courses"
        >
          <div className="space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <p>
                {t('dashboard.myCourses.enrolled', { count: courses.length })}
              </p>
            )}
          </div>
        </DashboardCard>

        <DashboardCard
          title={t('dashboard.progress.title')}
          icon={<BarChart3 size={24} />}
          link="/student/progress"
        >
          <p className="text-sm text-muted-foreground">
            {t('dashboard.progress.track')}
          </p>
        </DashboardCard>
      </div>

      <div className="mt-6">
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-medium">
            {t('dashboard.quickActions.title')}
          </h3>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/student/courses')}
            >
              {t('dashboard.quickActions.browseCourses')}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/student/progress')}
            >
              {t('dashboard.quickActions.viewProgress')}
            </Button>
            <FeedbackForm />
          </div>
        </Card>
      </div>
    </>
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {t('dashboard.welcome', { name: user.fullName })}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {user.role === UserRole.ADMIN && t('dashboard.adminDashboard')}
              {user.role === UserRole.TEACHER &&
                t('dashboard.teacherDashboard')}
              {user.role === UserRole.STUDENT &&
                t('dashboard.studentDashboard')}
            </p>
          </div>
        </div>

        {renderDashboard()}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
