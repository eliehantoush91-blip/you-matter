import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, ArrowLeft, Camera, Save, Loader2 } from 'lucide-react';
import DoctorSidebar from '@/components/DoctorSidebar';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/store';

interface DoctorProfileData {
  id: number;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  specialization: string;
  clinic_location: string;
  contact_info: string;
  experiance_years: number;
  working_hours: string;
  availability_schedule: {
    working_days: string[];
    start_time: string;
    end_time: string;
    slot_duration: number;
    break_start?: string;
    break_end?: string;
  } | null;
  doctor_image: string | null;
}

const DoctorProfile = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = useSelector((state: RootState) => state.auth);

  const [profile, setProfile] = useState<DoctorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = auth.token;
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await axios.get('http://127.0.0.1:8000/api/doctor-profile/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setProfile(response.data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
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

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: t('خطأ', 'Error'),
        description: t('يرجى اختيار ملف صورة صحيح', 'Please select a valid image file'),
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: t('خطأ', 'Error'),
        description: t('حجم الملف كبير جداً (الحد الأقصى 5 ميجابايت)', 'File size too large (max 5MB)'),
      });
      return;
    }

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

      const formData = new FormData();
      formData.append('doctor_image', file);

      const response = await axios.put('http://127.0.0.1:8000/api/doctor-profile/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update local profile state
      if (profile) {
        setProfile({ ...profile, doctor_image: response.data.doctor_image });
      }

      toast({
        title: t('تم التحميل بنجاح', 'Uploaded Successfully'),
        description: t('تم تحديث الصورة الشخصية', 'Profile picture updated successfully'),
    });
    } catch (err: any) {
      console.error('Error uploading image:', err);
      const errorMessage = err.response?.data?.error || 'Failed to upload image';
      toast({
        variant: 'destructive',
        title: t('خطأ', 'Error'),
        description: errorMessage,
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      setSaving(true);

      const token = auth.token;
      if (!token) {
        toast({
          variant: 'destructive',
          title: t('خطأ', 'Error'),
          description: 'No authentication token found',
        });
        return;
      }

      const updateData = {
        specialization: profile.specialization,
        clinic_location: profile.clinic_location,
        contact_info: profile.contact_info,
        experiance_years: profile.experiance_years,
        working_hours: profile.working_hours,
        availability_schedule: profile.availability_schedule,
  };

      const response = await axios.put('http://127.0.0.1:8000/api/doctor-profile/', updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setProfile(response.data);
      toast({
        title: t('تم الحفظ بنجاح', 'Saved Successfully'),
        description: t('تم حفظ التعديلات على ملفك الشخصي', 'Your profile changes have been saved'),
      });
    } catch (err: any) {
      console.error('Error saving profile:', err);
      const errorMessage = err.response?.data?.error || 'Failed to save profile data';
    toast({
        variant: 'destructive',
        title: t('خطأ', 'Error'),
        description: errorMessage,
    });
    } finally {
      setSaving(false);
    }
  };



  return (
    <div className="flex min-h-screen bg-gradient-to-br from-primary/10 via-secondary/40 via-accent/8 to-background">
      <DoctorSidebar />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate('/doctor-dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <User className="h-10 w-10 text-primary" />
              {t('الملف الشخصي', 'Profile')}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t('إدارة معلوماتك الشخصية والمهنية', 'Manage your personal and professional information')}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Avatar Card */}
          <Card className="lg:col-span-1 fade-in">
            <CardHeader>
              <CardTitle>{t('الصورة الشخصية', 'Profile Picture')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {loading ? (
                <div className="flex justify-center items-center h-32 w-32">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : profile ? (
                <>
              <div className="relative">
                <Avatar className="h-32 w-32">
                      <AvatarImage src={profile.doctor_image ? `http://127.0.0.1:8000${profile.doctor_image}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.user.username}`} />
                      <AvatarFallback>{profile.user.first_name.charAt(0)}{profile.user.last_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full"
                  onClick={handleAvatarUpload}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <h2 className="text-xl font-bold mt-4">
                    {profile.user.first_name} {profile.user.last_name}
                  </h2>
                  <p className="text-muted-foreground">{profile.specialization || t('لم يتم تحديد التخصص', 'Specialization not specified')}</p>
              <p className="text-sm text-muted-foreground mt-2">
                    {profile.experiance_years ? t(`${profile.experiance_years} سنوات خبرة`, `${profile.experiance_years} years of experience`) : t('خبرة غير محددة', 'Experience not specified')}
              </p>
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  {t('فشل في تحميل البيانات', 'Failed to load data')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Info */}
          <Card className="lg:col-span-2 fade-in">
            <CardHeader>
              <CardTitle>{t('المعلومات الشخصية', 'Personal Information')}</CardTitle>
              <CardDescription>
                {t('تحديث معلوماتك المهنية والشخصية', 'Update your professional and personal information')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">{t('جاري التحميل...', 'Loading...')}</span>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">
                  <p>{error}</p>
                  <Button onClick={fetchProfile} className="mt-4">
                    {t('إعادة المحاولة', 'Try Again')}
                  </Button>
                </div>
              ) : profile ? (
                <>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                      <Label htmlFor="firstName">{t('الاسم الأول', 'First Name')}</Label>
                  <Input
                        id="firstName"
                        value={profile.user.first_name}
                        disabled
                  />
                </div>
                <div className="space-y-2">
                      <Label htmlFor="lastName">{t('الاسم الأخير', 'Last Name')}</Label>
                  <Input
                        id="lastName"
                        value={profile.user.last_name}
                        disabled
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('البريد الإلكتروني', 'Email')}</Label>
                  <Input
                    id="email"
                    type="email"
                        value={profile.user.email}
                        disabled
                  />
                </div>
                <div className="space-y-2">
                      <Label htmlFor="contactInfo">{t('معلومات التواصل', 'Contact Info')}</Label>
                  <Input
                        id="contactInfo"
                        value={profile.contact_info || ''}
                        onChange={(e) => setProfile({ ...profile, contact_info: e.target.value })}
                        placeholder={t('أدخل معلومات التواصل', 'Enter contact information')}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialization">{t('التخصص', 'Specialization')}</Label>
                      <Input
                        id="specialization"
                        value={profile.specialization || ''}
                        onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                        placeholder={t('أدخل تخصصك', 'Enter your specialization')}
                      />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">{t('سنوات الخبرة', 'Years of Experience')}</Label>
                  <Input
                    id="experience"
                    type="number"
                        value={profile.experiance_years || ''}
                        onChange={(e) => setProfile({ ...profile, experiance_years: parseInt(e.target.value) || 0 })}
                        placeholder={t('أدخل سنوات الخبرة', 'Enter years of experience')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                    <Label htmlFor="clinicLocation">{t('موقع العيادة', 'Clinic Location')}</Label>
                    <Input
                      id="clinicLocation"
                      value={profile.clinic_location || ''}
                      onChange={(e) => setProfile({ ...profile, clinic_location: e.target.value })}
                      placeholder={t('أدخل موقع العيادة', 'Enter clinic location')}
                />
              </div>

                  {/* Availability Schedule */}
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <h3 className="font-semibold text-sm">{t('جدولة المواعيد', 'Appointment Scheduling')}</h3>

                    {/* Working Days */}
              <div className="space-y-2">
                      <Label>{t('أيام العمل', 'Working Days')}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'saturday', labelAr: 'السبت', labelEn: 'Saturday' },
                          { key: 'sunday', labelAr: 'الأحد', labelEn: 'Sunday' },
                          { key: 'monday', labelAr: 'الاثنين', labelEn: 'Monday' },
                          { key: 'tuesday', labelAr: 'الثلاثاء', labelEn: 'Tuesday' },
                          { key: 'wednesday', labelAr: 'الأربعاء', labelEn: 'Wednesday' },
                          { key: 'thursday', labelAr: 'الخميس', labelEn: 'Thursday' },
                          { key: 'friday', labelAr: 'الجمعة', labelEn: 'Friday' },
                        ].map((day) => (
                          <div key={day.key} className="flex items-center space-x-2 space-x-reverse">
                            <Checkbox
                              id={day.key}
                              checked={profile.availability_schedule?.working_days?.includes(day.key) || false}
                              onCheckedChange={(checked) => {
                                const currentDays = profile.availability_schedule?.working_days || [];
                                const newDays = checked
                                  ? [...currentDays, day.key]
                                  : currentDays.filter(d => d !== day.key);

                    setProfile({
                      ...profile,
                                  availability_schedule: {
                                    ...profile.availability_schedule,
                                    working_days: newDays,
                                    start_time: profile.availability_schedule?.start_time || '09:00',
                                    end_time: profile.availability_schedule?.end_time || '17:00',
                                    slot_duration: profile.availability_schedule?.slot_duration || 60,
                                  } as any
                                });
                              }}
                            />
                            <Label htmlFor={day.key} className="text-sm">
                              {t(day.labelAr, day.labelEn)}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Working Hours */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime">{t('وقت البداية', 'Start Time')}</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={profile.availability_schedule?.start_time || '09:00'}
                          onChange={(e) => setProfile({
                            ...profile,
                            availability_schedule: {
                              ...profile.availability_schedule,
                              working_days: profile.availability_schedule?.working_days || [],
                              start_time: e.target.value,
                              end_time: profile.availability_schedule?.end_time || '17:00',
                              slot_duration: profile.availability_schedule?.slot_duration || 60,
                            } as any
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime">{t('وقت النهاية', 'End Time')}</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={profile.availability_schedule?.end_time || '17:00'}
                          onChange={(e) => setProfile({
                            ...profile,
                            availability_schedule: {
                              ...profile.availability_schedule,
                              working_days: profile.availability_schedule?.working_days || [],
                              start_time: profile.availability_schedule?.start_time || '09:00',
                              end_time: e.target.value,
                              slot_duration: profile.availability_schedule?.slot_duration || 60,
                            } as any
                          })}
                        />
                      </div>
                    </div>

                    {/* Appointment Duration */}
                    <div className="space-y-2">
                      <Label htmlFor="slotDuration">{t('مدة الموعد (بالدقائق)', 'Appointment Duration (minutes)')}</Label>
                      <Select
                        value={profile.availability_schedule?.slot_duration?.toString() || '60'}
                        onValueChange={(value) => setProfile({
                          ...profile,
                          availability_schedule: {
                            ...profile.availability_schedule,
                            working_days: profile.availability_schedule?.working_days || [],
                            start_time: profile.availability_schedule?.start_time || '09:00',
                            end_time: profile.availability_schedule?.end_time || '17:00',
                            slot_duration: parseInt(value),
                          } as any
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">{t('30 دقيقة', '30 minutes')}</SelectItem>
                          <SelectItem value="45">{t('45 دقيقة', '45 minutes')}</SelectItem>
                          <SelectItem value="60">{t('60 دقيقة', '60 minutes')}</SelectItem>
                          <SelectItem value="90">{t('90 دقيقة', '90 minutes')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
              </div>

                  <Button onClick={handleSaveProfile} className="w-full" disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                <Save className="h-4 w-4 mr-2" />
                    )}
                    {saving ? t('جاري الحفظ...', 'Saving...') : t('حفظ التعديلات', 'Save Changes')}
              </Button>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>

        
      </main>
    </div>
  );
};

export default DoctorProfile;
