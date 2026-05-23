import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, FileText, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DoctorSidebar from '@/components/DoctorSidebar';
import Header from '@/components/Header';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/store';
import { useToast } from '@/hooks/use-toast';

interface Patient {
  id: number;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  birth_date?: string;
  gender?: string;
}

interface Appointment {
  id: number;
  patient: Patient;
  doctor: any;
  date: string;
  status: string;
  notes?: string;
}

interface TestResult {
  id: number;
  patient: Patient;
  test: {
    name: string;
  };
  total_score: number;
  created_at: string;
}

interface DashboardStats {
  active_patients: number;
  todays_appointments: number;
  messages: number;
  pending_reports: number;
}

interface StatItem {
  icon: any;
  titleAr: string;
  titleEn: string;
  value: string;
  descriptionAr: string;
  descriptionEn: string;
}

interface DashboardData {
  doctor_name: string;
  stats: DashboardStats;
  todays_appointments: Appointment[];
  recent_patients: Patient[];
  recent_results: TestResult[];
  recent_messages: any[];
}

const DoctorDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = useSelector((state: RootState) => state.auth);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = auth.token;
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await axios.get('http://127.0.0.1:8000/api/doctor-dashboard/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
    },
      });

      setDashboardData(response.data);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      const errorMessage = err.response?.data?.error || 'Failed to load dashboard data';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: t('خطأ', 'Error'),
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats: StatItem[] = dashboardData ? [
    {
      icon: Users,
      titleAr: 'المرضى',
      titleEn: 'Patients',
      value: dashboardData.stats.active_patients.toString(),
      descriptionAr: 'مريض نشط',
      descriptionEn: 'Active patients',
    },
    {
      icon: Calendar,
      titleAr: 'المواعيد',
      titleEn: 'Appointments',
      value: dashboardData.stats.todays_appointments.toString(),
      descriptionAr: 'موعد اليوم',
      descriptionEn: "Today's appointments",
    },
    {
      icon: FileText,
      titleAr: 'التقارير',
      titleEn: 'Reports',
      value: dashboardData.stats.pending_reports.toString(),
      descriptionAr: 'بانتظار المراجعة',
      descriptionEn: 'Pending review',
    },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/40 via-accent/8 to-background">
      <Header />
      <div className="flex">
        <DoctorSidebar />
        
        <main className="flex-1 p-8">
        {/* Header with Notifications */}
        <div className="flex justify-between items-center mb-8 fade-in">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {dashboardData ? t(`د. ${dashboardData.doctor_name.split(' ')[0]}، أهلاً بك`, `Dr. ${dashboardData.doctor_name.split(' ')[0]}, welcome`) : t('د. أحمد، أهلاً بك', 'Dr. Ahmed, welcome')}
            </h1>
            <p className="text-muted-foreground">
              {dashboardData ? t(`لديك ${dashboardData.stats.todays_appointments} مواعيد اليوم`, `You have ${dashboardData.stats.todays_appointments} appointments today`) : t('لديك 8 مواعيد اليوم', 'You have 8 appointments today')}
            </p>
          </div>
          </div>
          
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  </div>
                  <CardTitle className="text-3xl font-bold">--</CardTitle>
                  <CardDescription>
                    {t('جاري التحميل...', 'Loading...')}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            <p>{error}</p>
            <Button onClick={fetchDashboardData} className="mt-4">
              {t('إعادة المحاولة', 'Try Again')}
                </Button>
              </div>
        ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold">{stat.value}</CardTitle>
                <CardDescription>
                  {t(stat.titleAr, stat.titleEn)}
                  <br />
                  <span className="text-xs">{t(stat.descriptionAr, stat.descriptionEn)}</span>
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="fade-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle>{t('مواعيد اليوم', "Today's Appointments")}</CardTitle>
              <CardDescription>
                {t('جلسات اليوم مع المرضى', "Today's sessions with patients")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">{t('جاري التحميل...', 'Loading...')}</span>
                </div>
              ) : dashboardData?.todays_appointments && dashboardData.todays_appointments.length > 0 ? (
                <>
                  {dashboardData.todays_appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                        <p className="font-semibold">
                          {appointment.patient.user.first_name} {appointment.patient.user.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })} - {appointment.notes || t('جلسة', 'Session')}
                        </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/doctor-dashboard/patients')}>
                  {t('الملف', 'View File')}
                </Button>
              </div>
                  ))}
              <Button variant="default" className="w-full" onClick={() => navigate('/doctor-dashboard/appointments')}>
                {t('عرض التقويم الكامل', 'View Full Calendar')}
              </Button>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t('لا توجد مواعيد اليوم', 'No appointments today')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="fade-in" style={{ animationDelay: '0.6s' }}>
          <CardHeader>
            <CardTitle>{t('إدارة المرضى', 'Patient Management')}</CardTitle>
            <CardDescription>
              {t('قائمة المرضى المسجلين لديك', 'List of your registered patients')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">{t('جاري التحميل...', 'Loading...')}</span>
                </div>
              ) : dashboardData?.recent_patients && dashboardData.recent_patients.length > 0 ? (
                <>
                  {dashboardData.recent_patients.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                          <p className="font-semibold">
                            {patient.user.first_name} {patient.user.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {patient.birth_date ? t('مريض مسجل', 'Registered patient') : t('مريض جديد', 'New patient')}
                          </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate('/doctor-dashboard/patients')}>
                    {t('الملف', 'File')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('/doctor-dashboard/analysis')}>
                    {t('النتائج', 'Results')}
                  </Button>
                </div>
              </div>
                  ))}
                  <Button variant="outline" className="w-full">{t('عرض جميع المرضى', 'View All Patients')}</Button>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t('لا يوجد مرضى مسجلين', 'No registered patients')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
