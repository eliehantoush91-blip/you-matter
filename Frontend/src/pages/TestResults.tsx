import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/store';
import axios from 'axios';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Calendar, TrendingUp, Send, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
}

const TestResults = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch test results on component mount
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = auth.token;
        if (!token) {
          setError('No authentication token found. Please log in again.');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://127.0.0.1:8000/api/patient_test_results/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        setResults(response.data.results);
      } catch (err: any) {
        console.error('Error fetching test results:', err);
        const errorMessage = err.response?.data?.error || 'Failed to load test results';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (auth.isAuthenticated) {
      fetchResults();
    } else {
      setError('Please log in to view your test results');
      setLoading(false);
    }
  }, [auth.isAuthenticated, auth.token]);

  const filteredResults = results
    .filter((result) => selectedTest === 'all' || result.testId === selectedTest)
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const handleViewDetails = (result: TestResult) => {
    navigate(`/test-results/${result.id}`);
  };

  const handleSendToDoctor = () => {
    toast.success(t('تم إرسال النتائج إلى الطبيب بنجاح', 'Results sent to doctor successfully'));
    setIsModalOpen(false);
  };

  const handleRetakeTest = () => {
    if (selectedResult) {
      navigate(`/tests/${selectedResult.testId}`);
    }
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
        <div className="mb-8 fade-in">
          <Button variant="ghost" onClick={() => navigate('/patient-dashboard')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('العودة إلى لوحة التحكم', 'Back to Dashboard')}
          </Button>
          
          <h1 className="text-4xl font-bold mb-2">
            {t('نتائج الاختبارات', 'Test Results History')}
          </h1>
          <p className="text-muted-foreground">
            {t('جميع نتائج الاختبارات النفسية السابقة', 'All your previous psychological test results')}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex-1">
            <Select value={selectedTest} onValueChange={setSelectedTest}>
              <SelectTrigger>
                <SelectValue placeholder={t('جميع الاختبارات', 'All Tests')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('جميع الاختبارات', 'All Tests')}</SelectItem>
                <SelectItem value="depression">{t('الاكتئاب', 'Depression')}</SelectItem>
                <SelectItem value="gad7">{t('القلق العام', 'Generalized Anxiety')}</SelectItem>
                <SelectItem value="ptsd">{t('اضطراب ما بعد الصدمة', 'PTSD')}</SelectItem>
                <SelectItem value="bipolar">{t('اضطراب المزاج الثنائي', 'Bipolar Disorder')}</SelectItem>
                <SelectItem value="insomnia">{t('الأرق', 'Insomnia')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'newest' | 'oldest')}>
              <SelectTrigger>
                <SelectValue placeholder={t('الأحدث أولاً', 'Newest First')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('الأحدث أولاً', 'Newest First')}</SelectItem>
                <SelectItem value="oldest">{t('الأقدم أولاً', 'Oldest First')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="fade-in animate-pulse">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded-full bg-muted"></div>
                    <div className="h-4 w-20 bg-muted rounded"></div>
                  </div>
                  <div className="h-6 w-3/4 bg-muted rounded mb-2"></div>
                  <div className="h-4 w-1/2 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-muted rounded"></div>
                    <div className="h-10 w-full bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                {t('إعادة المحاولة', 'Try Again')}
              </Button>
            </div>
          ) : filteredResults.length > 0 ? (
            filteredResults.map((result, index) => (
            <Card
              key={result.id}
              className="fade-in cursor-pointer hover:shadow-soft transition-smooth"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              onClick={() => handleViewDetails(result)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(result.date)}
                  </div>
                </div>
                <CardTitle className="text-lg">
                  {language === 'ar' ? result.name.ar : result.name.en}
                </CardTitle>
                <CardDescription className={`font-semibold ${result.levelColor}`}>
                  {language === 'ar' ? result.level.ar : result.level.en}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">{t('الدرجة', 'Score')}</span>
                      <span className="font-semibold">
                        {result.score} / {result.maxScore}
                      </span>
                    </div>
                    <Progress value={result.percentage} className="h-2" />
                  </div>
                  <Button variant="outline" className="w-full" onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(result);
                  }}>
                    {t('عرض التفاصيل', 'View Details')}
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('لا توجد نتائج للعرض', 'No results to display')}
              </p>
              <Button asChild>
                <Link to="/psychological-tests">
                  {t('ابدأ اختباراً جديداً', 'Start a New Test')}
                </Link>
              </Button>
            </CardContent>
          </Card>
            </div>
        )}
        </div>

      </main>

      {/* Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedResult && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {language === 'ar' ? selectedResult.name.ar : selectedResult.name.en}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {t('تم الإجراء في', 'Completed on')} {formatDate(selectedResult.date)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Score Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('نظرة عامة على النتيجة', 'Score Overview')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t('الدرجة الإجمالية', 'Total Score')}</span>
                      <span className="text-2xl font-bold">
                        {selectedResult.score} / {selectedResult.maxScore}
                      </span>
                    </div>
                    <Progress value={selectedResult.percentage} className="h-3" />
                    <div className={`text-center font-semibold text-lg ${selectedResult.levelColor}`}>
                      {language === 'ar' ? selectedResult.level.ar : selectedResult.level.en}
                    </div>
                  </CardContent>
                </Card>

                {/* Interpretation */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('التفسير', 'Interpretation')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {language === 'ar'
                        ? 'تشير هذه النتيجة إلى أنك قد تواجه بعض الأعراض. يُنصح بمناقشة هذه النتائج مع أخصائي الصحة النفسية للحصول على تقييم شامل وخطة علاجية مناسبة.'
                        : 'This result indicates that you may be experiencing some symptoms. It is recommended to discuss these results with a mental health professional for a comprehensive assessment and appropriate treatment plan.'}
                    </p>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={handleSendToDoctor}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {t('إرسال إلى الطبيب', 'Send to Doctor')}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleRetakeTest}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {t('إعادة الاختبار', 'Retake Test')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestResults;
