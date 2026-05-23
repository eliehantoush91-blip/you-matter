import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, Phone, Mail, MapPin, Send, ArrowLeft, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Contact = () => {
  const { language, toggleLanguage } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const isRTL = language === 'ar';

  const content = {
    ar: {
      pageTitle: "تواصل معنا",
      heroTitle: "نحن هنا من أجلك 💬",
      heroDescription: "هل لديك استفسار أو تحتاج للمساعدة؟ تواصل معنا وسنرد عليك بأسرع وقت ممكن.",
      formTitle: "أرسل لنا رسالة",
      formDescription: "املأ النموذج أدناه وسنتواصل معك في أقرب وقت",
      nameLabel: "الاسم الكامل",
      namePlaceholder: "أدخل اسمك الكامل",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "example@email.com",
      subjectLabel: "الموضوع",
      subjectPlaceholder: "ما موضوع رسالتك؟",
      messageLabel: "الرسالة",
      messagePlaceholder: "اكتب رسالتك هنا...",
      submitButton: "إرسال الرسالة",
      submitting: "جاري الإرسال...",
      contactInfoTitle: "معلومات التواصل",
      contactInfoDescription: "يمكنك أيضًا التواصل معنا مباشرة عبر:",
      address: "دمشق - سوريا",
      phone: "+963 999 999 999",
      email: "support@mindpeacehub.com",
      callUs: "اتصل بنا",
      emailUs: "راسلنا",
      whatsapp: "واتساب",
      privacyNote: "نحترم خصوصيتك. جميع الرسائل تبقى سرية ولن تُشارك مع أي طرف ثالث.",
      backToHome: "العودة للرئيسية",
      successMessage: "تم إرسال رسالتك بنجاح! سنعاود التواصل معك قريبًا.",
      errorMessage: "حدث خطأ أثناء الإرسال. حاول مرة أخرى لاحقًا.",
      requiredFields: "جميع الحقول مطلوبة"
    },
    en: {
      pageTitle: "Contact Us",
      heroTitle: "We're Here for You 💬",
      heroDescription: "Have a question or need help? Contact us and we'll get back to you as soon as possible.",
      formTitle: "Send Us a Message",
      formDescription: "Fill out the form below and we'll get back to you soon",
      nameLabel: "Full Name",
      namePlaceholder: "Enter your full name",
      emailLabel: "Email Address",
      emailPlaceholder: "example@email.com",
      subjectLabel: "Subject",
      subjectPlaceholder: "What's your message about?",
      messageLabel: "Message",
      messagePlaceholder: "Write your message here...",
      submitButton: "Send Message",
      submitting: "Sending...",
      contactInfoTitle: "Contact Information",
      contactInfoDescription: "You can also reach us directly via:",
      address: "Damascus - Syria",
      phone: "+963 999 999 999",
      email: "support@mindpeacehub.com",
      callUs: "Call Us",
      emailUs: "Email Us",
      whatsapp: "WhatsApp",
      privacyNote: "We respect your privacy. All messages remain confidential and will not be shared with any third party.",
      backToHome: "Back to Home",
      successMessage: "Your message has been sent successfully! We'll get back to you soon.",
      errorMessage: "An error occurred while sending. Please try again later.",
      requiredFields: "All fields are required"
    }
  };

  const t = content[language];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: t.requiredFields,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://api.mindpeacehub.com/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: t.successMessage,
        });
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      toast({
        title: t.errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-secondary/35 via-primary/10 to-accent/8 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with Navigation */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <ArrowLeft className={isRTL ? 'rotate-180' : ''} size={20} />
              <span className="font-medium">{t.backToHome}</span>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="font-medium"
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/14 via-secondary/32 via-accent/10 to-background/95 py-12 md:py-16 animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MessageCircle className="text-primary" size={40} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t.heroTitle}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t.heroDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Card className="shadow-glow">
                <CardHeader>
                  <CardTitle className="text-2xl">{t.formTitle}</CardTitle>
                  <CardDescription>{t.formDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t.nameLabel}</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={t.namePlaceholder}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t.emailLabel}</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={t.emailPlaceholder}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">{t.subjectLabel}</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder={t.subjectPlaceholder}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">{t.messageLabel}</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder={t.messagePlaceholder}
                        rows={6}
                        required
                        disabled={isLoading}
                        className="resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="gradient"
                      size="lg"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          {t.submitting}
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          {t.submitButton}
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center mt-4">
                      🔒 {t.privacyNote}
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Card className="shadow-glow">
                <CardHeader>
                  <CardTitle>{t.contactInfoTitle}</CardTitle>
                  <CardDescription>{t.contactInfoDescription}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="text-primary mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-medium text-foreground">{t.address}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="text-primary mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-medium text-foreground">{t.phone}</p>
                        <a
                          href={`tel:${t.phone.replace(/\s/g, '')}`}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {t.callUs}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="text-primary mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-medium text-foreground">{t.email}</p>
                        <a
                          href={`mailto:${t.email}`}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {t.emailUs}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                    >
                      <a href={`mailto:${t.email}`}>
                        <Mail size={18} />
                        {t.emailUs}
                      </a>
                    </Button>

                    <Button
                      variant="gradient"
                      className="w-full"
                      asChild
                    >
                      <a
                        href="https://wa.me/963999999999"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle size={18} />
                        {t.whatsapp}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Map */}
              <Card className="shadow-glow overflow-hidden">
                <div className="aspect-video w-full">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d212270.5484487718!2d36.18829!3d33.5138!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1518e6dc413cc6a7%3A0x877546f4882af620!2sDamascus%2C%20Syria!5e0!3m2!1sen!2s!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Damascus Location"
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
