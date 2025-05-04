import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { UserRole } from './enums/roles';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

import CreateCourse from './pages/teacher/CreateCourse';
import CoursesList from './pages/teacher/CoursesList';
import CourseDetail from './pages/teacher/CourseDetail';
import Students from './pages/teacher/Students';
import TeacherAnalytics from './pages/teacher/Analytics';

import StudentCourses from './pages/student/Courses';
import StudentCourseDetail from './pages/student/CourseDetail';
import Progress from './pages/student/Progress';

import UsersManagement from './pages/admin/UsersManagement';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminCourses from './pages/admin/AdminCourses';
import Statistics from './pages/admin/Statistics';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <PublicRoute redirectToDashboard={false}>
                    <Landing />
                  </PublicRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/teacher/courses"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
                    <CoursesList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/courses/new"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
                    <CreateCourse />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/courses/:id"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
                    <CourseDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/students"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
                    <Students />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/analytics"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
                    <TeacherAnalytics />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/student/courses"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                    <StudentCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/courses/:id"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                    <StudentCourseDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/progress"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                    <Progress />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <UsersManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/courses"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <AdminCourses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/feedback"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <AdminFeedback />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/statistics"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                    <Statistics />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
