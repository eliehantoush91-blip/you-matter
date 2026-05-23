import { Button } from '@/components/ui/button';
import { Brain, UserRound } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from "react-router-dom";

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden">
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8 fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            {t(
              'افهم نفسك أكثر، وابدأ رحلتك نحو السلام النفسي',
              'Understand yourself better, and begin your journey toward mental peace'
            )}
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t(
              'أجرِ اختبارًا نفسيًا علميًا، وتعرف على حالتك بدقة وخصوصية تامة',
              'Take a scientifically validated test and understand your mental health with full privacy'
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link to="/Tests">
            <Button size="lg" className="gap-2 text-lg px-8 py-6 shadow-soft hover:shadow-lg transition-smooth">
              <Brain className="h-5 w-5" />
              {t('ابدأ الاختبار الآن', 'Start the Test')}
            </Button>
            </Link>
            <Link to="/Doctors">
            <Button variant="outline" size="lg" className="gap-2 text-lg px-8 py-6 shadow-soft hover:shadow-lg transition-smooth">
              <UserRound className="h-5 w-5" />
              {t('تواصل مع طبيب', 'Contact a Doctor')}
            </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
