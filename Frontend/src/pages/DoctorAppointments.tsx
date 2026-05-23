import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowLeft, Check, X, Clock, Loader2 } from 'lucide-react';
import DoctorSidebar from '@/components/DoctorSidebar';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

interface AppointmentData {
  id: number;
  patient: {
    id: number;
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    };
    patient_image: string | null;
  };
  date: string;
  time: string;
  datetime: string;
  status: string;
  notes: string;
  type: string;
}

interface AppointmentsResponse {
  appointments: AppointmentData[];
  total_count: number;
}

const DoctorAppointments = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = useSelector((state: RootState) => state.auth);

  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<{ id: number; action: string } | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = auth.token;
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await axios.get<AppointmentsResponse>('http://127.0.0.1:8000/api/doctor-appointments/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
    },
      });

      setAppointments(response.data.appointments);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      const errorMessage = err.response?.data?.error || 'Failed to load appointments data';
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
    fetchAppointments();
  }, []);


  const handleAction = (id: number, action: string) => {
    setSelectedAction({ id, action });
  };

  const confirmAction = async () => {
    if (!selectedAction) return;

    const { id, action } = selectedAction;

    try {
      const token = auth.token;
      if (!token) {
        toast({
          variant: 'destructive',
          title: t('خطأ', 'Error'),
          description: 'No authentication token found',
        });
        return;
      }

      await axios.patch(`http://127.0.0.1:8000/api/update-appointment-status/${id}/`, {
        action: action,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Update local state
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === id) {
            if (action === 'accept') return { ...apt, status: 'confirmed' };
            if (action === 'reject') return { ...apt, status: 'cancelled' };
            if (action === 'complete') return { ...apt, status: 'completed' };
        }
        return apt;
      })
    );

    toast({
      title: t('تم التحديث', 'Updated'),
      description:
        action === 'accept'
          ? t('تم قبول الموعد', 'Appointment accepted')
          : action === 'reject'
          ? t('تم رفض الموعد', 'Appointment rejected')
          : t('تم إكمال الموعد', 'Appointment completed'),
    });

    setSelectedAction(null);
    } catch (err: any) {
      console.error('Error updating appointment status:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update appointment status';
      toast({
        variant: 'destructive',
        title: t('خطأ', 'Error'),
        description: errorMessage,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'outline', textAr: 'قيد الانتظار', textEn: 'Pending' },
      confirmed: { variant: 'default', textAr: 'مؤكد', textEn: 'Confirmed' },
      completed: { variant: 'secondary', textAr: 'مكتمل', textEn: 'Completed' },
      cancelled: { variant: 'destructive', textAr: 'ملغي', textEn: 'Cancelled' },
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant as any}>
        {t(config.textAr, config.textEn)}
      </Badge>
    );
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((apt) => apt.date === today);
  const upcomingAppointments = appointments.filter((apt) => apt.date > today);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-primary/10 via-secondary/40 via-accent/8 to-background">
      <DoctorSidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 fade-in">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/doctor-dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Calendar className="h-10 w-10 text-primary" />
                {t('إدارة المواعيد', 'Appointments Management')}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t('جدول مواعيدك مع المرضى', 'Your schedule with patients')}
              </p>
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <Card className="mb-6 fade-in">
          <CardHeader>
            <CardTitle>{t('مواعيد اليوم', "Today's Appointments")}</CardTitle>
            <CardDescription>
              {loading ? t('جاري التحميل...', 'Loading...') : t(`لديك ${todayAppointments.length} موعد اليوم`, `You have ${todayAppointments.length} appointments today`)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>{t('جاري تحميل المواعيد...', 'Loading appointments...')}</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                <p>{error}</p>
                <Button onClick={fetchAppointments} className="mt-4">
                  {t('إعادة المحاولة', 'Try Again')}
                </Button>
              </div>
            ) : todayAppointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t('لا توجد مواعيد لليوم', 'No appointments today')}
              </p>
            ) : (
              todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{`${apt.patient.user.first_name} ${apt.patient.user.last_name}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {apt.time} - {t('استشارة', 'Consultation')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(apt.status)}
                    {apt.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="default" onClick={() => handleAction(apt.id, 'accept')}>
                          <Check className="h-4 w-4 mr-1" />
                          {t('قبول', 'Accept')}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleAction(apt.id, 'reject')}>
                          <X className="h-4 w-4 mr-1" />
                          {t('رفض', 'Reject')}
                        </Button>
                      </div>
                    )}
                    {apt.status === 'confirmed' && (
                      <Button size="sm" variant="outline" onClick={() => handleAction(apt.id, 'complete')}>
                        {t('إكمال', 'Complete')}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="fade-in">
          <CardHeader>
            <CardTitle>{t('المواعيد القادمة', 'Upcoming Appointments')}</CardTitle>
            <CardDescription>
              {loading ? t('جاري التحميل...', 'Loading...') : t(`${upcomingAppointments.length} موعد قادم`, `${upcomingAppointments.length} upcoming appointments`)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>{t('جاري تحميل المواعيد...', 'Loading appointments...')}</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                <p>{error}</p>
                <Button onClick={fetchAppointments} className="mt-4">
                  {t('إعادة المحاولة', 'Try Again')}
                </Button>
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t('لا توجد مواعيد قادمة', 'No upcoming appointments')}
              </p>
            ) : (
              upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{`${apt.patient.user.first_name} ${apt.patient.user.last_name}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {apt.date} - {apt.time} - {t('استشارة', 'Consultation')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(apt.status)}
                    {apt.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="default" onClick={() => handleAction(apt.id, 'accept')}>
                          <Check className="h-4 w-4 mr-1" />
                          {t('قبول', 'Accept')}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleAction(apt.id, 'reject')}>
                          <X className="h-4 w-4 mr-1" />
                          {t('رفض', 'Reject')}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <AlertDialog open={!!selectedAction} onOpenChange={() => setSelectedAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {selectedAction?.action === 'accept' && t('قبول الموعد', 'Accept Appointment')}
                {selectedAction?.action === 'reject' && t('رفض الموعد', 'Reject Appointment')}
                {selectedAction?.action === 'complete' && t('إكمال الموعد', 'Complete Appointment')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedAction?.action === 'accept' &&
                  t('هل أنت متأكد من قبول هذا الموعد؟', 'Are you sure you want to accept this appointment?')}
                {selectedAction?.action === 'reject' &&
                  t('هل أنت متأكد من رفض هذا الموعد؟', 'Are you sure you want to reject this appointment?')}
                {selectedAction?.action === 'complete' &&
                  t('هل تم إكمال هذا الموعد؟', 'Has this appointment been completed?')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('إلغاء', 'Cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmAction}>{t('تأكيد', 'Confirm')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default DoctorAppointments;
