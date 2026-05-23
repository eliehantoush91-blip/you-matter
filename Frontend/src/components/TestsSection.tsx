import { useLanguage } from '@/contexts/LanguageContext';
import { Brain, Heart, Moon, AlertCircle, Loader2 } from 'lucide-react';
import TestCard from './TestCard';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Test {
  id: number;
  translations: {
    en: {
      name: string;
      description: string;
    };
    ar: {
      name: string;
      description: string;
    };
  };
  test_type: string;
  estimated_time: string;
}

const TestsSection = () => {
  const { t, language } = useLanguage();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://127.0.0.1:8000/api/tests/', {
          params: { language }
        });
        setTests(response.data.slice(0, 4)); // Get first 4 tests
      } catch (err: any) {
        console.error('Error fetching tests:', err);
        setError('Failed to load tests');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [language]);

  // Map test types to icons
  const getTestIcon = (testType: string) => {
    switch (testType.toLowerCase()) {
      case 'static':
        return Brain;
      case 'dynamic':
        return Heart;
      case 'game':
        return AlertCircle;
      default:
        return Brain;
    }
  };

  const getTestLink = (test: Test) => {
    const testName = (test.translations?.en?.name || '').toLowerCase();
    return testName.includes('big five') ? '/big-five/start' : `/test/${test.id}`;
  };

  return (
    <section className="py-20 bg-background/30 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 slide-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('اختبارات نفسية علمية', 'Scientific Mental Health Tests')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t(
              'اختبارات مبنية على معايير علمية لمساعدتك في فهم حالتك النفسية',
              'Tests based on scientific standards to help you understand your mental state'
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="animate-pulse">
                  <div className="bg-card border rounded-lg p-6 shadow-card">
                    <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-4"></div>
                    <div className="h-6 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="h-10 bg-muted rounded"></div>
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : (
            tests.map((test, index) => {
              const icon = getTestIcon(test.test_type);
              const title = language === 'ar' ? test.translations.ar.name : test.translations.en.name;
              const description = language === 'ar' ? test.translations.ar.description : test.translations.en.description;
              const link = getTestLink(test);

              return (
                <div key={test.id} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <TestCard
                    icon={icon}
                    titleAr={title}
                    titleEn={title}
                    descriptionAr={description}
                    descriptionEn={description}
                    link={link}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default TestsSection;
