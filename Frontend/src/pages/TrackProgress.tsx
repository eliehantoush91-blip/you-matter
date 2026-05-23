import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingDown, TrendingUp, Minus, Heart, Brain, Moon, AlertCircle, FileText, MessageSquare, Loader2, Users, Zap } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/store';

interface DomainData {
  count: number;
  avg_score: number | null;
  std: number;
  trend: 'improving' | 'worsening' | 'stable';
  predicted_next: number | null;
  history: Array<{score: number; date: string}>;
}

interface ApiResponse {
  patient_id: number;
  domains: Record<string, DomainData>;
  alerts: Array<{level: string; code: string; message: string}>;
  personality_profile?: {
    cluster_id: number | null;
    cluster_label: string;
    cluster_label_i18n?: { en: string; ar: string };
    cluster_description: string;
    cluster_description_i18n?: { en: string; ar: string };
    date: string;
  };
}

interface ProgressData {
  date: string;
  depression: number;
  anxiety: number;
  personality: number;
  cognitive: number;
  ptsd: number;
  sleep: number;
}

const TrackProgress = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);

  const [summaries, setSummaries] = useState<Record<string, DomainData>>({});
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalTests, setTotalTests] = useState(0);
  const [personalityProfile, setPersonalityProfile] = useState<ApiResponse['personality_profile'] | null>(null);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = auth.token;
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await axios.get<ApiResponse>('http://127.0.0.1:8000/api/patient-summary/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.data.domains) {
        setSummaries(response.data.domains);
        setPersonalityProfile(response.data.personality_profile || null);
        // For progressData, we can use history from domains
        // But for chart, might need to adapt
        setProgressData([]); // Temporarily empty, can be updated later
        setTotalTests(Object.values(response.data.domains).reduce((sum, domain) => sum + domain.count, 0));
      } else if (response.data.patient_id === undefined) {
        // If no patient_id, it's an error
        setError('Failed to load data');
      } else {
        setSummaries({});
        setPersonalityProfile(null);
        setProgressData([]);
        setTotalTests(0);
      }
    } catch (err: any) {
      console.error('Error fetching progress data:', err);
      const errorMessage = err.response?.data?.error || 'Failed to load progress data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="h-5 w-5 text-primary" />;
      case 'worsening':
        return <TrendingUp className="h-5 w-5 text-destructive" />;
      default:
        return <Minus className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'bg-primary/10 border-primary/30';
      case 'worsening':
        return 'bg-destructive/10 border-destructive/30';
      default:
        return 'bg-muted/30 border-border';
    }
  };

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'depression':
        return <Brain className="h-6 w-6" />;
      case 'anxiety':
        return <Heart className="h-6 w-6" />;
      case 'personality':
        return <Users className="h-6 w-6" />;
      case 'cognitive':
        return <Zap className="h-6 w-6" />;
      case 'sleep':
        return <Moon className="h-6 w-6" />;
      case 'ptsd':
        return <AlertCircle className="h-6 w-6" />;
      default:
        return <Brain className="h-6 w-6" />;
    }
  };

  const getConditionName = (condition: string) => {
    const names = {
      depression: { ar: 'الاكتئاب', en: 'Depression' },
      anxiety: { ar: 'القلق', en: 'Anxiety' },
      personality: { ar: 'الشخصية', en: 'Personality' },
      cognitive: { ar: 'القدرات المعرفية', en: 'Cognitive Skills' },
      sleep: { ar: 'جودة النوم', en: 'Sleep Quality' },
      ptsd: { ar: 'اضطراب ما بعد الصدمة', en: 'PTSD' },
    };
    return language === 'ar' ? names[condition as keyof typeof names].ar : names[condition as keyof typeof names].en;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };


  const isImproving = Object.values(summaries).filter((s) => s.trend === 'improving').length >= 2;
  const getPersonalityLabel = () => {
    if (!personalityProfile) return '';
    return personalityProfile.cluster_label_i18n?.[language as 'en' | 'ar'] ||
      personalityProfile.cluster_label ||
      `${language === 'ar' ? 'المجموعة' : 'Cluster'} ${personalityProfile.cluster_id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/40 via-accent/8 to-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">
                {t("جاري تحميل بيانات التقدم...", "Loading progress data...")}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchProgressData}>
              {t("إعادة المحاولة", "Try Again")}
            </Button>
          </div>
        ) : totalTests === 0 ? (
          /* Empty State - No Tests Taken */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                {t("لا توجد نتائج اختبارات بعد", "No Test Results Yet")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t(
                  "ابدأ بإجراء بعض الاختبارات النفسية لرؤية تقدمك وتطور حالتك الصحية",
                  "Start taking some psychological tests to see your progress and mental health evolution"
                )}
              </p>
              <Button asChild>
                <Link to="/tests">
                  <FileText className="h-5 w-5 mr-2" />
                  {t("ابدأ الاختبارات", "Start Tests")}
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="mb-8 fade-in">
              <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/patient-dashboard')}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-4xl font-bold">{t('تتبّع التقدّم', 'Track Your Progress')}</h1>
                  <p className="text-muted-foreground mt-2">
                    {t(
                      'شاهد تطور حالتك النفسية بناءً على نتائج اختباراتك السابقة.',
                      'See how your mental health has evolved based on your past test results.'
                    )}
                  </p>
                </div>
              </div>
              <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                <CardContent className="py-4">
                  <p className="text-center font-medium">
                    {t('استمر في المسير، رحلتك نحو الصحة النفسية مهمة 💙', 'Keep going, your mental health journey matters 💙')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Summary Cards Section */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Object.entries(summaries).map(([key, summary], index) => {
                if (!summary) return null;
                return (
                  <Card
                    key={key}
                    className={`fade-in border-2 ${getTrendColor(summary.trend)}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          {getConditionIcon(key)}
                        </div>
                        {getTrendIcon(summary.trend)}
                      </div>
                      <CardTitle className="text-lg">{getConditionName(key)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {key === 'personality' && personalityProfile ? (
                          <div className="space-y-1">
                            <span className="text-2xl font-bold leading-tight block">
                              {getPersonalityLabel()}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {language === 'ar' ? 'المجموعة' : 'Cluster'} {personalityProfile.cluster_id}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold">{summary.avg_score?.toFixed(1) || 'N/A'}</span>
                            <span className="text-sm text-muted-foreground">/ 100</span>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {t('عدد الاختبارات', 'Tests Count')}: {summary.count}
                        </p>
                        {summary.predicted_next !== null && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                              {t('متوقع بعد 30 يوم', 'Predicted in 30 days')}: {summary.predicted_next.toFixed(1)}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Progress Charts Section - Temporarily disabled, needs adaptation for new API */}
            {false && (
            <Card className="mb-8 fade-in" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle>{t('تطور الحالة النفسية', 'Mental Health Progress Over Time')}</CardTitle>
                <CardDescription>
                  {t('رسم بياني يوضح تطور درجات الاختبارات خلال الأشهر الماضية', 'Chart showing test scores evolution over the past months')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={progressData}>
                    <defs>
                      <linearGradient id="colorDepression" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorAnxiety" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="depression"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorDepression)"
                      name={t('الاكتئاب', 'Depression')}
                    />
                    <Area
                      type="monotone"
                      dataKey="anxiety"
                      stroke="hsl(var(--secondary))"
                      fillOpacity={1}
                      fill="url(#colorAnxiety)"
                      name={t('القلق', 'Anxiety')}
                    />
                    <Line
                      type="monotone"
                      dataKey="personality"
                      stroke="hsl(var(--destructive))"
                      strokeWidth={2}
                      name={t('الشخصية', 'Personality')}
                    />
                    <Line
                      type="monotone"
                      dataKey="cognitive"
                      stroke="hsl(var(--warning))"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      name={t('القدرات المعرفية', 'Cognitive Skills')}
                    />
                    <Line
                      type="monotone"
                      dataKey="ptsd"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      name={t('اضطراب ما بعد الصدمة', 'PTSD')}
                    />
                    <Line
                      type="monotone"
                      dataKey="sleep"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name={t('جودة النوم', 'Sleep Quality')}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            )}

            {/* Insights & Recommendations Section */}
            <Card className="fade-in" style={{ animationDelay: '0.5s' }}>
              <CardHeader>
                <CardTitle>{t('رؤى وتوصيات', 'Insights & Recommendations')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isImproving ? (
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                    <p className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-primary" />
                      {t('استمر بالتقدم! حالتك تتحسن 🌿', 'Keep it up! Your condition is improving 🌿')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        'تظهر بياناتك تحسناً ملحوظاً في معظم المؤشرات النفسية. استمر في متابعة خطتك العلاجية.',
                        'Your data shows significant improvement in most psychological indicators. Continue following your treatment plan.'
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                    <p className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      {t('يُنصح بالمتابعة مع طبيبك', 'We recommend following up with your doctor')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        'بعض المؤشرات تحتاج إلى اهتمام. يُفضل مراسلة طبيبك لمناقشة خطتك العلاجية.',
                        'Some indicators need attention. Consider messaging your doctor to discuss your treatment plan.'
                      )}
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4 pt-4">
                  <Button variant="default" size="lg" className="w-full" asChild>
                    <Link to="/tests">
                      <FileText className="h-5 w-5 mr-2" />
                      {t('إعادة إجراء الاختبار', 'Retake Test')}
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="w-full" onClick={() => navigate('/patient-dashboard')}>
                    <MessageSquare className="h-5 w-5 mr-2" />
                    {t('راسل طبيبك', 'Message Your Doctor')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default TrackProgress;
