import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const year = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-background py-6">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-center text-center">
          <Link
            to="/"
            className="mb-4 flex items-center space-x-2 text-primary"
          >
            <BookOpen size={24} />
            <span className="text-xl font-bold">EduLearn</span>
          </Link>
          <p className="mb-4 text-sm text-muted-foreground">
            {t('footer.description')}
          </p>
          <div className="mt-2 border-t border-border pt-4 text-center text-sm text-muted-foreground">
            <p>
              &copy; {year} EduLearn. {t('footer.allRightsReserved')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
