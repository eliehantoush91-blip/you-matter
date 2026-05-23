import { useLanguage } from '@/contexts/LanguageContext';
import { Quote as QuoteIcon } from 'lucide-react';

const Quote = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-primary/5 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6 slide-up">
          <QuoteIcon className="h-12 w-12 text-primary mx-auto opacity-50" />
          <blockquote className="text-2xl md:text-3xl font-semibold leading-relaxed">
            {t(
              'طلب المساعدة ليس ضعفًا، بل شجاعة تبدأ بها رحلة الشفاء',
              'Asking for help is not weakness, it\'s the courage that begins healing'
            )}
          </blockquote>
        </div>
      </div>
    </section>
  );
};

export default Quote;
