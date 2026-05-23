import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, Stethoscope } from 'lucide-react';

import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '@/Redux/actions';
import type { AppDispatch } from '@/Redux/store';
import type { RootState } from '@/Redux/store';

type UserRole = 'patient' | 'doctor';

const Register = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((s: RootState) => s.auth);

  const [role, setRole] = useState<UserRole>('patient');
  
  // Common fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Patient-specific fields
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [hasMentalHealthHistory, setHasMentalHealthHistory] = useState(false);
  
  // Doctor-specific fields
  const [specialty, setSpecialty] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [clinicLocation, setClinicLocation] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  useEffect(() => {
    if (auth.error) {
      toast({
        variant: 'destructive',
        title: t('خطأ', 'Error'),
        description: auth.error,
      });
    }
  }, [auth.error, toast, t]);

  useEffect(() => {
    if (!auth.loading && auth.isAuthenticated) {
      toast({
        title: t('تم التسجيل بنجاح', 'Registration Successful'),
        description: t('مرحباً بك في انت مهم', 'Welcome to you matter'),
      });

      if (role === 'doctor') navigate('/');
      else navigate('/');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isAuthenticated, auth.loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      toast({
        variant: 'destructive',
        title: t('خطأ', 'Error'),
        description: t('الرجاء ملء جميع الحقول المطلوبة', 'Please fill all required fields'),
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        variant: 'destructive',
        title: t('خطأ', 'Error'),
        description: t('البريد الإلكتروني غير صالح', 'Invalid email address'),
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: t('خطأ', 'Error'),
        description: t('كلمات المرور غير متطابقة', 'Passwords do not match'),
      });
      return;
    }

    if (password.length < 8) {
      toast({
        variant: 'destructive',
        title: t('خطأ', 'Error'),
        description: t('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 'Password must be at least 6 characters'),
      });
      return;
    }

    // Role-specific validation
    if (role === 'patient' && (!gender || !birthDate)) {
      toast({
        variant: 'destructive',
        title: t('خطأ', 'Error'),
        description: t('الرجاء ملء جميع الحقول المطلوبة', 'Please fill all required fields'),
      });
      return;
    }

    if (role === 'doctor' && (!specialty || !yearsOfExperience)) {
      toast({
        variant: 'destructive',
        title: t('خطأ', 'Error'),
        description: t('الرجاء ملء جميع الحقول المطلوبة', 'Please fill all required fields'),
      });
      return;
    }

    // Build typed payload
        type BasePayload = {
          name: string;
          email: string;
          password: string;
          role: UserRole;
        };
        type PatientPayload = BasePayload & {
          gender: string;
          birthDate: string;
          hasMentalHealthHistory: boolean;
        };
        type DoctorPayload = BasePayload & {
          specialty: string;
          yearsOfExperience: string;
          clinicLocation?: string;
          contactNumber?: string;
        };
        type RegisterPayload = PatientPayload | DoctorPayload;
    
        let payload: RegisterPayload;
        if (role === 'patient') {
          payload = {
            name: fullName,
            email,
            password,
            role,
            gender,
            birthDate,
            hasMentalHealthHistory,
          };
        } else {
          payload = {
            name: fullName,
            email,
            password,
            role,
            specialty,
            yearsOfExperience,
            clinicLocation,
            contactNumber,
          };
        }

    // Dispatch register action (redux thunk)
    dispatch(registerUser(payload));
  };

  const handleGoogleRegister = () => {
    toast({
      title: t('قريباً', 'Coming Soon'),
      description: t('التسجيل عبر Google قريباً', 'Google registration coming soon'),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/35 via-primary/8 to-accent/12">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            {t('إنشاء حساب جديد', 'Create a New Account')}
          </CardTitle>
          <CardDescription className="text-lg">
            {t('انضم إلى انت مهم', 'Join you matter')}
          </CardDescription>
          
          {/* Role Selector */}
          <div className="flex gap-4 justify-center pt-4">
            <Button
              type="button"
              variant={role === 'patient' ? 'default' : 'outline'}
              className="flex-1 max-w-[200px]"
              onClick={() => setRole('patient')}
            >
              <UserCircle className="ml-2 h-5 w-5" />
              {t('مريض', 'Patient')}
            </Button>
            <Button
              type="button"
              variant={role === 'doctor' ? 'default' : 'outline'}
              className="flex-1 max-w-[200px]"
              onClick={() => setRole('doctor')}
            >
              <Stethoscope className="ml-2 h-5 w-5" />
              {t('طبيب', 'Doctor')}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common Fields */}
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('الاسم الكامل', 'Full Name')} *</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('أدخل اسمك الكامل', 'Enter your full name')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('البريد الإلكتروني', 'Email Address')} *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('أدخل بريدك الإلكتروني', 'Enter your email')}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t('كلمة المرور', 'Password')} *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('أدخل كلمة المرور', 'Enter password')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('تأكيد كلمة المرور', 'Confirm Password')} *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('أعد إدخال كلمة المرور', 'Re-enter password')}
                  required
                />
              </div>
            </div>

            {/* Patient-specific fields */}
            {role === 'patient' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">{t('الجنس', 'Gender')} *</Label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      required
                    >
                      <option value="">{t('اختر', 'Select')}</option>
                      <option value="male">{t('ذكر', 'Male')}</option>
                      <option value="female">{t('أنثى', 'Female')}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">{t('تاريخ الميلاد', 'Date of Birth')} *</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                
              </>
            )}

            {/* Doctor-specific fields */}
            {role === 'doctor' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialty">{t('التخصص', 'Specialty')} *</Label>
                    <Input
                      id="specialty"
                      type="text"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder={t('مثال: طب نفسي', 'e.g., Psychiatry')}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">{t('سنوات الخبرة', 'Years of Experience')} *</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                      placeholder={t('عدد السنوات', 'Number of years')}
                      min="0"
                      max="60"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicLocation">{t('موقع العيادة', 'Clinic Location')}</Label>
                  <Input
                    id="clinicLocation"
                    type="text"
                    value={clinicLocation}
                    onChange={(e) => setClinicLocation(e.target.value)}
                    placeholder={t('اختياري', 'Optional')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNumber">{t('رقم الاتصال', 'Contact Number')}</Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder={t('اختياري', 'Optional')}
                  />
                </div>
              </>
            )}

            {/* Privacy Notice */}
            <div className="text-sm text-muted-foreground text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              {t(
                'بياناتك محمية ومشفّرة ولا يراها سوى طبيبك المعتمد.',
                'Your data is securely encrypted and visible only to your assigned doctor.'
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg" disabled={auth.loading}>
              {auth.loading ? t('جارٍ التسجيل...', 'Registering...') : t('إنشاء الحساب', 'Create Account')}
            </Button>

            

            {/* Login Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {t('لديك حساب؟', 'Already have an account?')}{' '}
              </span>
              <Link to="/login" className="text-primary hover:underline font-medium">
                {t('تسجيل الدخول', 'Login')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;