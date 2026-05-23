import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Heart, Users, ClipboardList, Zap, Gamepad2, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/store';

interface TestApiData {
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




const getTestIcon = (testType: string) => {
  switch (testType) {
    case "static":
      return ClipboardList;
    case "dynamic":
      return Zap;
    case "game":
      return Gamepad2;
    default:
      return ClipboardList;
  }
};

const getTestColor = (testType: string) => {
  switch (testType) {
    case "static":
      return "text-blue-500";
    case "dynamic":
      return "text-green-500";
    case "game":
      return "text-purple-500";
    default:
      return "text-primary";
  }
};


const Tests = () => {
  const navigate = useNavigate();
  const { t, language: globalLang } = useLanguage();
  const auth = useSelector((state: RootState) => state.auth);
  const language = globalLang === 'ar' ? 'ar' : 'en';

  // Get dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!auth.isAuthenticated) return '/';
    return auth.user?.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard';
  };

  const [apiTests, setApiTests] = useState<TestApiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('http://127.0.0.1:8000/api/tests/', {
        params: { language: globalLang }
      });

      setApiTests(response.data);
    } catch (err: any) {
      console.error('Error fetching tests:', err);
      console.error('Error fetching tests:', err);
      const errorMessage = err.response?.data?.error || 'Failed to load tests';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [globalLang]);

  // Transform API tests to match PsychologicalTests.tsx structure
  const tests = useMemo(() => {
    
    return apiTests.map(test => {
      // Map test IDs to correct route strings for game tests
      const routeMap: { [key: number]: string } = {
        2: 'gonogo',
        3: 'stroop',
      };

      const testName = (test.translations?.en?.name || '').toLowerCase();
      const isBigFive = testName.includes('big five');
      const routeSlug = routeMap[test.id] || test.id.toString();
      const route = isBigFive
        ? '/big-five/start'
        : test.test_type === 'game'
          ? `/game/${routeSlug}`
          : `/test/${test.id}`;

      return {
        icon: getTestIcon(test.test_type),
        titleAr: test.translations?.ar?.name || test.translations?.en?.name || 'اختبار غير مسمى',
        titleEn: test.translations?.en?.name || 'Untitled Test',
        descriptionAr: test.translations?.ar?.description || test.translations?.en?.description || '',
        descriptionEn: test.translations?.en?.description || '',
        link: route,
        color: getTestColor(test.test_type),
      };
    });
  }, [apiTests]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-accent/8">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(getDashboardUrl())}
            className="mb-4"
          >
            <ArrowLeft className="rotate-180" />
            {t("العودة إلى لوحة التحكم", "Back to Dashboard")}
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent mb-2">
            {t("الاختبارات النفسية", "Psychological Tests")}
          </h1>
          <p className="text-muted-foreground mb-4">
            {t(
              "اختبارات نفسية علمية مبنية على معايير عالمية لمساعدتك في فهم حالتك النفسية بشكل أفضل",
              "Scientific psychological tests based on international standards to help you better understand your mental state"
            )}
          </p>

          {/* Disclaimer */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/20 border border-accent/30">
            <AlertCircle className="w-4 h-4 text-accent-foreground" />
            <p className="text-sm text-accent-foreground">
              {t(
                "هذه الاختبارات ليست تشخيصاً طبياً. استشر متخصصاً إذا كانت النتائج مقلقة",
                "These tests are not a medical diagnosis. Consult a professional if results are concerning"
              )}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">
                {t("جاري تحميل الاختبارات...", "Loading tests...")}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchTests}>
              {t("إعادة المحاولة", "Try Again")}
            </Button>
          </div>
        ) : (
          <>
            {/* Tests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tests.map((test, index) => {
                const IconComponent = test.icon;
                return (
                  <Card
                    key={index}
                    className="fade-in cursor-pointer hover:shadow-elegant transition-smooth hover:-translate-y-1 group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => navigate(test.link)}
                  >
                    <CardHeader>
                      <div className={`w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${test.color}`}>
                        <IconComponent className="h-7 w-7" />
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {t(test.titleAr, test.titleEn)}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {t(test.descriptionAr, test.descriptionEn)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {t("ابدأ الاختبار", "Start Test")}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Info Section */}
            <Card className="mt-12 shadow-card border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <CardHeader>
                <CardTitle>{t("لماذا الاختبارات النفسية مهمة؟", "Why Are Psychological Tests Important?")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {t(
                    "الاختبارات النفسية هي أدوات علمية موثوقة تساعدك على فهم حالتك النفسية بشكل أفضل. هذه الاختبارات مبنية على معايير عالمية وتم التحقق من صحتها من قبل خبراء في الصحة النفسية.",
                    "Psychological tests are reliable scientific tools that help you better understand your mental state. These tests are based on international standards and have been validated by mental health experts."
                  )}
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <h3 className="font-semibold mb-2 text-primary">
                      {t("موثوقة علمياً", "Scientifically Validated")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "جميع الاختبارات مبنية على أبحاث علمية معترف بها",
                        "All tests are based on recognized scientific research"
                      )}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <h3 className="font-semibold mb-2 text-primary">
                      {t("سرية تامة", "Completely Confidential")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "نتائجك خاصة بك ولا يتم مشاركتها مع أي طرف ثالث",
                        "Your results are private and not shared with any third party"
                      )}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <h3 className="font-semibold mb-2 text-primary">
                      {t("سهلة الاستخدام", "Easy to Use")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        "واجهة بسيطة وسهلة الفهم تناسب جميع المستخدمين",
                        "Simple and easy-to-understand interface suitable for all users"
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Tests;
