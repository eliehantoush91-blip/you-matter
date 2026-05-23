import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, ArrowLeft, Calendar, MessageSquare, FileText, Trash2 } from 'lucide-react';
import DoctorSidebar from '@/components/DoctorSidebar';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/store';

const DoctorNotifications = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const authState = useSelector((state: RootState) => state.auth);
  const currentUserId = authState.user?.id ? String(authState.user.id) : null;

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) return;
    setLoading(true);
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const allNotifications = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      // Filter notifications for this doctor and not deleted
      const doctorNotifications = allNotifications.filter(n => n.receiverId === currentUserId && !n.deleted);
      setNotifications(doctorNotifications);
      setLoading(false);
    }, (err) => {
      console.error('Notifications listener error', err);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUserId]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-5 w-5" />;
      case 'message':
        return <MessageSquare className="h-5 w-5" />;
      case 'test':
        return <FileText className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const handleNotificationClick = async (notification: any) => {
    // Mark as read in Firestore
    if (!notification.read) {
      await updateDoc(doc(db, 'notifications', notification.id), { read: true });
    }

    // Navigate based on type
    if (notification.type === 'message') {
      navigate('/doctor-dashboard/messages');
    } else if (notification.type === 'appointment') {
      navigate('/doctor-dashboard/appointments');
    } else if (notification.type === 'test') {
      navigate('/doctor-dashboard/analysis');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    // Delete from Firestore
    await updateDoc(doc(db, 'notifications', notificationId), { deleted: true });
  };

  const filteredNotifications = notifications;

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
                <Bell className="h-10 w-10 text-primary" />
                {t('الإشعارات', 'Notifications')}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t(`لديك ${filteredNotifications.filter(n => !n.read).length} إشعار جديد`, `You have ${filteredNotifications.filter(n => !n.read).length} new notifications`)}
              </p>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <Card className="fade-in">
          <CardHeader>
            <CardTitle>{t('جميع الإشعارات', 'All Notifications')}</CardTitle>
            <CardDescription>
              {t(`${notifications.length} إشعار إجمالي`, `${notifications.length} total notifications`)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                {t('لا توجد إشعارات', 'No notifications')}
              </p>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-smooth hover:bg-muted/50 ${
                    !notification.read ? 'bg-primary/5 border-l-4 border-primary' : 'bg-muted/30'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      notification.type === 'appointment'
                        ? 'bg-primary/20 text-primary'
                        : notification.type === 'message'
                        ? 'bg-secondary/20 text-secondary-foreground'
                        : 'bg-accent/20 text-accent-foreground'
                    }`}
                  >
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold flex items-center gap-2">
                          {t(notification.titleAr || `رسالة جديدة من ${notification.senderName}`, notification.titleEn || `New message from ${notification.senderName}`)}
                          {!notification.read && (
                            <Badge variant="destructive" className="text-xs">
                              {t('جديد', 'New')}
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t(notification.messageAr || notification.rawMessage || 'رسالة جديدة', notification.messageEn || notification.rawMessage || 'New message')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DoctorNotifications;
