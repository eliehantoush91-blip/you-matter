import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

export type ChatMessage = {
  id: string;
  text: string;
  senderId?: string;
  senderRole?: 'doctor' | 'patient' | string;
  createdAt?: any;
  read?: boolean;
};

export function useChat(chatId: string | null, role: 'patient' | 'doctor' = 'patient') {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!chatId) return;

    let unsubSnapshot: (() => void) | null = null;

    const setupListener = () => {
      const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
      unsubSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ChatMessage[];
          setMessages(docs);
        },
        (err) => {
          console.error('Firestore listener error', err);
        }
      );
    };

    if (auth.currentUser) {
      setupListener();
    } else {
      const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        if (user) setupListener();
      });
      return () => {
        unsubscribeAuth();
        if (unsubSnapshot) unsubSnapshot();
      };
    }

    return () => {
      if (unsubSnapshot) unsubSnapshot();
    };
  }, [chatId]);

  const sendMessage = async (text: string, metadata?: Record<string, any>) => {
    if (!chatId) return;
    if (!text || !text.trim()) return;
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: text.trim(),
      senderRole: role,
      createdAt: serverTimestamp(),
      read: false,
      ...metadata,
    });
  };

  return { messages, sendMessage, isTyping, setIsTyping };
}
