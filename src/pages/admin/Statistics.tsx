import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import MainLayout from '@/components/layout/MainLayout';
import { UserRole } from '@/enums/roles';
import { format, subDays } from 'date-fns';
import { ChartBarBig, ChartLine, Users } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import axios from 'axios';

const Statistics = () => {
  const { t } = useTranslation();

  const { data: userStats, isLoading: loadingUserStats } = useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: async () => {
      const { data: roleData } = await axios.get('/api/stats/role-count');

      const processedRoleData = roleData
        ? roleData.map((item: any) => ({
            role: item.role,
            count: String(item.count),
          }))
        : [];

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: activeUsers } = await axios.get('/api/stats/active-users', {
        params: { since: thirtyDaysAgo.toISOString() },
      });

      const { data: bannedCount } = await axios.get('/api/stats/banned-users');

      const { data: signupsData } = await axios.get('/api/stats/signups', {
        params: { since: thirtyDaysAgo.toISOString() },
      });

      const signupsByDay = signupsData.reduce(
        (acc: Record<string, number>, user: any) => {
          const date = format(new Date(user.created_at), 'yyyy-MM-dd');
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        },
        {},
      );

      const signupSeries = [];
      for (let i = 29; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        signupSeries.push({
          date,
          count: signupsByDay[date] || 0,
        });
      }

      const activeUsersByRole = activeUsers.reduce(
        (acc: Record<string, number>, user: any) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        },
        {},
      );

      const totalUsers = processedRoleData.reduce((sum: number, item: any) => {
        return sum + Number(item.count);
      }, 0);

      if (processedRoleData.length === 0) {
        const { data: allProfiles } = await axios.get(
          '/api/stats/all-profiles',
        );

        const totalUsers = allProfiles.length;

        const usersByRole = allProfiles.reduce(
          (acc: Record<string, number>, user: any) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
          },
          {},
        );

        const processedRoleData = Object.entries(usersByRole).map(
          ([role, count]) => ({
            role,
            count: String(count),
          }),
        );

        return {
          usersByRole: processedRoleData,
          activeUsersByRole,
          totalUsers,
          activeUsers: activeUsers.length,
          bannedUsers: bannedCount || 0,
          signupSeries,
        };
      }

      return {
        usersByRole: processedRoleData,
        activeUsersByRole,
        totalUsers,
        activeUsers: activeUsers.length,
        bannedUsers: bannedCount || 0,
        signupSeries,
      };
    },
  });

  const { data: courseStats, isLoading: loadingCourseStats } = useQuery({
    queryKey: ['admin-course-stats'],
    queryFn: async () => {
      const { data: courseCount } = await axios.get('/api/stats/total-courses');
      const { data: lessonCount } = await axios.get('/api/stats/total-lessons');
      const { data: testCount } = await axios.get('/api/stats/total-tests');
      const { data: enrollmentCount } = await axios.get(
        '/api/stats/total-enrollments',
      );

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentCourses } = await axios.get(
        '/api/stats/recent-courses',
        {
          params: { since: thirtyDaysAgo.toISOString() },
        },
      );

      const coursesByDay = recentCourses.reduce(
        (acc: Record<string, number>, course: any) => {
          const date = format(new Date(course.created_at), 'yyyy-MM-dd');
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        },
        {},
      );

      const courseSeries = [];
      for (let i = 29; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        courseSeries.push({
          date,
          count: coursesByDay[date] || 0,
        });
      }

      const avgLessonsPerCourse = courseCount
        ? (lessonCount / courseCount).toFixed(1)
        : '0';

      const { data: topCoursesData } = await axios.get(
        '/api/stats/top-courses',
      );

      const topCourses = topCoursesData
        .map((course: any) => ({
          title: course.title,
          count: course.course_enrollments?.length || 0,
        }))
        .sort((a: any, b: any) => b.count - a.count);

      return {
        totalCourses: courseCount,
        totalLessons: lessonCount,
        totalTests: testCount,
        totalEnrollments: enrollmentCount,
        avgLessonsPerCourse,
        courseSeries,
        topCourses,
      };
    },
  });

  const { data: activityStats, isLoading: loadingActivityStats } = useQuery({
    queryKey: ['admin-activity-stats'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: userActivity } = await axios.get(
        '/api/stats/user-activity',
        {
          params: { since: thirtyDaysAgo.toISOString() },
        },
      );

      const activityByDay = userActivity.reduce(
        (acc: Record<string, any>, user: any) => {
          const date = format(new Date(user.last_active), 'yyyy-MM-dd');
          if (!acc[date]) {
            acc[date] = {
              date,
              total: 0,
              STUDENT: 0,
              TEACHER: 0,
              ADMIN: 0,
            };
          }
          acc[date].total++;
          acc[date][user.role]++;
          return acc;
        },
        {},
      );

      const activitySeries = [];
      for (let i = 29; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        activitySeries.push({
          date,
          total: activityByDay[date]?.total || 0,
          STUDENT: activityByDay[date]?.STUDENT || 0,
          TEACHER: activityByDay[date]?.TEACHER || 0,
          ADMIN: activityByDay[date]?.ADMIN || 0,
        });
      }

      const { data: recentTests } = await axios.get('/api/stats/recent-tests', {
        params: { since: thirtyDaysAgo.toISOString() },
      });

      const testsByDay = recentTests.reduce(
        (acc: Record<string, any>, test: any) => {
          const date = format(new Date(test.completed_at), 'yyyy-MM-dd');
          if (!acc[date]) {
            acc[date] = { date, total: 0, passed: 0, failed: 0 };
          }
          acc[date].total++;
          if (test.is_passed) {
            acc[date].passed++;
          } else {
            acc[date].failed++;
          }
          return acc;
        },
        {},
      );

      const testSeries = [];
      for (let i = 29; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        testSeries.push({
          date,
          total: testsByDay[date]?.total || 0,
          passed: testsByDay[date]?.passed || 0,
          failed: testsByDay[date]?.failed || 0,
        });
      }

      return {
        activitySeries,
        testSeries,
      };
    },
  });

  const chartConfig = {
    student: {
      label: 'Students',
      theme: {
        light: '#22c55e',
        dark: '#4ade80',
      },
    },
    teacher: {
      label: 'Teachers',
      theme: {
        light: '#3b82f6',
        dark: '#60a5fa',
      },
    },
    admin: {
      label: 'Admins',
      theme: {
        light: '#f97316',
        dark: '#fb923c',
      },
    },
    passed: {
      label: 'Passed',
      theme: {
        light: '#22c55e',
        dark: '#4ade80',
      },
    },
    failed: {
      label: 'Failed',
      theme: {
        light: '#ef4444',
        dark: '#f87171',
      },
    },
    total: {
      label: 'Total',
      theme: {
        light: '#8b5cf6',
        dark: '#a78bfa',
      },
    },
  };

  return (
    <MainLayout>
      <div className="container py-6">
        <h1 className="mb-6 text-3xl font-bold">{t('statistics.title')}</h1>

        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users size={16} />
              <span>{t('statistics.tabs.users')}</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <ChartBarBig size={16} />
              <span>{t('statistics.tabs.courses')}</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <ChartLine size={16} />
              <span>{t('statistics.tabs.activity')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Users Statistics Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('statistics.cards.totalUsers')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingUserStats ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      userStats?.totalUsers || 0
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('statistics.cards.activeUsers')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingUserStats ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      userStats?.activeUsers || 0
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('statistics.cards.students')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingUserStats ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      userStats?.usersByRole?.find(
                        (r: any) => r.role === UserRole.STUDENT,
                      )?.count || 0
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('statistics.cards.teachers')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingUserStats ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      userStats?.usersByRole?.find(
                        (r: any) => r.role === UserRole.TEACHER,
                      )?.count || 0
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  {t('statistics.charts.userSignups.title')}
                </CardTitle>
                <CardDescription>
                  {t('statistics.charts.userSignups.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {loadingUserStats ? (
                  <div className="flex h-full items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ChartContainer className="h-[300px]" config={chartConfig}>
                    <BarChart
                      data={userStats?.signupSeries || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) =>
                          format(new Date(value), 'MMM d')
                        }
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis allowDecimals={false} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            labelFormatter={(date) =>
                              format(new Date(date as string), 'MMMM d, yyyy')
                            }
                          />
                        }
                      />
                      <Bar dataKey="count" name="Signups" fill="#8884d8" />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t('statistics.charts.usersByRole.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('statistics.charts.usersByRole.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex h-[300px] items-center justify-center">
                  {loadingUserStats ? (
                    <Skeleton className="h-[250px] w-[250px] rounded-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={
                          userStats?.usersByRole?.map((item: any) => ({
                            role: item.role,
                            count: Number(item.count),
                          })) || []
                        }
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="role" width={80} />
                        <ChartTooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {t('statistics.charts.activeUsersByRole.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('statistics.charts.activeUsersByRole.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {loadingUserStats ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={[
                          {
                            role: UserRole.STUDENT,
                            count:
                              userStats?.activeUsersByRole?.[
                                UserRole.STUDENT
                              ] || 0,
                          },
                          {
                            role: UserRole.TEACHER,
                            count:
                              userStats?.activeUsersByRole?.[
                                UserRole.TEACHER
                              ] || 0,
                          },
                          {
                            role: UserRole.ADMIN,
                            count:
                              userStats?.activeUsersByRole?.[UserRole.ADMIN] ||
                              0,
                          },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="role" width={80} />
                        <ChartTooltip />
                        <Bar dataKey="count" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('statistics.cards.totalCourses')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingCourseStats ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      courseStats?.totalCourses || 0
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('statistics.cards.totalLessons')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingCourseStats ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      courseStats?.totalLessons || 0
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('statistics.cards.totalTests')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingCourseStats ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      courseStats?.totalTests || 0
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('statistics.cards.totalEnrollments')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingCourseStats ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      courseStats?.totalEnrollments || 0
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('statistics.charts.newCourses.title')}</CardTitle>
                <CardDescription>
                  {t('statistics.charts.newCourses.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {loadingCourseStats ? (
                  <div className="flex h-full items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ChartContainer className="h-[300px]" config={chartConfig}>
                    <BarChart
                      data={courseStats?.courseSeries || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) =>
                          format(new Date(value), 'MMM d')
                        }
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis allowDecimals={false} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            labelFormatter={(date) =>
                              format(new Date(date as string), 'MMMM d, yyyy')
                            }
                          />
                        }
                      />
                      <Bar dataKey="count" name="New Courses" fill="#3b82f6" />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {courseStats?.topCourses && courseStats.topCourses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t('statistics.charts.popularCourses.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('statistics.charts.popularCourses.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {loadingCourseStats ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={courseStats.topCourses}
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis
                          type="category"
                          dataKey="title"
                          width={100}
                          tickFormatter={(value) =>
                            value.length > 15
                              ? `${value.substring(0, 15)}...`
                              : value
                          }
                        />
                        <ChartTooltip
                          labelFormatter={(label) => `Course: ${label}`}
                        />
                        <Bar
                          dataKey="count"
                          name="Enrollments"
                          fill="#22c55e"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('statistics.charts.platformActivity.title')}
                </CardTitle>
                <CardDescription>
                  {t('statistics.charts.platformActivity.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {loadingActivityStats ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ChartContainer className="h-[350px]" config={chartConfig}>
                    <LineChart
                      data={activityStats?.activitySeries || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) =>
                          format(new Date(value), 'MMM d')
                        }
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis allowDecimals={false} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            labelFormatter={(date) =>
                              format(new Date(date as string), 'MMMM d, yyyy')
                            }
                          />
                        }
                      />
                      <Line
                        type="monotone"
                        name={chartConfig.total.label}
                        dataKey="total"
                        stroke="var(--color-total)"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        name={chartConfig.student.label}
                        dataKey={UserRole.STUDENT}
                        stroke="var(--color-student)"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        name={chartConfig.teacher.label}
                        dataKey={UserRole.TEACHER}
                        stroke="var(--color-teacher)"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        name={chartConfig.admin.label}
                        dataKey={UserRole.ADMIN}
                        stroke="var(--color-admin)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {t('statistics.charts.testAttempts.title')}
                </CardTitle>
                <CardDescription>
                  {t('statistics.charts.testAttempts.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {loadingActivityStats ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ChartContainer className="h-[350px]" config={chartConfig}>
                    <AreaChart
                      data={activityStats?.testSeries || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) =>
                          format(new Date(value), 'MMM d')
                        }
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis allowDecimals={false} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            labelFormatter={(date) =>
                              format(new Date(date as string), 'MMMM d, yyyy')
                            }
                          />
                        }
                      />
                      <Area
                        type="monotone"
                        name={chartConfig.passed.label}
                        dataKey="passed"
                        stackId="1"
                        stroke="var(--color-passed)"
                        fill="var(--color-passed)"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        name={chartConfig.failed.label}
                        dataKey="failed"
                        stackId="1"
                        stroke="var(--color-failed)"
                        fill="var(--color-failed)"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Statistics;
