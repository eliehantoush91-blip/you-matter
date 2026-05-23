import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { Camera, User, Settings, Calendar, Activity, Upload, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/store';

interface PersonalInfoForm {
  fullName: string;
  email: string;
  contact_info: string;
  dateOfBirth: string;
  gender: string;
}

interface GenderSelectProps {
  value: string;
  onChange: (value: string) => void;
}


interface PatientProfileData {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  birth_date: string;
  gender: string;
  doctor?: {
    user: {
      first_name: string;
      email: string;
    };
  };
  progress_notes?: string;
  patient_image?: string;
  contact_info?: string;
}

interface DashboardSummary {
  upcoming_appointments: Array<{
    id: number;
    date: string;
    status: string;
    doctor: {
      user: {
        first_name: string;
        email: string;
      };
    };
  }>;
  recent_test_results: Array<{
    id: number;
    test: {
      name: string;
    };
    total_score: number;
    created_at: string;
  }>;
}

const PatientProfile = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);

  const [profileData, setProfileData] = useState<PatientProfileData | null>(null);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [avatarPreview, setAvatarPreview] = useState<string>('/placeholder.svg');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedGender, setSelectedGender] = useState<string>('');

  const getUserInitials = (firstName: string) => {
    return firstName ? firstName.charAt(0).toUpperCase() : 'U';
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = auth.token;
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await axios.get('http://127.0.0.1:8000/api/patient-profile/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setProfileData(response.data);
    } catch (err: any) {
      console.error('Error fetching profile data:', err);
      const errorMessage = err.response?.data?.error || 'Failed to load profile data';
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

  const fetchDashboardSummary = async () => {
    try {
      const token = auth.token;
      if (!token) return;

      const response = await axios.get('http://127.0.0.1:8000/api/patient-dashboard/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setDashboardSummary(response.data);
    } catch (err: any) {
      console.error('Error fetching dashboard summary:', err);
      // Don't show error toast for dashboard data, just log it
    }
  };

  const updateProfileData = async (data: any) => {
    try {
      setUpdating(true);

      const token = auth.token;
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put('http://127.0.0.1:8000/api/patient-profile/', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setProfileData(response.data);
      toast({
        title: t('✅ تم حفظ التعديلات بنجاح', '✅ Changes saved successfully'),
        description: t('تم تحديث معلوماتك الشخصية', 'Your personal information has been updated'),
      });
    } catch (err: any) {
      console.error('Error updating profile data:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update profile data';
      toast({
        variant: 'destructive',
        title: t('خطأ', 'Error'),
        description: errorMessage,
      });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchProfileData(), fetchDashboardSummary()]);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (profileData) {
      const genderValue = profileData.gender || '';
      setSelectedGender(genderValue);

      // Set avatar preview from backend image
      if (profileData.patient_image) {
        setAvatarPreview(`http://127.0.0.1:8000${profileData.patient_image}`);
      }

      resetPersonal({
        fullName: profileData.user.first_name,
        email: profileData.user.email,
        contact_info: profileData.contact_info || '', // Phone not in current model
        dateOfBirth: profileData.birth_date ? new Date(profileData.birth_date).toISOString().split('T')[0] : '',
        gender: genderValue,
      });
    }
  }, [profileData]);

  const { register: registerPersonal, handleSubmit: handlePersonalSubmit, reset: resetPersonal } = useForm<PersonalInfoForm>({
    defaultValues: {
      fullName: '',
      email: '',
      contact_info: '',
      dateOfBirth: '',
      gender: '',
    },
  });


  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to backend
      try {
        const token = auth.token;
        if (!token) {
          toast({
            variant: 'destructive',
            title: t('خطأ', 'Error'),
            description: t('لم يتم العثور على رمز المصادقة', 'No authentication token found'),
          });
          return;
        }

        const formData = new FormData();
        formData.append('patient_image', file);

        const response = await axios.put('http://127.0.0.1:8000/api/patient-profile/', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        // Update profile data with new image
        setProfileData(prev => prev ? { ...prev, patient_image: response.data.patient_image } : null);

        toast({
          title: t('✅ تم تحديث الصورة', '✅ Avatar updated'),
          description: t('تم تحديث صورة الملف الشخصي بنجاح', 'Profile picture updated successfully'),
        });
      } catch (err: any) {
        console.error('Error uploading avatar:', err);
        const errorMessage = err.response?.data?.error || 'Failed to upload avatar';
        toast({
          variant: 'destructive',
          title: t('خطأ', 'Error'),
          description: errorMessage,
        });

        // Reset preview on error
        setAvatarPreview('/placeholder.svg');
      }
    }
  };

  const onPersonalInfoSubmit = async (data: PersonalInfoForm) => {
    const updateData = {
      user: {
        first_name: data.fullName,
        email: data.email,
      },
      birth_date: data.dateOfBirth,
      gender: selectedGender,
    };
    await updateProfileData(updateData);
  };


  const handleSavePreferences = () => {
    toast({
      title: t('✅ تم حفظ الإعدادات', '✅ Preferences saved'),
      description: t('تم حفظ إعداداتك بنجاح', 'Your preferences have been saved successfully'),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/40 via-accent/8 to-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 fade-in">
          <h1 className="text-4xl font-bold mb-2">
            {t('الملف الشخصي', 'My Profile')}
          </h1>
          <p className="text-muted-foreground">
            {t('إدارة معلوماتك الشخصية وإعداداتك', 'Manage your personal information and settings')}
          </p>
        </div>

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
              <Button onClick={fetchProfileData} variant="outline">
                {t('إعادة المحاولة', 'Try Again')}
              </Button>
            </div>
          </div>
        ) : profileData ? (
          <>
            {/* Health Summary Card */}
        <Card className="mb-6 fade-in shadow-card overflow-hidden" style={{ animationDelay: '0.1s' }}>
          <div className="bg-gradient-to-r from-primary/10 to-secondary/20 p-6">
            <CardHeader className="p-0 mb-4">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarImage src={profileData?.patient_image ? `http://127.0.0.1:8000${profileData.patient_image}` : avatarPreview} />
                    <AvatarFallback className="text-2xl">
                      {profileData ? getUserInitials(profileData.user.first_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-smooth shadow-lg">
                    <Camera className="h-4 w-4 text-primary-foreground" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-1">{profileData.user.first_name}</CardTitle>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t('مريض', 'Patient')}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <p className="font-semibold text-sm">
                      {t('نتيجتك النفسية الأخيرة', 'Your Latest Mental Health Result')}
                    </p>
                  </div>
                  {dashboardSummary?.recent_test_results?.[0] ? (
                    <>
                      <p className="text-2xl font-bold text-primary mb-1">
                        {dashboardSummary.recent_test_results[0].total_score}/100
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {dashboardSummary.recent_test_results[0].test?.name || t('اختبار غير محدد', 'Unknown Test')}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-primary mb-1">-</p>
                      <p className="text-sm text-muted-foreground">
                        {t('لا توجد نتائج متاحة', 'No results available')}
                      </p>
                    </>
                  )}
                </div>
                
                <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <p className="font-semibold text-sm">
                      {t('موعدك القادم', 'Next Appointment')}
                    </p>
                  </div>
                  {dashboardSummary?.upcoming_appointments?.[0] ? (
                    <>
                      <p className="text-lg font-semibold mb-1">
                        {new Date(dashboardSummary.upcoming_appointments[0].date).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('د.', 'Dr.')} {dashboardSummary.upcoming_appointments[0].doctor.user.first_name} - {' '}
                        {new Date(dashboardSummary.upcoming_appointments[0].date).toLocaleTimeString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-semibold mb-1">-</p>
                      <p className="text-sm text-muted-foreground">
                        {t('لا توجد مواعيد قادمة', 'No upcoming appointments')}
                      </p>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <Button variant="outline" size="sm" onClick={() => navigate('/test-results')}>
                  {t('عرض التفاصيل', 'View Details')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/book-appointment')}>
                  {t('المواعيد', 'Appointments')}
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>

        <div className="grid gap-6">
          {/* Personal Information Card */}
          <Card className="fade-in shadow-card" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>{t('المعلومات الشخصية', 'Personal Information')}</CardTitle>
              </div>
              <CardDescription>
                {t('قم بتحديث معلوماتك الشخصية', 'Update your personal details')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePersonalSubmit(onPersonalInfoSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">{t('الاسم الكامل', 'Full Name')}</Label>
                  <Input
                    id="fullName"
                    {...registerPersonal('fullName')}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">{t('البريد الإلكتروني', 'Email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    {...registerPersonal('email')}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">{t('رقم الهاتف', 'Phone Number')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...registerPersonal('contact_info')}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="dateOfBirth">{t('تاريخ الميلاد', 'Date of Birth')}</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...registerPersonal('dateOfBirth')}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="gender">{t('الجنس', 'Gender')}</Label>
                  <Select value={selectedGender} onValueChange={setSelectedGender}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('اختر الجنس', 'Select gender')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t('ذكر', 'Male')}</SelectItem>
                      <SelectItem value="female">{t('أنثى', 'Female')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="hidden" {...registerPersonal('gender')} value={selectedGender} />
                </div>
                
                <Button type="submit" className="w-full" disabled={updating}>
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('جارٍ الحفظ...', 'Saving...')}
                    </>
                  ) : (
                    t('حفظ التعديلات', 'Save Changes')
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>


          {/* Preferences Card */}
          <Card className="fade-in shadow-card" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle>{t('الإعدادات والتفضيلات', 'Settings & Preferences')}</CardTitle>
              </div>
              <CardDescription>
                {t('خصّص تجربتك على المنصة', 'Customize your platform experience')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🌐</div>
                    <div>
                      <p className="font-semibold">{t('اللغة', 'Language')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('العربية / English', 'Arabic / English')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={toggleLanguage}
                    className="flex items-center gap-2"
                  >
                    {language === 'ar' ? '🇸🇦 عربي' : '🇬🇧 English'}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🌙</div>
                    <div>
                      <p className="font-semibold">{t('المظهر', 'Theme')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('فاتح / داكن', 'Light / Dark')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="flex items-center gap-2"
                  >
                    {theme === 'dark' ? t('🌙 داكن', '🌙 Dark') : t('☀️ فاتح', '☀️ Light')}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🔔</div>
                    <div>
                      <p className="font-semibold">{t('الإشعارات', 'Notifications')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('إشعارات المواعيد والرسائل', 'Appointment and message reminders')}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>

                <Button onClick={handleSavePreferences} className="w-full">
                  {t('حفظ الإعدادات', 'Save Preferences')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default PatientProfile;
