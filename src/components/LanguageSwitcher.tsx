import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { uk, enUS } from 'date-fns/locale';
import { setDefaultOptions } from 'date-fns';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'uk' ? 'en' : 'uk';
    setDefaultOptions({ locale: i18n.language === 'uk' ? enUS : uk });
    i18n.changeLanguage(nextLang);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="flex items-center gap-2"
      title={
        i18n.language === 'uk'
          ? 'Switch to English'
          : 'Переключити на українську'
      }
    >
      <Globe size={20} className="rotate-0 scale-100 transition-transform" />
    </Button>
  );
};

export default LanguageSwitcher;
