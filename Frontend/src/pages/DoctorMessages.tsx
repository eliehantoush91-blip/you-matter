import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, ArrowLeft, Paperclip } from 'lucide-react';
import DoctorSidebar from '@/components/DoctorSidebar';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/store';

const DoctorMessages = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const authState = useSelector((state: RootState) => state.auth);
  const token = authState.token;
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (!token) return;

    const fetchPatients = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/doctor-patients/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(res.data.patients || []);
      } catch (err) {
        console.error('Failed to load doctor patients', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [token]);

  const selectedPatient = patients.find((p) => p.user?.id === selectedChat);

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
              <MessageSquare className="h-10 w-10 text-primary" />
              {t('الرسائل', 'Messages')}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t('تواصل مع مرضاك', 'Communicate with your patients')}
            </p>
          </div>
        </div>

        {/* Messages Interface */}
        <div className="grid grid-cols-3 gap-6 fade-in">
          {/* Patients List */}
          <Card className="col-span-1 p-4">
            <h3 className="font-semibold mb-4">{t('المحادثات', 'Conversations')}</h3>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {loading ? (
                  <div className="text-center text-muted-foreground py-8">{t('جاري تحميل المرضى...', 'Loading patients...')}</div>
                ) : patients.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">{t('لا يوجد مرضى حاليًا', 'No patients available')}</div>
                ) : (
                  patients.map((patient) => (
                    <div
                      key={patient.user.id}
                      onClick={() => {
                        setSelectedChat(patient.user.id);
                        navigate(`/chat/${patient.user.id}`);
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-smooth hover:bg-muted/50 ${
                        selectedChat === patient.user.id ? 'bg-primary/10 border-2 border-primary' : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={patient.user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${patient.user.first_name}`} />
                          <AvatarFallback>{patient.user.first_name?.[0] || 'P'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{`${patient.user.first_name || ''} ${patient.user.last_name || ''}`}</p>
                          <p className="text-sm text-muted-foreground truncate">{t('اضغط لفتح المحادثة', 'Tap to open chat')}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>

          <Card className="col-span-2 flex flex-col items-center justify-center text-center p-8">
            <MessageSquare className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-2xl font-semibold mb-2">{t('اختر مريض لفتح المحادثة الحقيقية', 'Select a patient to open the real chat')}</h2>
            <p className="text-muted-foreground max-w-lg">
              {t(
                'سيتم فتح المحادثة الحقيقية في صفحة الدردشة وتظهر الرسائل الحقيقية فقط.',
                'The real chat will open in the chat page and show only real messages.'
              )}
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DoctorMessages;
