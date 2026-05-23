import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import {
  Home,
  Calendar,
  FileText,
  MessageSquare,
  Activity,
  User,
  LogOut,
  Moon,
  Sun,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PatientSidebar = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: Home,
      labelAr: 'الرئيسية',
      labelEn: 'Home',
      path: '/patient-dashboard',
    },
    {
      icon: Calendar,
      labelAr: 'حجز موعد',
      labelEn: 'Book Appointment',
      path: '/book-appointment',
    },
    {
      icon: FileText,
      labelAr: 'الاختبارات',
      labelEn: 'Tests',
      path: '/tests',
    },
    {
      icon: MessageSquare,
      labelAr: 'راسل طبيبك',
      labelEn: 'Message Doctor',
      path: '/message-doctor',
    },
    {
      icon: Activity,
      labelAr: 'تتبع التقدم',
      labelEn: 'Track Progress',
      path: '/track-progress',
    },
    {
      icon: User,
      labelAr: 'الملف الشخصي',
      labelEn: 'Profile',
      path: '/profile',
    },
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/patient-dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 min-h-screen bg-card border-r border-border flex flex-col shadow-soft">
      {/* Logo/Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          {t('انت مهم', 'you matter')}
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            variant={isActive(item.path) ? 'default' : 'ghost'}
            className={cn(
              'w-full justify-start gap-3',
              isActive(item.path) && 'bg-primary text-primary-foreground'
            )}
            onClick={() => navigate(item.path)}
          >
            <item.icon className="h-5 w-5" />
            {t(item.labelAr, item.labelEn)}
          </Button>
        ))}
      </nav>

      {/* Settings & Logout */}
      <div className="p-4 space-y-2 border-t border-border">
        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-3"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          {theme === 'dark' ? t('وضع النهار', 'Light Mode') : t('وضع الليل', 'Dark Mode')}
        </Button>

        {/* Language Toggle */}
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-3"
          onClick={toggleLanguage}
        >
          <Globe className="h-4 w-4" />
          {language === 'ar' ? '🇬🇧 English' : '🇸🇦 العربية'}
        </Button>

        {/* Logout */}
        <Button
          variant="destructive"
          size="sm"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {t('تسجيل الخروج', 'Logout')}
        </Button>
      </div>
    </div>
  );
};

export default PatientSidebar;

