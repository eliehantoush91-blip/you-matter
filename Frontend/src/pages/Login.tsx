import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { Stethoscope, User, Lock, Mail, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '@/Redux/actions';
import type { AppDispatch } from '@/Redux/store';
import type { RootState } from '@/Redux/store';

const Login = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');

  const [doctorForm, setDoctorForm] = useState({ email: '', password: '' });
  const [patientForm, setPatientForm] = useState({ email: '', password: '' });

  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    if (auth.error) {
      toast({
        title: t('خطأ', 'Error'),
        description: auth.error,
        variant: 'destructive',
      });
    }
  }, [auth.error, toast, t]);

  useEffect(() => {
    if (!auth.loading && auth.isAuthenticated) {
      toast({
        title: t('تم تسجيل الدخول بنجاح', 'Login successful'),
        description: t('مرحبا بك', 'Welcome back'),
        
      });
      navigate('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isAuthenticated, auth.loading]);

  const handleDoctorLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!doctorForm.email || !doctorForm.password) {
      toast({
        title: t('خطأ', 'Error'),
        description: t('يرجى ملء جميع الحقول', 'Please fill in all fields'),
        variant: 'destructive',
      });
      return;
    }

    dispatch(loginUser({ email: doctorForm.email, password: doctorForm.password }));
  };

  const handlePatientLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientForm.email || !patientForm.password) {
      toast({
        title: t('خطأ', 'Error'),
        description: t('يرجى ملء جميع الحقول', 'Please fill in all fields'),
        variant: 'destructive',
      });
      return;
    }

    dispatch(loginUser({ email: patientForm.email, password: patientForm.password }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/35 via-primary/8 to-accent/12">
      <Header />
      
      <main className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-4xl fade-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              {t('تسجيل الدخول', 'Login to Your Account')}
            </h1>
            <p className="text-muted-foreground">
              {t('اختر نوع حسابك لتسجيل الدخول', 'Choose your account type to login')}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'patient' | 'doctor')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="patient" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('مريض', 'Patient')}
              </TabsTrigger>
              <TabsTrigger value="doctor" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                {t('طبيب', 'Doctor')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="patient" className="fade-in">
              <Card className="shadow-elegant border-2">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl text-center">
                    {t('تسجيل دخول المريض', 'Patient Login')}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {t('أدخل بياناتك للوصول إلى حسابك', 'Enter your credentials to access your account')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePatientLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="patient-email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {t('البريد الإلكتروني', 'Email')}
                      </Label>
                      <Input
                        id="patient-email"
                        type="email"
                        placeholder={t('أدخل بريدك الإلكتروني', 'Enter your email')}
                        value={patientForm.email}
                        onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="patient-password" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        {t('كلمة المرور', 'Password')}
                      </Label>
                      <Input
                        id="patient-password"
                        type="password"
                        placeholder={t('أدخل كلمة المرور', 'Enter your password')}
                        value={patientForm.password}
                        onChange={(e) => setPatientForm({ ...patientForm, password: e.target.value })}
                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                      />
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      
                      <Link to="/register" className="text-primary hover:underline">
                        {t('مستخدم جديد؟', 'New user?')}
                      </Link>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={auth.loading}>
                      {auth.loading ? t('جارٍ تسجيل الدخول...', 'Logging in...') : t('تسجيل الدخول', 'Login')}
                    </Button>

                    <div className="flex items-start gap-2 p-4 bg-secondary/20 rounded-lg mt-4">
                      <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        {t(
                          'بياناتك محمية ومشفّرة ولا يراها سوى طبيبك المعتمد.',
                          'Your data is securely encrypted and visible only to your assigned doctor.'
                        )}
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="doctor" className="fade-in">
              <Card className="shadow-elegant border-2">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                    <Stethoscope className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl text-center">
                    {t('تسجيل دخول الطبيب', 'Doctor Login')}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {t('الوصول إلى لوحة التحكم الطبية', 'Access your medical dashboard')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDoctorLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctor-email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {t('البريد الإلكتروني', 'Email')}
                      </Label>
                      <Input
                        id="doctor-email"
                        type="email"
                        placeholder={t('أدخل بريدك الإلكتروني', 'Enter your email')}
                        value={doctorForm.email}
                        onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="doctor-password" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        {t('كلمة المرور', 'Password')}
                      </Label>
                      <Input
                        id="doctor-password"
                        type="password"
                        placeholder={t('أدخل كلمة المرور', 'Enter your password')}
                        value={doctorForm.password}
                        onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                      />
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      
                      <Link to="/register" className="text-primary hover:underline">
                        {t('مستخدم جديد؟', 'New user?')}
                      </Link>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={auth.loading}>
                      {auth.loading ? t('جارٍ تسجيل الدخول...', 'Logging in...') : t('تسجيل الدخول', 'Login')}
                    </Button>

                    <div className="flex items-start gap-2 p-4 bg-secondary/20 rounded-lg mt-4">
                      <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        {t(
                          'بياناتك محمية ومشفّرة ولا يراها سوى طبيبك المعتمد.',
                          'Your data is securely encrypted and visible only to your assigned doctor.'
                        )}
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Login;
