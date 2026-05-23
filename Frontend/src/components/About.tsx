import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Heart, BookOpen } from 'lucide-react';

const About = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Shield,
      titleAr: 'خصوصية تامة',
      titleEn: 'Full Privacy',
      descAr: 'معلوماتك محمية بأعلى معايير الأمان',
      descEn: 'Your information is protected with the highest security standards',
    },
    {
      icon: Heart,
      titleAr: 'رعاية مهنية',
      titleEn: 'Professional Care',
      descAr: 'أطباء معتمدون وذوو خبرة',
      descEn: 'Certified and experienced doctors',
    },
    {
      icon: BookOpen,
      titleAr: 'محتوى علمي',
      titleEn: 'Scientific Content',
      descAr: 'معلومات موثوقة ومبنية على الأبحاث',
      descEn: 'Reliable and research-based information',
    },
  ];

  return (
    <section className="py-20 bg-card/40 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8 slide-up">
          <h2 className="text-3xl md:text-4xl font-bold">
            {t('عن انت مهم', 'About you matter')}
          </h2>
          
          <p className="text-lg leading-relaxed text-muted-foreground">
            {t(
              'انت مهم منصة طبية متخصصة في التوعية بالصحة النفسية. تقدم اختبارات علمية، محتوى تثقيفي، واستشارات مهنية لمساعدتك على فهم ذاتك والتعامل مع ضغوط الحياة',
              'you matter is a bilingual platform for you matter awareness. It offers validated tests, educational resources, and professional consultations to help you understand yourself and handle life\'s pressures'
            )}
          </p>

          <div className="grid md:grid-cols-3 gap-8 pt-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-lg bg-background shadow-card hover:shadow-soft transition-smooth"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {t(feature.titleAr, feature.titleEn)}
                  </h3>
                  <p className="text-muted-foreground">
                    {t(feature.descAr, feature.descEn)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
