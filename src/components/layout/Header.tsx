import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/enums/roles';
import { BookOpen, LogOut, Menu, User, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case UserRole.ADMIN:
        return [
          { title: t('common.dashboard'), href: '/dashboard' },
          { title: t('common.users'), href: '/admin/users' },
          { title: t('common.courses'), href: '/admin/courses' },
          { title: t('common.feedback'), href: '/admin/feedback' },
          { title: t('common.platformAnalytics'), href: '/admin/statistics' },
        ];
      case UserRole.TEACHER:
        return [
          { title: t('common.dashboard'), href: '/dashboard' },
          { title: t('courses.myCourses'), href: '/teacher/courses' },
          { title: t('common.students'), href: '/teacher/students' },
          { title: t('common.analytics'), href: '/teacher/analytics' },
        ];
      case UserRole.STUDENT:
        return [
          { title: t('common.dashboard'), href: '/dashboard' },
          { title: t('courses.myCourses'), href: '/student/courses' },
          { title: t('common.statistic'), href: '/student/progress' },
        ];
      default:
        return [];
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center space-x-2 text-primary">
          <BookOpen size={28} />
          <span className="text-xl font-bold">EduLearn</span>
        </Link>

        <nav className="hidden items-center space-x-8 md:flex">
          {isAuthenticated ? (
            <>
              <ul className="flex space-x-6">
                {getNavLinks().map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User size={16} className="text-foreground/60" />
                  <span className="text-sm font-medium text-foreground/80">
                    {user?.fullName}
                  </span>
                </div>
                <LanguageSwitcher />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm"
                >
                  <LogOut size={16} />
                  <span>{t('common.logout')}</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">{t('common.login')}</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">{t('common.signup')}</Link>
              </Button>
            </div>
          )}
        </nav>

        <div className="md:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              {isAuthenticated ? (
                <div className="flex h-full flex-col py-6">
                  <div className="mb-6 flex flex-col items-center space-y-2 px-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User size={20} className="text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{user?.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {t(`auth.${user?.role.toLowerCase()}`)}
                      </p>
                    </div>
                  </div>

                  <nav className="flex-1">
                    <ul className="flex flex-col space-y-1">
                      {getNavLinks().map((link) => (
                        <li key={link.href}>
                          <Link
                            to={link.href}
                            className="block rounded-md px-3 py-2 text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {link.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>

                  <Button
                    variant="ghost"
                    className="mt-6 flex items-center justify-center gap-2"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut size={16} />
                    <span>{t('common.logout')}</span>
                  </Button>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center space-y-4">
                  <Button className="w-full" asChild>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      {t('common.login')}
                    </Link>
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    asChild
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to="/signup">{t('common.signup')}</Link>
                  </Button>
                  <Button
                    className="w-full"
                    variant="ghost"
                    asChild
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to="/">{t('header.home')}</Link>
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
