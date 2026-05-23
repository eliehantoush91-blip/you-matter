import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, ArrowLeft, Download, Filter, Loader2 } from 'lucide-react';
import DoctorSidebar from '@/components/DoctorSidebar';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/store';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AnalyticsData {
  statistics: {
    total_tests: number;
    active_patients: number;
    improvement_rate: number;
    tests_this_month: number;
  };
  test_distribution: Array<{ test: string; count: number }>;
  trend_data: {
    anxiety: Array<{ month: string; score: number }>;
    depression: Array<{ month: string; score: number }>;
  };
  patient_count: number;
}

interface Patient {
  id: number;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  birth_date: string | null;
  age: number | null;
  gender: string;
  contact_info: string | null;
  progress_notes: string | null;
  patient_image: string | null;
  recent_results: any[];
  last_visit: string | null;
}

const DoctorAnalysis = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);
  const [selectedPatient, setSelectedPatient] = useState('all');

  // Real data states
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Refs for PDF capture
  const anxietyChartRef = useRef<HTMLDivElement>(null);
  const depressionChartRef = useRef<HTMLDivElement>(null);
  const distributionChartRef = useRef<HTMLDivElement>(null);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = auth.token;
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await axios.get('http://127.0.0.1:8000/api/doctor-analytics/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      setAnalyticsData(response.data);
    } catch (err: any) {
      console.error('Error fetching analytics data:', err);
      const errorMessage = err.response?.data?.error || 'Failed to load analytics data';
      setError(errorMessage);
    }
  };

  const fetchPatients = async () => {
    try {
      const token = auth.token;
      if (!token) return;

      const response = await axios.get('http://127.0.0.1:8000/api/doctor-patients/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      // Add "All Patients" option
      const patientsData = [
        {
          id: 0,
          user: { id: 0, username: 'all', first_name: '', last_name: '', email: '' },
          birth_date: null,
          age: null,
          gender: '',
          contact_info: null,
          progress_notes: null,
          patient_image: null,
          recent_results: [],
          last_visit: null
        },
        ...response.data.patients
      ];

      setPatients(patientsData);
    } catch (err: any) {
      console.error('Error fetching patients:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchAnalyticsData(), fetchPatients()]);
      setLoading(false);
    };

    loadData();
  }, [auth.token]);

  const captureChartAsImage = async (chartRef: React.RefObject<HTMLDivElement>): Promise<string | null> => {
    if (!chartRef.current) return null;

    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff'
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error capturing chart:', error);
      return null;
    }
  };

  const handleExport = async () => {
    if (!analyticsData) return;

    setIsExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let currentY = 20;

      // Header
      pdf.setFontSize(20);
      pdf.setTextColor(51, 51, 51);
      const doctorName = (auth.user as any)?.first_name || 'Doctor';
      pdf.text(t('تقرير التحليلات النفسية', 'Psychological Analytics Report'), pageWidth / 2, currentY, { align: 'center' });
      currentY += 10;

      pdf.setFontSize(12);
      pdf.text(`${t('الطبيب:', 'Doctor:')} ${doctorName}`, 20, currentY);
      pdf.text(`${t('تاريخ التقرير:', 'Report Date:')} ${new Date().toLocaleDateString()}`, pageWidth - 20, currentY, { align: 'right' });
      currentY += 20;

      // Statistics Section
      pdf.setFontSize(16);
      pdf.setTextColor(33, 150, 243);
      pdf.text(t('الإحصائيات الأساسية', 'Key Statistics'), 20, currentY);
      currentY += 15;

      pdf.setFontSize(12);
      pdf.setTextColor(51, 51, 51);

      const stats = analyticsData.statistics;
      const statData = [
        [t('إجمالي الاختبارات:', 'Total Tests:'), stats.total_tests.toString()],
        [t('المرضى النشطين:', 'Active Patients:'), stats.active_patients.toString()],
        [t('معدل التحسن:', 'Improvement Rate:'), `${stats.improvement_rate}%`],
        [t('الاختبارات هذا الشهر:', 'Tests This Month:'), stats.tests_this_month.toString()]
      ];

      statData.forEach(([label, value]) => {
        pdf.text(`${label} ${value}`, 30, currentY);
        currentY += 8;
      });

      currentY += 10;

      // Charts Section
      pdf.setFontSize(16);
      pdf.setTextColor(33, 150, 243);
      pdf.text(t('التحليلات البصرية', 'Visual Analytics'), 20, currentY);
      currentY += 15;

      // Capture and add anxiety chart
      if (anxietyChartRef.current) {
        const anxietyImage = await captureChartAsImage(anxietyChartRef);
        if (anxietyImage && currentY + 60 <= pageHeight) {
          pdf.setFontSize(14);
          pdf.setTextColor(51, 51, 51);
          pdf.text(t('اتجاه القلق (GAD-7)', 'Anxiety Trend (GAD-7)'), 20, currentY);
          currentY += 10;

          const imgWidth = 170;
          const imgHeight = 60;
          pdf.addImage(anxietyImage, 'PNG', 20, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 10;
        }
      }

      // Check if we need a new page
      if (currentY + 60 > pageHeight) {
        pdf.addPage();
        currentY = 20;
      }

      // Capture and add depression chart
      if (depressionChartRef.current) {
        const depressionImage = await captureChartAsImage(depressionChartRef);
        if (depressionImage) {
          pdf.setFontSize(14);
          pdf.setTextColor(51, 51, 51);
          pdf.text(t('اتجاه الاكتئاب (PHQ-9)', 'Depression Trend (PHQ-9)'), 20, currentY);
          currentY += 10;

          const imgWidth = 170;
          const imgHeight = 60;
          pdf.addImage(depressionImage, 'PNG', 20, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 10;
        }
      }

      // Check if we need a new page
      if (currentY + 60 > pageHeight) {
        pdf.addPage();
        currentY = 20;
      }

      // Capture and add distribution chart
      if (distributionChartRef.current) {
        const distributionImage = await captureChartAsImage(distributionChartRef);
        if (distributionImage) {
          pdf.setFontSize(14);
          pdf.setTextColor(51, 51, 51);
          pdf.text(t('توزيع الاختبارات', 'Test Distribution'), 20, currentY);
          currentY += 10;

          const imgWidth = 170;
          const imgHeight = 60;
          pdf.addImage(distributionImage, 'PNG', 20, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 15;
        }
      }

      // Insights Section
      if (currentY + 40 > pageHeight) {
        pdf.addPage();
        currentY = 20;
      }

      pdf.setFontSize(16);
      pdf.setTextColor(33, 150, 243);
      pdf.text(t('الرؤى الرئيسية', 'Key Insights'), 20, currentY);
      currentY += 15;

      pdf.setFontSize(12);
      pdf.setTextColor(51, 51, 51);

      const insights = [
        t('• يظهر معدل التحسن الإيجابي في علاج المرضى', '• Shows positive improvement rate in patient treatment'),
        t(`${analyticsData.test_distribution.length > 0 ? '• ' + analyticsData.test_distribution[0].test : ''} هو الاختبار الأكثر شيوعاً`, `• ${analyticsData.test_distribution.length > 0 ? analyticsData.test_distribution[0].test : 'N/A'} is the most common test`),
        t('• يُنصح بمتابعة المرضى ذوي المعدلات المنخفضة للتحسن', '• Patients with low improvement rates should be monitored closely'),
        t('• التركيز على الاختبارات النفسية المبكرة يحسن النتائج', '• Early psychological testing improves outcomes')
      ];

      insights.forEach(insight => {
        if (currentY + 10 > pageHeight) {
          pdf.addPage();
          currentY = 20;
        }
        pdf.text(insight, 30, currentY);
        currentY += 8;
      });

      // Footer
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(t('تم إنشاء هذا التقرير بواسطة نظام الصحة النفسية', 'Generated by Mental Health System'), pageWidth / 2, pageHeight - 20, { align: 'center' });
      pdf.text(`© ${new Date().getFullYear()} ${t('جميع الحقوق محفوظة', 'All Rights Reserved')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Save the PDF
      const fileName = `${t('تقرير_التحليلات', 'Analytics_Report')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      // You could add a toast notification here
    } finally {
      setIsExporting(false);
    }
  };

  // Prepare data for charts
  const anxietyData = analyticsData?.trend_data?.anxiety || [];
  const depressionData = analyticsData?.trend_data?.depression || [];
  const testDistribution = analyticsData?.test_distribution || [];

  // Prepare patient options for filter
  const patientOptions = patients.map(patient => ({
    value: patient.id.toString(),
    labelAr: patient.id === 0 ? 'جميع المرضى' : `${patient.user.first_name} ${patient.user.last_name}`,
    labelEn: patient.id === 0 ? 'All Patients' : `${patient.user.first_name} ${patient.user.last_name}`
  }));

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-primary/10 via-secondary/40 via-accent/8 to-background">
      <DoctorSidebar />

      <main className="flex-1 p-8">
        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">
                {t("جاري تحميل بيانات التحليلات...", "Loading analytics data...")}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => { fetchAnalyticsData(); fetchPatients(); }}>
              {t("إعادة المحاولة", "Try Again")}
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8 fade-in">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/doctor-dashboard')}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-4xl font-bold flex items-center gap-3">
                    <BarChart3 className="h-10 w-10 text-primary" />
                    {t('التحليلات والإحصائيات', 'Analysis & Statistics')}
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    {t('تحليل شامل لنتائج الاختبارات النفسية', 'Comprehensive analysis of psychological test results')}
                  </p>
                </div>
              </div>
              <Button onClick={handleExport} disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? t('جاري التصدير...', 'Exporting...') : t('تصدير التقرير', 'Export Report')}
              </Button>
            </div>

            {/* Filters */}
            <Card className="mb-6 fade-in">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Filter className="h-5 w-5 text-muted-foreground" />
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {patientOptions.map((patient) => (
                        <SelectItem key={patient.value} value={patient.value}>
                          {t(patient.labelAr, patient.labelEn)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-6 fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl font-bold">{analyticsData?.statistics?.total_tests || 0}</CardTitle>
                  <CardDescription>{t('إجمالي الاختبارات', 'Total Tests')}</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-primary">{analyticsData?.statistics?.active_patients || 0}</CardTitle>
                  <CardDescription>{t('مرضى نشطين', 'Active Patients')}</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-secondary">{analyticsData?.statistics?.improvement_rate || 0}%</CardTitle>
                  <CardDescription>{t('معدل التحسن', 'Improvement Rate')}</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-accent-foreground">{analyticsData?.statistics?.tests_this_month || 0}</CardTitle>
                  <CardDescription>{t('هذا الشهر', 'This Month')}</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Anxiety Trend */}
              <Card className="fade-in">
                <CardHeader>
                  <CardTitle>{t('اتجاه القلق (GAD-7)', 'Anxiety Trend (GAD-7)')}</CardTitle>
                  <CardDescription>
                    {t('متوسط درجات القلق خلال الأشهر الستة الماضية', 'Average anxiety scores over the past 6 months')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div ref={anxietyChartRef}>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={anxietyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        name={t('درجة القلق', 'Anxiety Score')}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Depression Trend */}
              <Card className="fade-in">
                <CardHeader>
                  <CardTitle>{t('اتجاه الاكتئاب (PHQ-9)', 'Depression Trend (PHQ-9)')}</CardTitle>
                  <CardDescription>
                    {t('متوسط درجات الاكتئاب خلال الأشهر الستة الماضية', 'Average depression scores over the past 6 months')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div ref={depressionChartRef}>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={depressionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(var(--secondary))"
                        strokeWidth={3}
                        name={t('درجة الاكتئاب', 'Depression Score')}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Test Distribution */}
            <Card className="fade-in">
              <CardHeader>
                <CardTitle>{t('توزيع الاختبارات', 'Test Distribution')}</CardTitle>
                <CardDescription>
                  {t('عدد الاختبارات المكتملة لكل نوع', 'Number of completed tests by type')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div ref={distributionChartRef}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={testDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="test" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="hsl(var(--primary))" name={t('عدد الاختبارات', 'Test Count')} />
                  </BarChart>
                </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default DoctorAnalysis;
