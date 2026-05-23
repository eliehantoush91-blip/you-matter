import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Search, ArrowLeft, FileText, Calendar, Mail, Phone, Loader2 } from 'lucide-react';
import DoctorSidebar from '@/components/DoctorSidebar';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/store';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';


interface PatientResult {
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

interface PatientData {
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
  gender: string | null;
  contact_info: string | null;
  progress_notes: string | null;
  patient_image: string | null;
  recent_results: PatientResult[];
  last_visit: string | null;
}

interface PatientsResponse {
  patients: PatientData[];
  total_count: number;
}

const DoctorPatients = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = useSelector((state: RootState) => state.auth);

  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = auth.token;
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await axios.get<PatientsResponse>('http://127.0.0.1:8000/api/doctor-patients/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setPatients(response.data.patients);
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      const errorMessage = err.response?.data?.error || 'Failed to load patients data';
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
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((patient) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${patient.user.first_name} ${patient.user.last_name}`.toLowerCase();
    const email = patient.user.email.toLowerCase();
    return (
      fullName.includes(query) ||
      email.includes(query) ||
      patient.user.username.toLowerCase().includes(query)
    );
  });

  const handleViewProfile = (patient: PatientData) => {
    setSelectedPatient(patient);
    setDoctorNotes(patient.progress_notes || '');
  };

  const handleSaveNotes = async () => {
    if (!selectedPatient) return;

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

      await axios.patch(`http://127.0.0.1:8000/api/update-patient-notes/${selectedPatient.id}/`, {
        progress_notes: doctorNotes,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Update the patient in the local state
      setPatients(patients.map(patient =>
        patient.id === selectedPatient.id
          ? { ...patient, progress_notes: doctorNotes }
          : patient
      ));

      toast({
        title: t('تم الحفظ بنجاح', 'Saved Successfully'),
        description: t('تم حفظ ملاحظات المريض', 'Patient notes saved successfully'),
      });

      setSelectedPatient(null);
    } catch (err: any) {
      console.error('Error saving patient notes:', err);
      const errorMessage = err.response?.data?.error || 'Failed to save patient notes';
      toast({
        variant: 'destructive',
        title: t('خطأ', 'Error'),
        description: errorMessage,
      });
    }
  };

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
                <Users className="h-10 w-10 text-primary" />
                {t('إدارة المرضى', 'Patient Management')}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t('قائمة المرضى المسجلين لديك', 'List of your registered patients')}
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 fade-in">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('ابحث عن مريض...', 'Search for a patient...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card className="fade-in">
          <CardHeader>
            <CardTitle>{t('قائمة المرضى', 'Patients List')}</CardTitle>
            <CardDescription>
              {loading ? t('جاري التحميل...', 'Loading...') : t(`إجمالي ${filteredPatients.length} مريض`, `Total ${filteredPatients.length} patients`)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('المريض', 'Patient')}</TableHead>
                  <TableHead>{t('العمر', 'Age')}</TableHead>
                  <TableHead>{t('التشخيص', 'Diagnosis')}</TableHead>
                  <TableHead>{t('آخر زيارة', 'Last Visit')}</TableHead>
                  <TableHead>{t('الإجراءات', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>{t('جاري تحميل بيانات المرضى...', 'Loading patients data...')}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-destructive">
                      <p>{error}</p>
                      <Button onClick={fetchPatients} className="mt-4">
                        {t('إعادة المحاولة', 'Try Again')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? t('لا توجد مرضى يطابقون البحث', 'No patients match your search') : t('لا توجد مرضى مسجلين', 'No patients registered')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={patient.patient_image ? `http://127.0.0.1:8000${patient.patient_image}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.user.username}`} />
                            <AvatarFallback>{patient.user.first_name.charAt(0)}{patient.user.last_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-semibold">{`${patient.user.first_name} ${patient.user.last_name}`}</span>
                        </div>
                      </TableCell>
                      <TableCell>{patient.age || t('غير محدد', 'Not specified')}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {patient.recent_results.length > 0 ? t('لديه نتائج اختبارات', 'Has test results') : t('بدون نتائج', 'No results')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {patient.last_visit ? new Date(patient.last_visit).toLocaleDateString() : t('لا توجد زيارة', 'No visit')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewProfile(patient)}>
                            {t('الملف', 'View Profile')}
                          </Button>
                          <Button size="sm" onClick={() => {
                            // open chat for this patient
                            localStorage.setItem('chatPatientId', String(patient.user.id));
                            navigate(`/chat/${patient.user.id}`);
                          }}>
                            {t('راسل', 'Message')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Patient Profile Dialog */}
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedPatient?.patient_image ? `http://127.0.0.1:8000${selectedPatient.patient_image}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPatient?.user.username}`} />
                  <AvatarFallback>{selectedPatient?.user.first_name.charAt(0)}{selectedPatient?.user.last_name.charAt(0)}</AvatarFallback>
                </Avatar>
                {`${selectedPatient?.user.first_name} ${selectedPatient?.user.last_name}`}
              </DialogTitle>
              <DialogDescription>
                {t('الملف الشخصي الكامل للمريض', 'Complete patient profile')}
              </DialogDescription>
            </DialogHeader>

            {selectedPatient && (
              <div className="space-y-6">
                {/* Personal Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedPatient.user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedPatient.contact_info || t('غير محدد', 'Not specified')}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('العمر', 'Age')}</p>
                    <p className="font-semibold">{selectedPatient.age || t('غير محدد', 'Not specified')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('آخر زيارة', 'Last Visit')}</p>
                    <p className="font-semibold">
                      {selectedPatient.last_visit ? new Date(selectedPatient.last_visit).toLocaleDateString() : t('لا توجد زيارة', 'No visit')}
                    </p>
                  </div>
                </div>

                {/* Tests */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {t('الاختبارات المكتملة', 'Completed Tests')}
                  </h3>
                  <div className="space-y-2">
                    {selectedPatient.recent_results.length > 0 ? (
                      selectedPatient.recent_results.map((result: PatientResult, idx: number) => (
                        <div key={idx} className="flex justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-semibold">
                              {language === 'ar'
                                ? (result.test?.translations?.ar?.name || result.test?.translations?.en?.name || t('اختبار غير محدد', 'Unknown Test'))
                                : (result.test?.translations?.en?.name || result.test?.translations?.ar?.name || t('اختبار غير محدد', 'Unknown Test'))
                              }
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(result.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge>{t(`النتيجة: ${result.total_score}`, `Score: ${result.total_score}`)}</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        {t('لا توجد نتائج اختبارات', 'No test results available')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Doctor Notes */}
                <div>
                  <h3 className="font-semibold mb-3">{t('ملاحظات الطبيب', 'Doctor Notes')}</h3>
                  <Textarea
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    rows={4}
                    placeholder={t('أضف ملاحظاتك هنا...', 'Add your notes here...')}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('هذه الملاحظات ستُحفظ في ملف المريض', 'These notes will be saved in the patient\'s file')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button onClick={handleSaveNotes} className="flex-1">
                    {t('حفظ الملاحظات', 'Save Notes')}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => navigate('/doctor-dashboard/appointments')}>
                    <Calendar className="h-4 w-4 mr-2" />
                    {t('حجز موعد متابعة', 'Schedule Follow-Up')}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default DoctorPatients;
