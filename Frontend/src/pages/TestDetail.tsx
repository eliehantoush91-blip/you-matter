import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft, Brain, ClipboardList, Heart, Users, Loader2 } from "lucide-react";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";

interface TestDetailApiData {
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

// Mock test data - fallback if API fails
const testsData: Record<string, {
  name: string;
  description: string;
  type: string;
  estimated_time: string;
  questions_count?: number;
}> = {
  "1": {
    name: "Beck Depression Inventory (BDI)",
    description: "The Beck Depression Inventory is a 21-item self-report questionnaire that measures the severity of depression in adults and adolescents. It covers common symptoms such as sadness, pessimism, loss of pleasure, guilt, and changes in sleep and appetite. This assessment helps identify depressive symptoms and track changes over time.",
    type: "Mental Health",
    estimated_time: "10-15 min",
    questions_count: 21,
  },
  "2": {
    name: "Generalized Anxiety Disorder Assessment (GAD-7)",
    description: "The GAD-7 is a brief clinical measure for assessing generalized anxiety disorder. It helps identify the presence and severity of anxiety symptoms over the past two weeks. This screening tool is widely used in clinical settings to monitor treatment progress and outcomes.",
    type: "Anxiety",
    estimated_time: "5-10 min",
    questions_count: 7,
  },
  "3": {
    name: "Big Five Personality Test",
    description: "Explore the five major dimensions of personality: Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism. This comprehensive assessment provides insights into your personality traits and how they influence your behavior, relationships, and career choices.",
    type: "Personality",
    estimated_time: "20-25 min",
    questions_count: 50,
  },
  "4": {
    name: "Emotional Intelligence Assessment",
    description: "Measure your ability to recognize, understand, and manage emotions in yourself and others. This assessment evaluates key components of emotional intelligence including self-awareness, self-regulation, motivation, empathy, and social skills.",
    type: "Emotional",
    estimated_time: "15-20 min",
    questions_count: 33,
  },
};

const getTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "mental health":
      return <Brain className="h-5 w-5" />;
    case "anxiety":
      return <Heart className="h-5 w-5" />;
    case "personality":
      return <Users className="h-5 w-5" />;
    case "emotional":
      return <Heart className="h-5 w-5" />;
    default:
      return <ClipboardList className="h-5 w-5" />;
  }
};

const getTypeBadgeVariant = (type: string): "default" | "secondary" | "outline" => {
  switch (type.toLowerCase()) {
    case "mental health":
      return "default";
    case "anxiety":
      return "secondary";
    default:
      return "outline";
  }
};

const TestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language: globalLang } = useLanguage();
  const language = globalLang === 'ar' ? 'ar' : 'en';
  const isRTL = language === 'ar';

  const [apiTest, setApiTest] = useState<TestDetailApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create test object from API data or fallback
  const test = apiTest ? {
    name: (language === 'ar' ? apiTest.translations?.ar?.name : null) ||
          apiTest.translations?.en?.name ||
          (language === 'ar' ? apiTest.translations?.en?.name : null) ||
          'Untitled Test',
    description: (language === 'ar' ? apiTest.translations?.ar?.description : null) ||
                 apiTest.translations?.en?.description ||
                 (language === 'ar' ? apiTest.translations?.en?.description : null) ||
                 '',
    type: apiTest.test_type === 'static' ? 'Mental Health' :
          apiTest.test_type === 'dynamic' ? 'Personality' : 'Assessment',
    estimated_time: apiTest.estimated_time || '10-15 min',
    questions_count: undefined, // We'll get this from questions API
  } : (id ? testsData[id] : null);

  const fetchTestDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`http://127.0.0.1:8000/api/test_details/${id}/`, {
        params: { language: globalLang }
      });

      setApiTest(response.data);
    } catch (err: any) {
      console.error('Error fetching test details:', err);
      const errorMessage = err.response?.data?.error || 'Failed to load test details';
      setError(errorMessage);
      // Don't set error for 404s, just use fallback data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestDetail();
  }, [id, globalLang]);

  if (loading && !apiTest) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading test details...</p>
        </div>
      </div>
    );
  }

  if (!test && !loading) {
    return (
      <div className={`min-h-screen bg-background flex items-center justify-center p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'الاختبار غير موجود' : 'Test Not Found'}</CardTitle>
            <CardDescription>
              {language === 'ar'
                ? 'الاختبار الذي تبحث عنه غير موجود أو تم حذفه.'
                : 'The test you\'re looking for doesn\'t exist or has been removed.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/tests")} variant="outline" className={isRTL ? 'flex-row-reverse' : ''}>
              <ArrowLeft className={`mr-2 h-4 w-4 ${isRTL ? 'ml-2 mr-0 rotate-180' : ''}`} />
              {language === 'ar' ? 'العودة للاختبارات' : 'Back to Tests'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStartTest = () => {
    const testName = test?.name?.toLowerCase() || '';
    if (testName.includes('big five')) {
      navigate('/big-five/start');
      return;
    }
    navigate(`/test/${id}/start`);
  };

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/tests")}
            className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            {language === 'ar' ? 'العودة للاختبارات' : 'Back to Tests'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-lg border-border/50">
            <CardHeader className="pb-4">
              {/* Type Badge */}
              <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Badge 
                  variant={getTypeBadgeVariant(test.type)}
                  className="gap-1.5 px-3 py-1"
                >
                  {getTypeIcon(test.type)}
                  {language === 'ar' ?
                    (test.type === 'Mental Health' ? 'الصحة النفسية' :
                     test.type === 'Anxiety' ? 'القلق' :
                     test.type === 'Personality' ? 'الشخصية' :
                     test.type === 'Emotional' ? 'عاطفي' :
                     test.type) :
                    test.type}
                </Badge>
              </div>

              {/* Test Name */}
              <CardTitle className={`text-2xl md:text-3xl font-serif font-semibold leading-tight ${isRTL ? 'text-right' : ''}`}>
                {test.name}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Description */}
              <div className="space-y-2">
                <h3 className={`text-sm font-medium text-muted-foreground uppercase tracking-wide ${isRTL ? 'text-right' : ''}`}>
                  {language === 'ar' ? 'حول هذا التقييم' : 'About this assessment'}
                </h3>
                <p className={`text-foreground/90 leading-relaxed ${isRTL ? 'text-right' : ''}`}>
                  {test.description}
                </p>
              </div>

              {/* Test Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-border">
                {/* Estimated Time */}
                <div className={`flex items-center gap-3 p-3 rounded-lg bg-accent/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="p-2 rounded-full bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className={`${isRTL ? 'text-right' : ''}`}>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'الوقت المقدر' : 'Estimated Time'}
                    </p>
                    <p className="font-medium">{test.estimated_time}</p>
                  </div>
                </div>

                {/* Questions Count */}
                {test.questions_count && (
                  <div className={`flex items-center gap-3 p-3 rounded-lg bg-accent/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="p-2 rounded-full bg-primary/10">
                      <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div className={`${isRTL ? 'text-right' : ''}`}>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'الأسئلة' : 'Questions'}
                      </p>
                      <p className="font-medium">
                        {language === 'ar' ? `${test.questions_count} سؤال` : `${test.questions_count} questions`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Start Button */}
              <div className={`pt-4 ${isRTL ? 'text-right' : ''}`}>
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto px-8 py-6 text-lg font-semibold"
                  onClick={handleStartTest}
                >
                  {language === 'ar' ? 'ابدأ التقييم' : 'Start Assessment'}
                </Button>
                <p className="mt-3 text-sm text-muted-foreground">
                  {language === 'ar'
                    ? 'سيتم الحفاظ على سرية إجاباتك وأمانها.'
                    : 'Your responses will be kept confidential and secure.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TestDetail;
