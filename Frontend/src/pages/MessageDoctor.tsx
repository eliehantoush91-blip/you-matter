import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/store';
import axios from 'axios';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';

import { toast } from '@/hooks/use-toast';
import { useCallback } from 'react';

interface Message {
  id?: string;
  senderId: string;
  text: string;
  createdAt: any;
}

function getConversationId(user1: string, user2: string) {
  return [user1, user2].sort().join('_');
}

const MessageDoctor = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const params = useParams<{ patientId?: string }>();
  const authState = useSelector((state: RootState) => state.auth);
  const role = (authState.user?.role as 'patient' | 'doctor') || (localStorage.getItem('role') as 'patient' | 'doctor') || 'patient';

  const [currentUserId, setCurrentUserId] = useState<string | null>(authState.user?.id ? String(authState.user.id) : localStorage.getItem('user_id') || null);
  const [patientUserId, setPatientUserId] = useState<string | null>(params.patientId || localStorage.getItem('chatPatientId') || null);
  const [doctorUserId, setDoctorUserId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [senderName, setSenderName] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [canChat, setCanChat] = useState<boolean | null>(null);
  const [payloading, setPayloading] = useState(false);
  const [paypalReady, setPaypalReady] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

 
  useEffect(() => {
    const token = authState.token;
    if (role === 'doctor') {
      if (authState.user?.id) setDoctorUserId(String(authState.user.id));
      if (params.patientId) setPatientUserId(params.patientId);

      const fetchPatient = async () => {
        if (!token || !params.patientId) return;
        try {
          const res = await axios.get('http://127.0.0.1:8000/api/doctor-patients/', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const found = (res.data.patients || []).find((p: any) => String(p.user.id) === String(params.patientId));
          if (found) {
            setPartnerName(`${found.user.first_name} ${found.user.last_name}`);
            setSenderName(`${found.user.first_name} ${found.user.last_name}`);
          }
        } catch (err) {
          // ignore
        }
      };
      fetchPatient();
    }

    if (role === 'patient') {
      const fetchDoctors = async () => {
        if (!token) return;
        try {
          const res = await axios.get('http://127.0.0.1:8000/api/doctors/', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setDoctors(res.data);
        } catch (err) {
          console.error('Failed to fetch doctors', err);
        }
      };
      fetchDoctors();

      const fetchProfile = async () => {
        if (!token) return;
        try {
          const res = await axios.get('http://127.0.0.1:8000/api/patient-profile/', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const patient = res.data;
          if (patient?.user?.id) {
            setCurrentUserId(String(patient.user.id));
            // ensure patientUserId is set for the chat conversation
            setPatientUserId(String(patient.user.id));
            localStorage.setItem('chatPatientId', String(patient.user.id));
            // Set sender name for notifications
            setSenderName(authState.user?.name || `${patient.user.first_name} ${patient.user.last_name}`);
          }
          if (patient?.doctor && patient.doctor.user?.id) {
            setDoctorUserId(String(patient.doctor.user.id));
            setPartnerName(`${patient.doctor.user.first_name} ${patient.doctor.user.last_name}`);
          }
        } catch (err) {
          // ignore
        }
      };
      fetchProfile();
    }
  }, [role, authState.token, params.patientId]);

  // Check server whether patient can chat with the doctor (has captured payment)
  useEffect(() => {
    const check = async () => {
      if (!authState.token || !doctorUserId || role !== 'patient') return setCanChat(false);
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/payments/can-chat/${doctorUserId}/`, { headers: { Authorization: `Bearer ${authState.token}` } });
        setCanChat(!!res.data.can_chat);
      } catch (err) {
        console.error('can-chat check failed', err);
        setCanChat(false);
      }
    };
    check();
  }, [authState.token, doctorUserId, role]);

  // Load PayPal SDK when needed
  const loadPaypalSdk = useCallback(async () => {
    if (paypalReady) return;
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/payments/client-id/');
      const clientId = res.data.client_id;
      if (!clientId) throw new Error('PayPal client id not set');
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      script.async = true;
      script.onload = () => setPaypalReady(true);
      document.body.appendChild(script);
    } catch (err) {
      console.error('Failed to load PayPal SDK', err);
      toast({ title: 'Payment error', description: 'Unable to load PayPal' });
    }
  }, [paypalReady]);

  // Mount PayPal Buttons when SDK is ready and user still needs to pay
  useEffect(() => {
    if (!paypalReady || canChat !== false || !window || !('paypal' in window)) return;
    if (!authState.token || !doctorUserId) return;

    const paypal = (window as any).paypal;
    if (!paypal || !paypal.Buttons) {
      console.error('PayPal Buttons not available');
      return;
    }

    // Clean any existing buttons
    const container = document.getElementById('paypal-button-container');
    if (!container) return;
    container.innerHTML = '';

    paypal.Buttons({
      createOrder: async (_data: any, actions: any) => {
        try {
          setPayloading(true);
          const res = await axios.post('http://127.0.0.1:8000/api/payments/create-order/', { doctor_id: Number(doctorUserId) }, { headers: { Authorization: `Bearer ${authState.token}` } });
          const orderID = res.data.orderID;
          return orderID;
        } catch (err) {
          console.error('create order error', err);
          toast({ title: 'Payment error', description: 'Failed to create PayPal order' });
          throw err;
        } finally {
          setPayloading(false);
        }
      },
      onApprove: async (_data: any, actions: any) => {
        const orderID = _data.orderID || (_data && _data.orderID);
        try {
          setPayloading(true);
          await axios.post('http://127.0.0.1:8000/api/payments/capture-order/', { orderID }, { headers: { Authorization: `Bearer ${authState.token}` } });
          setCanChat(true);
          toast({ title: 'Payment successful', description: 'You can now chat with the doctor.' });
        } catch (err) {
          console.error('capture error', err);
          toast({ title: 'Payment error', description: 'Failed to capture payment' });
        } finally {
          setPayloading(false);
        }
      },
      onError: (err: any) => {
        console.error('PayPal error', err);
        toast({ title: 'Payment error', description: 'An error occurred during payment' });
      }
    }).render('#paypal-button-container');

    return () => {
      if (container) container.innerHTML = '';
    };
  }, [paypalReady, canChat, authState.token, doctorUserId]);

  useEffect(() => {
    if (!patientUserId || !doctorUserId) return;
    setLoading(true);
    const conversationId = getConversationId(patientUserId, doctorUserId);
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Message)));
      setLoading(false);
    }, (err) => {
      console.error('Firestore listener error', err);
      setLoading(false);
    });

    return () => unsub();
  }, [patientUserId, doctorUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !patientUserId || !doctorUserId || !currentUserId) return;
    try {
      const conversationId = getConversationId(patientUserId, doctorUserId);
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');

      await setDoc(doc(db, 'conversations', conversationId), {
        userIds: [patientUserId, doctorUserId].sort(),
        createdAt: serverTimestamp(),
      }, { merge: true });

      await addDoc(messagesRef, {
        senderId: currentUserId,
        text: input.trim(),
        createdAt: serverTimestamp(),
      });

      // Create notification for the doctor
      if (role === 'patient' && doctorUserId) {
        const notificationSender = senderName || authState.user?.name || partnerName || 'المريض';
        const messagePreview = input.trim().substring(0, 80) + (input.trim().length > 80 ? '...' : '');
        const notificationsRef = collection(db, 'notifications');
        await addDoc(notificationsRef, {
          type: 'message',
          receiverId: doctorUserId,
          senderId: currentUserId,
          senderName: notificationSender,
          titleAr: `رسالة جديدة من ${notificationSender}`,
          titleEn: `New message from ${notificationSender}`,
          messageAr: messagePreview,
          messageEn: messagePreview,
          rawMessage: input.trim(),
          time: 'الآن / Just now',
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      setInput('');
    } catch (err) {
      console.error('Send message error', err);
      toast({ title: 'Send failed', description: 'Failed to send message' });
    }
  };

  const handleDoctorChange = (doctorId: string) => {
    const selectedDoctor = doctors.find(d => String(d.user.id) === doctorId);
    if (selectedDoctor) {
      setDoctorUserId(doctorId);
      setPartnerName(`${selectedDoctor.user.first_name} ${selectedDoctor.user.last_name}`);
      setCanChat(null); // reset to check payment again
    }
  };

  if (!patientUserId || !doctorUserId) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">{t('جارٍ الإعداد...', 'Chat not ready. Please try again.')}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {role === 'patient' && (
          <Card className="mb-4 p-4 max-w-3xl mx-auto">
            <label className="block text-sm font-medium mb-2">{t('اختر الطبيب', 'Select Doctor')}</label>
            <Select onValueChange={handleDoctorChange} value={doctorUserId || ''}>
              <SelectTrigger>
                <SelectValue placeholder={t('اختر طبيب', 'Choose a doctor')} />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.user.id} value={String(doctor.user.id)}>
                    {`${doctor.user.first_name} ${doctor.user.last_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        )}

        {role === 'patient' && canChat === false && doctorUserId && (
          <Card className="mb-4 p-4 max-w-3xl mx-auto">
            <div className="mb-2">{t('يجب عليك دفع 5$ لبدء المحادثة', 'You must pay $5 to start the chat')}</div>
            {!paypalReady ? (
              <Button onClick={loadPaypalSdk} disabled={payloading}>{t('تحميل بوابة الدفع', 'Load payment')}</Button>
            ) : (
              <div id="paypal-button-container" />
            )}
          </Card>
        )}

        <div className="mb-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{partnerName || 'Conversation'}</h1>
            <p className="text-sm text-muted-foreground">{t('رسالة واحدة مباشرة', 'Direct one-on-one chat')}</p>
          </div>
        </div>

        <Card className="p-4 max-w-3xl mx-auto">
          <div style={{ height: 400, overflowY: 'auto', padding: 8 }}>
            {loading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">{t('لا توجد رسائل', 'No messages yet')}</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`mb-3 ${msg.senderId === currentUserId ? 'text-right' : 'text-left'}`}>
                  <div
                    style={{
                      display: 'inline-block',
                      background: msg.senderId === currentUserId ? '#DCF8C6' : '#ECECEC',
                      padding: 8,
                      borderRadius: 12,
                      maxWidth: '70%',
                      color: '#000',
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="mt-4 flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('اكتب رسالة...', 'Type a message...')} />
            <Button type="submit" disabled={!input.trim()}><Send className="h-4 w-4" /></Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default MessageDoctor;
