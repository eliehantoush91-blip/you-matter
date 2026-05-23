import { Button } from '@/components/ui/button';
import { Globe, Moon, Sun, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/store';
import { logout } from '@/Redux/actions';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/Redux/store';

const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate=useNavigate()
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getProfileLink = () => {
    if (!auth.user?.role) return '/';
    return auth.user.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard';
  };

  const navItems = [
    { ar: 'الرئيسية', en: 'Home', link: '/' },
    { ar: 'الاختبارات', en: 'Tests', link: '/tests' },
    { ar: 'المقالات', en: 'Articles', link: '/Articles' },
    { ar: 'الأطباء', en: 'Doctors', link: '/Doctors' },
    
    { ar: 'تواصل معنا', en: 'Contact', link: '/Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="w-9 h-9" />
            <span className="text-xl font-bold text-primary">
              {t('انت مهم', 'you matter')}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.link}
                className="text-sm font-medium text-foreground hover:text-primary transition-smooth"
              >
                {t(item.ar, item.en)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="gap-2"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              {language === 'ar' ? '🇬🇧 EN' : '🇸🇦 AR'}
            </Button>
            
            {auth.isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to={getProfileLink()}>
                    <User className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  {t('تسجيل الخروج', 'Logout')}
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">
                  {t('تسجيل الدخول', 'Login')}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
