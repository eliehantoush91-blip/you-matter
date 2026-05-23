import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/store';
import axios from 'axios';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Calendar, TrendingUp, Send, RotateCcw, User } from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TestResult {
  id: number;
  testId: string;
  name: { en: string; ar: string };
  date: string;
  score: number;
  maxScore: number;
  percentage: number;
  level: { en: string; ar: string };
  levelColor: string;
  interpretation?: { en: string; ar: string };
  recommendations?: { en: string[]; ar: string[] };
  resultText?: string;
}


// Using real API data instead of mock data

// Using real API data - no mock data needed

const TestResultDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const auth = useSelector((state: RootState) => state.auth);

  const [result, setResult] = useState<any>(null);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch result details on component mount
  useEffect(() => {
    const fetchResult = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const token = auth.token;
        if (!token) {
          setError('No authentication token found. Please log in again.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://127.0.0.1:8000/api/patient_test_results/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        setResult(response.data);

        // Also fetch progress data
        try {
          const progressResponse = await axios.get(`http://127.0.0.1:8000/api/patient_test_results/${id}/progress/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });
          console.log('Progress API called for result ID:', id);
          console.log('Progress data received:', progressResponse.data);
          console.log('Progress data array:', progressResponse.data.progress_data);
          console.log('Progress data length:', progressResponse.data.progress_data?.length || 0);
          setProgressData(progressResponse.data.progress_data || []);
        } catch (progressErr: any) {
          console.error('Error fetching progress data:', progressErr);
          console.error('Progress error response:', progressErr.response?.data);
          // Don't set error for progress data, just leave it empty
          setProgressData([]);
        }
      } catch (err: any) {
        console.error('Error fetching test result details:', err);
        const errorMessage = err.response?.data?.error || 'Failed to load test result';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (auth.isAuthenticated && id) {
      fetchResult();
    } else if (!auth.isAuthenticated) {
      setError('Please log in to view test results');
      setLoading(false);
    }
  }, [id, auth.isAuthenticated, auth.token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/40 via-accent/8 to-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-6"></div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-muted rounded"></div>
                <div className="h-48 bg-muted rounded"></div>
              </div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/40 via-accent/8 to-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {error || t('النتيجة غير موجودة', 'Result not found')}
              </p>
              <Button asChild>
                <Link to="/test-results">
                  {t('العودة إلى النتائج', 'Back to Results')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Progress data is now fetched from API

  const handleSendToDoctor = () => {
    toast.success(t('تم إرسال النتائج إلى الطبيب بنجاح', 'Results sent to doctor successfully'));
  };

  const handleRetakeTest = () => {
    navigate(`/tests`);
  };

  const handleContactDoctor = () => {
    navigate('/message-doctor');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (language === 'ar') {
      return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/40 via-accent/8 to-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6 fade-in">
          <Button variant="ghost" onClick={() => navigate('/test-results')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('العودة إلى جميع النتائج', 'Back to All Results')}
          </Button>
        </div>

        {/* Header Section */}
        <div className="mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                {language === 'ar' ? result.name.ar : result.name.en}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(result.date)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Score Card */}
            <Card className="fade-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>{t('نتيجة الاختبار', 'Test Score')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Large Percentage Display */}
                <div className="text-center py-8">
                  <div className="text-7xl font-bold text-primary mb-2">
                    {result.percentage}%
                  </div>
                  <div className={`text-2xl font-semibold mb-4 ${result.levelColor}`}>
                    {language === 'ar' ? result.level.ar : result.level.en}
                  </div>
                  <Progress value={result.percentage} className="h-3 max-w-md mx-auto" />
                  <div className="text-muted-foreground mt-4">
                    {result.score} {t('من', 'out of')} {result.maxScore} {t('نقطة', 'points')}
                  </div>
                </div>

                {/* Interpretation */}
                <div className="bg-muted/50 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-3">
                    {t('التفسير', 'Interpretation')}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {result.interpretation
                      ? (language === 'ar' ? result.interpretation.ar : result.interpretation.en)
                      : (language === 'ar'
                          ? 'تم إكمال الاختبار بنجاح. يمكنك مراجعة نتيجتك مع أخصائي الصحة النفسية للحصول على تفسير مفصل.'
                          : 'Test completed successfully. You can review your results with a mental health professional for detailed interpretation.'
                        )
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Progress Chart */}
            <Card className="fade-in" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <CardTitle>{t('التقدم عبر الوقت', 'Progress Over Time')}</CardTitle>
                <CardDescription>
                  {progressData.length > 1
                    ? t('تطور درجاتك في الاختبارات السابقة', 'Your score evolution in previous tests')
                    : t('قم بإجراء المزيد من الاختبارات لرؤية التقدم', 'Take more tests to see your progress')
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {progressData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="formatted_date"
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: any, name: string) => [
                          `${value} ${t('نقطة', 'points')}`,
                          t('الدرجة', 'Score')
                        ]}
                        labelFormatter={(label) => t('التاريخ', 'Date') + ': ' + label}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                        activeDot={{ r: 7 }}
                        name={t('الدرجة', 'Score')}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <TrendingUp className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {t('لا توجد بيانات كافية', 'Not Enough Data')}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-md">
                      {t(
                        'قم بإجراء هذا الاختبار عدة مرات لرؤية تطور درجاتك مع مرور الوقت',
                        'Take this test multiple times to see how your scores evolve over time'
                      )}
                    </p>
                    <Button
                      onClick={handleRetakeTest}
                      variant="outline"
                      size="sm"
                      className="mt-4"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {t('إعادة الاختبار', 'Retake Test')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="fade-in" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle>{t('التوصيات', 'Recommendations')}</CardTitle>
              </CardHeader>
              <CardContent>
                {result.recommendations ? (
                <ul className="space-y-3">
                    {(language === 'ar' ? result.recommendations.ar : result.recommendations.en).map((rec: string, index: number) => (
                    <li key={index} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-sm font-semibold">{index + 1}</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{rec}</p>
                    </li>
                  ))}
                </ul>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-sm font-semibold">1</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {language === 'ar'
                          ? 'استشر أخصائي الصحة النفسية لمناقشة نتائجك'
                          : 'Consult with a mental health professional to discuss your results'
                        }
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-sm font-semibold">2</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {language === 'ar'
                          ? 'تابع اختباراتك المنتظمة لمراقبة تقدمك'
                          : 'Continue regular testing to monitor your progress'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid sm:grid-cols-2 gap-4 fade-in" style={{ animationDelay: '0.5s' }}>
              <Button
                variant="default"
                size="lg"
                onClick={handleRetakeTest}
                className="w-full"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                {t('إعادة الاختبار', 'Repeat the Test')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleSendToDoctor}
                className="w-full"
              >
                <Send className="h-5 w-5 mr-2" />
                {t('إرسال إلى الطبيب', 'Send to Doctor')}
              </Button>
            </div>
          </div>

          {/* Sidebar - Next Steps */}
          <div className="space-y-6">
            <Card className="fade-in" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <CardTitle>{t('الخطوات التالية', 'Next Steps')}</CardTitle>
                <CardDescription>
                  {t('كيفية الاستفادة من نتائجك', 'How to make the most of your results')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-sm font-semibold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {t('شارك النتائج', 'Share Results')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('أرسل النتائج إلى طبيبك للحصول على استشارة', 'Send results to your doctor for consultation')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-sm font-semibold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {t('تابع التقدم', 'Track Progress')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('كرر الاختبار بانتظام لمراقبة تحسنك', 'Retake tests regularly to monitor improvement')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-sm font-semibold">3</span>
                        </div>
                    <div>
                      <p className="font-medium text-sm">
                        {t('اطلب المساعدة', 'Seek Help')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('تواصل مع متخصص للدعم والإرشاد', 'Contact a specialist for support and guidance')}
                      </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={handleContactDoctor}
                      >
                        <User className="h-4 w-4 mr-2" />
                        {t('تواصل مع الطبيب', 'Contact Doctor')}
                      </Button>
              </CardContent>
            </Card>

            {/* Motivational Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 fade-in" style={{ animationDelay: '0.4s' }}>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3">
                  {t('استمر في التقدم! 💙', 'Keep Going! 💙')}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(
                    'رحلتك نحو الصحة النفسية الأفضل تهمنا. تذكر أن التحسن يحتاج إلى وقت وجهد، ونحن هنا لدعمك.',
                    'Your journey to better mental health matters to us. Remember that improvement takes time and effort, and we are here to support you.'
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestResultDetails;
