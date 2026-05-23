import { useLanguage } from '@/contexts/LanguageContext';
import { Linkedin, Youtube, Instagram } from 'lucide-react';

const  Footer = () => {
  const { t } = useLanguage();

  const links = [
    { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
    { ar: 'الشروط والأحكام', en: 'Terms of Service' },
    { ar: 'تواصل معنا', en: 'Contact Us'},
  ];

  return (
    <footer className="bg-card/50 backdrop-blur-sm border-t py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">
              {t('انت مهم', 'you matter')}
            </h3>
            <p className="text-muted-foreground">
              {t(
                'منصة متخصصة في التوعية بالصحة النفسية',
                'A platform specialized in you matter awareness'
              )}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('روابط سريعة', 'Quick Links')}</h4>
            <ul className="space-y-2">
              {links.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                    {t(link.ar, link.en)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('تابعنا', 'Follow Us')}</h4>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-[#0077B5] transition-smooth">
                <Linkedin className="h-6 w-6" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-[#FF0000] transition-smooth">
                <Youtube className="h-6 w-6" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-[#E4405F] transition-smooth">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 text-center text-sm text-muted-foreground">
          <p>
            © 2025 {t('انت مهم', 'you matter')} - {t('جميع الحقوق محفوظة', 'All rights reserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
