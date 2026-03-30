import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './useAuth.tsx';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'transaction' | 'security' | 'system';
  read: boolean;
  timestamp: any;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      
      // Check for new unread notifications to show a toast
      const unreadCount = newNotifications.filter(n => !n.read).length;
      const prevUnreadCount = notifications.filter(n => !n.read).length;
      
      if (unreadCount > prevUnreadCount) {
        const latest = newNotifications.find(n => !n.read);
        if (latest) {
          toast(latest.title, {
            description: latest.message,
          });
        }
      }

      setNotifications(newNotifications);
      setLoading(false);
    }, (error) => {
      console.error("Notifications fetch error:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const createNotification = async (userId: string, title: string, message: string, type: 'transaction' | 'security' | 'system' = 'system') => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        title,
        message,
        type,
        read: false,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  return { notifications, loading, markAsRead, deleteNotification, createNotification };
}
