import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Calendar as CalendarIcon, Clock, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";

interface DoctorData {
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
}

const BookAppointment = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);

  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [checkingDates, setCheckingDates] = useState(false);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('http://127.0.0.1:8000/api/doctors/');
      setDoctors(response.data);
    } catch (err: any) {
      console.error('Error fetching doctors:', err);
      const errorMessage = err.response?.data?.error || 'Failed to load doctors';
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
    fetchDoctors();
  }, []);

  const fetchAvailableSlots = async (doctorId: string, date: Date) => {
    if (!doctorId || !date) return;

    try {
      setLoadingSlots(true);
      const response = await axios.get(`http://127.0.0.1:8000/api/available-slots/${doctorId}/?date=${date.toISOString()}`);
      setAvailableSlots(response.data.available_slots || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const checkAvailableDates = async (doctorId: string) => {
    if (!doctorId) {
      setAvailableDates([]);
      return;
    }

    setCheckingDates(true);
    const datesWithSlots: string[] = [];

    // Check next 30 days for availability
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() + i);

      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/available-slots/${doctorId}/?date=${checkDate.toISOString()}`);
        if (response.data.available_slots && response.data.available_slots.length > 0) {
          datesWithSlots.push(checkDate.toISOString().split('T')[0]);
        }
      } catch (error) {
        // Continue checking other dates
        console.log(`No slots available for ${checkDate.toISOString().split('T')[0]}`);
      }
    }

    setAvailableDates(datesWithSlots);
    setCheckingDates(false);
  };

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots(selectedDoctor, selectedDate);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDoctor, selectedDate]);

  useEffect(() => {
    if (selectedDoctor) {
      checkAvailableDates(selectedDoctor);
    } else {
      setAvailableDates([]);
    }
  }, [selectedDoctor]);



  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTimeSlot) {
      toast({
        title: t("خطأ", "Error"),
        description: t("الرجاء تعبئة جميع الحقول", "Please fill in all fields"),
        variant: "destructive",
      });
      return;
    }

    try {
      setBooking(true);

      const token = auth.token;
      if (!token) {
        toast({
          variant: 'destructive',
          title: t('خطأ', 'Error'),
          description: 'No authentication token found',
        });
        return;
      }

      // Time slot is already in HH:MM format from availableSlots
      const timeStr = selectedTimeSlot;

      const bookingData = {
        doctor_id: selectedDoctor,
        date: selectedDate.toISOString(),
        time: timeStr,
        notes: ""
      };

      const response = await axios.post('http://127.0.0.1:8000/api/book-appointment/', bookingData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      toast({
        title: t("تم حجز الموعد بنجاح!", "Appointment Booked Successfully!"),
        description: t(
          `تم تأكيد حجز الموعد رقم ${response.data.appointment.id}`,
          `Appointment #${response.data.appointment.id} has been confirmed`
        ),
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/patient-dashboard");
      }, 2000);
    } catch (err: any) {
      console.error('Error booking appointment:', err);
      const errorMessage = err.response?.data?.error || 'Failed to book appointment';
      toast({
        variant: 'destructive',
        title: t('خطأ', 'Error'),
        description: errorMessage,
      });
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/40 via-accent/8 to-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/patient-dashboard")}
            className="mb-4"
          >
            <ArrowRight className="rotate-180" />
            {t("العودة إلى لوحة التحكم", "Back to Dashboard")}
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent mb-2">
            {t("حجز موعد", "Book Appointment")}
          </h1>
          <p className="text-muted-foreground">
            {t("اختر الطبيب والموعد المناسب لك", "Choose your doctor and preferred appointment time")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Doctor Selection */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                {t("اختر الطبيب", "Select Doctor")}
              </CardTitle>
              <CardDescription>
                {t("اختر الطبيب المناسب لحالتك", "Choose the right doctor for your needs")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>{t('جاري تحميل الأطباء...', 'Loading doctors...')}</span>
                </div>
              ) : error ? (
                <div className="text-center py-4 text-destructive">
                  <p>{error}</p>
                  <Button onClick={fetchDoctors} className="mt-2">
                    {t('إعادة المحاولة', 'Try Again')}
                  </Button>
                </div>
              ) : (
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("اختر طبيباً", "Select a doctor")} />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">
                            {doctor.user.first_name} {doctor.user.last_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {doctor.specialization || t('غير محدد', 'Not specified')}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Time Slot Selection */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                {t("اختر الوقت", "Select Time Slot")}
              </CardTitle>
              <CardDescription>
                {t("اختر الوقت المناسب لموعدك", "Choose your preferred time")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSlots ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>{t('جاري تحميل الأوقات المتاحة...', 'Loading available times...')}</span>
                </div>
              ) : !selectedDoctor || !selectedDate ? (
                <div className="text-center py-4 text-muted-foreground">
                  {t('اختر الطبيب والتاريخ أولاً', 'Select doctor and date first')}
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  {t('لا توجد أوقات متاحة لهذا اليوم', 'No available times for this day')}
                </div>
              ) : (
                <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("اختر الوقت", "Select time")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Date Selection */}
        <Card className="mt-6 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              {t("اختر التاريخ", "Select Date")}
            </CardTitle>
            <CardDescription>
              {selectedDoctor
                ? checkingDates
                  ? t("جاري البحث عن التواريخ المتاحة...", "Checking available dates...")
                  : t("اختر التاريخ المناسب لموعدك (التواريخ المتاحة مفعلة فقط)", "Choose your preferred appointment date (only available dates are enabled)")
                : t("اختر الطبيب أولاً لرؤية التواريخ المتاحة", "Select a doctor first to see available dates")
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                // Only allow selecting available dates when a doctor is selected
                if (selectedDoctor && date) {
                  const dateStr = date.toISOString().split('T')[0];
                  if (!availableDates.includes(dateStr)) {
                    return; // Don't allow selecting unavailable dates
                  }
                }
                setSelectedDate(date);
              }}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Always disable past dates
                if (date < today) return true;

                // If doctor is selected, only allow available dates
                if (selectedDoctor) {
                  const dateStr = date.toISOString().split('T')[0];
                  return !availableDates.includes(dateStr);
                }

                return false;
              }}
              className={cn("rounded-md border pointer-events-auto")}
              initialFocus
            />
            {selectedDoctor && !checkingDates && (
              <div className="mt-4 text-center">
                
                {availableDates.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("لا توجد تواريخ متاحة في الشهر الحالي", "No available dates in current month")}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary & Book Button */}
        {selectedDoctor && selectedDate && selectedTimeSlot && (
          <Card className="mt-6 shadow-card border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <CardTitle>{t("ملخص الموعد", "Appointment Summary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("الطبيب:", "Doctor:")}</span>
                <span className="font-medium">
                  {(() => {
                    const doctor = doctors.find(d => d.id.toString() === selectedDoctor);
                    return doctor ? `${doctor.user.first_name} ${doctor.user.last_name}` : "";
                  })()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("التاريخ:", "Date:")}</span>
                <span className="font-medium">
                  {selectedDate.toLocaleDateString(t('ar-EG', 'en-US'), { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("الوقت:", "Time:")}</span>
                <span className="font-medium">
                  {selectedTimeSlot}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Book Button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleBookAppointment}
            size="lg"
            className="w-full md:w-auto px-12 text-lg shadow-soft hover:shadow-lg transition-all"
            disabled={booking}
          >
            {booking ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t("جاري الحجز...", "Booking...")}
              </>
            ) : (
              <>
                {t("اطلب موعدا ", "Request Appointment")}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
