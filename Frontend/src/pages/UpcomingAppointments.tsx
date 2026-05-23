import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, ArrowRight, Video, MapPin, Clock, User, X, ChevronDown, ChevronUp, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Appointment {
  id: string;
  doctorAr: string;
  doctorEn: string;
  specialtyAr: string;
  specialtyEn: string;
  date: string;
  time: string;
  typeAr: string;
  typeEn: string;
  status: "Confirmed" | "Pending" | "Cancelled";
}

const UpcomingAppointments = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      doctorAr: "د. سامر الأحمد",
      doctorEn: "Dr. Samer Al Ahmad",
      specialtyAr: "طبيب نفسي",
      specialtyEn: "Psychiatrist",
      date: "2025-11-10",
      time: "15:00",
      typeAr: "عن بعد",
      typeEn: "Online",
      status: "Confirmed",
    },
    {
      id: "2",
      doctorAr: "د. ليلى حسن",
      doctorEn: "Dr. Leila Hassan",
      specialtyAr: "أخصائية علاج سلوكي",
      specialtyEn: "Behavioral Therapist",
      date: "2025-11-14",
      time: "10:30",
      typeAr: "حضوري",
      typeEn: "In-person",
      status: "Pending",
    },
    {
      id: "3",
      doctorAr: "د. محمد العلي",
      doctorEn: "Dr. Mohammed Al Ali",
      specialtyAr: "معالج نفسي",
      specialtyEn: "Psychotherapist",
      date: "2025-11-18",
      time: "14:00",
      typeAr: "عن بعد",
      typeEn: "Online",
      status: "Confirmed",
    },
  ]);

  const handleCancelClick = (appointmentId: string) => {
    setSelectedAppointment(appointmentId);
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    if (selectedAppointment) {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment ? { ...apt, status: "Cancelled" as const } : apt
        )
      );
      toast.success(
        language === "ar"
          ? "تم إلغاء الموعد بنجاح"
          : "Appointment cancelled successfully"
      );
    }
    setShowCancelDialog(false);
    setSelectedAppointment(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      Confirmed: { ar: "مؤكد", en: "Confirmed" },
      Pending: { ar: "قيد الانتظار", en: "Pending" },
      Cancelled: { ar: "ملغي", en: "Cancelled" },
    };
    return language === "ar" ? statusMap[status as keyof typeof statusMap].ar : statusMap[status as keyof typeof statusMap].en;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (language === "ar") {
      return date.toLocaleDateString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/40 via-accent/8 to-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate("/patient-dashboard")}
            className="mb-4 gap-2"
          >
            <ArrowRight className={`h-4 w-4 ${language === "ar" ? "" : "rotate-180"}`} />
            {t("العودة إلى لوحة التحكم", "Back to Dashboard")}
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              {t("المواعيد القادمة", "Upcoming Appointments")}
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            {t(
              "راجع مواعيدك القادمة مع الأطباء",
              "Review your upcoming doctor appointments"
            )}
          </p>
        </div>

        {/* Appointments Grid */}
        {appointments.length === 0 ? (
          <Card className="p-12 text-center animate-fade-in">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">
              {t("لا توجد مواعيد قادمة حاليًا", "You have no upcoming appointments at the moment")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t("يمكنك حجز موعد جديد مع طبيبك", "You can book a new appointment with your doctor")}
            </p>
            <Button onClick={() => navigate("/book-appointment")}>
              {t("حجز موعد جديد", "Book New Appointment")}
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((appointment, index) => (
              <Card
                key={appointment.id}
                className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">
                          {language === "ar" ? appointment.doctorAr : appointment.doctorEn}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {language === "ar" ? appointment.specialtyAr : appointment.specialtyEn}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(appointment.date)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{appointment.time}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    {appointment.typeEn === "Online" ? (
                      <Video className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{language === "ar" ? appointment.typeAr : appointment.typeEn}</span>
                  </div>

                  {/* View Details Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 gap-2"
                    onClick={() => setExpandedAppointment(
                      expandedAppointment === appointment.id ? null : appointment.id
                    )}
                  >
                    {expandedAppointment === appointment.id ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        {t("إخفاء التفاصيل", "Hide Details")}
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        {t("عرض التفاصيل", "View Details")}
                      </>
                    )}
                  </Button>

                  {/* Expanded Details Section */}
                  {expandedAppointment === appointment.id && (
                    <div className="mt-4 pt-4 border-t space-y-3 animate-fade-in">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {t("الهاتف:", "Phone:")}
                        </span>
                        <span>+966 50 123 4567</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {t("البريد:", "Email:")}
                        </span>
                        <span className="text-sm">doctor@clinic.com</span>
                      </div>

                      {appointment.typeEn === "Online" ? (
                        <div className="p-3 bg-primary/5 rounded-lg">
                          <p className="text-sm font-medium mb-1">
                            {t("رابط الجلسة:", "Session Link:")}
                          </p>
                          <a
                            href="#"
                            className="text-sm text-primary hover:underline break-all"
                          >
                            https://meet.clinic.com/session-12345
                          </a>
                        </div>
                      ) : (
                        <div className="p-3 bg-primary/5 rounded-lg">
                          <p className="text-sm font-medium mb-1">
                            {t("العنوان:", "Address:")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {language === "ar" 
                              ? "شارع الملك فهد، الرياض، المملكة العربية السعودية"
                              : "King Fahd Road, Riyadh, Saudi Arabia"}
                          </p>
                        </div>
                      )}

                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium mb-1">
                          {t("ملاحظات:", "Notes:")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {language === "ar"
                            ? "يرجى الحضور قبل 10 دقائق من موعد الجلسة."
                            : "Please arrive 10 minutes before your session."}
                        </p>
                      </div>
                    </div>
                  )}

                  {(appointment.status === "Confirmed" || appointment.status === "Pending") && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full mt-4 gap-2"
                      onClick={() => handleCancelClick(appointment.id)}
                    >
                      <X className="h-4 w-4" />
                      {t("إلغاء الموعد", "Cancel Appointment")}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("تأكيد الإلغاء", "Confirm Cancellation")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "هل أنت متأكد من إلغاء هذا الموعد؟ لن تتمكن من التراجع عن هذا الإجراء.",
                "Are you sure you want to cancel this appointment? This action cannot be undone."
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              {t("تراجع", "Cancel")}
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel}>
              {t("نعم، إلغاء الموعد", "Yes, Cancel Appointment")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpcomingAppointments;
