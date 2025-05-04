import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import {
  BookOpen,
  CheckCircle,
  BarChart3,
  Users,
  Award,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  return (
    <MainLayout>
      <section className="bg-gradient-to-br from-edu-primary/20 to-edu-secondary/20 px-4 py-20">
        <div className="container mx-auto flex max-w-7xl flex-col items-center md:flex-row">
          <div className="mb-10 md:mb-0 md:w-1/2 md:pr-8">
            <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground md:text-5xl">
              {t('landing.hero.title')}
            </h1>
            <p className="mb-8 max-w-lg text-lg text-muted-foreground">
              {t('landing.hero.description')}
            </p>
            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Button size="lg" asChild>
                  <Link to="/dashboard">
                    {t('landing.hero.goToDashboard')}{' '}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <Link to="/signup">
                      {t('landing.hero.getStarted')}{' '}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="secondary" asChild>
                    <Link to="/login">{t('common.login')}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="relative overflow-hidden rounded-lg border-2 border-primary/20 bg-white/60 p-6 shadow-lg backdrop-blur-sm md:p-8">
              <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-secondary/30"></div>
              <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-primary/30"></div>
              <div className="relative">
                <BookOpen size={48} className="mb-6 text-primary" />
                <h3 className="mb-4 text-xl font-bold">
                  {t('landing.benefitsCard.title')}
                </h3>
                <p className="mb-4 text-muted-foreground">
                  {t('landing.benefitsCard.subtitle')}
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle
                      size={16}
                      className="mr-2 text-edu-secondary"
                    />
                    <span>{t('landing.benefitsCard.benefits.0')}</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle
                      size={16}
                      className="mr-2 text-edu-secondary"
                    />
                    <span>{t('landing.benefitsCard.benefits.1')}</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle
                      size={16}
                      className="mr-2 text-edu-secondary"
                    />
                    <span>{t('landing.benefitsCard.benefits.2')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background px-4 py-16">
        <div className="container mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            {t('landing.features.title')}
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen size={24} className="text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">
                {t('landing.features.richContent.title')}
              </h3>
              <p className="text-muted-foreground">
                {t('landing.features.richContent.description')}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 size={24} className="text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">
                {t('landing.features.analytics.title')}
              </h3>
              <p className="text-muted-foreground">
                {t('landing.features.analytics.description')}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users size={24} className="text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">
                {t('landing.features.roles.title')}
              </h3>
              <p className="text-muted-foreground">
                {t('landing.features.roles.description')}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Award size={24} className="text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">
                {t('landing.features.assessment.title')}
              </h3>
              <p className="text-muted-foreground">
                {t('landing.features.assessment.description')}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle size={24} className="text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">
                {t('landing.features.progress.title')}
              </h3>
              <p className="text-muted-foreground">
                {t('landing.features.progress.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary px-4 py-16">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-white">
            {t('landing.cta.title')}
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-white/80">
            {t('landing.cta.description')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <Button size="lg" variant="secondary" asChild>
                <Link to="/dashboard">{t('landing.hero.goToDashboard')}</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/signup">{t('landing.hero.getStarted')}</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text:black border-white hover:bg-white/20 hover:text-white"
                  asChild
                >
                  <Link to="/login">{t('common.login')}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default LandingPage;
