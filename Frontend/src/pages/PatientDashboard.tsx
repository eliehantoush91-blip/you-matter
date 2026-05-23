import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import PatientSidebar from '@/components/PatientSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, MessageSquare, Activity, Loader2, Trash2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/store';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Appointment {
  id: number;
  date: string;
  status: string;
  doctor: {
    user: {
      first_name: string;
      email: string;
    };
  };
}

interface TestResult {
  id: number;
  test: {
    name: string;
    translations?: {
      en: {
        name: string;
      };
      ar: {
        name: string;
      };
    };
  };
  total_score: number;
  created_at: string;
}

interface DashboardData {
  patient_name: string;
  upcoming_appointments: Appointment[];
  recent_test_results: TestResult[];
  recent_messages: any[];
}

const PatientDashboard = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = useSelector((state: RootState) => state.auth);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [patientSummary, setPatientSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteAppointment, setDeleteAppointment] = useState<Appointment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = auth.token;
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await axios.get('http://127.0.0.1:8000/api/patient-dashboard/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log(response.data);
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

  const fetchPatientSummary = async () => {
    try {
      const token = auth.token;
      if (!token) return;
      const resp = await axios.get('http://127.0.0.1:8000/api/patient-summary/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatientSummary(resp.data);
    } catch (err) {
      console.error('Error fetching patient summary', err);
    }
  };

  const deleteAppointmentApi = async (appointmentId: number) => {
    try {
      setDeleting(true);

      const token = auth.token;
      if (!token) {
        toast({
          variant: 'destructive',
          title: t('خطأ', 'Error'),
          description: 'No authentication token found',
        });
        return;
      }

      await axios.delete(`http://127.0.0.1:8000/api/delete-appointment/${appointmentId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Remove the appointment from local state
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          upcoming_appointments: dashboardData.upcoming_appointments.filter(
            apt => apt.id !== appointmentId
          )
        });
      }

      toast({
        title: t('تم الحذف بنجاح', 'Deleted Successfully'),
        description: t('تم حذف الموعد', 'Appointment has been deleted'),
      });

      setDeleteAppointment(null);
    } catch (err: any) {
      console.error('Error deleting appointment:', err);
      const errorMessage = err.response?.data?.error || 'Failed to delete appointment';
      toast({
        variant: 'destructive',
        title: t('خطأ', 'Error'),
        description: errorMessage,
      });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchPatientSummary();
  }, []);

  const handleLogout = () => {
    navigate('/login');
  };

  const quickActions = [
    {
      icon: Calendar,
      titleAr: 'حجز موعد',
      titleEn: 'Book Appointment',
      descriptionAr: 'احجز موعدك مع طبيبك',
      descriptionEn: 'Schedule a session with your doctor',
      link: '/book-appointment',
    },
    {
      icon: FileText,
      titleAr: 'الاختبارات النفسية',
      titleEn: 'Take Tests',
      descriptionAr: 'أجرِ اختبارات تقييمية',
      descriptionEn: 'Complete psychological assessments',
      link: '/tests',
    },
    {
      icon: MessageSquare,
      titleAr: 'راسل طبيبك',
      titleEn: 'Message Doctor',
      descriptionAr: 'تواصل مع طبيبك الخاص',
      descriptionEn: 'Communicate with your doctor',
      link: '/message-doctor',
    },
    {
      icon: Activity,
      titleAr: 'تتبع التقدم',
      titleEn: 'Track Progress',
      descriptionAr: 'راجع تطور حالتك',
      descriptionEn: 'Review your progress',
      link: '/track-progress',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/40 via-accent/8 to-background">
      <Header />
      <div className="flex">
        <PatientSidebar />
        
        <main className="flex-1 p-8">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">{t('جارٍ تحميل البيانات...', 'Loading data...')}</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={fetchDashboardData} variant="outline">
                  {t('إعادة المحاولة', 'Try Again')}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8 fade-in">
                <h1 className="text-4xl font-bold mb-2">
                  {t('مرحباً', 'Welcome')}, {dashboardData?.patient_name || t('المستخدم', 'User')}
                </h1>
                <p className="text-muted-foreground">
                  {t('نتمنى لك يوماً سعيداً', 'Have a wonderful day')}
                </p>
              </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link}>
              <Card className="fade-in cursor-pointer hover:shadow-elegant transition-smooth h-full" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <action.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{t(action.titleAr, action.titleEn)}</CardTitle>
                  <CardDescription>
                    {t(action.descriptionAr, action.descriptionEn)}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="fade-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle>{t('المواعيد القادمة', 'Upcoming Appointments')}</CardTitle>
              <CardDescription>
                {t('جلساتك المجدولة مع الأطباء', 'Your scheduled sessions with doctors')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData?.upcoming_appointments?.length ? (
                dashboardData.upcoming_appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <p className="font-semibold">
                        {t('د.', 'Dr.')} {appointment.doctor.user.first_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(appointment.date).toLocaleDateString('ar-SA', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          appointment.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : appointment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : appointment.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : appointment.status === 'cancelled'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status === 'confirmed'
                            ? t('مؤكد', 'Confirmed')
                            : appointment.status === 'pending'
                            ? t('في الانتظار', 'Pending')
                            : appointment.status === 'rejected'
                            ? t('مرفوض', 'Rejected')
                            : appointment.status === 'cancelled'
                            ? t('ملغي', 'Cancelled')
                            : t('مكتمل', 'Completed')
                          }
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteAppointment(appointment)}
                      disabled={deleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t('لا توجد مواعيد قادمة', 'No upcoming appointments')}</p>
                </div>
              )}
              <Button variant="default" className="w-full" asChild>
                <Link to="/book-appointment">
                  {t('احجز موعداً جديداً', 'Book New Appointment')}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="fade-in" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <CardTitle>{t('نتائج الاختبارات', 'Your Test Results')}</CardTitle>
              <CardDescription>
                {t('نتائج الاختبارات النفسية الأخيرة', 'Your recent psychological test results')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData?.recent_test_results?.length ? (
                dashboardData.recent_test_results.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-semibold">
                        {language === 'ar'
                          ? (result.test?.translations?.ar?.name || result.test?.translations?.en?.name || t('اختبار غير محدد', 'Unknown Test'))
                          : (result.test?.translations?.en?.name || result.test?.translations?.ar?.name || t('اختبار غير محدد', 'Unknown Test'))
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('الدرجة', 'Score')}: {result.total_score} - {new Date(result.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/test-results">{t('عرض', 'View')}</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t('لا توجد نتائج اختبارات حديثة', 'No recent test results')}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/test-results">
                    {t('عرض الكل', 'View All')}
                  </Link>
                </Button>
                <Button variant="default" className="w-full" asChild>
                  <Link to="/psychological-tests">
                    {t('اختبار جديد', 'New Test')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {patientSummary && (
          <Card className="fade-in mt-6" style={{ animationDelay: '0.7s' }}>
            <CardHeader>
              <CardTitle>{t('ملخص الملف الشخصي', 'Profile Summary')}</CardTitle>
              <CardDescription>{t('موجز للنتائج المجمعة والتنبيهات', 'Aggregated results and alerts')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(patientSummary.domains || {}).map(([domain, info]: any) => (
                  <div key={domain} className="p-4 rounded-lg bg-muted/20">
                    <h3 className="font-semibold capitalize">{domain}</h3>
                    <p className="text-sm text-muted-foreground">{t('المتوسط', 'Average')}: {info.avg_score ?? '-'}%</p>
                    <p className="text-sm text-muted-foreground">{t('عدد القياسات', 'Count')}: {info.count}</p>
                    <p className="text-sm text-muted-foreground">{t('الاتجاه', 'Trend')}: {info.trend}</p>
                  </div>
                ))}
              </div>
              {patientSummary.alerts && patientSummary.alerts.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold">{t('تنبيهات', 'Alerts')}</h4>
                  <ul className="list-disc list-inside mt-2">
                    {patientSummary.alerts.map((a: any, i: number) => (
                      <li key={i} className="text-destructive">{a.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="fade-in" style={{ animationDelay: '0.6s' }}>
          <CardHeader>
            <CardTitle>{t('الرسائل والاستشارات', 'Messages & Consultations')}</CardTitle>
            <CardDescription>
              {t('آخر المحادثات مع أطبائك', 'Recent conversations with your doctors')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData?.recent_messages?.length ? (
              dashboardData.recent_messages.map((message, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{message.doctor_name || t('د. غير محدد', 'Dr. Unknown')}</p>
                    <p className="text-sm text-muted-foreground">{message.content || t('محتوى الرسالة', 'Message content')}</p>
                    <p className="text-xs text-muted-foreground mt-1">{message.time || t('منذ وقت', 'Some time ago')}</p>
                  </div>
                  <Button size="sm" variant="ghost">{t('رد', 'Reply')}</Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t('لا توجد رسائل حديثة', 'No recent messages')}</p>
              </div>
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link to="/message-doctor">
                {t('عرض جميع الرسائل', 'View All Messages')}
              </Link>
            </Button>
          </CardContent>
        </Card>
            </>
          )}

          {/* Delete Appointment Confirmation Dialog */}
          <AlertDialog open={!!deleteAppointment} onOpenChange={() => setDeleteAppointment(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t('تأكيد حذف الموعد', 'Confirm Appointment Deletion')}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {deleteAppointment && (
                    <>
                      {t('هل أنت متأكد من حذف موعدك مع', 'Are you sure you want to delete your appointment with')}{' '}
                      {t('د.', 'Dr.')} {deleteAppointment.doctor.user.first_name}{' '}
                      {t('في', 'on')} {new Date(deleteAppointment.date).toLocaleDateString('ar-SA')}؟
                      <br />
                      <span className="text-destructive font-medium">
                        {t('هذا الإجراء لا يمكن التراجع عنه.', 'This action cannot be undone.')}
                      </span>
                    </>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>
                  {t('إلغاء', 'Cancel')}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteAppointment && deleteAppointmentApi(deleteAppointment.id)}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('جاري الحذف...', 'Deleting...')}
                    </>
                  ) : (
                    t('حذف', 'Delete')
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;
